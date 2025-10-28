// Dynamic Report Generator API - Clean and Professional
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, PageNumber, NumberFormat, TabStopType, LeaderType } = require('docx');

module.exports = async (req, res) => {
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
        
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType'];
        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        console.log(`🎯 Starting dynamic report generation for: ${config.projectTitle}`);
        console.log(`📋 Report Type: ${config.reportType}`);
        
        // Simulate AI processing time
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
        
        const reportBuffer = await createProfessionalReport(config);
        
        const endTime = Date.now();
        console.log(`⏱️ Processing completed in ${endTime - startTime}ms`);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.studentId}_Report_${timestamp}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);

        console.log(`✅ Report generated: ${reportBuffer.length} bytes`);
        res.send(reportBuffer);

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Failed to generate report', details: error.message });
    }
};

async function createProfessionalReport(config) {
    console.log('📝 Analyzing project and generating dynamic structure...');
    
    const { chapters, category } = generateDynamicChapters(config);
    console.log(`📚 Generated ${chapters.length} chapters for ${category} ${config.reportType}`);
    
    const mainBodyContent = [];
    
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        console.log(`🔄 Processing Chapter ${i + 1}: ${chapter.substring(0, 40)}...`);
        
        if (i > 0) {
            mainBodyContent.push(new Paragraph({ children: [new PageBreak()] }));
        }
        
        mainBodyContent.push(
            new Paragraph({
                children: [new TextRun({ 
                    text: `CHAPTER ${i + 1}: ${chapter}`, 
                    bold: true, size: 28, font: "Times New Roman" 
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 480, after: 240 }
            })
        );
        
        const chapterContent = generateChapterContent(i + 1, chapter, config, category);
        const contentParagraphs = createFormattedParagraphs(chapterContent);
        mainBodyContent.push(...contentParagraphs);
        
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        console.log(`✅ Chapter ${i + 1} completed`);
    }
    
    mainBodyContent.push(new Paragraph({ children: [new PageBreak()] }));
    mainBodyContent.push(
        new Paragraph({
            children: [new TextRun({ text: "REFERENCES", bold: true, size: 28, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 240 }
        })
    );
    
    const references = generateDynamicReferences(category);
    const referenceParagraphs = createFormattedParagraphs(references.join('\n'));
    mainBodyContent.push(...referenceParagraphs);
    
    const doc = new Document({
        sections: [
            {
                children: createCoverPage(config),
                headers: { default: new Header({ children: [new Paragraph("")] }) },
                footers: { default: new Footer({ children: [new Paragraph("")] }) },
                properties: {
                    page: {
                        pageNumbers: { start: 1, formatType: NumberFormat.NONE },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                }
            },
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [new TextRun({
                                    text: config.projectTitle.toUpperCase(),
                                    bold: true, size: 20, font: "Times New Roman"
                                })],
                                alignment: AlignmentType.LEFT,
                                spacing: { after: 120 }
                            })
                        ]
                    })
                },
                footers: { default: createFooter() },
                children: [
                    ...createCertificatePage(config),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createAcknowledgementPage(config),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createCompactAbstractPage(config, category),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createTableOfContentsPage(chapters)
                ],
                properties: {
                    page: {
                        pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                }
            },
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [new TextRun({
                                    text: config.projectTitle.toUpperCase(),
                                    bold: true, size: 20, font: "Times New Roman"
                                })],
                                alignment: AlignmentType.LEFT,
                                spacing: { after: 120 }
                            })
                        ]
                    })
                },
                footers: { default: createFooter() },
                children: mainBodyContent,
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
    
    console.log('🎯 Document assembly complete');
    return await Packer.toBuffer(doc);
}function
 generateDynamicChapters(config) {
    const title = config.projectTitle.toLowerCase();
    const description = config.projectDescription.toLowerCase();
    const reportType = config.reportType.toLowerCase();
    
    let chapters = [];
    let category = "general";
    
    if (title.includes('java') || title.includes('mysql') || title.includes('database') || description.includes('java') || description.includes('database')) {
        category = "java-database";
    } else if (title.includes('ai') || title.includes('machine learning') || title.includes('ml') || description.includes('ai') || description.includes('machine learning')) {
        category = "ai-ml";
    } else if (title.includes('web') || title.includes('react') || title.includes('node') || description.includes('web') || description.includes('react')) {
        category = "web-development";
    }
    
    if (reportType.includes('thesis')) {
        if (category === "java-database") {
            chapters = [
                "INTRODUCTION",
                "LITERATURE REVIEW AND THEORETICAL FOUNDATIONS",
                "RESEARCH METHODOLOGY AND DATABASE DESIGN",
                "JAVA APPLICATION ARCHITECTURE AND IMPLEMENTATION",
                "EXPERIMENTAL RESULTS AND PERFORMANCE ANALYSIS",
                "DISCUSSION AND VALIDATION",
                "CONCLUSION"
            ];
        } else if (category === "ai-ml") {
            chapters = [
                "INTRODUCTION",
                "LITERATURE REVIEW AND THEORETICAL BACKGROUND",
                "MACHINE LEARNING METHODOLOGY AND ALGORITHM DESIGN",
                "DATA ANALYSIS AND MODEL DEVELOPMENT",
                "EXPERIMENTAL RESULTS AND PERFORMANCE EVALUATION",
                "DISCUSSION AND COMPARATIVE ANALYSIS",
                "CONCLUSION"
            ];
        } else {
            chapters = [
                "INTRODUCTION",
                "LITERATURE REVIEW AND BACKGROUND STUDY",
                "RESEARCH METHODOLOGY AND DESIGN",
                "IMPLEMENTATION AND DEVELOPMENT",
                "RESULTS AND ANALYSIS",
                "DISCUSSION AND VALIDATION",
                "CONCLUSION"
            ];
        }
    } else if (reportType.includes('internship')) {
        if (category === "web-development") {
            chapters = [
                "INTRODUCTION",
                "ORGANIZATION OVERVIEW AND WEB TECHNOLOGIES",
                "TRAINING PROGRAM AND SKILL DEVELOPMENT",
                "PRACTICAL WORK AND PROJECT IMPLEMENTATION",
                "PROFESSIONAL DEVELOPMENT AND LEARNING OUTCOMES",
                "CHALLENGES AND SOLUTIONS",
                "CONCLUSION"
            ];
        } else if (category === "java-database") {
            chapters = [
                "INTRODUCTION",
                "COMPANY OVERVIEW AND TECHNOLOGY STACK",
                "TRAINING METHODOLOGY AND JAVA DEVELOPMENT",
                "DATABASE SYSTEMS AND PRACTICAL IMPLEMENTATION",
                "PROJECT WORK AND REAL-WORLD APPLICATIONS",
                "LEARNING OUTCOMES AND PROFESSIONAL GROWTH",
                "CONCLUSION"
            ];
        } else {
            chapters = [
                "INTRODUCTION",
                "ORGANIZATION OVERVIEW AND WORK ENVIRONMENT",
                "TRAINING PROGRAM AND SKILL ACQUISITION",
                "PRACTICAL WORK AND PROJECT CONTRIBUTIONS",
                "PROFESSIONAL DEVELOPMENT AND LEARNING",
                "CHALLENGES AND ACHIEVEMENTS",
                "CONCLUSION"
            ];
        }
    } else {
        if (category === "java-database") {
            chapters = [
                "INTRODUCTION",
                "SYSTEM ANALYSIS AND REQUIREMENTS GATHERING",
                "DATABASE DESIGN AND ARCHITECTURE",
                "JAVA APPLICATION DEVELOPMENT AND IMPLEMENTATION",
                "TESTING AND QUALITY ASSURANCE",
                "RESULTS AND PERFORMANCE ANALYSIS",
                "CONCLUSION"
            ];
        } else if (category === "ai-ml") {
            chapters = [
                "INTRODUCTION",
                "PROBLEM ANALYSIS AND DATA COLLECTION",
                "MACHINE LEARNING MODEL DESIGN AND DEVELOPMENT",
                "ALGORITHM IMPLEMENTATION AND TRAINING",
                "TESTING AND PERFORMANCE EVALUATION",
                "RESULTS AND COMPARATIVE ANALYSIS",
                "CONCLUSION"
            ];
        } else if (category === "web-development") {
            chapters = [
                "INTRODUCTION",
                "REQUIREMENTS ANALYSIS AND SYSTEM DESIGN",
                "FRONTEND DEVELOPMENT AND USER INTERFACE",
                "BACKEND DEVELOPMENT AND API IMPLEMENTATION",
                "TESTING AND DEPLOYMENT",
                "RESULTS AND PERFORMANCE EVALUATION",
                "CONCLUSION"
            ];
        } else {
            chapters = [
                "INTRODUCTION",
                "SYSTEM ANALYSIS AND REQUIREMENTS",
                "DESIGN AND ARCHITECTURE",
                "IMPLEMENTATION AND DEVELOPMENT",
                "TESTING AND VALIDATION",
                "RESULTS AND ANALYSIS",
                "CONCLUSION"
            ];
        }
    }
    
    return { chapters, category };
}