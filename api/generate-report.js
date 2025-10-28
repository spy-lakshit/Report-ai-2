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

// Function to generate truly dynamic chapter content based on report type and project topic
function generateChapterContent(chapterNum, chapterTitle, config) {
    const title = config.projectTitle.toLowerCase();
    const description = config.projectDescription.toLowerCase();
    const type = config.reportType.toLowerCase();

    // Determine project category
    let projectCategory = "general";
    if (title.includes('java') || title.includes('mysql') || title.includes('database') || description.includes('java') || description.includes('database') || description.includes('sql')) {
        projectCategory = "java-database";
    } else if (title.includes('ai') || title.includes('machine learning') || title.includes('ml') || description.includes('machine learning') || description.includes('artificial intelligence')) {
        projectCategory = "ai-ml";
    } else if (title.includes('web') || title.includes('website') || title.includes('react') || description.includes('web development')) {
        projectCategory = "web-development";
    } else if (title.includes('mobile') || title.includes('app') || title.includes('android') || title.includes('ios') || description.includes('mobile')) {
        projectCategory = "mobile-development";
    }

    // Generate content based on chapter number, report type, and project category
    return generateDynamicChapterContent(chapterNum, chapterTitle, config, type, projectCategory);
}

// Function to generate dynamic content for each chapter
function generateDynamicChapterContent(chapterNum, chapterTitle, config, reportType, projectCategory) {
    const contentKey = `${reportType}-${projectCategory}-${chapterNum}`;

    // Dynamic content templates based on report type and project category
    const contentTemplates = {
        // THESIS REPORTS - Academic Research Focus
        "thesis-java-database-1": `1.1 Research Background and Motivation

The field of database systems and Java programming has experienced significant evolution in recent years, particularly in enterprise-level applications and data management solutions. This research addresses the critical need for understanding the integration patterns between Java applications and relational database systems, specifically focusing on ${config.projectTitle}.

Current research in database connectivity and Java enterprise applications reveals gaps in performance optimization, transaction management, and scalable architecture design. This study aims to contribute to the academic understanding of these integration patterns while providing empirical evidence for best practices in Java-database system design.

1.2 Research Problem Statement

The primary research question investigates how Java applications can be optimally integrated with MySQL database systems to achieve maximum performance, reliability, and maintainability. Existing literature shows inconsistencies in recommended approaches for JDBC optimization, connection pooling strategies, and transaction management in enterprise environments.

Specific research problems include: inadequate performance benchmarking of different JDBC drivers, limited comparative analysis of ORM frameworks versus native SQL approaches, insufficient documentation of connection pooling impact on system scalability, and lack of comprehensive security analysis for Java-database integration patterns.

1.3 Research Objectives and Hypotheses

The primary objective is to conduct a comprehensive analysis of Java-MySQL integration patterns and their impact on system performance and reliability. Secondary objectives include developing performance benchmarks, analyzing security implications, and proposing optimization strategies for enterprise-level applications.

Research hypotheses: (H1) Optimized JDBC connection pooling significantly improves application performance compared to basic connection management, (H2) Prepared statements provide measurable security and performance benefits over dynamic SQL generation, (H3) Transaction isolation levels directly correlate with system concurrency capabilities.

1.4 Research Scope and Methodology

This research employs a mixed-methods approach combining quantitative performance analysis with qualitative assessment of code maintainability and security. The scope includes comprehensive testing of various Java-MySQL integration approaches, performance benchmarking under different load conditions, and security vulnerability assessment.

The methodology involves controlled experiments using standardized datasets, statistical analysis of performance metrics, and comparative evaluation of different architectural approaches. Limitations include focus on MySQL-specific features and Java 8+ environments.

1.5 Thesis Organization and Contribution

This thesis is structured to provide a comprehensive analysis of Java-MySQL integration from both theoretical and practical perspectives. Each chapter builds upon previous findings to develop a complete framework for optimal database integration in Java applications.

The expected contribution includes empirical performance data, security best practices documentation, and a comprehensive framework for Java-database integration that can be applied in enterprise environments.`,

        "thesis-ai-ml-1": `1.1 Research Background and Motivation

The field of artificial intelligence and machine learning has witnessed unprecedented growth in recent years, particularly in applications related to ${config.projectTitle}. This research addresses the critical need for understanding advanced machine learning algorithms and their practical applications in solving complex real-world problems.

Current research in AI and ML reveals significant opportunities for innovation in algorithm optimization, model interpretability, and scalable deployment strategies. This study aims to contribute to the academic understanding of these areas while providing empirical evidence for the effectiveness of proposed methodologies.

1.2 Research Problem Statement

The primary research question investigates how machine learning algorithms can be optimized and applied to achieve superior performance in ${config.projectTitle.toLowerCase()}. Existing literature shows gaps in comparative analysis of different algorithmic approaches, limited research on model interpretability, and insufficient documentation of deployment strategies for production environments.

Specific research problems include: inadequate benchmarking of algorithm performance across different datasets, limited analysis of feature engineering impact on model accuracy, insufficient research on model bias and fairness, and lack of comprehensive frameworks for model deployment and monitoring.

1.3 Research Objectives and Hypotheses

The primary objective is to conduct a comprehensive analysis of machine learning algorithms and their application to ${config.projectTitle.toLowerCase()}. Secondary objectives include developing performance benchmarks, analyzing model interpretability, and proposing optimization strategies for production deployment.

Research hypotheses: (H1) Advanced feature engineering techniques significantly improve model performance compared to basic preprocessing, (H2) Ensemble methods provide measurable accuracy improvements over individual algorithms, (H3) Model interpretability techniques do not significantly impact prediction accuracy.

1.4 Research Scope and Methodology

This research employs a quantitative approach combining experimental design with statistical analysis of algorithm performance. The scope includes comprehensive evaluation of various machine learning algorithms, performance benchmarking across multiple datasets, and analysis of model interpretability techniques.

The methodology involves controlled experiments using standardized datasets, statistical significance testing, cross-validation techniques, and comparative evaluation of different algorithmic approaches. Limitations include focus on supervised learning techniques and specific domain applications.

1.5 Thesis Organization and Contribution

This thesis is structured to provide a comprehensive analysis of machine learning applications from both theoretical and practical perspectives. Each chapter builds upon previous findings to develop a complete framework for optimal algorithm selection and deployment.

The expected contribution includes empirical performance data, algorithm optimization strategies, and a comprehensive framework for machine learning implementation that can be applied across various domains.`,

        // INTERNSHIP REPORTS - Practical Training Focus
        "internship-java-database-1": `1.1 Internship Background and Motivation

The internship at ${config.institution} provided an invaluable opportunity to gain hands-on experience in Java programming and database systems development. This experience focused on ${config.projectTitle}, allowing for practical application of academic knowledge in a professional environment.

The motivation for this internship stemmed from the desire to understand real-world software development practices, particularly in Java enterprise applications and database integration. The experience aimed to bridge the gap between theoretical knowledge gained in academic settings and practical skills required in the software industry.

1.2 Learning Objectives and Goals

The primary learning objectives included mastering Java programming best practices, understanding database design and optimization techniques, gaining experience with enterprise development tools and frameworks, and developing professional software development skills.

Specific goals encompassed: learning advanced Java concepts including multithreading and design patterns, mastering SQL query optimization and database performance tuning, understanding version control systems and collaborative development practices, gaining experience with testing frameworks and quality assurance processes.

1.3 Internship Scope and Structure

The internship program was structured to provide comprehensive exposure to Java-database development through hands-on projects, mentorship from experienced developers, and participation in real client projects. The scope included both individual learning activities and collaborative team projects.

The program structure involved initial orientation and training sessions, progressive assignment of development tasks with increasing complexity, regular code reviews and feedback sessions, and final project presentation demonstrating acquired skills and knowledge.

1.4 Professional Development Focus

This internship emphasized professional skill development including communication, teamwork, problem-solving, and project management. The experience provided exposure to industry-standard development practices, client interaction, and project lifecycle management.

Professional development activities included participation in team meetings and planning sessions, collaboration with cross-functional teams, presentation of technical solutions to stakeholders, and documentation of development processes and best practices.

1.5 Report Organization and Learning Outcomes

This report documents the comprehensive learning experience gained during the internship, including technical skills development, professional growth, and practical application of academic knowledge. Each chapter details specific aspects of the learning journey and acquired competencies.

The expected outcomes include demonstrated proficiency in Java-database development, understanding of professional software development practices, and preparation for career advancement in software engineering roles.`,

        "internship-web-development-1": `1.1 Internship Background and Motivation

The web development internship at ${config.institution} provided an exceptional opportunity to gain practical experience in modern web technologies and development practices. This experience focused on ${config.projectTitle}, allowing for hands-on application of contemporary web development frameworks and methodologies.

The motivation for pursuing this internship was to understand the rapidly evolving landscape of web development, particularly in areas of frontend frameworks, backend services, and full-stack development practices. The experience aimed to provide industry-relevant skills and professional development opportunities.

1.2 Learning Objectives and Goals

The primary learning objectives included mastering modern web development frameworks, understanding responsive design principles, gaining experience with backend development and API design, and developing professional web development workflows.

Specific goals encompassed: learning React.js and modern JavaScript frameworks, mastering CSS frameworks and responsive design techniques, understanding Node.js and backend development practices, gaining experience with database integration and API development, learning version control and deployment strategies.

1.3 Internship Scope and Structure

The internship program was designed to provide comprehensive exposure to full-stack web development through progressive skill building, mentorship from senior developers, and participation in real client projects. The scope included both frontend and backend development experiences.

The program structure involved initial training in web technologies and development tools, progressive assignment of development tasks from simple components to complex applications, regular code reviews and technical discussions, and final project demonstration showcasing acquired skills.

1.4 Professional Development Focus

This internship emphasized professional skills including client communication, project management, collaborative development, and industry best practices. The experience provided exposure to agile development methodologies, client requirements gathering, and project delivery processes.

Professional development activities included participation in client meetings and requirement discussions, collaboration with design and development teams, presentation of technical solutions and project progress, and documentation of development processes and lessons learned.

1.5 Report Organization and Learning Outcomes

This report documents the comprehensive learning experience gained during the web development internship, including technical skill acquisition, professional growth, and practical application of modern web development practices. Each chapter details specific learning milestones and competency development.

The expected outcomes include demonstrated proficiency in full-stack web development, understanding of professional development practices, and preparation for career advancement in web development and software engineering roles.`,

        // PROJECT REPORTS - Implementation Focus
        "project-java-database-1": `1.1 Project Background and Motivation

The ${config.projectTitle} project addresses the critical need for efficient data management solutions in modern software applications. This project focuses on leveraging Java programming capabilities combined with MySQL database systems to create a robust, scalable, and maintainable application architecture.

The motivation for this project stems from the increasing demand for enterprise-level applications that can handle complex data operations while maintaining high performance and reliability. The project aims to demonstrate best practices in Java-database integration while solving real-world data management challenges.

1.2 Problem Statement and Analysis

The primary challenge addressed by this project is the development of an efficient system that can handle complex data operations while maintaining optimal performance and user experience. Current solutions often suffer from scalability issues, poor database design, and inadequate user interface design.

Specific problems identified include: inefficient database query patterns leading to poor performance, lack of proper data validation and security measures, inadequate user interface design affecting user productivity, limited scalability options for growing data volumes, and insufficient error handling and logging mechanisms.

1.3 Project Objectives and Goals

The main objectives include designing and implementing a comprehensive Java application with MySQL database integration, developing efficient data access patterns and query optimization strategies, creating an intuitive user interface that enhances user experience, and implementing robust security and validation mechanisms.

Primary goals encompass: developing a scalable application architecture using Java best practices, implementing optimized database schema and query patterns, creating responsive user interfaces with modern design principles, ensuring comprehensive data validation and security measures, providing detailed documentation and user guides.

1.4 Project Scope and Deliverables

This project covers the complete software development lifecycle including requirements analysis, system design, implementation, testing, and deployment preparation. The scope includes database design and optimization, Java application development, user interface creation, and comprehensive testing strategies.

Key deliverables include: fully functional Java application with MySQL integration, optimized database schema with proper indexing and relationships, user-friendly interface with comprehensive functionality, complete source code with detailed documentation, testing suite with unit and integration tests, deployment guide and user manual.

1.5 Development Methodology and Approach

The project follows an iterative development approach combining elements of agile methodology with traditional software engineering practices. The development process emphasizes continuous testing, regular code reviews, and incremental feature implementation.

The methodology includes: comprehensive requirements analysis and system design, iterative development with regular milestone reviews, continuous integration and testing practices, regular code reviews and quality assurance, comprehensive documentation throughout the development process, and user feedback integration for interface improvements.`,

        "project-ai-ml-1": `1.1 Project Background and Motivation

The ${config.projectTitle} project addresses the growing need for intelligent systems that can analyze complex data patterns and provide actionable insights. This project focuses on implementing advanced machine learning algorithms to solve real-world problems through data-driven approaches.

The motivation for this project stems from the increasing availability of data and the need for automated analysis systems that can extract meaningful patterns and predictions. The project aims to demonstrate practical applications of machine learning while addressing specific domain challenges.

1.2 Problem Statement and Analysis

The primary challenge addressed by this project is the development of an intelligent system that can process complex datasets and provide accurate predictions or classifications. Current solutions often suffer from poor accuracy, limited scalability, and inadequate model interpretability.

Specific problems identified include: insufficient accuracy in existing prediction models, lack of proper feature engineering and data preprocessing, inadequate model validation and testing procedures, limited scalability for large datasets, and poor model interpretability affecting user trust and adoption.

1.3 Project Objectives and Goals

The main objectives include designing and implementing a comprehensive machine learning solution, developing effective data preprocessing and feature engineering pipelines, creating accurate and interpretable prediction models, and implementing robust model validation and testing procedures.

Primary goals encompass: developing scalable machine learning pipelines using industry best practices, implementing advanced feature engineering and data preprocessing techniques, creating accurate models with comprehensive performance evaluation, ensuring model interpretability and explainability, providing detailed analysis and visualization of results.

1.4 Project Scope and Deliverables

This project covers the complete machine learning development lifecycle including data collection and preprocessing, feature engineering, model development and training, validation and testing, and deployment preparation. The scope includes comprehensive data analysis, algorithm implementation, and performance evaluation.

Key deliverables include: complete machine learning pipeline with data preprocessing and feature engineering, trained and validated models with performance metrics, comprehensive analysis and visualization of results, complete source code with detailed documentation, model evaluation reports with statistical analysis, deployment guide and user documentation.

1.5 Development Methodology and Approach

The project follows a data science methodology combining elements of CRISP-DM with agile development practices. The development process emphasizes iterative model improvement, comprehensive validation, and continuous performance monitoring.

The methodology includes: comprehensive data exploration and analysis, iterative feature engineering and model development, rigorous model validation and testing procedures, continuous performance monitoring and improvement, comprehensive documentation of methodology and results, and stakeholder feedback integration for model refinement.`
    };

    // Get content for the specific combination, or generate generic content
    let content = contentTemplates[contentKey];

    if (!content) {
        // Generate generic content for chapters 2-6 or missing combinations
        if (chapterNum === 7) {
            content = generateConclusionContent(config, reportType, projectCategory);
        } else if (chapterNum >= 2 && chapterNum <= 6) {
            content = generateGenericChapterContent(chapterNum, chapterTitle, config, reportType, projectCategory);
        } else {
            // Fallback for chapter 1
            content = generateGenericIntroductionContent(config, reportType, projectCategory);
        }
    }

    return content;
}

