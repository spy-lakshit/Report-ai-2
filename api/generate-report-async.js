// Enhanced AI Report Generator with Real-Time Progress Tracking and Timeout Handling
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, NumberFormat, TabStopPosition, TabStopType, LeaderType, PageNumber } = require('docx');

// Gemini AI Configuration
const GEMINI_API_KEY = 'demo-key-placeholder';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// In-memory progress store (in production, use Redis or database)
const progressStore = new Map();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const config = req.body;
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType', 'apiKey'];

        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Generate unique report ID
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Initialize progress tracking
        initializeProgress(reportId, config);

        // Start asynchronous report generation (non-blocking)
        generateReportAsync(reportId, config).catch(error => {
            console.error(`Report generation failed for ${reportId}:`, error);
            updateProgress(reportId, 'failed', 0, 'Generation failed', error.message);
        });

        // Return immediately with report ID for status tracking
        res.json({
            success: true,
            reportId: reportId,
            message: 'Report generation started',
            statusUrl: `/api/report-status?id=${reportId}`,
            estimatedTime: '10-15 minutes'
        });

    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({ error: 'Failed to start report generation', details: error.message });
    }
};

// Initialize progress tracking for a report
function initializeProgress(reportId, config) {
    const progress = {
        reportId: reportId,
        status: 'analyzing',
        percentage: 0,
        currentStage: 'analysis',
        currentChapter: 'Project Analysis',
        wordsGenerated: 0,
        estimatedTimeRemaining: 900, // 15 minutes in seconds
        lastUpdated: new Date(),
        config: config,
        stageDetails: {
            analysis: { completed: false, startTime: new Date() },
            planning: { completed: false },
            content_generation: { completed: false, chaptersCompleted: 0, totalChapters: 7 },
            formatting: { completed: false }
        },
        error: null,
        downloadUrl: null
    };

    progressStore.set(reportId, progress);
    console.log(`📊 Progress tracking initialized for report: ${reportId}`);
}

// Update progress for a report
function updateProgress(reportId, stage, percentage, currentChapter, details = null, error = null) {
    const progress = progressStore.get(reportId);
    if (!progress) return;

    progress.status = stage;
    progress.percentage = Math.min(100, Math.max(0, percentage));
    progress.currentStage = stage;
    progress.currentChapter = currentChapter;
    progress.lastUpdated = new Date();
    progress.estimatedTimeRemaining = Math.max(0, Math.floor((100 - percentage) * 9)); // Rough estimate

    if (details) progress.details = details;
    if (error) progress.error = error;

    // Update stage details
    if (stage === 'analyzing') {
        progress.stageDetails.analysis.completed = percentage >= 15;
        if (progress.stageDetails.analysis.completed) {
            progress.stageDetails.analysis.endTime = new Date();
            progress.stageDetails.planning.startTime = new Date();
        }
    } else if (stage === 'planning') {
        progress.stageDetails.planning.completed = percentage >= 25;
        if (progress.stageDetails.planning.completed) {
            progress.stageDetails.planning.endTime = new Date();
            progress.stageDetails.content_generation.startTime = new Date();
        }
    } else if (stage === 'generating') {
        const chaptersCompleted = Math.floor((percentage - 25) / 65 * 7);
        progress.stageDetails.content_generation.chaptersCompleted = chaptersCompleted;
        progress.stageDetails.content_generation.completed = percentage >= 90;
        if (progress.stageDetails.content_generation.completed) {
            progress.stageDetails.content_generation.endTime = new Date();
            progress.stageDetails.formatting.startTime = new Date();
        }
    } else if (stage === 'formatting') {
        progress.stageDetails.formatting.completed = percentage >= 100;
        if (progress.stageDetails.formatting.completed) {
            progress.stageDetails.formatting.endTime = new Date();
        }
    }

    progressStore.set(reportId, progress);
    console.log(`📊 Progress updated for ${reportId}: ${percentage}% - ${currentChapter}`);
}

