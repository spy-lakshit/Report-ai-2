// Vercel Serverless Function: api/generate-report.js

// Import required libraries
// NOTE: docx must be installed in your project: npm install docx
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = require('docx');

// The main model used for generation
const AI_MODEL = "gemini-2.5-flash-preview-09-2025";

/**
 * MOCK: This function simulates an API call to Gemini to generate the report structure.
 * In a real Vercel environment, you would use a dedicated Gemini SDK or fetch call here.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {string} apiKey - The user's Gemini API Key.
 * @returns {Promise<object>} The parsed JSON structure for the report.
 */
async function generateStructuredReportStructure(prompt, apiKey) {
    console.log(`[AI Call] Generating structure using model ${AI_MODEL}`);
    
    // In a real implementation, you'd use fetch or the official SDK here.
    // Example using fetch (requires Node's fetch support or a polyfill):
    /*
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${apiKey}`;
    
    const payload = {
        // ... contents and system instruction ...
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                // ... schema for the report structure ...
            }
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.statusText}`);
    }
    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
    */

    // --- MOCK RESPONSE FOR DEMONSTRATION ---
    // This mock simulates the output JSON from the AI, which defines the report's chapters.
    const projectType = prompt.includes("web-development") ? "Web Dev" : "General";
    
    return {
        // This is the structure the AI defines based on the prompt
        // The content for each section will be populated in the next step
        reportTitle: "AI-Generated Draft Report on " + prompt.match(/Project Title: (.*?)\./)[1],
        chapters: [
            { 
                title: "Chapter 1: Introduction and Project Context", 
                sections: [
                    { title: "1.1 Background and Motivation", content: `(Content Placeholder for 1.1 - The project addresses X challenge in Y domain.)` },
                    { title: "1.2 Problem Statement", content: `(Content Placeholder for 1.2 - The core problem is Z.)` },
                    { title: "1.3 Report Structure", content: `(Content Placeholder for 1.3 - This section outlines the flow of the document.)` },
                ]
            },
            {
                title: `Chapter 2: Literature Review and Methodology (${projectType})`,
                sections: [
                    { title: "2.1 Literature Review", content: `(Content Placeholder for 2.1 - Review of relevant papers and prior art.)` },
                    { title: "2.2 Proposed Solution Architecture", content: `(Content Placeholder for 2.2 - High-level system design.)` },
                    { title: "2.3 Implementation Technologies", content: `(Content Placeholder for 2.3 - Key technologies like Java and MySQL are discussed.)` },
                ]
            },
            {
                title: "Chapter 3: System Implementation",
                sections: [
                    { title: "3.1 Database Design", content: `(Content Placeholder for 3.1 - Entity-Relationship Diagram and schema discussion.)` },
                    { title: "3.2 Frontend and Backend Integration", content: `(Content Placeholder for 3.2 - Describing how the system components interact.)` },
                    { title: "3.3 Testing and Quality Assurance", content: `(Content Placeholder for 3.3 - Discussion on unit and integration tests.)` },
                ]
            },
            {
                title: "Chapter 4: Conclusion and Future Work",
                sections: [
                    { title: "4.1 Conclusion", content: `(Content Placeholder for 4.1 - Summarizing key findings and project success.)` },
                    { title: "4.2 Future Enhancements", content: `(Content Placeholder for 4.2 - Suggestions for further development.)` },
                ]
            }
        ]
    };
}

/**
 * Creates the cover page elements.
 * @param {object} data - User input data.
 * @returns {Paragraph[]} An array of docx Paragraphs for the cover page.
 */
