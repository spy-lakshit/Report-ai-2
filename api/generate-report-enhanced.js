// Enhanced Academic Report Generator - Full Features + Reliable
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, NumberFormat, TabStopPosition, TabStopType, LeaderType, PageNumber } = require('docx');

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

        console.log(`🎓 Generating enhanced academic report for: ${config.projectTitle}`);

        // Generate comprehensive report with AI + fallback
        const reportBuffer = await generateEnhancedReport(config);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_Academic_Report_${timestamp}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);

        console.log(`✅ Enhanced report generated: ${reportBuffer.length} bytes`);
        res.send(reportBuffer);

    } catch (error) {
        console.error('❌ Enhanced report error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ 
            error: 'Failed to generate report', 
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Generate enhanced academic report
async function generateEnhancedReport(config) {
    console.log('📚 Generating enhanced academic report...');

    // Get chapter structure based on report type
    const chapterTitles = getChapterTitles(config.reportType);
    const generatedChapters = [];
    let totalWords = 0;

    // Generate content for each chapter with AI + fallback
    for (let i = 0; i < chapterTitles.length; i++) {
        const chapterTitle = chapterTitles[i];
        console.log(`📝 Generating Chapter ${i + 1}: ${chapterTitle}...`);

        const chapterContent = await generateChapterContent(chapterTitle, i, config);
        const wordCount = chapterContent.split(' ').length;

        generatedChapters.push({
            number: i + 1,
            title: chapterTitle,
            content: chapterContent,
            wordCount: wordCount
        });

        totalWords += wordCount;
        console.log(`✅ Chapter ${i + 1} completed: ${wordCount} words`);
    }

    console.log(`🎉 Enhanced report generated: ${totalWords} total words!`);
    return await createEnhancedDocument(config, generatedChapters);
}

// Get chapter titles based on report type
function getChapterTitles(reportType) {
    const titles = {
        'thesis': [
            "INTRODUCTION", 
            "LITERATURE REVIEW", 
            "RESEARCH METHODOLOGY", 
            "SYSTEM DESIGN AND IMPLEMENTATION", 
            "RESULTS AND ANALYSIS", 
            "CONCLUSION AND FUTURE WORK"
        ],
        'internship': [
            "INTRODUCTION", 
            "COMPANY OVERVIEW AND BACKGROUND", 
            "ROLE DESCRIPTION AND RESPONSIBILITIES", 
            "PROJECTS AND ACHIEVEMENTS", 
            "SKILLS DEVELOPMENT AND LEARNING", 
            "CONCLUSION AND RECOMMENDATIONS"
        ],
        'project': [
            "INTRODUCTION", 
            "LITERATURE REVIEW AND BACKGROUND", 
            "SYSTEM ANALYSIS AND DESIGN", 
            "IMPLEMENTATION AND DEVELOPMENT", 
            "TESTING AND VALIDATION", 
            "CONCLUSION AND FUTURE ENHANCEMENTS"
        ]
    };

    const type = reportType.toLowerCase();
    if (type.includes('thesis')) return titles.thesis;
    if (type.includes('internship')) return titles.internship;
    return titles.project;
}

// Generate chapter content with AI + comprehensive fallback
async function generateChapterContent(chapterTitle, chapterIndex, config) {
    try {
        // Try AI generation first with timeout
        console.log(`🤖 Attempting AI generation for ${chapterTitle}...`);
        const aiContent = await generateAIContent(chapterTitle, config);
        if (aiContent && aiContent.length > 800) {
            console.log(`✅ AI content generated: ${aiContent.length} characters`);
            return aiContent;
        }
    } catch (error) {
        console.log(`⚠️ AI generation failed for ${chapterTitle}, using enhanced fallback`);
    }

    // Enhanced fallback content
    return generateEnhancedFallbackContent(chapterTitle, chapterIndex, config);
}

// Generate AI content with timeout
async function generateAIContent(chapterTitle, config) {
    const prompt = `Write a comprehensive academic chapter for "${chapterTitle}" in a ${config.reportType} about "${config.projectTitle}".

Project Description: ${config.projectDescription}
Course: ${config.course}
Institution: ${config.institution}

Requirements:
- Write 1200-1500 words of professional academic content
- Use technical depth appropriate for university level
- Include specific details related to the project description
- Use proper academic language and structure
- Create multiple well-structured paragraphs with clear flow
- Include relevant technical concepts and methodologies
- Make it specific to the project, not generic

Write only the chapter content, no headings or titles.`;

    return await callGeminiAPI(prompt, config.apiKey);
}

// Enhanced fallback content generation
function generateEnhancedFallbackContent(chapterTitle, chapterIndex, config) {
    const projectTitle = config.projectTitle;
    const projectDesc = config.projectDescription;
    const course = config.course;
    const reportType = config.reportType;

    const enhancedContent = {
        0: `This chapter provides a comprehensive introduction to the ${projectTitle} project, which represents a significant undertaking in the field of ${course}. The development of modern software applications requires careful planning, systematic analysis, and implementation of industry best practices. This project demonstrates the practical application of software engineering principles in creating a robust and scalable solution that addresses real-world challenges.

The primary objective of this project is to develop a comprehensive system that ${projectDesc.toLowerCase()}. Through systematic analysis of requirements and careful design of system architecture, the project aims to deliver a solution that meets both functional and non-functional requirements while maintaining high standards of code quality and user experience.

The scope of this project encompasses various aspects of software development including user interface design, database management, system integration, and performance optimization. The implementation follows modern development methodologies and incorporates industry best practices to ensure maintainability and scalability. The project serves as a practical demonstration of theoretical concepts learned during the course of study, providing valuable hands-on experience in software development and project management.

The motivation for this project stems from the need to bridge the gap between theoretical knowledge and practical implementation. In today's rapidly evolving technological landscape, it is essential for students to gain experience in developing real-world applications that can solve actual problems. This project provides an opportunity to apply various software engineering concepts, design patterns, and development methodologies in a practical context.

The significance of this work lies in its potential to contribute to the field of ${course} by demonstrating effective approaches to software development and system design. The project incorporates modern technologies and follows current industry standards, making it relevant to contemporary software development practices. The outcomes of this project can serve as a reference for future similar endeavors and contribute to the body of knowledge in the field.`,

        1: `This chapter presents a comprehensive review of existing literature and technologies relevant to the ${projectTitle} project. The theoretical foundation for this work is built upon established principles of software engineering, database management, and system design. A thorough understanding of current research and industry practices is essential for developing an effective solution that meets modern standards and requirements.

The literature review encompasses various aspects of software development methodologies, including agile development practices, object-oriented design principles, and modern architectural patterns. Recent research in the field of ${course} has emphasized the importance of user-centered design, scalable architecture, and maintainable code structures. These principles have been carefully considered in the design and implementation of this project.

Modern software development practices emphasize the importance of systematic design and implementation approaches. The literature reveals various methodologies and frameworks that can be applied to similar projects, each with their own advantages and limitations. Industry trends show a growing preference for modular design, microservices architecture, and cloud-based solutions, which have influenced the technical decisions made in this project.

The technology stack selection for this project is based on careful analysis of available options and their suitability for the specific requirements. Current industry standards favor technologies that provide good performance, maintainability, and community support. The chosen technologies align with modern development practices and ensure that the project remains relevant and maintainable in the long term.

Previous research in this domain has established several key principles that guide the development process. These include modular design, separation of concerns, adherence to established design patterns, and the importance of comprehensive testing. The literature also emphasizes the significance of user experience design and the need for intuitive, accessible interfaces that cater to diverse user needs and preferences.`,

        2: `This chapter outlines the methodology and system design approach adopted for the ${projectTitle} project. The development process follows a systematic approach that ensures quality and maintainability throughout the project lifecycle. The methodology incorporates best practices from software engineering and adapts them to the specific requirements and constraints of this project.

The system architecture is designed to be modular and scalable, allowing for future enhancements and modifications. The design emphasizes separation of concerns and follows established architectural patterns to ensure code organization and maintainability. The architecture consists of multiple layers, each with specific responsibilities and well-defined interfaces that promote loose coupling and high cohesion.

The development methodology adopted for this project combines elements of agile development with traditional software engineering practices. This hybrid approach allows for iterative development while maintaining proper documentation and design standards. Regular code reviews, continuous integration, and automated testing are integral parts of the development process, ensuring code quality and reliability.

Database design follows normalization principles while optimizing for performance and data integrity. The schema is designed to efficiently handle the expected data volume and support the required operations. Careful consideration has been given to indexing strategies, query optimization, and data security measures to ensure robust and efficient data management.

User interface design focuses on usability and user experience, incorporating modern design principles and accessibility standards. The interface is designed to be intuitive and responsive across different devices and screen sizes. User feedback and usability testing have been incorporated into the design process to ensure that the final product meets user expectations and requirements.

The testing strategy encompasses multiple levels, including unit testing, integration testing, and system testing. Automated testing frameworks are employed to ensure consistent and reliable testing processes. Performance testing and security testing are also conducted to validate that the system meets non-functional requirements and industry security standards.`,

        3: `This chapter details the implementation process and technical aspects of the ${projectTitle} project. The development process involved careful coding practices, regular testing, and iterative refinement to achieve the desired functionality. The implementation phase represents the culmination of the design and planning efforts, translating theoretical concepts into a working software solution.

The implementation incorporates modern programming techniques and follows established coding standards to ensure code quality and maintainability. Error handling and validation are implemented throughout the system to provide robust operation and graceful degradation in case of unexpected conditions. The code structure follows object-oriented principles and design patterns to promote reusability and maintainability.

The development environment was carefully configured to support efficient development and testing processes. Version control systems, integrated development environments, and automated build tools were employed to streamline the development workflow. Continuous integration practices ensure that code changes are automatically tested and validated before integration into the main codebase.

Key features of the implementation include ${projectDesc}. Each feature has been carefully designed and implemented to meet specific user requirements while maintaining system performance and reliability. The implementation process involved multiple iterations, with each iteration adding new functionality and refining existing features based on testing results and user feedback.

Performance optimization techniques are applied throughout the implementation to maintain responsive user interactions and efficient resource utilization. Database queries are optimized for performance, caching strategies are employed where appropriate, and the user interface is designed to provide smooth and responsive interactions. Memory management and resource cleanup are carefully handled to prevent memory leaks and ensure stable operation.

Security considerations are integrated throughout the implementation, including input validation, authentication mechanisms, and data protection measures. The system follows security best practices to protect against common vulnerabilities and ensure that user data is handled securely and in compliance with relevant regulations and standards.`,

        4: `This chapter presents the testing methodology, results, and validation of the ${projectTitle} project. Comprehensive testing is essential to ensure that the system meets all specified requirements and performs reliably under various conditions. The testing process encompasses multiple levels and types of testing to validate both functional and non-functional aspects of the system.

Unit testing forms the foundation of the testing strategy, with individual components and modules tested in isolation to verify their correct behavior. Automated unit tests are developed alongside the implementation code, following test-driven development principles where appropriate. The unit tests provide rapid feedback during development and serve as regression tests to prevent the introduction of new bugs.

Integration testing validates the interactions between different system components and external dependencies. This level of testing ensures that the various modules work correctly together and that data flows properly through the system. Integration tests also validate the system's interaction with external services, databases, and third-party components.

System testing evaluates the complete integrated system to verify that it meets all specified requirements. This includes functional testing to validate that all features work as expected, as well as non-functional testing to assess performance, scalability, and reliability. User acceptance testing involves end users in the testing process to ensure that the system meets their needs and expectations.

Performance testing results demonstrate that the system meets the specified performance requirements under normal and peak load conditions. Load testing, stress testing, and endurance testing are conducted to evaluate system behavior under various usage scenarios. The results show that the system maintains acceptable response times and resource utilization even under high load conditions.

Security testing validates that the system adequately protects against common security threats and vulnerabilities. This includes testing for injection attacks, authentication bypass, data exposure, and other security risks. The testing results confirm that the implemented security measures effectively protect the system and user data from potential threats.`,

        5: `This chapter presents the conclusions drawn from the ${projectTitle} project and discusses the outcomes achieved. The project successfully demonstrates the practical application of software engineering principles and modern development methodologies in creating a comprehensive software solution. The systematic approach adopted throughout the development process has resulted in a maintainable and scalable solution that meets all specified requirements.

The implementation meets all functional requirements and provides a solid foundation for future enhancements. The modular design and clean architecture facilitate easy maintenance and extension of the system. The comprehensive testing strategy ensures that the system is reliable and performs well under various conditions, providing confidence in its production readiness.

Key learning outcomes include practical experience in software development, project management, and the application of theoretical concepts in real-world scenarios. The project has provided valuable insights into the challenges and considerations involved in developing comprehensive software solutions. The experience gained in working with modern development tools, frameworks, and methodologies will be valuable for future professional endeavors.

The project has successfully achieved its primary objectives of ${projectDesc}. The solution demonstrates effective use of modern technologies and development practices, resulting in a system that is both functional and maintainable. The user feedback received during testing phases has been positive, indicating that the system meets user needs and expectations.

Future work could include additional features such as advanced analytics, mobile applications, integration with additional external services, and performance optimizations. The modular design of the current implementation provides a solid foundation for such enhancements. Potential areas for improvement include user interface enhancements, additional automation features, and expanded reporting capabilities.

The project contributes to the field of ${course} by demonstrating effective approaches to software development and system design. The methodologies and techniques employed in this project can serve as a reference for similar future projects. The documentation and code produced during this project provide valuable resources for other developers and researchers working in related areas.`
    };

    return enhancedContent[chapterIndex] || enhancedContent[0];
}

// Call Gemini API with timeout
async function callGeminiAPI(prompt, apiKey) {
    if (!apiKey || apiKey.length < 10) {
        throw new Error('Invalid API key');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
        const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Create enhanced academic document
async function createEnhancedDocument(config, chapters) {
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
                        children: [PageNumber.CURRENT],
                        font: "Times New Roman",
                        size: 24
                    })
                ],
                alignment: AlignmentType.RIGHT
            })
        ]
    });

    // Create Table of Contents
    const createTOC = () => {
        const tocEntries = [];
        const tabStops = [{ type: TabStopType.RIGHT, position: 9000, leader: LeaderType.DOT }];

        // Add front matter
        const frontMatter = [
            { text: "Acknowledgement", page: "ii" },
            { text: "Abstract", page: "iii" },
            { text: "Table of Contents", page: "iv" }
        ];

        frontMatter.forEach(item => {
            tocEntries.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.text, font: "Times New Roman", size: 24 }),
                        new TextRun({ text: '\t', font: "Times New Roman", size: 24 }),
                        new TextRun({ text: item.page, font: "Times New Roman", size: 24 })
                    ],
                    spacing: { after: 120 },
                    tabStops: tabStops
                })
            );
        });

        // Add chapters
        chapters.forEach((chapter, index) => {
            const pageNum = 1 + (index * 4); // Rough page calculation
            tocEntries.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `Chapter ${chapter.number}: ${chapter.title}`, font: "Times New Roman", size: 24 }),
                        new TextRun({ text: '\t', font: "Times New Roman", size: 24 }),
                        new TextRun({ text: pageNum.toString(), font: "Times New Roman", size: 24 })
                    ],
                    spacing: { after: 120 },
                    tabStops: tabStops
                })
            );
        });

        return tocEntries;
    };

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

        // Chapter content - split into paragraphs
        const paragraphs = chapter.content.split('\n\n').filter(p => p.trim()).map(paragraph => 
            new Paragraph({
                children: [new TextRun({
                    text: paragraph.trim(),
                    size: 24,
                    font: "Times New Roman"
                })],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 240 },
                indent: { firstLine: 720 } // First line indent for academic style
            })
        );
        mainContent.push(...paragraphs);
    });

    const doc = new Document({
        sections: [
            // Cover page
            {
                children: createCoverPage(config),
                properties: {
                    page: { pageNumbers: { start: 1, formatType: NumberFormat.NONE } }
                }
            },
            // Front matter
            {
                children: [
                    ...createAcknowledgement(config),
                    new Paragraph({ children: [new PageBreak()] }),
                    ...createAbstract(config),
                    new Paragraph({ children: [new PageBreak()] }),
                    new Paragraph({
                        children: [new TextRun({ text: "Table of Contents", bold: true, size: 28, font: "Times New Roman" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 480, after: 360 }
                    }),
                    ...createTOC()
                ],
                headers: { default: createHeader() },
                footers: { default: createFooter() },
                properties: {
                    page: { pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } }
                }
            },
            // Main content
            {
                children: mainContent,
                headers: { default: createHeader() },
                footers: { default: createFooter() },
                properties: {
                    page: { pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } }
                }
            }
        ]
    });

    return await Packer.toBuffer(doc);
}

