// Dynamic Lakshay-Style Report Generator - Comprehensive University Format
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, NumberFormat, TabStopPosition, TabStopType, Table, TableRow, TableCell, WidthType } = require('docx');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const config = req.body;
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType'];
        
        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        console.log(`🤖 Generating Lakshay-style report for: ${config.projectTitle}`);
        
        // Generate dynamic report in Lakshay format
        const reportBuffer = await generateLakshayStyleReport(config);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.studentId}_${config.projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_50Page_Report_${timestamp}.docx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);
        
        console.log(`✅ Lakshay-style report generated: ${reportBuffer.length} bytes`);
        res.send(reportBuffer);
        
    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({ error: 'Failed to generate report', details: error.message });
    }
};

// Generate report in Lakshay's exact format but with dynamic content
async function generateLakshayStyleReport(config) {
    console.log('🔍 Analyzing project for dynamic content generation...');
    await delay(300);
    
    // Analyze project to determine technology and content strategy
    const analysis = analyzeProjectForLakshayFormat(config);
    console.log(`📊 Project analysis: ${analysis.category} | ${analysis.technologies.join(', ')}`);
    
    // Generate dynamic chapters in Lakshay format
    const chapters = generateLakshayChapters(analysis, config);
    console.log(`📚 Generated ${chapters.length} chapters in Lakshay format`);
    
    // Generate content for each chapter
    const generatedChapters = [];
    for (let i = 0; i < chapters.length; i++) {
        console.log(`🔄 Generating Chapter ${i + 1}: ${chapters[i].title}`);
        await delay(400 + Math.random() * 600);
        
        const chapterContent = await generateLakshayChapterContent(i + 1, chapters[i], config, analysis);
        generatedChapters.push(chapterContent);
        
        console.log(`✅ Chapter ${i + 1} completed: ${chapterContent.wordCount} words`);
    }
    
    console.log('📝 Assembling Lakshay-style document...');
    await delay(200);
    
    return await createLakshayDocument(config, generatedChapters, analysis);
}

// Analyze project details for Lakshay format
function analyzeProjectForLakshayFormat(config) {
    const title = config.projectTitle.toLowerCase();
    const desc = config.projectDescription.toLowerCase();
    
    let category = 'general';
    let technologies = ['Software Development'];
    let focus = 'implementation';
    
    // Determine project category and technologies (Lakshay style)
    if (title.includes('java') || desc.includes('java') || title.includes('mysql') || desc.includes('database')) {
        category = 'java-database';
        technologies = ['Java Programming', 'MySQL Database', 'JDBC Connectivity', 'Database Management'];
        focus = 'database-integration';
    } else if (title.includes('python') || desc.includes('python') || title.includes('django') || desc.includes('flask')) {
        category = 'python-web';
        technologies = ['Python Programming', 'Web Development', 'Database Integration', 'Framework Development'];
        focus = 'web-development';
    } else if (title.includes('react') || title.includes('node') || title.includes('javascript') || desc.includes('web')) {
        category = 'web-development';
        technologies = ['JavaScript', 'React.js', 'Node.js', 'Web Technologies'];
        focus = 'frontend-backend';
    } else if (title.includes('android') || title.includes('mobile') || desc.includes('app')) {
        category = 'mobile-development';
        technologies = ['Mobile Development', 'Android Programming', 'Mobile UI/UX'];
        focus = 'mobile-app';
    }
    
    return { category, technologies, focus, reportType: config.reportType };
}

// Generate Lakshay-style chapter structure
function generateLakshayChapters(analysis, config) {
    // Lakshay's exact 7-chapter structure but with dynamic titles
    const chapters = [
        {
            title: 'INTRODUCTION',
            sections: [
                'Background and Motivation',
                'Problem Statement', 
                'Objectives',
                'Scope and Limitations'
            ]
        },
        {
            title: 'LITERATURE REVIEW',
            sections: [
                'Theoretical Background',
                'Technology Review',
                'Related Work and Existing Solutions',
                'Research Gap and Justification'
            ]
        },
        {
            title: 'METHODOLOGY',
            sections: [
                'Development Approach',
                'System Requirements',
                'System Design and Architecture',
                'Technology Stack and Tools'
            ]
        },
        {
            title: 'SYSTEM ANALYSIS AND DESIGN',
            sections: [
                'Requirements Analysis',
                'System Architecture',
                analysis.category === 'java-database' ? 'Database Design' : 'Data Management Design',
                'User Interface Design'
            ]
        },
        {
            title: 'IMPLEMENTATION',
            sections: [
                'Development Environment Setup',
                analysis.category === 'java-database' ? 'Database Implementation' : 'Core System Implementation',
                'Core System Development',
                'User Interface Development'
            ]
        },
        {
            title: 'TESTING AND VALIDATION',
            sections: [
                'Testing Strategy',
                'Unit and Integration Testing',
                'System and Performance Testing'
            ]
        },
        {
            title: 'CONCLUSION',
            sections: [
                'Project Summary and Achievements',
                'Learning Outcomes and Skills Gained',
                'Limitations and Challenges',
                'Future Work and Recommendations'
            ]
        }
    ];
    
    return chapters;
}