// Generate comprehensive dynamic content for chapters 2-6 based on report type and project category
function generateGenericChapterContent(chapterNum, chapterTitle, config, reportType, projectCategory) {
    // Generate much more detailed and varied content based on combinations
    const contentKey = `${reportType}-${projectCategory}-${chapterNum}`;

    // Comprehensive content templates for all combinations
    const detailedTemplates = {
        // JAVA-DATABASE PROJECT CHAPTERS
        "project-java-database-2": `2.1 System Requirements Analysis and Specification

The requirements analysis for ${config.projectTitle} involved comprehensive stakeholder interviews, business process analysis, and technical feasibility studies. The functional requirements include user authentication and authorization, comprehensive data management capabilities, real-time data processing and validation, advanced reporting and analytics features, and scalable system architecture supporting concurrent users.

Non-functional requirements encompass system performance targets of sub-second response times for database queries, support for minimum 100 concurrent users, 99.9% system availability, comprehensive security measures including data encryption and access controls, and cross-platform compatibility across Windows, Linux, and macOS environments.

2.2 Database Schema Design and Optimization

The MySQL database schema design follows third normal form principles with carefully planned entity relationships. Primary entities include User management with role-based access control, comprehensive data storage with proper indexing strategies, audit trail implementation for data integrity, backup and recovery mechanisms, and performance optimization through query analysis and index tuning.

The database architecture implements advanced features including stored procedures for complex business logic, triggers for automated data validation and logging, views for simplified data access and security, proper foreign key constraints ensuring referential integrity, and comprehensive indexing strategy optimizing query performance.

2.3 Java Application Architecture and Design Patterns

The Java application architecture follows Model-View-Controller (MVC) design pattern with clear separation of concerns. The implementation utilizes proven design patterns including Singleton for database connection management, Factory pattern for object creation, Observer pattern for event handling, Strategy pattern for algorithm selection, and Command pattern for user action processing.

The architectural components include data access layer with optimized JDBC implementation, business logic layer with comprehensive validation rules, presentation layer with intuitive user interfaces, service layer for external integrations, and utility layer for common functionality and helper methods.`,

        "project-java-database-3": `3.1 Development Environment and Technology Stack

The development environment for ${config.projectTitle} utilizes industry-standard tools and frameworks. The technology stack includes Java SE 11 with advanced features and lambda expressions, MySQL 8.0 with enhanced performance capabilities, JDBC 4.2 for optimized database connectivity, Maven for dependency management and build automation, and JUnit 5 for comprehensive unit testing.

Development tools encompass IntelliJ IDEA for advanced code development and debugging, MySQL Workbench for database design and administration, Git for version control and collaborative development, Jenkins for continuous integration and deployment, and SonarQube for code quality analysis and improvement.

3.2 Database Implementation and Configuration

The MySQL database implementation includes comprehensive schema creation with optimized data types, advanced indexing strategies for query performance, stored procedures for complex business operations, triggers for automated data validation and logging, and user-defined functions for specialized calculations.

Database configuration optimizations include connection pooling for improved performance, transaction isolation level configuration, query cache optimization for frequently accessed data, buffer pool sizing for optimal memory utilization, and comprehensive backup and recovery procedures ensuring data integrity.

3.3 Java Application Development and Integration

The Java application development follows object-oriented programming principles with emphasis on code reusability and maintainability. Key implementation aspects include comprehensive exception handling with custom exception classes, logging framework integration for debugging and monitoring, configuration management through properties files, multi-threading support for concurrent operations, and comprehensive input validation and sanitization.

Integration components include JDBC connection pooling for database efficiency, RESTful API development for external integrations, JSON processing for data interchange, email notification system for user communications, and comprehensive security implementation including authentication and authorization mechanisms.`,

        "project-java-database-4": `4.1 User Interface Design and Implementation

The user interface design for ${config.projectTitle} emphasizes usability, accessibility, and professional appearance. The implementation utilizes Java Swing with modern look-and-feel themes, responsive layout managers for different screen sizes, comprehensive input validation with user-friendly error messages, intuitive navigation with consistent design patterns, and accessibility features supporting users with disabilities.

Advanced UI features include data visualization through charts and graphs, advanced search and filtering capabilities, export functionality for reports and data, print support for documents and reports, and comprehensive help system with context-sensitive assistance.

4.2 Business Logic Implementation and Validation

The business logic implementation encompasses comprehensive data validation rules, complex calculation algorithms, workflow management for business processes, audit trail functionality for compliance requirements, and integration with external systems and services.

Validation mechanisms include client-side validation for immediate user feedback, server-side validation for security and data integrity, database constraints for referential integrity, business rule validation for domain-specific requirements, and comprehensive error handling with meaningful user messages.

4.3 Performance Optimization and Scalability

Performance optimization strategies include database query optimization through proper indexing, connection pooling for efficient resource utilization, caching mechanisms for frequently accessed data, asynchronous processing for long-running operations, and memory management optimization to prevent memory leaks.

Scalability considerations encompass horizontal scaling capabilities, load balancing support, database partitioning strategies, microservices architecture preparation, and comprehensive monitoring and alerting systems for performance tracking.`,

        "project-java-database-5": `5.1 Testing Strategy and Implementation

The comprehensive testing strategy for ${config.projectTitle} includes unit testing with JUnit 5 covering all business logic components, integration testing for database connectivity and external services, system testing for end-to-end functionality validation, performance testing under various load conditions, and security testing for vulnerability assessment.

Testing implementation encompasses automated test suites with continuous integration, mock objects for isolated unit testing, test data management with setup and teardown procedures, code coverage analysis ensuring comprehensive testing, and regression testing for change impact assessment.

5.2 Quality Assurance and Code Review

Quality assurance processes include comprehensive code review procedures, static code analysis using SonarQube, coding standards enforcement, documentation review and validation, and user acceptance testing with stakeholder involvement.

Code quality metrics encompass cyclomatic complexity analysis, code duplication detection, maintainability index calculation, technical debt assessment, and comprehensive documentation coverage ensuring long-term maintainability.

5.3 Deployment and Production Readiness

Deployment preparation includes comprehensive deployment documentation, environment configuration management, database migration scripts, security configuration validation, and performance monitoring setup.

Production readiness encompasses backup and recovery procedures, monitoring and alerting configuration, security hardening implementation, scalability testing validation, and comprehensive user training and documentation.`,

        "project-java-database-6": `6.1 System Performance Analysis and Metrics

The performance analysis of ${config.projectTitle} demonstrates excellent system responsiveness with average query response times under 200 milliseconds, successful handling of 150+ concurrent users, 99.95% system uptime during testing period, efficient memory utilization with minimal garbage collection impact, and optimal database performance with properly tuned queries.

Performance metrics include throughput analysis showing 1000+ transactions per minute, latency measurements across different system components, resource utilization monitoring for CPU, memory, and disk usage, scalability testing results under increasing load conditions, and comprehensive benchmarking against industry standards.

6.2 User Acceptance and Feedback Analysis

User acceptance testing results show 95% user satisfaction rating, intuitive interface design with minimal training requirements, comprehensive functionality meeting all specified requirements, reliable system performance under normal operating conditions, and positive feedback on system usability and efficiency.

Feedback analysis encompasses usability testing results, feature utilization statistics, user workflow efficiency improvements, error rate analysis and resolution, and comprehensive user training effectiveness assessment.

6.3 Security Assessment and Compliance

Security assessment results demonstrate robust authentication and authorization mechanisms, comprehensive data encryption for sensitive information, secure communication protocols for data transmission, comprehensive audit logging for compliance requirements, and vulnerability assessment with no critical security issues identified.

Compliance validation includes data protection regulation adherence, industry standard security protocol implementation, comprehensive access control validation, security incident response procedures, and regular security assessment and update procedures.`,

        // AI-ML PROJECT CHAPTERS
        "project-ai-ml-2": `2.1 Machine Learning Problem Formulation and Analysis

The machine learning problem formulation for ${config.projectTitle} involves comprehensive data analysis, feature identification, and algorithm selection. The problem is classified as ${config.projectTitle.toLowerCase().includes('classification') ? 'a supervised classification task' : config.projectTitle.toLowerCase().includes('prediction') ? 'a supervised regression problem' : 'a complex pattern recognition challenge'} requiring advanced analytical approaches.

Data analysis encompasses exploratory data analysis revealing key patterns and relationships, statistical analysis of feature distributions and correlations, missing data assessment and imputation strategies, outlier detection and handling procedures, and comprehensive data quality assessment ensuring reliable model training.

2.2 Feature Engineering and Data Preprocessing

Feature engineering strategies include domain-specific feature creation based on business knowledge, automated feature selection using statistical methods, dimensionality reduction through principal component analysis, feature scaling and normalization for algorithm optimization, and comprehensive feature validation ensuring predictive power.

Data preprocessing encompasses data cleaning and validation procedures, handling missing values through advanced imputation techniques, categorical variable encoding using appropriate methods, temporal feature extraction for time-series data, and comprehensive data transformation ensuring optimal model performance.

2.3 Algorithm Selection and Model Architecture

Algorithm selection process includes comparative analysis of multiple machine learning approaches, performance benchmarking across different algorithm families, hyperparameter optimization using grid search and random search, cross-validation strategies for robust model evaluation, and ensemble method implementation for improved accuracy.

Model architecture design encompasses neural network architecture for deep learning approaches, decision tree optimization for interpretable models, support vector machine configuration for complex decision boundaries, clustering algorithm selection for unsupervised learning, and comprehensive model validation ensuring generalization capability.`,

        "project-ai-ml-3": `3.1 Data Collection and Preparation Pipeline

The data collection pipeline for ${config.projectTitle} implements comprehensive data acquisition from multiple sources, automated data validation and quality checks, real-time data processing capabilities, scalable data storage solutions, and comprehensive data governance ensuring compliance and security.

Data preparation encompasses automated data cleaning procedures, feature extraction from raw data sources, data transformation and normalization processes, temporal data alignment for time-series analysis, and comprehensive data validation ensuring model training reliability.

3.2 Model Development and Training Procedures

Model development follows rigorous machine learning best practices including systematic hyperparameter tuning, cross-validation for robust performance estimation, regularization techniques preventing overfitting, ensemble methods for improved accuracy, and comprehensive model validation ensuring generalization capability.

Training procedures encompass automated model training pipelines, distributed computing for large-scale training, model versioning and experiment tracking, comprehensive performance monitoring during training, and automated model selection based on validation metrics.

3.3 Performance Optimization and Scalability

Performance optimization strategies include algorithm efficiency improvements, parallel processing implementation, memory optimization for large datasets, GPU acceleration for deep learning models, and comprehensive performance profiling identifying bottlenecks.

Scalability considerations encompass distributed computing architecture, cloud-based model training and deployment, automated scaling based on demand, comprehensive monitoring and alerting systems, and cost optimization strategies for production deployment.`,

        // WEB DEVELOPMENT INTERNSHIP CHAPTERS  
        "internship-web-development-2": `2.1 Modern Web Development Technologies and Frameworks

The internship experience at ${config.institution} provided comprehensive exposure to modern web development technologies including React.js for dynamic frontend development, Node.js for scalable backend services, Express.js for RESTful API development, MongoDB for flexible data storage, and comprehensive development tools for efficient workflow.

Technology learning encompassed advanced JavaScript ES6+ features and best practices, responsive web design using CSS Grid and Flexbox, modern build tools including Webpack and Babel, version control with Git and collaborative development workflows, and comprehensive testing frameworks for quality assurance.

2.2 Frontend Development with React.js and Modern JavaScript

Frontend development training included React.js component architecture and lifecycle management, state management using Redux and Context API, modern JavaScript features including async/await and destructuring, responsive design implementation with CSS frameworks, and comprehensive user experience optimization techniques.

Advanced frontend concepts encompassed single-page application development, progressive web app implementation, performance optimization through code splitting and lazy loading, accessibility implementation following WCAG guidelines, and comprehensive cross-browser compatibility testing.

2.3 Backend Development with Node.js and API Design

Backend development experience included Node.js server development with Express.js framework, RESTful API design and implementation, database integration with MongoDB and Mongoose, authentication and authorization implementation, and comprehensive error handling and logging mechanisms.

API development encompassed comprehensive endpoint design and documentation, data validation and sanitization procedures, rate limiting and security implementation, comprehensive testing with automated test suites, and deployment strategies for production environments.`,

        // THESIS AI-ML CHAPTERS
        "thesis-ai-ml-2": `2.1 Theoretical Foundations and Literature Review

The theoretical foundation for ${config.projectTitle} draws from extensive literature in machine learning, artificial intelligence, and domain-specific applications. The literature review encompasses seminal works in neural network architectures, recent advances in deep learning methodologies, comparative studies of algorithm performance, theoretical analysis of model complexity, and comprehensive survey of current research trends.

Research gap analysis reveals opportunities for innovation in algorithm optimization, model interpretability enhancement, scalability improvements for large datasets, real-time processing capabilities, and comprehensive evaluation methodologies for domain-specific applications.

2.2 Mathematical Framework and Algorithm Analysis

The mathematical framework encompasses statistical learning theory foundations, optimization theory for model training, probability theory for uncertainty quantification, information theory for feature selection, and comprehensive mathematical analysis of algorithm convergence and stability.

Algorithm analysis includes computational complexity assessment, theoretical performance bounds, convergence analysis for iterative algorithms, statistical significance testing for model comparison, and comprehensive mathematical validation of proposed methodologies.

2.3 Research Methodology and Experimental Design

Research methodology follows rigorous scientific principles including controlled experimental design, statistical hypothesis testing, comprehensive validation procedures, reproducibility requirements, and ethical considerations for data usage and algorithm deployment.

Experimental design encompasses systematic parameter space exploration, statistical significance testing for performance comparisons, comprehensive baseline establishment, ablation studies for component analysis, and rigorous evaluation metrics ensuring reliable research conclusions.`
    };

    // Get detailed content if available, otherwise generate generic content
    let content = detailedTemplates[contentKey];

    if (!content) {
        // Fallback to more generic but still dynamic content
        const sectionTitles = chapterTitle.split(' AND ');
        const mainTitle = sectionTitles[0] || chapterTitle;

        content = `${chapterNum}.1 ${mainTitle} Overview and Analysis\n\n`;

        if (reportType === 'thesis') {
            content += `This chapter presents comprehensive research analysis of ${chapterTitle.toLowerCase()} in the context of ${config.projectTitle}. The research methodology follows rigorous academic standards with emphasis on empirical validation, statistical significance testing, and theoretical contribution to the field.\n\n`;
            content += `The theoretical framework draws from established principles in ${projectCategory === 'java-database' ? 'database systems theory, software engineering principles, and enterprise architecture patterns' : projectCategory === 'ai-ml' ? 'machine learning theory, statistical learning principles, and artificial intelligence methodologies' : 'computer science fundamentals and software engineering best practices'}.\n\n`;
        } else if (reportType === 'internship') {
            content += `This chapter documents comprehensive practical experience in ${chapterTitle.toLowerCase()} gained during the professional internship at ${config.institution}. The learning process involved hands-on application of theoretical knowledge under expert supervision and mentorship.\n\n`;
            content += `The practical training focused on industry-standard practices including ${projectCategory === 'java-database' ? 'enterprise Java development, database administration, and production system management' : projectCategory === 'web-development' ? 'modern web development frameworks, full-stack architecture, and deployment strategies' : 'professional software development practices and industry workflows'}.\n\n`;
        } else {
            content += `This chapter details the comprehensive ${chapterTitle.toLowerCase()} phase of the ${config.projectTitle} project. The implementation follows industry best practices and demonstrates practical application of advanced software engineering principles.\n\n`;
            content += `The development approach emphasizes ${projectCategory === 'java-database' ? 'robust database design, efficient Java implementation, and enterprise-grade security measures' : projectCategory === 'ai-ml' ? 'rigorous model development, comprehensive validation procedures, and scalable deployment architecture' : 'maintainable code design, scalable architecture, and comprehensive testing strategies'}.\n\n`;
        }

        content += `${chapterNum}.2 Technical Implementation and Methodology\n\n`;

        // Add much more detailed technical content based on project category
        if (projectCategory === 'java-database') {
            content += `The technical implementation encompasses advanced Java programming techniques including design patterns (Singleton, Factory, Observer, Strategy), comprehensive exception handling with custom exception hierarchies, multi-threading for concurrent operations, and advanced JDBC programming with connection pooling and transaction management.\n\n`;
            content += `Database implementation includes normalized schema design following third normal form principles, advanced indexing strategies for query optimization, stored procedures for complex business logic, triggers for automated data validation, and comprehensive backup and recovery procedures ensuring data integrity and availability.\n\n`;
        } else if (projectCategory === 'ai-ml') {
            content += `The technical implementation involves advanced machine learning algorithms including supervised learning (classification and regression), unsupervised learning (clustering and dimensionality reduction), deep learning with neural networks, ensemble methods for improved accuracy, and comprehensive model validation using cross-validation and statistical testing.\n\n`;
            content += `Implementation utilizes industry-standard libraries including scikit-learn for traditional machine learning, TensorFlow/PyTorch for deep learning, pandas for data manipulation, NumPy for numerical computing, and comprehensive visualization tools for data analysis and model interpretation.\n\n`;
        } else if (projectCategory === 'web-development') {
            content += `The technical implementation covers comprehensive full-stack development including React.js for dynamic frontend interfaces, Node.js with Express.js for scalable backend services, RESTful API design and implementation, database integration with MongoDB/MySQL, and comprehensive authentication and authorization systems.\n\n`;
            content += `Modern development practices include responsive web design using CSS Grid and Flexbox, progressive web app implementation, performance optimization through code splitting and lazy loading, comprehensive testing with Jest and Cypress, and deployment strategies using Docker and cloud platforms.\n\n`;
        } else {
            content += `The technical implementation follows software engineering best practices including modular architecture design, comprehensive error handling and logging, automated testing with unit and integration tests, continuous integration and deployment pipelines, and comprehensive documentation for maintainability.\n\n`;
            content += `Quality assurance encompasses code review procedures, static analysis tools, performance profiling and optimization, security vulnerability assessment, and comprehensive user acceptance testing ensuring high-quality deliverables.\n\n`;
        }

        content += `${chapterNum}.3 Results, Analysis, and Validation\n\n`;
        content += `The implementation results demonstrate successful achievement of all specified objectives with comprehensive performance metrics validating system effectiveness. ${reportType === 'thesis' ? 'Statistical analysis confirms the significance of research findings with p-values < 0.05 for all major hypotheses.' : reportType === 'internship' ? 'Professional evaluation confirms successful completion of all learning objectives with excellent performance ratings.' : 'System testing validates all functional requirements with performance exceeding specified benchmarks.'}\n\n`;
        content += `${reportType === 'thesis' ? 'Comprehensive validation includes statistical significance testing, comparative analysis with existing approaches, and rigorous peer review ensuring research reliability and contribution to the field.' : reportType === 'internship' ? 'Learning validation includes practical skill assessment, professional competency evaluation, and comprehensive feedback from supervisors and mentors.' : 'Validation encompasses comprehensive testing procedures, performance benchmarking, user acceptance testing, and security assessment ensuring production readiness.'}\n\n`;
    }

    return content;
}

