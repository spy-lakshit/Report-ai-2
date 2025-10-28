// api/generate-report.js
// Dynamic AI Report Generator using Google Gemini (User-provided key)
// ✅ Works perfectly on Vercel

const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  NumberFormat,
  PageNumber,
} = require("docx");

module.exports = async (req, res) => {
  // === CORS Setup ===
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    // === Body Parsing (fix for Vercel JSON issues) ===
    const config =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const required = [
      "studentName",
      "studentId",
      "course",
      "semester",
      "institution",
      "supervisor",
      "projectTitle",
      "projectDescription",
      "reportType",
      "apiKey",
    ];
    for (const field of required) {
      if (!config[field] || config[field].trim() === "")
        return res.status(400).json({ error: `Missing required field: ${field}` });
    }

    console.log(`🧠 Generating report for: ${config.projectTitle}`);

    // === Initialize Gemini with user-provided API key ===
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    async function generateText(prompt) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch (err) {
        console.error("Gemini API error:", err.message);
        return "⚠️ Unable to generate this section due to API key or quota issue.";
      }
    }

    // === Generate Abstract & Acknowledgement ===
    const abstractPrompt = `
Generate an academic-style abstract (150–200 words) for a ${config.reportType} report.
Project Title: ${config.projectTitle}
Project Description: ${config.projectDescription}
Use formal tone, summarizing objectives, methods, and outcomes.
    `;
    const acknowledgementPrompt = `
Write an academic acknowledgement for a ${config.reportType} report.
Student: ${config.studentName}
Supervisor: ${config.supervisor}
Institution: ${config.institution}
Keep it respectful and concise (100–150 words).
    `;
    const abstractText = await generateText(abstractPrompt);
    const acknowledgementText = await generateText(acknowledgementPrompt);

    // === Generate Chapter Titles Dynamically ===
    const { chapters } = generateDynamicChapters(config);
    const chapterSections = [];

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const chapterPrompt = `
Write a detailed academic section for "${chapter}" in a ${config.reportType}.
Project Title: ${config.projectTitle}
Project Description: ${config.projectDescription}
Student: ${config.studentName}, Course: ${config.course}, Supervisor: ${config.supervisor}.
Include subheadings, paragraphs, and around 500–700 words.
      `;
      const text = await generateText(chapterPrompt);
      chapterSections.push({ title: chapter, text });
    }

    // === Build DOCX ===
    const docSections = [];

    // Cover Page
    docSections.push(
      new Paragraph({
        text: config.institution.toUpperCase(),
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 36,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: config.reportType.toUpperCase(),
        alignment: AlignmentType.CENTER,
        size: 28,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `PROJECT TITLE: ${config.projectTitle}`,
        alignment: AlignmentType.CENTER,
        size: 26,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `Submitted by ${config.studentName} (${config.studentId})`,
        alignment: AlignmentType.CENTER,
        size: 24,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Under the guidance of ${config.supervisor}`,
        alignment: AlignmentType.CENTER,
        size: 22,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `${config.course}, ${config.semester}`,
        alignment: AlignmentType.CENTER,
        size: 22,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: new Date().getFullYear().toString(),
        alignment: AlignmentType.CENTER,
        size: 22,
        spacing: { after: 400 },
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Certificate
    docSections.push(
      new Paragraph({
        text: "CERTIFICATE",
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 28,
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: `This is to certify that the ${config.reportType.toLowerCase()} report titled "${config.projectTitle}" submitted by ${config.studentName} (${config.studentId}) in partial fulfillment for ${config.course}, ${config.semester}, has been successfully completed under my supervision.`,
        alignment: AlignmentType.JUSTIFIED,
        size: 24,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `Supervisor: ${config.supervisor}`,
        alignment: AlignmentType.LEFT,
        size: 24,
      }),
      new Paragraph({
        text: `Institution: ${config.institution}`,
        alignment: AlignmentType.LEFT,
        size: 24,
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Acknowledgement
    docSections.push(
      new Paragraph({
        text: "ACKNOWLEDGEMENT",
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 28,
        spacing: { after: 300 },
      }),
      ...acknowledgementText.split("\n").map(
        (p) =>
          new Paragraph({
            text: p.trim(),
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            size: 24,
          })
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Abstract
    docSections.push(
      new Paragraph({
        text: "ABSTRACT",
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 28,
        spacing: { after: 300 },
      }),
      ...abstractText.split("\n").map(
        (p) =>
          new Paragraph({
            text: p.trim(),
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            size: 24,
          })
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Chapters
    for (let i = 0; i < chapterSections.length; i++) {
      const ch = chapterSections[i];
      docSections.push(
        new Paragraph({
          text: `CHAPTER ${i + 1}: ${ch.title}`,
          alignment: AlignmentType.CENTER,
          bold: true,
          size: 28,
          spacing: { before: 400, after: 300 },
        }),
        ...ch.text.split("\n").map(
          (line) =>
            new Paragraph({
              text: line.trim(),
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
              size: 24,
            })
        ),
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    // References
    docSections.push(
      new Paragraph({
        text: "REFERENCES",
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 28,
        spacing: { before: 400, after: 300 },
      }),
      new Paragraph({
        text:
          "References are based on standard research and project methodologies used in this report.",
        alignment: AlignmentType.JUSTIFIED,
        size: 24,
      })
    );

    // === Assemble Document ===
    const doc = new Document({
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  text: config.projectTitle.toUpperCase(),
                  alignment: AlignmentType.LEFT,
                  size: 20,
                  bold: true,
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun("Page "),
                    PageNumber.CURRENT,
                  ],
                }),
              ],
            }),
          },
          children: docSections,
          properties: {
            page: {
              pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
              margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
            },
          },
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${config.studentName.replace(/\s+/g, "_")}_Report.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error("❌ Server error:", err);
    res
      .status(500)
      .json({ error: "Server crash while generating report", details: err.message });
  }
};

// === Helper for dynamic chapters ===
function generateDynamicChapters(config) {
  const type = config.reportType.toLowerCase();
  let chapters;
  if (type === "internship") {
    chapters = [
      "INTRODUCTION",
      "COMPANY OVERVIEW",
      "TRAINING PROGRAM",
      "PROJECT WORK",
      "LEARNING OUTCOMES",
      "CONCLUSION",
    ];
  } else if (type === "thesis") {
    chapters = [
      "INTRODUCTION",
      "LITERATURE REVIEW",
      "METHODOLOGY",
      "IMPLEMENTATION",
      "RESULTS AND DISCUSSION",
      "CONCLUSION",
    ];
  } else {
    chapters = [
      "INTRODUCTION",
      "SYSTEM ANALYSIS",
      "DESIGN AND DEVELOPMENT",
      "IMPLEMENTATION",
      "TESTING AND RESULTS",
      "CONCLUSION",
    ];
  }
  return { chapters };
}