// Helper functions
function createCoverPage(config) {
    return [
        new Paragraph({
            children: [new TextRun({ text: config.institution.toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.course.toUpperCase(), bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
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
            children: [new TextRun({ text: `Submitted by: ${config.studentName}`, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `Student ID: ${config.studentId}`, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `Course: ${config.course}`, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `Semester: ${config.semester}`, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `Under the guidance of: ${config.supervisor}`, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),
        new Paragraph({
            children: [new TextRun({ text: new Date().getFullYear().toString(), bold: true, size: 28, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 960 }
        })
    ];
}

function createAcknowledgement(config) {
    return [
        new Paragraph({
            children: [new TextRun({ text: "ACKNOWLEDGEMENT", bold: true, size: 32, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1440, after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ 
                text: `I would like to express my sincere gratitude to my project supervisor ${config.supervisor} for their invaluable guidance, continuous support, and encouragement throughout this ${config.reportType}. Their expertise and insights have been instrumental in shaping this work and ensuring its successful completion.`,
                size: 24, font: "Times New Roman" 
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360 },
            indent: { firstLine: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ 
                text: `I am also grateful to the faculty members of ${config.course} at ${config.institution} for providing the theoretical foundation and practical knowledge that made this project possible. Special thanks to my fellow students for their collaboration and support during the course of this work.`,
                size: 24, font: "Times New Roman" 
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360 },
            indent: { firstLine: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ 
                text: `Finally, I extend my heartfelt appreciation to my family and friends for their unwavering support and encouragement throughout this academic journey.`,
                size: 24, font: "Times New Roman" 
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 480 },
            indent: { firstLine: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ text: config.studentName, bold: true, size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 720 }
        })
    ];
}

function createAbstract(config) {
    return [
        new Paragraph({
            children: [new TextRun({ text: "ABSTRACT", bold: true, size: 32, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1440, after: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ 
                text: `This ${config.reportType} presents the comprehensive development and implementation of "${config.projectTitle}", a project undertaken as part of the ${config.course} curriculum at ${config.institution}. The project demonstrates practical application of modern software development principles, methodologies, and best practices in creating a robust and scalable solution.`,
                size: 24, font: "Times New Roman" 
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360 },
            indent: { firstLine: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ 
                text: `The work encompasses comprehensive analysis, design, implementation, and testing phases, following established software engineering methodologies. The project addresses real-world challenges while maintaining high standards of code quality, user experience, and system performance. The implementation incorporates modern technologies and follows current industry standards.`,
                size: 24, font: "Times New Roman" 
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 360 },
            indent: { firstLine: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ 
                text: `The results demonstrate successful achievement of all project objectives, with comprehensive testing validating system functionality and performance. The project serves as a practical demonstration of theoretical concepts and provides valuable insights into modern software development practices.`,
                size: 24, font: "Times New Roman" 
            })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 480 },
            indent: { firstLine: 720 }
        }),
        new Paragraph({
            children: [new TextRun({ 
                text: `Keywords: Software Development, ${config.course}, Academic Project, System Design, Implementation, ${config.reportType}`,
                bold: true, size: 24, font: "Times New Roman" 
            })],
            alignment: AlignmentType.LEFT,
            spacing: { before: 480 }
        })
    ];
}