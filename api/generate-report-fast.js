// Fast AI Report Generator - Optimized for Vercel Serverless
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, NumberFormat } = require('docx');

// Gemini AI Configuration
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

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

        console.log(`🚀 Starting FAST AI report generation for: ${config.projectTitle}`);

        // Generate optimized report (5,000-7,000 words, ~20-25 pages)
        const reportBuffer = await generateFastAIReport(config, config.apiKey);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.studentId}_AI_Report_${timestamp}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);

        console.log(`✅ Fast AI report generated: ${reportBuffer.length} bytes`);
        res.send(reportBuffer);

    } catch (error) {
        console.error('❌ Report generation error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        
        let errorMessage = 'Failed to generate report';
        if (error.message.includes('API key')) {
            errorMessage = 'Invalid API key. Please check your Gemini API key.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
        }
        
        res.status(500).json({ 
            error: errorMessage, 
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Generate fast, optimized AI report (5,000-7,000 words)
async function generateFastAIReport(config, apiKey) {
    console.log('⚡ Generating FAST AI report optimized for serverless...');

    // Get dynamic chapter titles (quick AI call)
    const chapterTitles = await generateChapterTitles(config, apiKey);
    console.log(`📚 Using ${chapterTitles.length} chapters`);

    const generatedChapters = [];
    let totalWords = 0;

    // Generate 5 main chapters (instead of 7) for faster processing
    const mainChapters = chapterTitles.slice(0, 5);

    for (let i = 0; i < mainChapters.length; i++) {
        const chapterTitle = mainChapters[i];
        console.log(`📝 Generating Chapter ${i + 1}: ${chapterTitle}...`);

        // Generate 2 sections per chapter (instead of 4) for speed
        const sections = await generateChapterSections(chapterTitle, i, config, apiKey);
        
        let chapterContent = '';
        let chapterWords = 0;

        sections.forEach((section, sectionIndex) => {
            chapterContent += `${i + 1}.${sectionIndex + 1} ${section.title}\n\n${section.content}\n\n`;
            chapterWords += section.wordCount;
        });

        generatedChapters.push({
            number: i + 1,
            title: chapterTitle,
            content: chapterContent.trim(),
            wordCount: chapterWords
        });

        totalWords += chapterWords;
        console.log(`✅ Chapter ${i + 1} completed: ${chapterWords} words`);
    }

    console.log(`🎉 Fast AI report generated: ${totalWords} total words!`);
    return await createProfessionalDocument(config, generatedChapters);
}

// Generate chapter titles quickly
async function generateChapterTitles(config, apiKey) {
    const fallbackTitles = {
        'thesis': ["INTRODUCTION", "LITERATURE REVIEW", "METHODOLOGY", "RESULTS", "CONCLUSION"],
        'internship': ["INTRODUCTION", "COMPANY OVERVIEW", "ROLE AND TASKS", "SKILLS LEARNED", "CONCLUSION"],
        'project': ["INTRODUCTION", "LITERATURE REVIEW", "SYSTEM DESIGN", "IMPLEMENTATION", "CONCLUSION"]
    };

    try {
        const prompt = `Generate 5 chapter titles for a ${config.reportType} about "${config.projectTitle}". 
        
Respond with ONLY a JSON array like: ["INTRODUCTION", "CHAPTER2", "CHAPTER3", "CHAPTER4", "CONCLUSION"]`;

        const result = await callGeminiAPI(prompt, apiKey, 512); // Smaller token limit for speed
        
        if (Array.isArray(result) && result.length >= 5) {
            return result.slice(0, 5);
        }
    } catch (error) {
        console.log('Using fallback chapter titles due to AI error');
    }

    const reportType = config.reportType.toLowerCase();
    if (reportType.includes('thesis')) return fallbackTitles.thesis;
    if (reportType.includes('internship')) return fallbackTitles.internship;
    return fallbackTitles.project;
}

// Generate chapter sections quickly
async function generateChapterSections(chapterTitle, chapterIndex, config, apiKey) {
    const sections = [];
    
    // Generate 2 sections per chapter for speed
    const sectionTitles = getSectionTitles(chapterTitle, chapterIndex);
    
    for (let i = 0; i < 2; i++) {
        const sectionTitle = sectionTitles[i];
        
        try {
            const prompt = `Write a 400-500 word academic section for "${sectionTitle}" in "${chapterTitle}" of a ${config.reportType} about "${config.projectTitle}".

Project: ${config.projectDescription}
Course: ${config.course}

Write professional academic content. No headings, just content.`;

            const content = await callGeminiAPI(prompt, apiKey, 800); // Moderate token limit
            const wordCount = content.split(' ').length;
            
            sections.push({
                title: sectionTitle,
                content: content,
                wordCount: wordCount
            });
            
        } catch (error) {
            console.log(`Using fallback content for section: ${sectionTitle}`);
            
            const fallbackContent = `This section provides comprehensive analysis of ${sectionTitle} within the context of ${config.projectTitle}. The project demonstrates effective application of modern development methodologies and industry best practices. Through systematic implementation and testing, the system achieves its objectives while maintaining high standards of quality and performance. The technical approach emphasizes scalability, maintainability, and user experience design principles.`;
            
            sections.push({
                title: sectionTitle,
                content: fallbackContent,
                wordCount: fallbackContent.split(' ').length
            });
        }
        
        // Small delay to prevent rate limiting
        await delay(500);
    }
    
    return sections;
}

// Get section titles based on chapter
function getSectionTitles(chapterTitle, chapterIndex) {
    const sectionMap = {
        0: ["Background and Objectives", "Scope and Methodology"],
        1: ["Theoretical Framework", "Related Work Analysis"],
        2: ["System Architecture", "Design Principles"],
        3: ["Implementation Details", "Testing and Validation"],
        4: ["Results Summary", "Future Recommendations"]
    };
    
    return sectionMap[chapterIndex] || ["Overview", "Analysis"];
}

// Fast Gemini API call with timeout
async function callGeminiAPI(prompt, apiKey, maxTokens = 1024) {
    if (!apiKey || apiKey === 'demo-key-placeholder' || apiKey.length < 10) {
        throw new Error('Invalid API key. Please provide a valid Gemini API key.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 20,
                    topP: 0.8,
                    maxOutputTokens: maxTokens,
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Invalid API key or request format.');
            } else if (response.status === 403) {
                throw new Error('API key access denied.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded.');
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid API response format.');
        }
        
        const content = data.candidates[0].content.parts[0].text;

        try {
            return JSON.parse(content);
        } catch {
            return content.trim();
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('API request timed out.');
        }
        throw error;
    }
}

// Create professional Word document
async function createProfessionalDocument(config, chapters) {
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
                alignment: AlignmentType.LEFT
            })
        ]
    });

    const createFooter = () => new Footer({
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Page ",
                        font: "Times New Roman",
                        size: 24
                    }),
                    new TextRun({
                        children: ["CURRENT_PAGE"],
                        font: "Times New Roman",
                        size: 24
                    })
                ],
                alignment: AlignmentType.RIGHT
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

        // Chapter content
        const paragraphs = createFormattedParagraphs(chapter.content);
        mainContent.push(...paragraphs);
    });

    const doc = new Document({
        sections: [
            // Cover page
            {
                children: createCoverPage(config),
                properties: {
                    page: {
                        pageNumbers: { start: 1, formatType: NumberFormat.NONE },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                }
            },
            // Main content
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
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({
                        text: trimmedLine,
                        bold: true,
                        size: 26,
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.LEFT,
                    spacing: { before: 360, after: 240 }
                })
            );
        } else {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({
                        text: trimmedLine,
                        size: 24,
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 120 }
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}