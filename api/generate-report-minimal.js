// Ultra-Minimal Academic Report Generator - Guaranteed to Work
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak } = require('docx');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const config = req.body;
        
        // Basic validation
        if (!config.studentName || !config.projectTitle) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log(`🎓 Generating minimal report for: ${config.projectTitle}`);

        // Create minimal academic document
        const doc = new Document({
            sections: [{
                children: [
                    // Cover Page
                    new Paragraph({
                        children: [new TextRun({
                            text: config.institution || "UNIVERSITY",
                            bold: true,
                            size: 32,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 720, after: 480 }
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
                            text: `A ${(config.reportType || 'PROJECT').toUpperCase()} REPORT`,
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
                            text: `Student ID: ${config.studentId || 'N/A'}`,
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
                    }),

                    // Page Break
                    new Paragraph({ children: [new PageBreak()] }),

                    // Abstract
                    new Paragraph({
                        children: [new TextRun({
                            text: "ABSTRACT",
                            bold: true,
                            size: 32,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 1440, after: 720 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `This ${config.reportType || 'project'} presents the development of "${config.projectTitle}", demonstrating practical implementation of modern software development principles and best practices. The project addresses real-world challenges while maintaining high standards of code quality and user experience.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 360 }
                    }),

                    // Page Break
                    new Paragraph({ children: [new PageBreak()] }),

                    // Chapter 1: Introduction
                    new Paragraph({
                        children: [new TextRun({
                            text: "Chapter 1: INTRODUCTION",
                            bold: true,
                            size: 28,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 480, after: 360 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `This chapter provides a comprehensive introduction to the ${config.projectTitle} project. The development of modern software applications requires careful planning, systematic analysis, and implementation of industry best practices. This project demonstrates the practical application of software engineering principles in creating a robust and scalable solution.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `The primary objective of this project is to develop a comprehensive system that addresses real-world challenges while maintaining high standards of code quality and user experience. Through systematic analysis of requirements and careful design of system architecture, the project aims to deliver a solution that meets both functional and non-functional requirements.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),

                    // Page Break
                    new Paragraph({ children: [new PageBreak()] }),

                    // Chapter 2: Methodology
                    new Paragraph({
                        children: [new TextRun({
                            text: "Chapter 2: METHODOLOGY",
                            bold: true,
                            size: 28,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 480, after: 360 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `This chapter outlines the methodology and system design approach adopted for the ${config.projectTitle} project. The development process follows a systematic approach that ensures quality and maintainability throughout the project lifecycle.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `The system architecture is designed to be modular and scalable, allowing for future enhancements and modifications. The design emphasizes separation of concerns and follows established architectural patterns to ensure code organization and maintainability.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),

                    // Page Break
                    new Paragraph({ children: [new PageBreak()] }),

                    // Chapter 3: Implementation
                    new Paragraph({
                        children: [new TextRun({
                            text: "Chapter 3: IMPLEMENTATION",
                            bold: true,
                            size: 28,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 480, after: 360 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `This chapter details the implementation process and technical aspects of the ${config.projectTitle} project. The development process involved careful coding practices, regular testing, and iterative refinement to achieve the desired functionality.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `The implementation incorporates modern programming techniques and follows established coding standards to ensure code quality and maintainability. Error handling and validation are implemented throughout the system to provide robust operation.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),

                    // Page Break
                    new Paragraph({ children: [new PageBreak()] }),

                    // Chapter 4: Results
                    new Paragraph({
                        children: [new TextRun({
                            text: "Chapter 4: RESULTS",
                            bold: true,
                            size: 28,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 480, after: 360 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `This chapter presents the results and outcomes of the ${config.projectTitle} project. The implementation successfully demonstrates the practical application of software engineering principles and modern development methodologies.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `The system meets all specified requirements and provides a solid foundation for future enhancements. Testing results show that the application performs reliably under various conditions and user scenarios.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),

                    // Page Break
                    new Paragraph({ children: [new PageBreak()] }),

                    // Chapter 5: Conclusion
                    new Paragraph({
                        children: [new TextRun({
                            text: "Chapter 5: CONCLUSION",
                            bold: true,
                            size: 28,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 480, after: 360 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `This chapter presents the conclusions drawn from the ${config.projectTitle} project and discusses the outcomes achieved. The project successfully demonstrates the practical application of software engineering principles and modern development methodologies.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: `Key learning outcomes include practical experience in software development, project management, and the application of theoretical concepts in real-world scenarios. The project has provided valuable insights into the challenges and considerations involved in developing comprehensive software solutions.`,
                            size: 24,
                            font: "Times New Roman"
                        })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 240 }
                    })
                ]
            }]
        });

        // Generate document buffer
        const buffer = await Packer.toBuffer(doc);

        // Set response headers
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_Report_${timestamp}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        console.log(`✅ Minimal report generated: ${buffer.length} bytes`);
        res.send(buffer);

    } catch (error) {
        console.error('❌ Minimal report error:', error);
        res.status(500).json({ 
            error: 'Failed to generate report', 
            details: error.message 
        });
    }
};