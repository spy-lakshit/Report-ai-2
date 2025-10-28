// Simple AI Report Generator for Vercel
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak } = require('docx');

module.exports = async (req, res) => {
    // Set CORS headers
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
        console.log('📝 Generating report for:', config.projectTitle);

        // Validate required fields
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType'];
        
        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Generate the report
        const reportBuffer = await generateReport(config);
        
        // Set response headers
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_Report_${timestamp}.docx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);
        
        console.log('✅ Report generated successfully');
        res.send(reportBuffer);
        
    } catch (error) {
        console.error('❌ Error generating report:', error);
        res.status(500).json({ 
            error: 'Failed to generate report', 
            details: error.message 
        });
    }
};

async function generateReport(config) {
    const chapters = [
        {
            title: 'INTRODUCTION',
            content: `This ${config.reportType.toLowerCase()} presents "${config.projectTitle}", a comprehensive project developed as part of the ${config.course} curriculum at ${config.institution}.

The project addresses modern challenges in software development and demonstrates practical application of theoretical concepts learned during the academic program. This work showcases innovative approaches to problem-solving and technical implementation.

The primary objective is to develop a robust solution that meets industry standards while incorporating best practices in software engineering. The project demonstrates proficiency in various technologies and methodologies relevant to the field.`
        },
        {
            title: 'LITERATURE REVIEW',
            content: `The literature review examines current trends and established practices in the field relevant to "${config.projectTitle}". This analysis provides the theoretical foundation for the project implementation.

Recent research indicates significant advancements in software development methodologies, with emphasis on agile practices, user-centered design, and scalable architecture patterns. These developments inform the approach taken in this project.

The review encompasses academic publications, industry reports, and technical documentation that establish the context and justify the chosen implementation strategy. This foundation ensures the project aligns with current best practices and emerging trends.`
        },
        {
            title: 'METHODOLOGY',
            content: `The methodology section outlines the systematic approach adopted for the development of "${config.projectTitle}". The chosen methodology ensures structured progress and quality outcomes.

The development process follows established software engineering principles, incorporating iterative development cycles, comprehensive testing procedures, and continuous integration practices. This approach facilitates efficient project management and quality assurance.

Key methodological components include requirements analysis, system design, implementation planning, testing strategies, and deployment procedures. Each phase is carefully planned and executed to ensure project success and deliverable quality.`
        },
        {
            title: 'SYSTEM DESIGN',
            content: `The system design chapter presents the architectural framework and technical specifications for "${config.projectTitle}". The design emphasizes scalability, maintainability, and performance optimization.

The architecture follows modern design patterns and incorporates industry-standard practices for component organization, data management, and user interface design. This approach ensures system reliability and future extensibility.

Key design elements include modular architecture, efficient data structures, intuitive user interfaces, and comprehensive error handling mechanisms. The design supports both current requirements and anticipated future enhancements.`
        },
        {
            title: 'IMPLEMENTATION',
            content: `The implementation chapter details the development process and technical realization of "${config.projectTitle}". The implementation demonstrates practical application of design principles and technical expertise.

The development process involved systematic coding, comprehensive testing, and iterative refinement to achieve optimal functionality and performance. Industry-standard development tools and practices were employed throughout the implementation phase.

Key implementation aspects include efficient algorithm development, robust data handling, user-friendly interface creation, and comprehensive system integration. The implementation successfully realizes all design objectives and functional requirements.`
        },
        {
            title: 'TESTING AND EVALUATION',
            content: `The testing and evaluation phase ensures the reliability and effectiveness of "${config.projectTitle}". Comprehensive testing procedures validate system functionality and performance characteristics.

The testing strategy encompasses unit testing, integration testing, system testing, and user acceptance testing. Each testing phase contributes to overall system quality and reliability assurance.

Evaluation results demonstrate successful achievement of project objectives, with system performance meeting or exceeding established benchmarks. User feedback confirms the effectiveness of the implemented solution and validates the chosen approach.`
        },
        {
            title: 'CONCLUSION',
            content: `The "${config.projectTitle}" project has successfully achieved all established objectives and delivered a comprehensive solution that demonstrates technical proficiency and practical problem-solving capabilities.

Key achievements include successful implementation of all planned features, comprehensive system testing and validation, detailed documentation of development processes, and positive evaluation results from stakeholders and users.

The project contributes to the field by demonstrating effective application of modern development practices and providing a foundation for future enhancements. The experience gained through this project enhances professional development and technical expertise.

Future work may include additional feature development, performance optimization, integration with emerging technologies, and expansion to support broader use cases and requirements.`
        }
    ];

    // Create document sections
    const sections = [];

    // Cover page
    sections.push(
        new Paragraph({
            children: [new TextRun({
                text: config.institution.toUpperCase(),
                bold: true,
                size: 32
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1440, after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Department of ${config.course}`,
                bold: true,
                size: 24
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 960 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: config.projectTitle.toUpperCase(),
                bold: true,
                size: 28
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 960, after: 960 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `A ${config.reportType.toUpperCase()} REPORT`,
                bold: true,
                size: 24
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 960 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Submitted by: ${config.studentName}`,
                bold: false,
                size: 20
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Student ID: ${config.studentId}`,
                bold: false,
                size: 20
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `${config.course} - ${config.semester}`,
                bold: false,
                size: 20
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Under the guidance of: ${config.supervisor}`,
                bold: false,
                size: 20
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: new Date().getFullYear().toString(),
                bold: true,
                size: 24
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 960 }
        })
    );

    // Add chapters
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        // Page break before each chapter (except first)
        if (i > 0 || sections.length > 0) {
            sections.push(new Paragraph({ children: [new PageBreak()] }));
        }
        
        // Chapter title
        sections.push(
            new Paragraph({
                children: [new TextRun({
                    text: `CHAPTER ${i + 1}: ${chapter.title}`,
                    bold: true,
                    size: 24
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 480, after: 360 }
            })
        );
        
        // Chapter content
        const paragraphs = chapter.content.split('\n\n');
        for (const para of paragraphs) {
            if (para.trim()) {
                sections.push(
                    new Paragraph({
                        children: [new TextRun({
                            text: para.trim(),
                            size: 22
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240, line: 360 }
                    })
                );
            }
        }
    }

    // Create the document
    const doc = new Document({
        sections: [{
            children: sections,
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            }
        }]
    });

    return await Packer.toBuffer(doc);
}