// Generate dynamic content for Lakshay-style chapters
async function generateLakshayChapterContent(chapterNum, chapterInfo, config, analysis) {
    let content = '';
    let wordCount = 0;
    
    // Generate content for each section
    for (let i = 0; i < chapterInfo.sections.length; i++) {
        const section = chapterInfo.sections[i];
        await delay(100 + Math.random() * 200);
        
        const sectionContent = generateLakshaySection(chapterNum, i + 1, section, config, analysis);
        content += `${chapterNum}.${i + 1} ${section}\\n\\n${sectionContent}\\n\\n`;
        wordCount += sectionContent.split(' ').length;
    }
    
    return {
        number: chapterNum,
        title: chapterInfo.title,
        content: content.trim(),
        wordCount: wordCount
    };
}

// Generate Lakshay-style section content
function generateLakshaySection(chapterNum, sectionNum, sectionTitle, config, analysis) {
    const projectTitle = config.projectTitle;
    const technologies = analysis.technologies.join(', ');
    const category = analysis.category;
    
    // Generate content based on Lakshay's style and structure
    if (chapterNum === 1) {
        // Introduction chapter
        if (sectionTitle.includes('Background')) {
            return `The rapid advancement in ${technologies} has revolutionized the way modern software applications are developed and deployed. In today's digital era, the integration of robust programming languages with efficient database management systems has become crucial for developing scalable and maintainable applications.\\n\\nThe project "${projectTitle}" addresses the contemporary challenges in ${category.replace('-', ' ')} development by leveraging the power of ${technologies}. This comprehensive approach ensures optimal performance, security, and user experience while maintaining industry-standard development practices.\\n\\nThe motivation for this project stems from the increasing demand for efficient data management solutions in various industries. Organizations require systems that can handle complex data operations while providing intuitive user interfaces and maintaining data integrity. This project demonstrates practical implementation of these requirements using modern development methodologies.`;
        } else if (sectionTitle.includes('Problem Statement')) {
            return `Traditional approaches to ${category.replace('-', ' ')} development often face significant challenges in terms of scalability, maintainability, and performance optimization. Many existing solutions lack proper integration between different system components, leading to inefficient data processing and poor user experience.\\n\\nSpecific problems identified in current systems include inadequate database connectivity management, insufficient error handling mechanisms, limited scalability for concurrent users, poor user interface design and usability, and lack of comprehensive security measures for data protection.\\n\\nThese limitations create substantial barriers to effective system deployment and operation in real-world scenarios. The need for a comprehensive solution that addresses these challenges while incorporating best practices in ${technologies} development has become increasingly apparent.`;
        } else if (sectionTitle.includes('Objectives')) {
            return `The primary objective of this project is to design and implement a comprehensive ${category.replace('-', ' ')} solution that demonstrates effective integration of ${technologies}. The system aims to provide efficient data management capabilities while ensuring optimal performance and user satisfaction.\\n\\nSpecific objectives include: Development of a robust system architecture that supports scalability and maintainability; Implementation of efficient database connectivity and data management operations; Creation of an intuitive and user-friendly interface that enhances user experience; Integration of comprehensive security measures to protect sensitive data; Demonstration of best practices in ${technologies} development and deployment.\\n\\nThese objectives are structured to ensure both immediate practical value and long-term contribution to the field of ${category.replace('-', ' ')} development, with emphasis on creating a solution that can serve as a reference for future development projects.`;
        }
    } else if (chapterNum === 7) {
        // Conclusion chapter
        if (sectionTitle.includes('Summary')) {
            return `The "${projectTitle}" project has successfully achieved all primary objectives and delivered a comprehensive solution that demonstrates effective integration of ${technologies}. The implementation showcases practical application of modern development methodologies while addressing real-world challenges in ${category.replace('-', ' ')} development.\\n\\nKey achievements include successful implementation of all planned features and functionalities, comprehensive system testing and validation procedures, detailed documentation of development processes and methodologies, and demonstration of best practices in ${technologies} development.\\n\\nThe project contributes significantly to the understanding of effective ${category.replace('-', ' ')} development practices and provides a solid foundation for future enhancements and related development initiatives.`;
        } else if (sectionTitle.includes('Learning Outcomes')) {
            return `This project has provided valuable learning experiences in various aspects of ${technologies} development. The hands-on implementation approach has enhanced understanding of practical software development challenges and their solutions.\\n\\nKey learning outcomes include: Comprehensive understanding of ${technologies} integration and best practices; Practical experience in system design, implementation, and testing methodologies; Enhanced problem-solving skills through real-world development challenges; Improved understanding of software engineering principles and their practical application.\\n\\nThese learning experiences have contributed to professional development and prepared the foundation for advanced projects in ${category.replace('-', ' ')} development and related fields.`;
        } else if (sectionTitle.includes('Limitations')) {
            return `While the project has achieved its primary objectives, certain limitations and challenges were encountered during the development process. These limitations provide opportunities for future improvements and enhancements.\\n\\nIdentified limitations include: Scope constraints that limited the implementation of certain advanced features; Time limitations that affected the depth of testing and optimization procedures; Resource constraints that influenced technology choices and implementation approaches; Learning curve challenges associated with mastering new technologies and methodologies.\\n\\nDespite these limitations, the project successfully demonstrates the core concepts and provides a solid foundation for future development and enhancement efforts.`;
        } else if (sectionTitle.includes('Future Work')) {
            return `Future enhancements to the "${projectTitle}" system could include implementation of advanced features such as cloud integration for improved scalability and accessibility, mobile application development for enhanced user reach and convenience, integration with emerging technologies and industry standards, and implementation of advanced analytics and reporting capabilities.\\n\\nTechnical recommendations for future development include adoption of microservices architecture for improved modularity and scalability, implementation of containerization technologies for enhanced deployment flexibility, integration with continuous integration and deployment pipelines, and development of comprehensive API documentation and developer resources.\\n\\nThese future enhancements would significantly expand the system's capabilities and ensure its continued relevance in the evolving landscape of ${category.replace('-', ' ')} development.`;
        }
    } else {
        // Middle chapters - generate content based on section and context
        if (sectionTitle.includes('Requirements') || sectionTitle.includes('Analysis')) {
            return `The ${sectionTitle.toLowerCase()} phase of the "${projectTitle}" project involved comprehensive stakeholder consultation, detailed examination of existing systems, and thorough evaluation of technical requirements and constraints specific to ${category.replace('-', ' ')} development.\\n\\nThe analysis process included systematic evaluation of functional requirements that define what the system should accomplish, comprehensive assessment of non-functional requirements including performance, security, and usability metrics, detailed technical requirement analysis covering ${technologies} integration and compatibility, and thorough evaluation of system constraints and limitations.\\n\\nKey findings from the analysis indicate the need for robust ${technologies} implementation with proper error handling and validation, scalable architecture supporting multiple concurrent users and high-volume operations, intuitive user interfaces that enhance productivity and user satisfaction, and comprehensive security measures to protect sensitive data and system integrity.`;
        } else if (sectionTitle.includes('Design') || sectionTitle.includes('Architecture')) {
            return `The ${sectionTitle.toLowerCase()} phase focused on creating a comprehensive architectural framework that supports all identified requirements while ensuring scalability, maintainability, and performance optimization for ${category.replace('-', ' ')} systems.\\n\\nThe design approach emphasizes modular architecture with clear separation of concerns and well-defined interfaces, comprehensive data modeling and ${analysis.category === 'java-database' ? 'database' : 'data management'} design optimized for ${technologies}, user interface design following modern usability principles and accessibility standards, and integration design ensuring seamless communication between system components.\\n\\nKey design decisions include adoption of ${technologies} for optimal performance and reliability, implementation of industry-standard design patterns and architectural principles, comprehensive error handling and logging mechanisms for robust system operation, and scalable architecture supporting future growth and enhancement requirements.`;
        } else if (sectionTitle.includes('Implementation') || sectionTitle.includes('Development')) {
            return `The ${sectionTitle.toLowerCase()} phase involved systematic development of all system components using ${technologies}, following industry best practices and established development methodologies for ${category.replace('-', ' ')} systems.\\n\\nThe development process included comprehensive coding standards and review procedures to ensure code quality and maintainability, systematic testing and validation of all implemented features and functionalities, detailed documentation of code, implementation decisions, and system architecture, continuous integration and quality assurance processes throughout the development lifecycle.\\n\\nKey implementation aspects encompass efficient algorithm development and optimization for performance-critical operations, comprehensive ${analysis.category === 'java-database' ? 'database' : 'data management'} integration and performance tuning, user interface development with focus on usability, accessibility, and responsive design, thorough testing and validation of all system components and their interactions.`;
        } else if (sectionTitle.includes('Testing')) {
            return `The ${sectionTitle.toLowerCase()} process involved comprehensive testing strategies designed to ensure system reliability, performance, and user satisfaction across all operational scenarios for ${category.replace('-', ' ')} applications.\\n\\nThe testing approach included systematic unit testing of individual components and modules, comprehensive integration testing of system interfaces and data flows, thorough system testing under various load conditions and usage patterns, detailed user acceptance testing with stakeholder involvement and feedback collection, and comprehensive security and performance testing to validate system robustness.\\n\\nTesting results demonstrate successful achievement of all performance benchmarks and requirements, comprehensive validation of functional requirements and user expectations, thorough verification of security measures and data integrity protocols, positive user feedback on system usability and effectiveness, and successful validation of scalability and reliability requirements under various operational conditions.`;
        } else {
            // Generic content for other sections
            return `The ${sectionTitle.toLowerCase()} component of the "${projectTitle}" project represents a critical element in the overall system architecture and implementation strategy for ${category.replace('-', ' ')} development.\\n\\nThis section details the comprehensive approach taken to address the specific requirements and challenges associated with ${sectionTitle.toLowerCase()}, utilizing ${technologies} and following industry best practices for optimal results and maintainability.\\n\\nKey considerations include technical feasibility and implementation complexity assessment, integration requirements with existing system components and external services, performance and scalability implications for long-term system operation and growth, and comprehensive maintenance and enhancement procedures supporting sustainable system evolution and continuous improvement.`;
        }
    }
    
    // Fallback content
    return `This section provides comprehensive coverage of ${sectionTitle.toLowerCase()} as it relates to the "${projectTitle}" project, demonstrating thorough understanding and practical application of ${technologies} in ${category.replace('-', ' ')} development.`;
}

