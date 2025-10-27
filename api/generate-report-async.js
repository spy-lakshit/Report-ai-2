// Alternative API endpoint that returns JSON and supports progress tracking
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, PageNumber, NumberFormat } = require('docx');

// In-memory storage for progress tracking (use Redis in production)
const progressTracking = new Map();
const reportStorage = new Map();

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const config = req.body;
        const sessionId = Date.now().toString();
        
        // Validate required fields
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType'];
        
        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({
                    error: `Missing required field: ${field}`
                });
            }
        }
        
        // Return session ID immediately for progress tracking
        res.json({ sessionId, message: 'Report generation started' });
        
        console.log(`🎯 Generating report for: ${config.projectTitle}`);
        
        // Start background generation
        generateReportAsync(config, sessionId);
        
    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({ 
            error: 'Failed to start report generation',
            details: error.message 
        });
    }
};

// Background report generation
async function generateReportAsync(config, sessionId) {
    try {
        updateProgress(sessionId, 5, 'Initializing AI system...', 60);
        
        const reportBuffer = await generateUniversityReport(config, sessionId);
        
        // Create filename
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Report.docx`;
        
        // Store the completed report
        reportStorage.set(sessionId, {
            buffer: reportBuffer,
            filename: filename,
            completed: true,
            completedAt: new Date().toISOString()
        });
        
        updateProgress(sessionId, 100, 'Report completed! Ready for download.', 0);
        
    } catch (error) {
        console.error('❌ Background generation error:', error);
        updateProgress(sessionId, 0, `Error: ${error.message}`, 0);
    }
}

// Update progress helper
function updateProgress(sessionId, progress, status, timeRemaining = null) {
    const progressData = { progress, status, timestamp: new Date().toISOString() };
    if (timeRemaining !== null) {
        progressData.timeRemaining = timeRemaining;
    }
    progressTracking.set(sessionId, progressData);
    console.log(`📊 Progress [${sessionId}]: ${progress}% - ${status}`);
}

// Generate report with progress updates
async function generateUniversityReport(config, sessionId) {
    console.log(`📄 Starting report generation for: ${config.projectTitle}`);
    
    const sectionsConfig = createReportSections(config);
    const mainBodyContent = [];
    let totalWordCount = 0;
    const totalSections = sectionsConfig.length;

    updateProgress(sessionId, 10, 'Setting up report structure...', 50);

    // Generate content for each section
    for (let i = 0; i < sectionsConfig.length; i++) {
        const section = sectionsConfig[i];
        const progressPercent = 15 + Math.floor((i / totalSections) * 70);
        const timeRemaining = Math.max(5, (totalSections - i) * 10);
        
        updateProgress(sessionId, progressPercent, `Generating ${section.title}...`, timeRemaining);
        console.log(`⏳ Generating ${section.title}...`);
        
        const result = await generateContent(section.prompt);
        
        // Add page break before each chapter (except the first one)
        if (i > 0) {
            mainBodyContent.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // Chapter Title Paragraph
        mainBodyContent.push(
            new Paragraph({
                children: [new TextRun({ text: section.title, bold: true, size: 28, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 480, after: 240 },
            })
        );
        
        // Process content paragraphs
        const contentParagraphs = createFormattedParagraphs(result.content);
        mainBodyContent.push(...contentParagraphs);

        totalWordCount += result.wordCount;
        console.log(`✅ Generated ${section.title} (Word Count: ${result.wordCount})`);
    }

    updateProgress(sessionId, 85, 'Formatting document structure...', 10);

    // Create the document
    const doc = new Document({
        sections: [
            {
                children: createCoverPage(config),
                headers: { default: new Header({ children: [new Paragraph("")] }) },
                footers: { default: new Footer({ children: [new Paragraph("")] }) },
            },
            {
                headers: { default: new Header({ children: [new Paragraph("")] }) },
                footers: { default: createFooter() },
                children: mainBodyContent,
                properties: {
                    page: {
                        pageNumbers: {
                            start: 1,
                            formatType: NumberFormat.DECIMAL,
                        },
                    },
                },
            },
        ],
        styles: {
            default: {
                document: {
                    run: {
                        size: 24,
                        font: "Times New Roman",
                    },
                    paragraph: {
                        spacing: {
                            line: 360,
                        },
                    },
                },
            },
        },
    });

    updateProgress(sessionId, 95, 'Creating DOCX file...', 3);
    
    const buffer = await Packer.toBuffer(doc);
    
    console.log(`📊 Total Word Count: ${totalWordCount}`);
    
    return buffer;
}

// Same helper functions as the main API...
async function generateContent(prompt, retries = 2) {
    const BUILT_IN_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA61ci1A96CnXeFnrxtp7QwG-hSl8ypS4Y';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${BUILT_IN_API_KEY}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
            topP: 0.8,
            topK: 40
        }
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            
            if (responseText.startsWith('<') || responseText.includes('<!DOCTYPE')) {
                throw new Error('API returned HTML instead of JSON - likely rate limited');
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            const data = JSON.parse(responseText);

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No content generated by Gemini API');
            }

            const candidate = data.candidates[0];
            const content = candidate.content?.parts?.[0]?.text || '';

            if (!content.trim()) {
                throw new Error('Empty content generated');
            }

            return {
                content: content.trim(),
                wordCount: content.trim().split(/\s+/).length,
                finishReason: candidate.finishReason
            };

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);

            if (attempt === retries) {
                return generateFallbackContent(prompt);
            }

            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}

function generateFallbackContent(prompt) {
    const sectionType = prompt.toLowerCase();
    
    if (sectionType.includes('introduction')) {
        return {
            content: `1.1 Background and Motivation\n\nThis project addresses the growing need for innovative solutions in modern technology. The motivation stems from identifying gaps in current systems and the potential for improvement through advanced methodologies.\n\n1.2 Problem Statement\n\nThe primary challenge lies in developing efficient and scalable solutions that meet contemporary requirements while maintaining reliability and performance standards.\n\n1.3 Objectives\n\nThe main objectives include designing a comprehensive system, implementing robust functionality, ensuring optimal performance, and providing user-friendly interfaces that enhance overall experience.\n\n1.4 Scope and Limitations\n\nThis project focuses on core functionality while acknowledging certain limitations in scope due to time and resource constraints.\n\n1.5 Report Organization\n\nThis report is structured to provide a comprehensive overview of the project development process, from initial planning to final implementation.`,
            wordCount: 150,
            finishReason: 'fallback'
        };
    } else {
        return {
            content: `This section provides detailed information about the project implementation, covering all essential aspects of the development process. The content includes comprehensive analysis, methodology, and results that demonstrate the effectiveness of the proposed solution.`,
            wordCount: 40,
            finishReason: 'fallback'
        };
    }
}

function createReportSections(config) {
    return [
        {
            type: 'introduction',
            title: 'CHAPTER 1: INTRODUCTION',
            wordTarget: 1000,
            prompt: `Generate an Introduction chapter for a ${config.reportType} report titled "${config.projectTitle}". Project Description: ${config.projectDescription}. Include subsections: 1.1 Background and Motivation, 1.2 Problem Statement, 1.3 Objectives, 1.4 Scope and Limitations, 1.5 Report Organization. Write in formal academic language.`
        },
        {
            type: 'literature-review',
            title: 'CHAPTER 2: LITERATURE REVIEW',
            wordTarget: 1000,
            prompt: `Generate a Literature Review chapter for "${config.projectTitle}". Project Description: ${config.projectDescription}. Include subsections: 2.1 Theoretical Background, 2.2 Technology Review, 2.3 Related Work, 2.4 Research Gap. Include academic-style references.`
        },
        {
            type: 'methodology',
            title: 'CHAPTER 3: METHODOLOGY',
            wordTarget: 1000,
            prompt: `Generate a Methodology chapter for "${config.projectTitle}". Project Description: ${config.projectDescription}. Include subsections: 3.1 Development Approach, 3.2 System Requirements, 3.3 System Design, 3.4 Technology Stack. Write with technical depth.`
        },
        {
            type: 'conclusion',
            title: 'CHAPTER 4: CONCLUSION',
            wordTarget: 800,
            prompt: `Generate a Conclusion chapter for "${config.projectTitle}". Project Description: ${config.projectDescription}. Include subsections: 4.1 Summary of Achievements, 4.2 Key Findings, 4.3 Limitations, 4.4 Future Work. Provide a thoughtful conclusion.`
        }
    ];
}

function createFormattedParagraphs(text) {
    const paragraphs = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.match(/^#+\s*Chapter \d+:/i) || trimmedLine.match(/^Chapter \d+:/i)) {
            continue;
        }

        if (trimmedLine.match(/^\d+\.\d+/)) {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({ text: trimmedLine, bold: true, size: 26, font: "Times New Roman" })],
                    alignment: AlignmentType.LEFT,
                    spacing: { before: 360, after: 240, line: 360, lineRule: "auto" }
                })
            );
        } else {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({ text: trimmedLine, bold: false, size: 24, font: "Times New Roman" })],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { before: 0, after: 120, line: 360, lineRule: "auto" }
                })
            );
        }
    }
    return paragraphs;
}

function createCoverPage(config) {
    return [
        new Paragraph({
            children: [new TextRun({ text: config.institution.toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.department || `Department of ${config.course}`, bold: true, size: 28, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.projectTitle.toUpperCase(), bold: true, size: 36, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1440, after: 1440 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `A ${config.reportType.toUpperCase()} REPORT`, bold: true, size: 28, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ text: "Submitted by:", bold: false, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.studentName, bold: true, size: 28, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `Student ID: ${config.studentId}`, bold: false, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.course, bold: false, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.semester, bold: false, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ text: "Under the guidance of:", bold: false, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.supervisor, bold: true, size: 28, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ text: new Date().getFullYear().toString(), bold: true, size: 28, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720 }
        })
    ];
}

function createFooter() {
    return new Footer({
        children: [
            new Paragraph({
                children: [new TextRun({ children: [PageNumber.CURRENT], size: 24, font: "Times New Roman" })],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0 }
            })
        ]
    });
}