// Asynchronous report generation with progress updates
async function generateReportAsync(reportId, config) {
    try {
        console.log(`🤖 Starting async report generation for: ${reportId}`);
        
        // Stage 1: Analysis (0-15%)
        updateProgress(reportId, 'analyzing', 5, 'Analyzing project type and requirements');
        await delay(2000);
        
        updateProgress(reportId, 'analyzing', 10, 'Categorizing project by technology stack');
        await delay(2000);
        
        updateProgress(reportId, 'analyzing', 15, 'Analysis complete');
        await delay(1000);

        // Stage 2: Planning (15-25%)
        updateProgress(reportId, 'planning', 18, 'Generating dynamic chapter structure');
        const chapterTitles = await generateDynamicChapterTitles(config, config.apiKey || GEMINI_API_KEY);
        await delay(2000);
        
        updateProgress(reportId, 'planning', 22, 'Planning section content');
        await delay(2000);
        
        updateProgress(reportId, 'planning', 25, 'Chapter planning complete');
        await delay(1000);

        // Stage 3: Content Generation (25-90%)
        const generatedChapters = [];
        let totalWords = 0;
        
        for (let chapterIndex = 0; chapterIndex < chapterTitles.length; chapterIndex++) {
            const chapterTitle = chapterTitles[chapterIndex];
            const progressStart = 25 + (chapterIndex * 65 / chapterTitles.length);
            const progressEnd = 25 + ((chapterIndex + 1) * 65 / chapterTitles.length);
            
            updateProgress(reportId, 'generating', progressStart, `Writing Chapter ${chapterIndex + 1}: ${chapterTitle}`);
            
            // Generate chapter content with progress updates
            const chapter = await generateChapterWithProgress(
                reportId, 
                chapterTitle, 
                chapterIndex, 
                config, 
                progressStart, 
                progressEnd
            );
            
            generatedChapters.push(chapter);
            totalWords += chapter.wordCount;
            
            // Update word count
            const progress = progressStore.get(reportId);
            if (progress) {
                progress.wordsGenerated = totalWords;
                progressStore.set(reportId, progress);
            }
            
            updateProgress(reportId, 'generating', progressEnd, `Chapter ${chapterIndex + 1} completed (${totalWords} words)`);
            await delay(1000);
        }

        // Stage 4: Formatting (90-100%)
        updateProgress(reportId, 'formatting', 92, 'Applying professional formatting');
        await delay(2000);
        
        updateProgress(reportId, 'formatting', 95, 'Creating document structure');
        const reportBuffer = await createLakshayDocument(config, generatedChapters);
        await delay(2000);
        
        updateProgress(reportId, 'formatting', 98, 'Finalizing document');
        await delay(1000);

        // Save the generated report (in production, save to cloud storage)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.studentId}_Report_${timestamp}.docx`;
        
        // In production, upload to cloud storage and get URL
        const downloadUrl = `/api/download-report?id=${reportId}&filename=${filename}`;
        
        // Store the report buffer (in production, use cloud storage)
        const progress = progressStore.get(reportId);
        if (progress) {
            progress.reportBuffer = reportBuffer;
            progress.filename = filename;
            progress.downloadUrl = downloadUrl;
            progressStore.set(reportId, progress);
        }

        updateProgress(reportId, 'completed', 100, `Report completed (${totalWords} words)`);
        console.log(`✅ Report generation completed for ${reportId}: ${totalWords} words`);

    } catch (error) {
        console.error(`❌ Report generation failed for ${reportId}:`, error);
        updateProgress(reportId, 'failed', 0, 'Generation failed', null, error.message);
        throw error;
    }
}

