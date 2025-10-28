// Enhanced AI Report Generator API - Matches Perfect Offline Version EXACTLY
// Generates reports identical to test-lakshay-simple-offline.js with all features

const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, PageNumber, NumberFormat, TabStopPosition, TabStopType, LeaderType } = require('docx');

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

        // Validate required fields
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType'];

        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({
                    error: `Missing required field: ${field}`
                });
            }
        }

        console.log(`🎯 Generating enhanced report for: ${config.projectTitle}`);

        // Generate the report using EXACT offline logic
        const reportBuffer = await createPerfectDocx(config);

        // Create filename like offline version
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.studentId}_${config.projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${timestamp}.docx`;

        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);

        // Send the file
        res.send(reportBuffer);

    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({
            error: 'Failed to generate report',
            details: error.message
        });
    }
};

// Function to generate dynamic chapter titles based on BOTH report type AND project topic
function generateDynamicChapterTitles(projectTitle, projectDescription, reportType) {
    const title = projectTitle.toLowerCase();
    const description = projectDescription.toLowerCase();
    const type = reportType.toLowerCase();

    let mainTopic = "Software Development";
    let chapters = [];

    // THESIS REPORT - Academic research focus
    if (type === 'thesis') {
        if (title.includes('java') || title.includes('mysql') || title.includes('database') || description.includes('java') || description.includes('database') || description.includes('sql')) {
            mainTopic = "Java Programming and Database Systems Research";
            chapters = [
                "INTRODUCTION",
                "LITERATURE REVIEW AND THEORETICAL FOUNDATIONS",
                "RESEARCH METHODOLOGY AND DESIGN",
                "DATA COLLECTION AND ANALYSIS FRAMEWORK",
                "EXPERIMENTAL DESIGN AND IMPLEMENTATION",
                "RESULTS AND FINDINGS ANALYSIS",
                "CONCLUSION"
            ];
        } else if (title.includes('ai') || title.includes('machine learning') || title.includes('ml') || description.includes('machine learning') || description.includes('artificial intelligence')) {
            mainTopic = "Artificial Intelligence and Machine Learning Research";
            chapters = [
                "INTRODUCTION",
                "LITERATURE REVIEW AND THEORETICAL BACKGROUND",
                "RESEARCH METHODOLOGY AND APPROACH",
                "ALGORITHM DESIGN AND THEORETICAL ANALYSIS",
                "EXPERIMENTAL SETUP AND DATA COLLECTION",
                "RESULTS ANALYSIS AND EVALUATION",
                "CONCLUSION"
            ];
        } else {
            chapters = [
                "INTRODUCTION",
                "LITERATURE REVIEW AND THEORETICAL FOUNDATIONS",
                "RESEARCH METHODOLOGY AND DESIGN",
                "DATA COLLECTION AND ANALYSIS",
                "EXPERIMENTAL RESULTS AND FINDINGS",
                "DISCUSSION AND IMPLICATIONS",
                "CONCLUSION"
            ];
        }
    }
    // INTERNSHIP REPORT - Practical training focus
    else if (type === 'internship') {
        if (title.includes('java') || title.includes('mysql') || title.includes('database') || description.includes('java') || description.includes('database') || description.includes('sql')) {
            mainTopic = "Java Programming and Database Systems Internship";
            chapters = [
                "INTRODUCTION",
                "COMPANY OVERVIEW AND TECHNOLOGY STACK",
                "TRAINING METHODOLOGY AND SKILL DEVELOPMENT",
                "PRACTICAL IMPLEMENTATION AND HANDS-ON EXPERIENCE",
                "PROJECT WORK AND REAL-WORLD APPLICATIONS",
                "LEARNING OUTCOMES AND PROFESSIONAL DEVELOPMENT",
                "CONCLUSION"
            ];
        } else if (title.includes('web') || title.includes('website') || title.includes('react') || description.includes('web development')) {
            mainTopic = "Web Development Internship";
            chapters = [
                "INTRODUCTION",
                "ORGANIZATION PROFILE AND WEB TECHNOLOGIES",
                "TRAINING PROGRAM AND SKILL ACQUISITION",
                "FRONTEND AND BACKEND DEVELOPMENT EXPERIENCE",
                "PROJECT CONTRIBUTIONS AND PRACTICAL WORK",
                "PROFESSIONAL SKILLS AND INDUSTRY EXPOSURE",
                "CONCLUSION"
            ];
        } else {
            chapters = [
                "INTRODUCTION",
                "ORGANIZATION OVERVIEW AND WORK ENVIRONMENT",
                "TRAINING PROGRAM AND LEARNING METHODOLOGY",
                "PRACTICAL WORK AND SKILL APPLICATION",
                "PROJECT CONTRIBUTIONS AND ACHIEVEMENTS",
                "PROFESSIONAL DEVELOPMENT AND LEARNING OUTCOMES",
                "CONCLUSION"
            ];
        }
    }
    // PROJECT REPORT - Implementation and development focus
    else {
        if (title.includes('java') || title.includes('mysql') || title.includes('database') || description.includes('java') || description.includes('database') || description.includes('sql')) {
            mainTopic = "Java Programming and Database Systems Project";
            chapters = [
                "INTRODUCTION",
                "SYSTEM ANALYSIS AND REQUIREMENTS GATHERING",
                "SYSTEM DESIGN AND ARCHITECTURE",
                "DATABASE DESIGN AND IMPLEMENTATION",
                "APPLICATION DEVELOPMENT AND CODING",
                "TESTING AND VALIDATION",
                "CONCLUSION"
            ];
        } else if (title.includes('ai') || title.includes('machine learning') || title.includes('ml') || description.includes('machine learning') || description.includes('artificial intelligence')) {
            mainTopic = "Artificial Intelligence and Machine Learning Project";
            chapters = [
                "INTRODUCTION",
                "PROBLEM ANALYSIS AND REQUIREMENTS STUDY",
                "ALGORITHM SELECTION AND MODEL DESIGN",
                "DATA PREPROCESSING AND FEATURE ENGINEERING",
                "MODEL IMPLEMENTATION AND TRAINING",
                "PERFORMANCE EVALUATION AND OPTIMIZATION",
                "CONCLUSION"
            ];
        } else if (title.includes('web') || title.includes('website') || title.includes('react') || description.includes('web development')) {
            mainTopic = "Web Development Project";
            chapters = [
                "INTRODUCTION",
                "REQUIREMENTS ANALYSIS AND SYSTEM STUDY",
                "SYSTEM DESIGN AND ARCHITECTURE PLANNING",
                "FRONTEND DEVELOPMENT AND USER INTERFACE",
                "BACKEND DEVELOPMENT AND DATABASE INTEGRATION",
                "TESTING AND DEPLOYMENT",
                "CONCLUSION"
            ];
        } else if (title.includes('mobile') || title.includes('app') || title.includes('android') || title.includes('ios') || description.includes('mobile')) {
            mainTopic = "Mobile Application Development Project";
            chapters = [
                "INTRODUCTION",
                "MOBILE PLATFORM ANALYSIS AND REQUIREMENTS",
                "APPLICATION DESIGN AND USER EXPERIENCE",
                "MOBILE APP DEVELOPMENT AND IMPLEMENTATION",
                "TESTING AND CROSS-PLATFORM COMPATIBILITY",
                "DEPLOYMENT AND PERFORMANCE OPTIMIZATION",
                "CONCLUSION"
            ];
        } else {
            chapters = [
                "INTRODUCTION",
                "SYSTEM ANALYSIS AND REQUIREMENTS GATHERING",
                "SYSTEM DESIGN AND METHODOLOGY",
                "IMPLEMENTATION AND DEVELOPMENT",
                "TESTING AND VALIDATION",
                "RESULTS AND PERFORMANCE ANALYSIS",
                "CONCLUSION"
            ];
        }
    }

    return { mainTopic, chapters };
}

// Main function to create the professional DOCX report (EXACTLY like offline version)
async function createPerfectDocx(config) {
    try {
        console.log('📝 Creating professional DOCX with comprehensive structure...');

        const { chapters } = generateDynamicChapterTitles(config.projectTitle, config.projectDescription, config.reportType);
        const mainBodyContent = [];

        // Process each chapter (now 7 chapters including Conclusion)
        for (let i = 0; i < chapters.length; i++) {
            const chapter = chapters[i];

            // Add page break before each chapter (except the first one)
            if (i > 0) {
                mainBodyContent.push(new Paragraph({ children: [new PageBreak()] }));
            }

            // Chapter Title Paragraph
            mainBodyContent.push(
                new Paragraph({
                    children: [new TextRun({ text: `CHAPTER ${i + 1}: ${chapter}`, bold: true, size: 28, font: "Times New Roman" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 480, after: 240 },
                })
            );

            // Generate and add chapter content
            const chapterContent = generateChapterContent(i + 1, chapter, config);
            const contentParagraphs = createFormattedParagraphs(chapterContent);
            mainBodyContent.push(...contentParagraphs);
        }

        // Add References section
        mainBodyContent.push(new Paragraph({ children: [new PageBreak()] }));
        mainBodyContent.push(
            new Paragraph({
                children: [new TextRun({ text: "REFERENCES", bold: true, size: 28, font: "Times New Roman" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 480, after: 240 },
            })
        );

        // Add reference content
        const references = [
            "1. https://docs.oracle.com/javase/ - Official Java documentation and programming guides",
            "2. https://www.mysql.com/ - MySQL database official website and comprehensive documentation",
            "3. https://docs.oracle.com/javase/tutorial/jdbc/ - JDBC tutorial and best practices guide",
            "4. https://dev.mysql.com/doc/connector-j/8.0/en/ - MySQL Connector/J developer guide",
            "5. https://www.oracle.com/java/technologies/javase-downloads.html - Java SE development kit",
            "6. https://mysql.com/products/workbench/ - MySQL Workbench for database design and management",
            "7. https://junit.org/junit5/ - JUnit 5 testing framework documentation",
            "8. https://www.baeldung.com/java-jdbc - Java JDBC tutorials and examples",
            "9. https://spring.io/guides/gs/relational-data-access/ - Spring framework database access guide",
            "10. https://www.tutorialspoint.com/java/ - Java programming tutorials and examples"
        ];

        const referenceParagraphs = createFormattedParagraphs(references.join('\n'));
        mainBodyContent.push(...referenceParagraphs);

        // Create the complete document (EXACTLY like offline version)
        const doc = new Document({
            sections: [
                // **SECTION 1: COVER PAGE (No Header/Footer)**
                {
                    children: createCoverPage(config),
                    headers: { default: new Header({ children: [new Paragraph("")] }) },
                    footers: { default: new Footer({ children: [new Paragraph("")] }) },
                    properties: {
                        page: {
                            pageNumbers: {
                                start: 1,
                                formatType: NumberFormat.NONE
                            },
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    }
                },

                // **SECTION 2: FRONT MATTER (Roman Numerals i, ii, iii, iv)**
                {
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: config.projectTitle.toUpperCase(),
                                            bold: true,
                                            size: 20, // 10pt
                                            font: "Times New Roman"
                                        })
                                    ],
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
                        ...createAbstractPage(config),
                        new Paragraph({ children: [new PageBreak()] }),
                        ...createTableOfContentsPage(config),
                        new Paragraph({ children: [new PageBreak()] }),
                        ...createListOfTablesPage(),
                        new Paragraph({ children: [new PageBreak()] }),
                        ...createListOfFiguresPage()
                    ],
                    properties: {
                        page: {
                            pageNumbers: {
                                start: 1,
                                formatType: NumberFormat.LOWER_ROMAN,
                            },
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        },
                    },
                },

                // **SECTION 3: MAIN BODY & REFERENCES (Arabic Numerals 1, 2, 3...)**
                {
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: config.projectTitle.toUpperCase(),
                                            bold: true,
                                            size: 20, // 10pt
                                            font: "Times New Roman"
                                        })
                                    ],
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
                            pageNumbers: {
                                start: 1,
                                formatType: NumberFormat.DECIMAL,
                            },
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        },
                    },
                },
            ],
            // Default styles for all sections
            styles: {
                default: {
                    document: {
                        run: {
                            size: 24, // 12pt
                            font: "Times New Roman",
                        },
                        paragraph: {
                            spacing: {
                                line: 360, // 1.5 line spacing
                            },
                        },
                    },
                },
            },
        });

        return await Packer.toBuffer(doc);

    } catch (error) {
        console.error('DOCX generation error:', error);
        throw new Error(`Failed to create DOCX: ${error.message}`);
    }
}

// Function to generate chapter content (EXACTLY like offline version)
function generateChapterContent(chapterNum, chapterTitle, config) {
    const chapterContents = {
        1: `1.1 Background and Motivation

The field of ${config.course} has witnessed significant advancements in recent years, particularly in areas related to ${config.projectTitle}. This project addresses the growing need for innovative solutions in modern technology through systematic analysis and implementation of advanced methodologies. The motivation stems from identifying gaps in current systems and the potential for improvement through comprehensive system design and development.

The rapid evolution of technology has created new opportunities and challenges in software development. Organizations increasingly require robust, scalable, and efficient solutions that can adapt to changing requirements and handle complex business processes. This project aims to bridge the gap between theoretical knowledge and practical implementation by developing a solution that incorporates industry best practices and modern development methodologies.

1.2 Problem Statement

The primary challenge lies in developing efficient and scalable solutions that meet contemporary requirements while maintaining reliability and performance standards. Current approaches often face limitations in terms of scalability, maintainability, user experience, and integration capabilities. These challenges significantly impact the overall effectiveness of existing systems and create opportunities for innovative solutions.

Specific problems identified include inadequate performance under high load conditions, limited scalability options, poor user interface design, lack of comprehensive documentation, and insufficient integration capabilities with modern systems. These issues affect user productivity, system reliability, and overall business efficiency.

1.3 Project Objectives and Goals

The main objectives include designing a comprehensive system architecture, implementing robust functionality with modern technologies, ensuring optimal performance and scalability, providing intuitive user interfaces that enhance user experience, and delivering comprehensive documentation and support materials.

Primary goals encompass developing efficient algorithms and data structures, creating responsive and accessible user interfaces, implementing comprehensive security measures, ensuring cross-platform compatibility, providing detailed testing and validation, and establishing maintenance and support procedures.

1.4 Scope and Limitations

This project covers the complete development lifecycle from requirements analysis to implementation, testing, and deployment preparation. The scope includes system architecture design, database design and implementation, user interface development, comprehensive testing strategies, performance optimization, and detailed documentation.

Limitations include time constraints that may affect the implementation of certain advanced features, resource availability for extensive testing environments, and technical constraints related to specific platform requirements. These limitations are carefully considered and addressed through appropriate planning and risk management strategies.

1.5 Report Organization and Structure

This report is structured to provide a comprehensive overview of the project development process, from initial planning and analysis to final implementation and testing. Each chapter builds upon previous sections to create a complete picture of the development methodology, implementation details, and validation results.

The organization follows academic standards and industry best practices for technical documentation, ensuring clarity, completeness, and professional presentation of all project aspects and achievements.`,

        7: `7.1 Project Summary and Achievements

The ${config.projectTitle} project has successfully achieved all primary objectives and delivered a comprehensive solution that demonstrates effective integration of modern technologies and development methodologies. This project represents a significant achievement that combines theoretical knowledge with practical implementation experience.

The primary achievement is the successful implementation of a robust, scalable solution that effectively addresses identified requirements and provides significant value to users and stakeholders. The implementation demonstrates mastery of current technologies and best practices while delivering measurable improvements over existing approaches.

7.2 Learning Outcomes and Skills Gained

This project has provided invaluable learning experiences that significantly enhanced both technical skills and professional development capabilities. The comprehensive nature of the project enabled deep exploration of software development concepts, system design principles, and project management methodologies.

Key learning outcomes include advanced programming skills, system architecture design capabilities, database management expertise, user interface development proficiency, testing and quality assurance methodologies, and project management experience. These skills provide a strong foundation for future professional development and career advancement.

7.3 Limitations and Challenges

Despite successful completion of all primary objectives, this project encountered several limitations and challenges that provided valuable learning opportunities and insights into real-world software development complexities. Understanding these limitations provides important context for project outcomes and future improvement opportunities.

Technical limitations include focus on specific technology platforms rather than broader technology ecosystems, time constraints that limited implementation of certain advanced features, and resource constraints that affected the scope of testing and validation activities. These limitations were managed through careful planning and prioritization.

7.4 Future Work and Recommendations

The successful completion of this project provides a solid foundation for numerous enhancement opportunities and future development directions. These recommendations address both technical improvements and strategic directions that could significantly enhance system capabilities and value proposition.

Future enhancements could include advanced feature implementation, integration with additional systems and platforms, performance optimization for larger scale deployments, and expansion of functionality to address additional use cases and requirements. The modular architecture design supports these enhancements while maintaining system stability and reliability.`
    };

    // Get base content for the chapter
    let content = chapterContents[chapterNum] || chapterContents[7]; // Default to conclusion if chapter not found

    // Add generic content for chapters 2-6
    if (chapterNum >= 2 && chapterNum <= 6) {
        content = `${chapterNum}.1 Overview and Introduction

This chapter provides comprehensive coverage of ${chapterTitle.toLowerCase()} as it relates to ${config.projectTitle}. The content demonstrates thorough understanding of the subject matter and its practical application in the context of this project.

The methodology involves systematic analysis, design, implementation, and evaluation of the proposed solution. The work demonstrates practical application of modern technologies and methodologies in addressing real-world challenges specific to ${config.projectTitle}.

${chapterNum}.2 Technical Implementation and Analysis

Key technical aspects include the development of robust algorithms, implementation of efficient data structures, and creation of user-friendly interfaces. The implementation follows industry best practices and incorporates modern development methodologies to ensure quality and maintainability.

The technical analysis covers performance optimization, security considerations, scalability planning, and integration capabilities. These aspects are crucial for the successful deployment and operation of the system in real-world environments.

${chapterNum}.3 Results and Validation

The results demonstrate successful achievement of the objectives outlined for this phase of the project. Comprehensive testing and validation ensure that all requirements are met and the system performs as expected under various conditions.

Performance metrics, user feedback, and system analytics provide quantitative evidence of the solution's effectiveness. The validation process includes both automated testing and manual verification to ensure comprehensive coverage of all system aspects.

${chapterNum}.4 Discussion and Analysis

The discussion analyzes the implications of the results and their significance in the context of the overall project objectives. Key findings are presented with supporting evidence and detailed analysis of their impact on the project outcomes.

The analysis includes comparison with existing solutions, identification of innovative aspects, and assessment of the contribution to the field. This comprehensive evaluation provides valuable insights for future development and research activities.`;
    }

    return content;
}

// Function to create perfectly formatted paragraphs (EXACTLY like offline version)
function createFormattedParagraphs(text) {
    const paragraphs = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) continue;

        // Skip any chapter headings that might be generated by AI
        if (trimmedLine.match(/^#+\s*Chapter \d+:/i) || trimmedLine.match(/^Chapter \d+:/i)) {
            continue; // Skip this line completely
        }

        // Main heading (e.g., 1.1 Background) or Front Matter heading or Sub-point headings (e.g., 7.3 Limitations)
        if (trimmedLine.match(/^\d+\.\d+/) || ['TRAINING CERTIFICATE', 'ACKNOWLEDGEMENT', 'ABSTRACT', 'REFERENCES', 'LIST OF CONTENTS'].includes(trimmedLine)) {
            const isFrontMatterHeading = ['TRAINING CERTIFICATE', 'ACKNOWLEDGEMENT', 'ABSTRACT', 'REFERENCES', 'LIST OF CONTENTS'].includes(trimmedLine);

            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: trimmedLine,
                            bold: true,
                            size: 28, // 14pt bold
                            font: "Times New Roman"
                        })
                    ],
                    alignment: isFrontMatterHeading ? AlignmentType.CENTER : AlignmentType.LEFT,
                    spacing: {
                        before: isFrontMatterHeading ? 480 : 360,
                        after: 240,
                        line: 360,
                        lineRule: "auto"
                    },
                    indent: { left: 0, right: 0 }
                })
            );
        }
        // Regular paragraph - 12pt normal text
        else {
            // Check for Reference format (Simple numbered list with URLs)
            const isReference = trimmedLine.match(/^\d+\.\s*https?:\/\//);

            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: trimmedLine,
                            bold: false,
                            size: 24, // 12pt normal text
                            font: "Times New Roman"
                        })
                    ],
                    alignment: isReference ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
                    spacing: {
                        before: 0,
                        after: 120, // Normal spacing
                        line: 360, // 1.5 line spacing
                        lineRule: "auto"
                    },
                    indent: isReference ? { left: 360 } : { left: 0, right: 0 } // Small indent for numbered references
                })
            );
        }
    }

    return paragraphs;
}

// Function to create professional cover page (EXACTLY like offline version)
function createCoverPage(details) {
    return [
        // Institution name at top
        new Paragraph({
            children: [
                new TextRun({
                    text: details.institution.toUpperCase(),
                    bold: true,
                    size: 32, // 16pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 240 }
        }),

        // Department
        new Paragraph({
            children: [
                new TextRun({
                    text: details.department || `Department of ${details.course}`,
                    bold: true,
                    size: 28, // 14pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),

        // Project title (main heading)
        new Paragraph({
            children: [
                new TextRun({
                    text: details.projectTitle.toUpperCase(),
                    bold: true,
                    size: 36, // 18pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1440, after: 1440 }
        }),

        // Report type
        new Paragraph({
            children: [
                new TextRun({
                    text: `A ${details.reportType.toUpperCase()} REPORT`,
                    bold: true,
                    size: 28, // 14pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),

        // Submitted by
        new Paragraph({
            children: [
                new TextRun({
                    text: "Submitted by:",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),

        // Student name
        new Paragraph({
            children: [
                new TextRun({
                    text: details.studentName,
                    bold: true,
                    size: 28, // 14pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),

        // Student ID
        new Paragraph({
            children: [
                new TextRun({
                    text: `Student ID: ${details.studentId}`,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),

        // Course
        new Paragraph({
            children: [
                new TextRun({
                    text: details.course,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),

        // Semester
        new Paragraph({
            children: [
                new TextRun({
                    text: details.semester,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),

        // Supervisor
        new Paragraph({
            children: [
                new TextRun({
                    text: "Under the guidance of:",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: details.supervisor,
                    bold: true,
                    size: 28, // 14pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),

        // Year
        new Paragraph({
            children: [
                new TextRun({
                    text: new Date().getFullYear().toString(),
                    bold: true,
                    size: 28, // 14pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720 }
        })
    ];
}

// Function to create Training Certificate page
function createCertificatePage(details) {
    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: "TRAINING CERTIFICATE",
                    bold: true,
                    size: 28, // 14pt bold
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 480 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: `This is to certify that ${details.studentName} (Student ID: ${details.studentId}) has successfully completed the ${details.reportType.toLowerCase()} work on "${details.projectTitle}" as part of the curriculum for ${details.course} at ${details.institution}.`,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 360, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: `The work was carried out under the supervision of ${details.supervisor} during the academic year ${new Date().getFullYear()}.`,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 720, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Date: _______________",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { before: 720, after: 360 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Signature of Supervisor",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 720 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: details.supervisor,
                    bold: true,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 240 }
        })
    ];
}

// Function to create Acknowledgement page
function createAcknowledgementPage(details) {
    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: "ACKNOWLEDGEMENT",
                    bold: true,
                    size: 28, // 14pt bold
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 480 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: `I would like to express my sincere gratitude to my supervisor, ${details.supervisor}, for her valuable guidance, continuous support, and encouragement throughout the development of this ${details.reportType.toLowerCase()}. Her expertise and insights have been instrumental in shaping this work.`,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 360, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: `I am also thankful to the faculty members of ${details.department || `Department of ${details.course}`}, ${details.institution}, for their support and for providing the necessary resources and facilities required for this work.`,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 360, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "I would also like to thank my family and friends for their constant encouragement and moral support throughout this journey.",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 720, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: details.studentName,
                    bold: true,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 720 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: details.studentId,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 240 }
        })
    ];
}

// Function to create Abstract page
function createAbstractPage(details) {
    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: "ABSTRACT",
                    bold: true,
                    size: 28, // 14pt bold
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 480 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: `This ${details.reportType.toLowerCase()} presents the comprehensive study and implementation of "${details.projectTitle}". ${details.projectDescription}`,
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 360, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "The methodology involves systematic analysis of Java programming concepts, MySQL database design, JDBC connectivity implementation, and comprehensive testing of CRUD operations. The work demonstrates practical application of object-oriented programming principles and database management techniques.",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 360, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Key contributions include the development of a robust Java application with MySQL integration, implementation of efficient database operations, creation of user-friendly interfaces, and comprehensive documentation of development processes and best practices.",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 360, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "The results demonstrate successful integration of Java applications with MySQL databases, effective implementation of CRUD operations, and development of scalable, maintainable code following industry best practices. The project provides a solid foundation for understanding enterprise-level Java development.",
                    bold: false,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 360, after: 720, line: 360, lineRule: "auto" }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: `Keywords: Java Programming, MySQL Database, JDBC Connectivity, CRUD Operations, ${details.course}, Database Management, Software Development`,
                    bold: true,
                    size: 24, // 12pt
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { before: 360 }
        })
    ];
}

// Function to create Table of Contents page
function createTableOfContentsPage(config) {
    const contents = [
        new Paragraph({
            children: [
                new TextRun({
                    text: "TABLE OF CONTENTS",
                    bold: true,
                    size: 28, // 14pt bold
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 480 }
        })
    ];

    // Set up the custom tab stop for the page number aligned to the right margin
    const tabStops = [{
        type: TabStopType.RIGHT,
        position: 9000, // Right align at 6.25 inches
        leader: LeaderType.DOT // Dots fill the space
    }];

    // TOC structure matching the exact format provided
    const tocItems = [
        { text: "Training Certificate", page: "i", bold: false, indent: 0 },
        { text: "Acknowledgement", page: "ii", bold: false, indent: 0 },
        { text: "Abstract", page: "iii", bold: false, indent: 0 },
        { text: "Table of contents", page: "iv-v", bold: false, indent: 0 },
        { text: "List of tables", page: "vi", bold: false, indent: 0 },
        { text: "List of figures", page: "vii", bold: false, indent: 0 },

        // Main chapters with proper page ranges for 50+ pages
        { text: "Chapter 1: Introduction", page: "1-9", bold: false, indent: 0 },
        { text: "1.1 Background and Motivation", page: "1", bold: false, indent: 360 },
        { text: "1.2 Problem Statement", page: "3", bold: false, indent: 360 },
        { text: "1.3 Objectives", page: "6", bold: false, indent: 360 },
        { text: "1.4 Scope and Limitations", page: "8", bold: false, indent: 360 },

        { text: "Chapter 2: Literature Review", page: "10-17", bold: false, indent: 0 },
        { text: "2.1 Theoretical Background", page: "10", bold: false, indent: 360 },
        { text: "2.2 Technology Review", page: "12", bold: false, indent: 360 },
        { text: "2.3 Related Work and Existing Solutions", page: "14", bold: false, indent: 360 },
        { text: "2.4 Research Gap and Justification", page: "16", bold: false, indent: 360 },

        { text: "Chapter 3: Methodology", page: "18-24", bold: false, indent: 0 },
        { text: "3.1 Development Approach", page: "18", bold: false, indent: 360 },
        { text: "3.2 System Requirements", page: "19", bold: false, indent: 360 },
        { text: "3.3 System Design and Architecture", page: "21", bold: false, indent: 360 },
        { text: "3.4 Technology Stack and Tools", page: "23", bold: false, indent: 360 },

        { text: "Chapter 4: System Analysis and Design", page: "25-32", bold: false, indent: 0 },
        { text: "4.1 Requirements Analysis", page: "25", bold: false, indent: 360 },
        { text: "4.2 System Architecture", page: "26", bold: false, indent: 360 },
        { text: "4.3 Database Design", page: "29", bold: false, indent: 360 },
        { text: "4.4 User Interface Design", page: "31", bold: false, indent: 360 },

        { text: "Chapter 5: Implementation", page: "33-39", bold: false, indent: 0 },
        { text: "5.1 Development Environment Setup", page: "33", bold: false, indent: 360 },
        { text: "5.2 Database Implementation", page: "35", bold: false, indent: 360 },
        { text: "5.3 Core System Development", page: "37", bold: false, indent: 360 },
        { text: "5.4 User Interface Development", page: "38", bold: false, indent: 360 },

        { text: "Chapter 6: Testing and Validation", page: "40-47", bold: false, indent: 0 },
        { text: "6.1 Testing Strategy", page: "40", bold: false, indent: 360 },
        { text: "6.2 Unit and Integration Testing", page: "42", bold: false, indent: 360 },
        { text: "6.3 System and Performance Testing", page: "46", bold: false, indent: 360 },

        { text: "Chapter 7: Conclusion", page: "48-50", bold: false, indent: 0 },
        { text: "7.1 Project Summary and Achievements", page: "48", bold: false, indent: 360 },
        { text: "7.2 Learning Outcomes and Skills Gained", page: "48", bold: false, indent: 360 },
        { text: "7.3 Limitations and Challenges", page: "49", bold: false, indent: 360 },
        { text: "7.4 Future Work and Recommendations", page: "49", bold: false, indent: 360 },

        { text: "References", page: "51", bold: false, indent: 0 }
    ];

    for (const item of tocItems) {
        contents.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: item.text,
                        bold: item.bold,
                        size: 24, // 12pt
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: '\t', // Tab character to trigger the tab stop
                        size: 24,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: item.page,
                        bold: item.bold,
                        size: 24,
                        font: "Times New Roman"
                    })
                ],
                alignment: AlignmentType.LEFT,
                spacing: {
                    before: 0,
                    after: 120, // 6pt after
                    line: 360,  // 1.5 line spacing
                    lineRule: "auto"
                },
                indent: { left: item.indent },
                tabStops: tabStops
            })
        );
    }

    return contents;
}

// Function to create footer with page numbering
function createFooter() {
    return new Footer({
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        children: [PageNumber.CURRENT],
                        size: 24, // 12pt
                        font: "Times New Roman"
                    }),
                ],
                alignment: AlignmentType.RIGHT, // Page number on the bottom right
                spacing: { before: 0 }
            }),
        ],
    });
}

// Function to create List of Tables page
function createListOfTablesPage() {
    const tabStops = [{
        type: TabStopType.RIGHT,
        position: 9000,
        leader: LeaderType.DOT
    }];

    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: "LIST OF TABLES",
                    bold: true,
                    size: 28, // 14pt bold
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 480 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Table 3.1: System Requirements Specification",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "20",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { before: 240, after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Table 4.1: Database Schema Design",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "27",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Table 4.2: JDBC Connection Parameters",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "30",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Table 5.1: Implementation Timeline",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "34",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Table 6.1: Test Case Results",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "42",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Table 6.2: Performance Metrics",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "45",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        })
    ];
}

// Function to create List of Figures page
function createListOfFiguresPage() {
    const tabStops = [{
        type: TabStopType.RIGHT,
        position: 9000,
        leader: LeaderType.DOT
    }];

    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: "LIST OF FIGURES",
                    bold: true,
                    size: 28, // 14pt bold
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 480 }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Figure 3.1: System Architecture Diagram",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "22",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { before: 240, after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Figure 4.1: Database Entity Relationship Diagram",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "28",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Figure 4.2: User Interface Mockup",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "31",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Figure 5.1: Application Flow Diagram",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "36",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Figure 5.2: JDBC Connection Flow",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "38",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: "Figure 6.1: Test Results Dashboard",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: '\t',
                    size: 24,
                    font: "Times New Roman"
                }),
                new TextRun({
                    text: "43",
                    bold: false,
                    size: 24,
                    font: "Times New Roman"
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            tabStops: tabStops
        })
    ];
}