// Generate conclusion content based on report type and project category
function generateConclusionContent(config, reportType, projectCategory) {
    let content = `7.1 ${reportType === 'thesis' ? 'Research' : 'Project'} Summary and Achievements\n\n`;

    if (reportType === 'thesis') {
        content += `This research has successfully investigated ${config.projectTitle} and provided significant contributions to the academic understanding of ${projectCategory === 'java-database' ? 'Java-database integration patterns' : projectCategory === 'ai-ml' ? 'machine learning applications and optimization' : 'software engineering practices'}.\n\n`;
        content += `The research findings demonstrate empirical evidence supporting the proposed hypotheses and provide a comprehensive framework for future research in this domain. The methodology employed ensures reproducible results and contributes valuable insights to the existing body of knowledge.\n\n`;
    } else if (reportType === 'internship') {
        content += `The internship experience at ${config.institution} has provided invaluable practical knowledge and professional development opportunities. The hands-on experience with ${config.projectTitle} has significantly enhanced both technical skills and professional competencies.\n\n`;
        content += `The learning outcomes demonstrate successful achievement of all internship objectives and provide a strong foundation for career advancement in ${projectCategory === 'java-database' ? 'Java enterprise development' : projectCategory === 'web-development' ? 'web development and full-stack engineering' : 'software development'}.\n\n`;
    } else {
        content += `The ${config.projectTitle} project has successfully achieved all primary objectives and delivered a comprehensive solution that demonstrates effective integration of modern technologies and development methodologies.\n\n`;
        content += `The implementation showcases practical application of ${projectCategory === 'java-database' ? 'Java programming and database management principles' : projectCategory === 'ai-ml' ? 'machine learning algorithms and data science methodologies' : 'software engineering best practices'} while delivering measurable value to users and stakeholders.\n\n`;
    }

    content += `7.2 Learning Outcomes and Skills Gained\n\n`;
    content += `This ${reportType} has provided comprehensive learning experiences that significantly enhanced both technical skills and professional development capabilities. The practical application of theoretical knowledge has deepened understanding of ${projectCategory === 'java-database' ? 'enterprise Java development and database systems' : projectCategory === 'ai-ml' ? 'machine learning and artificial intelligence' : 'software development and system design'}.\n\n`;

    content += `7.3 Limitations and Future Work\n\n`;
    content += `While this ${reportType} has achieved its primary objectives, certain limitations provide opportunities for future enhancement. These limitations include scope constraints, resource availability, and technological considerations that could be addressed in future work.\n\n`;

    content += `Future enhancements could include ${projectCategory === 'java-database' ? 'advanced performance optimization, microservices architecture implementation, and cloud deployment strategies' : projectCategory === 'ai-ml' ? 'advanced algorithm implementation, real-time processing capabilities, and expanded dataset analysis' : 'additional feature implementation, scalability improvements, and integration with emerging technologies'}.\n\n`;

    return content;
}

// Generate generic introduction content
function generateGenericIntroductionContent(config, reportType, projectCategory) {
    return `1.1 Background and Motivation\n\nThe field of ${config.course} has witnessed significant advancements in recent years, particularly in areas related to ${config.projectTitle}. This ${reportType} addresses the growing need for innovative solutions in modern technology through systematic analysis and implementation of advanced methodologies.\n\n1.2 Objectives and Goals\n\nThe main objectives include comprehensive analysis and implementation of ${config.projectTitle}, demonstrating practical application of theoretical knowledge, and contributing to the understanding of ${projectCategory === 'java-database' ? 'Java-database integration' : projectCategory === 'ai-ml' ? 'machine learning applications' : 'software development practices'}.\n\n1.3 Scope and Organization\n\nThis ${reportType} covers comprehensive analysis and implementation of ${config.projectTitle}, following academic standards and industry best practices for technical documentation.`;
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