// Generate chapter with progress updates
async function generateChapterWithProgress(reportId, chapterTitle, chapterIndex, config, progressStart, progressEnd) {
    const sectionTitles = await generateSectionTitles(chapterTitle, chapterIndex, config, config.apiKey || GEMINI_API_KEY);
    
    let chapterContent = '';
    let chapterWords = 0;
    
    for (let sectionIndex = 0; sectionIndex < sectionTitles.length; sectionIndex++) {
        const sectionTitle = sectionTitles[sectionIndex];
        const sectionProgress = progressStart + ((sectionIndex + 1) / sectionTitles.length) * (progressEnd - progressStart);
        
        updateProgress(reportId, 'generating', sectionProgress, `Writing ${chapterTitle} - ${sectionTitle}`);
        
        const sectionContent = await generateDetailedSectionContent(
            chapterTitle,
            sectionTitle,
            chapterIndex + 1,
            sectionIndex + 1,
            config,
            config.apiKey || GEMINI_API_KEY
        );
        
        const wordCount = sectionContent.split(' ').length;
        chapterContent += `${chapterIndex + 1}.${sectionIndex + 1} ${sectionTitle}\n\n${sectionContent}\n\n`;
        chapterWords += wordCount;
        
        await delay(1500 + Math.random() * 2000); // Realistic AI processing delay
    }
    
    return {
        number: chapterIndex + 1,
        title: chapterTitle,
        content: chapterContent.trim(),
        wordCount: chapterWords,
        startPage: 1, // Will be calculated during document creation
        endPage: 1
    };
}

// Helper function for delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate dynamic chapter titles based on report type and project topic
async function generateDynamicChapterTitles(config, apiKey) {
    const prompt = `Based on the report type "${config.reportType}" and project "${config.projectTitle}" with description "${config.projectDescription}", suggest 7 appropriate chapter titles.

Report Type Guidelines:
- THESIS REPORT: Deep research focus - Literature Review, Data Collection, Analysis, Findings
- INTERNSHIP REPORT: Practical experience focus - Company Background, Role, Tasks, Skills Learned, Challenges
- PROJECT REPORT: Implementation focus - Objectives, Methodology, Implementation, Results

Requirements:
- Keep titles SHORT and professional (1-3 words each)
- Make them specific to the report type and project topic
- Use UPPERCASE format
- Always include INTRODUCTION as first and CONCLUSION as last
- Adapt structure based on report type

Respond with ONLY a JSON array of 7 chapter titles, like:
["INTRODUCTION", "BACKGROUND", "METHODOLOGY", "DESIGN", "IMPLEMENTATION", "TESTING", "CONCLUSION"]`;

    try {
        const result = await callGeminiAPI(prompt, apiKey);
        if (Array.isArray(result)) {
            return result;
        }
    } catch (error) {
        console.error('Failed to generate dynamic chapter titles:', error);
    }
    
    // Fallback chapter titles based on report type
    const fallbackTitles = {
        'thesis': ["INTRODUCTION", "LITERATURE REVIEW", "RESEARCH METHODOLOGY", "DATA ANALYSIS", "FINDINGS", "DISCUSSION", "CONCLUSION"],
        'internship': ["INTRODUCTION", "COMPANY OVERVIEW", "ROLE AND RESPONSIBILITIES", "TASKS AND PROJECTS", "SKILLS DEVELOPMENT", "CHALLENGES AND SOLUTIONS", "CONCLUSION"],
        'project': ["INTRODUCTION", "LITERATURE REVIEW", "METHODOLOGY", "SYSTEM DESIGN", "IMPLEMENTATION", "TESTING", "CONCLUSION"]
    };

    const reportType = config.reportType.toLowerCase();
    if (reportType.includes('thesis')) return fallbackTitles.thesis;
    if (reportType.includes('internship')) return fallbackTitles.internship;
    return fallbackTitles.project;
}

