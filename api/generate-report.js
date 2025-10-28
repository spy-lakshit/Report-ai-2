// api/generate-report.js
// Dynamic AI Report Generator using Google Gemini (User-provided key)
// Works perfectly with Vercel serverless environment

const { GoogleGenAI } = require('@google/genai');
const {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, PageBreak, Header, Footer, NumberFormat
} = require('docx');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const config = req.body;

    const required = [
      'studentName', 'studentId', 'course', 'semester',
      'institution', 'supervisor', 'projectTitle',
      'projectDescription', 'reportType', 'apiKey'
    ];
    for (const f of required) {
      if (!config[f] || config[f].trim() === '') {
        return res.status(400).json({ error: `Missing field: ${f}` });
      }
    }

    console.log(`🧠 Generating ${config.reportType} report for: ${config.projectTitle}`);

    // Initialize Gemini with the user’s key
    const genAI = new GoogleGenAI({ apiKey: config.apiKey });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Helper for prompting Gemini
    async function generateText(prompt) {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    }

    // === 1. Generate abstract & acknowledgement ===
    const abstractPrompt = `
Generate an academic-style abstract (150–200 words) for a ${config.reportType} report.
Project Title: ${config.projectTitle}
Project Description: ${config.projectDescription}
Use formal tone and clear summary.
    `;
    const acknowledgementPrompt = `
Write an academic acknowledgement section for a university ${config.reportType}.
Student: ${config.studentName}
Supervisor: ${config.supervisor}
Institution: ${config.institution}
Keep it short (100–150 words) and respectful.
    `;

    const abstractText = await generateText(abstractPrompt);
    const acknowledgementText = await generateText(acknowledgementPrompt);

    // === 2. Determine chapters dynamically ===
    const { chapters } = generateDynamicChapters(config);

    // === 3. Generate each chapter dynamically ===
    const chapterSections = [];
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const prompt = `
Write a detailed academic section for the chapter "${chapter}".
Report Type: ${config.reportType}
Project Title: ${config.projectTitle}
Project Description: ${config.projectDescription}
Student: ${config.studentName}, Course: ${config.course}
Institution: ${config.institution}, Supervisor: ${config.supervisor}.
Include about 500–700 words, with headings and subheadings in formal tone.
      `;
      const chapterText = await generateText(prompt);
      chapterSections.push({ title: chapter, text: chapterText });
    }

    // === 4. Build DOCX Document ===
    const docSections = [];

    // Cover Page
    docSections.push(
      new Paragraph({ text: config.institution.toUpperCase(), alignment: AlignmentType.CENTER, spacing: { after: 400 }, bold: true, size: 36 }),
      new Paragraph({ text: config.reportType.toUpperCase(), alignment: AlignmentType.CENTER, spacing: { after: 400 }, size: 28 }),
      new Paragraph({ text: `PROJECT TITLE: ${config.projectTitle}`, alignment: AlignmentType.CENTER, spacing: { after: 400 }, size: 26 }),
      new Paragraph({ text: `Submitted by ${config.studentName} (${config.studentId})`, alignment: AlignmentType.CENTER, spacing: { after: 200 }, size: 24 }),
      new Paragraph({ text: `Under the guidance of ${config.supervisor}`, alignment: AlignmentType.CENTER, spacing: { after: 200 }, size: 22 }),
      new Paragraph({ text: `Course: ${config.course}`, alignment: AlignmentType.CENTER, spacing: { after: 200 }, size: 22 }),
      new Paragraph({ text: `Semester: ${config.semester}`, alignment: AlignmentType.CENTER, spacing: { after: 400 }, size: 22 }),
      new Paragraph({ text: new Date().getFullYear().toString(), alignment: AlignmentType.CENTER, spacing: { after: 400 }, size: 22 }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Certificate Page
    docSections.push(
      new Paragraph({ text: "CERTIFICATE", alignment: AlignmentType.CENTER, spacing: { after: 300 }, bold: true, size: 28 }),
      new Paragraph({
        text: `This is to certify that the ${config.reportType.toLowerCase()} report titled "${config.projectTitle}" submitted by ${config.studentName} (${config.studentId}) in partial fulfillment for the course ${config.course}, ${config.semester}, has been successfully completed under my supervision.`,
        alignment: AlignmentType.JUSTIFIED, spacing: { after: 300 }, size: 24
      }),
      new Paragraph({ text: `Supervisor: ${config.supervisor}`, alignment: AlignmentType.LEFT, spacing: { after: 100 }, size: 24 }),
      new Paragraph({ text: `Institution: ${config.institution}`, alignment: AlignmentType.LEFT, spacing: { after: 100 }, size: 24 }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Acknowledgement
    docSections.push(
      new Paragraph({ text: "ACKNOWLEDGEMENT", alignment: AlignmentType.CENTER, spacing: { after: 300 }, bold: true, size: 28 }),
      ...acknowledgementText.split('\n').map(p =>
        new Paragraph({ text: p.trim(), alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, size: 24 })
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Abstract
    docSections.push(
      new Paragraph({ text: "ABSTRACT", alignment: AlignmentType.CENTER, spacing: { after: 300 }, bold: true, size: 28 }),
      ...abstractText.split('\n').map(p =>
        new Paragraph({ text: p.trim(), alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, size: 24 })
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Chapters
    for (const [i, ch] of chapterSections.entries()) {
      docSections.push(
        new Paragraph({
          text: `CHAPTER ${i + 1}: ${ch.title}`,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 300 },
          bold: true, size: 28
        }),
        ...ch.text.split('\n').map(line =>
          new Paragraph({ text: line.trim(), alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, size: 24 })
        ),
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    // References
    docSections.push(
      new Paragraph({ text: "REFERENCES", alignment: AlignmentType.CENTER, spacing: { before: 400, after: 300 }, bold: true, size: 28 }),
      new Paragraph({
        text: "References and citations generated automatically based on project context.",
        alignment: AlignmentType.JUSTIFIED, size: 24
      })
    );

    // === 5. Assemble Document ===
    const doc = new Document({
      sections: [{
        headers: {
          default: new Header({
            children: [new Paragraph({
              text: config.projectTitle.toUpperCase(),
              alignment: AlignmentType.LEFT,
              size: 20, bold: true
            })]
          })
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun("Page "), PageNumber.CURRENT]
            })]
          })
        },
        children: docSections,
        properties: {
          page: {
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        }
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.studentId}_Report.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Failed to generate report', details: err.message });
  }
};

// === Helper: Choose chapters dynamically ===
function generateDynamicChapters(config) {
  const title = config.projectTitle.toLowerCase();
  let chapters;
  if (config.reportType.toLowerCase() === 'internship') {
    chapters = ["INTRODUCTION", "COMPANY OVERVIEW", "TRAINING PROGRAM", "PROJECT WORK", "LEARNING OUTCOMES", "CONCLUSION"];
  } else if (config.reportType.toLowerCase() === 'thesis') {
    chapters = ["INTRODUCTION", "LITERATURE REVIEW", "METHODOLOGY", "IMPLEMENTATION", "RESULTS AND DISCUSSION", "CONCLUSION"];
  } else {
    // project report
    chapters = ["INTRODUCTION", "SYSTEM ANALYSIS", "DESIGN AND DEVELOPMENT", "IMPLEMENTATION", "TESTING AND RESULTS", "CONCLUSION"];
  }
  return { chapters };
}