// Create Lakshay-style document with exact formatting
async function createLakshayDocument(config, chapters, analysis) {
    // Create the complete document with Lakshay's exact structure
    const doc = new Document({
        sections: [
            // Cover page section
            {
                children: createLakshayCoverPage(config),
                headers: { default: new Header({ children: [new Paragraph("")] }) },
                footers: { default: new Footer({ children: [new Paragraph("")] }) },
                properties: {
                    page: {
                        pageNumbers: { start: 1, formatType: NumberFormat.NONE },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                }
            },
            
            // Front matter section (Roman numerals)
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [new TextRun({
                                    text: config.projectTitle.toUpperCase(),
                                    bold: true,
                                    size: 20,
                                    font: "Times New Roman"
                                })],
                                alignment: AlignmentType.LEFT, // Lakshay's requirement: LEFT not CENTER
                                spacing: { after: 120 }
                            })
                        ]
                    })
                },
                footers: { default: createLakshayFooter() },
                children: [
                    ...createTrainingCertificate(config),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createAcknowledgement(config),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createAbstract(config, analysis),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createLakshayTOC(chapters),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createListOfTables(),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createListOfFigures()
                ],
                properties: {
                    page: {
                        pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                }
            },
            
            // Main content section (Arabic numerals)
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [new TextRun({
                                    text: config.projectTitle.toUpperCase(),
                                    bold: true,
                                    size: 20,
                                    font: "Times New Roman"
                                })],
                                alignment: AlignmentType.LEFT, // Lakshay's requirement: LEFT not CENTER
                                spacing: { after: 120 }
                            })
                        ]
                    })
                },
                footers: { default: createLakshayFooter() },
                children: createLakshayMainContent(chapters),
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
                    run: { size: 24, font: "Times New Roman" }, // 12pt
                    paragraph: { spacing: { line: 360 } } // 1.5 line spacing
                }
            }
        }
    });
    
    return await Packer.toBuffer(doc);
}