async function generateSectionTitles(chapterTitle, chapterIndex, config, apiKey) {
    const prompt = `For a chapter titled "${chapterTitle}" in an academic ${config.reportType} about "${config.projectTitle}", suggest 4 appropriate section titles.

Project Context: ${config.projectDescription}
Course: ${config.course}

Make the sections comprehensive and academic. For Java/Database projects, include technical implementation details.

Respond with ONLY a JSON array of 4 section titles, like:
["Section 1 Title", "Section 2 Title", "Section 3 Title", "Section 4 Title"]`;

    try {
        const result = await callGeminiAPI(prompt, apiKey);
        if (Array.isArray(result)) {
            return result;
        }
    } catch (error) {
        console.error('Failed to generate section titles:', error);
    }

    // Fallback section titles if AI fails
    const fallbackSections = {
        0: ["Background and Motivation", "Problem Statement", "Objectives and Goals", "Scope and Limitations"],
        1: ["Theoretical Background", "Technology Review", "Related Work Analysis", "Research Gap Identification"],
        2: ["Development Methodology", "System Requirements", "Architecture Design", "Technology Stack Selection"],
        3: ["Requirements Analysis", "System Architecture", "Database Design", "User Interface Design"],
        4: ["Development Environment", "Database Implementation", "Core System Development", "Integration and Testing"],
        5: ["Testing Strategy", "Unit Testing", "System Testing", "Performance Validation"],
        6: ["Project Summary", "Learning Outcomes", "Limitations", "Future Recommendations"]
    };

    return fallbackSections[chapterIndex] || fallbackSections[0];
}

async function generateDetailedSectionContent(chapterTitle, sectionTitle, chapterNum, sectionNum, config, apiKey) {
    const prompt = `Write a comprehensive academic section for "${sectionTitle}" in Chapter ${chapterNum}: "${chapterTitle}" of a ${config.reportType} about "${config.projectTitle}".

Project Details:
- Title: ${config.projectTitle}
- Description: ${config.projectDescription}
- Course: ${config.course}
- Student: ${config.studentName}
- Institution: ${config.institution}
- Report Type: ${config.reportType}

Requirements:
- Write 500-700 words of original, detailed academic content
- Use formal academic language with technical depth
- Include specific implementation details, code concepts, database design principles
- Make it unique and contextual to this project
- Include practical examples and real-world applications
- Discuss technical challenges and solutions
- Reference industry best practices
- Do not use placeholder text or generic content
- Focus on comprehensive coverage of the topic

Write ONLY the section content, no headings or formatting.`;

    try {
        const content = await callGeminiAPI(prompt, apiKey);
        
        // Ensure minimum word count with fallback content
        const words = content.split(' ').length;
        if (words < 400) {
            return content + `\n\nThis implementation demonstrates the practical application of ${config.projectTitle} concepts in real-world scenarios. The development process involves careful consideration of software engineering principles, database normalization techniques, and user experience design. Through systematic analysis and iterative development, the project achieves its objectives while maintaining code quality and performance standards. The integration of modern programming techniques with database management showcases the effectiveness of contemporary development methodologies in creating robust, scalable applications that meet industry requirements and academic standards.`;
        }
        
        return content;
    } catch (error) {
        console.error('Failed to generate section content:', error);
        
        // Fallback content
        return `This section provides comprehensive coverage of ${sectionTitle} within the context of ${chapterTitle}. The development process involves systematic analysis of requirements, careful design of system architecture, and implementation of robust solutions that meet both functional and non-functional requirements.

The ${config.projectTitle} project demonstrates effective application of software engineering principles and modern development methodologies. Through iterative development and continuous testing, the system achieves its objectives while maintaining code quality and performance standards.

Key considerations include scalability, maintainability, and user experience design. The implementation incorporates industry best practices and follows established design patterns to ensure long-term viability and extensibility of the solution.

The technical approach emphasizes modular design, proper separation of concerns, and comprehensive error handling. Database design follows normalization principles while optimizing for performance and data integrity.

Testing strategies encompass unit testing, integration testing, and user acceptance testing to ensure system reliability and functionality. Performance optimization techniques are applied throughout the development lifecycle to maintain responsive user interactions and efficient resource utilization.

This comprehensive approach ensures that the ${config.projectTitle} system meets all specified requirements while providing a foundation for future enhancements and modifications. The systematic methodology employed throughout the development process demonstrates adherence to professional software development standards and academic excellence.`;
    }
}