function createCoverPage(data) {
    const defaultStyle = { font: 'Times New Roman', size: 24 };

    // Set Report Type
    const reportType = new Paragraph({
        children: [new TextRun({ text: data.reportType.toUpperCase(), bold: true, size: 36, font: defaultStyle.font })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 720, before: 1440 }
    });

    // Set Project Title
    const title = new Paragraph({
        children: [new TextRun({ text: data.projectTitle, bold: true, size: 56, font: defaultStyle.font })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1440 }
    });

    // Submission details (using a table for better alignment control)
    const table = new Table({
        width: { size: 9000, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Submitted by:", bold: true, ...defaultStyle })], alignment: AlignmentType.LEFT })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.studentName, ...defaultStyle })] })] }),
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Student ID:", bold: true, ...defaultStyle })], alignment: AlignmentType.LEFT })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.studentId, ...defaultStyle })] })] }),
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Supervised by:", bold: true, ...defaultStyle })], alignment: AlignmentType.LEFT })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.supervisor, ...defaultStyle })] })] }),
                ]
            }),
        ],
    });

    // Institution and Date
    const institution = new Paragraph({
        children: [
            new TextRun({ text: data.institution, bold: true, size: 32, font: defaultStyle.font }),
            new TextRun({ text: "\n" + data.course, size: 28, font: defaultStyle.font }),
            new TextRun({ text: "\n\n" + data.semester, size: 24, font: defaultStyle.font })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440 }
    });

    return [reportType, title, table, institution];
}


/**
 * Main handler for the serverless function.
 * @param {object} req - Vercel Request object.
 * @param {object} res - Vercel Response object.
 */
module.exports = async (req, res) => {
    // 1. Basic Validation and Setup
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    const data = req.body;
    const apiKey = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;
    
    // Check for essential data and API Key
    if (!apiKey || !data || !data.projectTitle || !data.projectDescription) {
        return res.status(400).json({ error: 'Missing required fields (API Key, Project Title, or Description).' });
    }

    try {
        // 2. Construct Prompt for AI (Determine Report Structure)
        // This is a single, concise prompt to guide the AI on the report structure and topic.
        const structurePrompt = `
            Act as a professional academic report writer. 
            Based on the following project details, generate a JSON object representing the structure of a professional, detailed academic report. 
            The structure must contain a field 'reportTitle' and an array of 'chapters'. 
            Each chapter must have a 'title' (e.g., 'Chapter 1: Introduction') and an array of 'sections'. 
            Each section must have a 'title' (e.g., '1.1 Problem Statement') and a placeholder 'content' field with a descriptive text like '(Content Placeholder for 1.1 - [Topic description])'.
            
            Report Type: ${data.reportType}
            Project Title: ${data.projectTitle}
            Description: ${data.projectDescription}
            
            Example Topic Match: The description indicates a project heavily involving Java and MySQL for an inventory system. The structure should reflect traditional software engineering report sections (Design, Implementation, Testing).
        `;

        // 3. Generate the Report Structure (Mocked for environment constraints)
        const reportStructure = await generateStructuredReportStructure(structurePrompt, apiKey);
        
        // 4. Build the DOCX Document
        const children = [];

        // --- Cover Page (First Page) ---
        children.push(...createCoverPage(data));
        children.push(new Paragraph({ children: [], pageBreakBefore: true })); // Page break after cover

        // --- Table of Contents (Second Page) ---
        // For simplicity and avoiding complex DOCX field usage, we will use a manual placeholder TOC
        children.push(new Paragraph({
            children: [new TextRun({ text: "Table of Contents", bold: true, size: 40, font: 'Times New Roman' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));
        // TOC placeholder (This part would typically be automated by DOCX, but is manually mocked here)
        reportStructure.chapters.forEach((chapter, chapterIndex) => {
             children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${chapter.title} . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . }
            
    // Set the response headers to indicate a file download (for the generated DOCX)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${data.projectTitle.replace(/[^a-z0-9]/gi, '_')}_Report_Draft.docx"`);

        // 6. Send the DOCX buffer back to the client
        return res.send(buffer);

    } catch (error) {
        console.error("Internal Server Error during report generation:", error);
        return res.status(500).json({ error: 'Failed to generate report structure. Check console for details.', details: error.message });
    }
};

/**
 * Creates a standard academic paragraph style.
 * @returns {object} Paragraph style configuration.
 */
function createStandardParagraphStyle() {
    return {
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360, after: 180 }, // 1.5 line spacing
        indent: { firstLine: 720 }, // Half-inch indent for first line
        run: { font: 'Times New Roman', size: 24 } // 12pt font
    };
}
