/**
 * Gemini-powered Report Generator using the exact layout from test-lakshay-simple-offline.js
 * Compatible with Vercel Node.js 20
 */

const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Footer, PageNumber } = require("docx");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔹 Gemini AI Helper
async function generateWithGemini(apiKey, prompt) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response?.text();
    return text && text.trim().length > 0
      ? text
      : "⚠️ Gemini returned no text.";
  } catch (err) {
    console.error("Gemini API error:", err);
    return "⚠️ Unable to generate section due to API issue.";
  }
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const config = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Validate input
    const required = ["studentName", "projectTitle", "projectDescription", "reportType", "apiKey"];
    for (const r of required) if (!config[r] || config[r].trim() === "")
      return res.status(400).json({ error: `Missing required field: ${r}` });

    // Chapters to be generated dynamically
    const chapters = [
      "INTRODUCTION",
      "LITERATURE REVIEW AND TECHNOLOGY ANALYSIS",
      "METHODOLOGY AND SYSTEM DESIGN",
      "IMPLEMENTATION AND DEVELOPMENT",
      "TESTING AND VALIDATION",
      "RESULTS AND ANALYSIS",
      "CONCLUSION"
    ];

    const generatedChapters = {};

    // 🧠 Generate each chapter dynamically with Gemini
    for (const chapter of chapters) {
      const prompt = `
Write a detailed, professional academic report section titled "${chapter}" 
for a ${config.reportType} on "${config.projectTitle}". 
Make it structured, coherent, and original — 2-3 pages worth of content.
Project Description: ${config.projectDescription}.
Institution: ${config.institution || "N/A"}.
Course: ${config.course || "N/A"}.
`;
      console.log("🔹 Generating:", chapter);
      generatedChapters[chapter] = await generateWithGemini(config.apiKey, prompt);
    }

    // Build DOCX with your layout (cover → certificate → acknowledgement → abstract → TOC → chapters → references)
    const paragraphs = [];

    // Cover Page
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: config.institution.toUpperCase(), bold: true, size: 32, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 720, after: 240 } }),
      new Paragraph({ children: [new TextRun({ text: `Department of ${config.course}`, bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 720 } }),
      new Paragraph({ children: [new TextRun({ text: config.projectTitle.toUpperCase(), bold: true, size: 36, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 1440, after: 1440 } }),
      new Paragraph({ children: [new TextRun({ text: `AN ${config.reportType.toUpperCase()}`, bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: "Submitted by:", size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: config.studentName, bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: `Student ID: ${config.studentId || ""}`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: config.semester || "", size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: `Under the guidance of: ${config.supervisor}`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: new Date().getFullYear().toString(), bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Certificate Page
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: "TRAINING CERTIFICATE", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: `This is to certify that ${config.studentName} (${config.studentId}) successfully completed the ${config.reportType.toLowerCase()} titled "${config.projectTitle}".`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Acknowledgement
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: "ACKNOWLEDGEMENT", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: `I sincerely thank ${config.supervisor} for valuable guidance during this ${config.reportType.toLowerCase()}.`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Abstract
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: "ABSTRACT", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: `This ${config.reportType.toLowerCase()} presents a comprehensive study of "${config.projectTitle}". ${config.projectDescription}`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Table of Contents
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      ...chapters.map((c, i) => new Paragraph({ children: [new TextRun({ text: `Chapter ${i + 1}: ${c}`, size: 24, font: "Times New Roman" })] })),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Add all generated chapters
    for (const [title, content] of Object.entries(generatedChapters)) {
      paragraphs.push(
        new Paragraph({ children: [new TextRun({ text: `CHAPTER: ${title}`, bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
        ...content.split("\n").filter(x => x.trim()).map(line =>
          new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 120, line: 360 }
          })
        ),
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    // References placeholder
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: "REFERENCES", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: "1. https://docs.oracle.com/javase", size: 24, font: "Times New Roman" })] }),
      new Paragraph({ children: [new TextRun({ text: "2. https://dev.mysql.com/doc", size: 24, font: "Times New Roman" })] })
    );

    // Footer with page numbers
    const footer = new Footer({
      children: [new Paragraph({
        children: [new TextRun({ children: [PageNumber.CURRENT], size: 24, font: "Times New Roman" })],
        alignment: AlignmentType.RIGHT
      })]
    });

    // Final DOCX assembly
    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs, footers: { default: footer } }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${config.studentName.replace(/\s+/g, "_")}_${config.reportType}.docx"`);
    res.send(buffer);

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
};