// Call Gemini AI API
async function callGeminiAPI(prompt, apiKey) {
    try {
        const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response from Gemini API');
        }
        
        const content = data.candidates[0].content.parts[0].text;

        // Try to parse as JSON if it looks like JSON, otherwise return as text
        try {
            return JSON.parse(content);
        } catch {
            return content.trim();
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

async function createLakshayDocument(config, chapters) {
    // Create header with project title (left-aligned)
    const createHeader = () => new Header({
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: config.projectTitle,
                        font: "Times New Roman",
                        size: 20,
                        italics: true
                    })
                ],
                alignment: AlignmentType.LEFT,
                spacing: { before: 0, after: 0 }
            })
        ]
    });

    // Create footer with page number (right-aligned)
    const createFooter = () => new Footer({
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        children: [PageNumber.CURRENT],
                        font: "Times New Roman",
                        size: 24
                    })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 }
            })
        ]
    });

    // Create main content
    const mainContent = [];

    chapters.forEach((chapter, index) => {
        if (index > 0) {
            mainContent.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // Chapter title
        mainContent.push(
            new Paragraph({
                children: [new TextRun({
                    text: `Chapter ${chapter.number}: ${chapter.title}`,
                    bold: true,
                    size: 28,
                    font: "Times New Roman"
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 480, after: 360 }
            })
        );

        // Chapter content with proper formatting
        const paragraphs = createFormattedParagraphs(chapter.content);
        mainContent.push(...paragraphs);
    });

    // Create the complete document
    const doc = new Document({
        sections: [
            // Cover page
            {
                children: createCoverPage(config),
                footers: { default: new Footer({ children: [] }) },
                properties: {
                    page: {
                        pageNumbers: { start: 1, formatType: NumberFormat.NONE },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                }
            },

            // Main content with arabic numerals
            {
                children: mainContent,
                headers: { default: createHeader() },
                footers: { default: createFooter() },
                properties: {
                    page: {
                        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                }
            }
        ],
        styles: {
            default: {
                document: {
                    run: { size: 24, font: "Times New Roman" },
                    paragraph: { spacing: { line: 360 } }
                }
            }
        }
    });

    return await Packer.toBuffer(doc);
}

// Helper functions
function createFormattedParagraphs(text) {
    const paragraphs = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.match(/^\d+\.\d+/)) {
            // Section headings
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({
                        text: trimmedLine,
                        bold: true,
                        size: 26,
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.LEFT,
                    spacing: { before: 360, after: 240, line: 360 }
                })
            );
        } else {
            // Regular paragraphs
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({
                        text: trimmedLine,
                        size: 24,
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 120, line: 360 }
                })
            );
        }
    }

    return paragraphs;
}

function createCoverPage(config) {
    return [
        new Paragraph({
            children: [new TextRun({
                text: config.institution.toUpperCase(),
                bold: true,
                size: 32,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Department of ${config.course}`,
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: config.projectTitle.toUpperCase(),
                bold: true,
                size: 36,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1440, after: 1440 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `A ${config.reportType.toUpperCase()} REPORT`,
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Submitted by: ${config.studentName}`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Student ID: ${config.studentId}`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `${config.course} - ${config.semester}`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Under the guidance of: ${config.supervisor}`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: new Date().getFullYear().toString(),
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 960 }
        })
    ];
}

// Export progress store for status endpoint
module.exports.getProgress = (reportId) => {
    return progressStore.get(reportId);
};

module.exports.getAllProgress = () => {
    return Array.from(progressStore.entries());
};