// Create Lakshay-style cover page
function createLakshayCoverPage(config) {
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
                text: "Submitted by:",
                bold: false,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: config.studentName,
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Student ID: ${config.studentId}`,
                bold: false,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `${config.course} - ${config.semester}`,
                bold: false,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Under the guidance of:",
                bold: false,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: config.supervisor,
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: new Date().getFullYear().toString(),
                bold: true,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 960 }
        })
    ];
}

// Create Training Certificate page
function createTrainingCertificate(config) {
    return [
        new Paragraph({
            children: [new TextRun({
                text: "TRAINING CERTIFICATE",
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `This is to certify that ${config.studentName} (${config.studentId}) has successfully completed the ${config.reportType.toLowerCase()} work on "${config.projectTitle}" under my supervision.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `The work demonstrates comprehensive understanding of the subject matter and shows practical application of theoretical concepts learned during the ${config.course} program.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `The student has shown dedication, technical competence, and professional approach throughout the ${config.reportType.toLowerCase()} period.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: config.supervisor,
                bold: true,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 720, after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Supervisor",
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: config.institution,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.RIGHT
        })
    ];
}

// Create Acknowledgement page
function createAcknowledgement(config) {
    return [
        new Paragraph({
            children: [new TextRun({
                text: "ACKNOWLEDGEMENT",
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `I would like to express my sincere gratitude to my supervisor ${config.supervisor} for their invaluable guidance, continuous support, and encouragement throughout this ${config.reportType.toLowerCase()} work.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `I am grateful to ${config.institution} and the Department of ${config.course} for providing the necessary resources and facilities that made this work possible.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "I would also like to thank my family and friends for their constant support and motivation throughout this journey.",
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Finally, I acknowledge all the authors and researchers whose work has been referenced in this report and has contributed to the successful completion of this project.",
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: config.studentName,
                bold: true,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 480 }
        })
    ];
}

// Create Abstract page
function createAbstract(config, analysis) {
    return [
        new Paragraph({
            children: [new TextRun({
                text: "ABSTRACT",
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `This ${config.reportType.toLowerCase()} presents the development and implementation of "${config.projectTitle}", a comprehensive solution that demonstrates the effective integration of ${analysis.technologies.join(', ')} technologies.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `The project addresses contemporary challenges in ${analysis.category.replace('-', ' ')} development by implementing modern software engineering practices and industry-standard development methodologies.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "The system demonstrates efficient data management, user-friendly interface design, and robust performance optimization. Comprehensive testing and validation procedures ensure system reliability and user satisfaction.",
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `The successful implementation of this project contributes to the field of ${analysis.category.replace('-', ' ')} development and provides a foundation for future enhancements and related research initiatives.`,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: `Keywords: ${analysis.technologies.join(', ')}, Software Development, System Implementation, Database Management`,
                bold: true,
                size: 24,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.JUSTIFIED
        })
    ];
}

// Create Lakshay-style Table of Contents
function createLakshayTOC(chapters) {
    const contents = [];
    
    // TOC Title
    contents.push(
        new Paragraph({
            children: [new TextRun({
                text: "TABLE OF CONTENTS",
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 }
        })
    );
    
    // Lakshay's exact TOC structure
    const tocItems = [
        { text: "Training Certificate", page: "i", bold: false, indent: 0 },
        { text: "Acknowledgement", page: "ii", bold: false, indent: 0 },
        { text: "Abstract", page: "iii", bold: false, indent: 0 },
        { text: "Table of contents", page: "iv-v", bold: false, indent: 0 },
        { text: "List of tables", page: "vi", bold: false, indent: 0 },
        { text: "List of figures", page: "vii", bold: false, indent: 0 },

        // Dynamic chapters with Lakshay's page ranges
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

        { text: "Chapter 7: Conclusion", page: "47-49", bold: false, indent: 0 },
        { text: "7.1 Project Summary and Achievements", page: "47", bold: false, indent: 360 },
        { text: "7.2 Learning Outcomes and Skills Gained", page: "47", bold: false, indent: 360 },
        { text: "7.3 Limitations and Challenges", page: "48", bold: false, indent: 360 },
        { text: "7.4 Future Work and Recommendations", page: "48", bold: false, indent: 360 },

        { text: "References", page: "49", bold: false, indent: 0 }
    ];

    for (const item of tocItems) {
        contents.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: item.text,
                        bold: item.bold,
                        size: 24,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: '\t',
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
                spacing: { before: 0, after: 120 },
                indent: { left: item.indent },
                tabStops: [
                    {
                        type: TabStopType.RIGHT,
                        position: 8640 // Right-aligned tab for page numbers
                    }
                ]
            })
        );
    }
    
    return contents;
}

// Create List of Tables
function createListOfTables() {
    return [
        new Paragraph({
            children: [new TextRun({
                text: "LIST OF TABLES",
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Table 3.1: System Requirements Specification",
                size: 24,
                font: "Times New Roman"
            })],
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Table 4.1: Database Schema Design",
                size: 24,
                font: "Times New Roman"
            })],
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Table 6.1: Testing Results Summary",
                size: 24,
                font: "Times New Roman"
            })],
            spacing: { after: 120 }
        })
    ];
}

// Create List of Figures
function createListOfFigures() {
    return [
        new Paragraph({
            children: [new TextRun({
                text: "LIST OF FIGURES",
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Figure 3.1: System Architecture Diagram",
                size: 24,
                font: "Times New Roman"
            })],
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Figure 4.1: Database Entity Relationship Diagram",
                size: 24,
                font: "Times New Roman"
            })],
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({
                text: "Figure 5.1: User Interface Design",
                size: 24,
                font: "Times New Roman"
            })],
            spacing: { after: 120 }
        })
    ];
}

// Create main content with Lakshay formatting
function createLakshayMainContent(chapters) {
    const mainContent = [];
    
    // Add chapters with proper formatting
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        if (i > 0) {
            mainContent.push(new Paragraph({ children: [new PageBreak()] }));
        }
        
        // Chapter title
        mainContent.push(
            new Paragraph({
                children: [new TextRun({
                    text: `CHAPTER ${chapter.number}: ${chapter.title}`,
                    bold: true,
                    size: 28,
                    font: "Times New Roman"
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 480, after: 360 }
            })
        );
        
        // Chapter content with Lakshay formatting
        const paragraphs = createLakshayFormattedParagraphs(chapter.content);
        mainContent.push(...paragraphs);
    }
    
    // Add references section
    mainContent.push(new Paragraph({ children: [new PageBreak()] }));
    mainContent.push(
        new Paragraph({
            children: [new TextRun({
                text: "REFERENCES",
                bold: true,
                size: 28,
                font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360 }
        })
    );
    
    const references = generateLakshayReferences();
    const refParagraphs = createLakshayFormattedParagraphs(references.join('\\n'));
    mainContent.push(...refParagraphs);
    
    return mainContent;
}

// Create Lakshay-formatted paragraphs
function createLakshayFormattedParagraphs(text) {
    const paragraphs = [];
    const lines = text.split('\\n').filter(line => line.trim());
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Section headings (e.g., "1.1 Background") - Lakshay's requirement: BOLD
        if (trimmedLine.match(/^\\d+\\.\\d+/)) {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({
                        text: trimmedLine,
                        bold: true, // Lakshay's requirement: Bold sub-point headings
                        size: 26,
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.LEFT,
                    spacing: { before: 360, after: 240, line: 360, lineRule: "auto" }
                })
            );
        } else {
            // Regular paragraphs
            const isReference = trimmedLine.match(/^\\d+\\./);
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({
                        text: trimmedLine,
                        bold: false,
                        size: 24,
                        font: "Times New Roman"
                    })],
                    alignment: isReference ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
                    spacing: { before: 0, after: 120, line: 360, lineRule: "auto" },
                    indent: isReference ? { left: 360 } : { left: 0, right: 0 }
                })
            );
        }
    }
    
    return paragraphs;
}

// Generate Lakshay-style references
function generateLakshayReferences() {
    return [
        "1. Oracle Corporation. (2023). Java Platform, Standard Edition Documentation. Oracle Technology Network.",
        "2. MySQL AB. (2023). MySQL 8.0 Reference Manual. Oracle Corporation.",
        "3. Horstmann, C. S., & Cornell, G. (2022). Core Java Volume I: Fundamentals. Pearson Education.",
        "4. Reese, G. (2021). Database Programming with JDBC and Java. O'Reilly Media.",
        "5. Silberschatz, A., Galvin, P. B., & Gagne, G. (2022). Operating System Concepts. John Wiley & Sons.",
        "6. Sommerville, I. (2021). Software Engineering. Pearson Education Limited.",
        "7. Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach. McGraw-Hill Education.",
        "8. Date, C. J. (2019). An Introduction to Database Systems. Pearson Education."
    ];
}

// Create Lakshay-style footer
function createLakshayFooter() {
    return new Footer({
        children: [
            new Paragraph({
                children: [new TextRun({
                    text: "Page ",
                    size: 20,
                    font: "Times New Roman"
                })],
                alignment: AlignmentType.CENTER
            })
        ]
    });
}

// Helper function for delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}