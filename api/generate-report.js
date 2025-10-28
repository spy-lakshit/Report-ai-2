/**
 * AI-Powered Dynamic Report Generator (Gemini + DOCX)
 * Works on Vercel Node 20 Runtime
 */

const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak } = require("docx");
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const config = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const required = ["studentName", "projectTitle", "projectDescription", "reportType", "apiKey"];
    for (const r of required) if (!config[r] || config[r].trim() === "")
      return res.status(400).json({ error: `Missing required field: ${r}` });

    console.log(`📘 Generating ${config.reportType} for: ${config.studentName}`);

    const reportText = await generateFullReport(config);
    const buffer = await createWordDoc(config, reportText);

    const fileName = `${config.studentName.replace(/\s+/g, "_")}_${config.reportType}_Report.docx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) {
    console.error("❌ Generation failed:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

// ---------------- Gemini Content Generation ----------------
async function generateWithGemini(apiKey, prompt) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response?.text();
    return text && text.trim().length > 0
      ? text
      : "⚠️ Gemini returned an empty response.";
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return "⚠️ Unable to generate section due to API issue.";
  }
}

// Create a single comprehensive report in one Gemini call
async function generateFullReport(config) {
  const prompt = `
Write a complete professional ${config.reportType} report on the topic "${config.projectTitle}".
Institution: ${config.institution || "N/A"}
Student: ${config.studentName}
Course: ${config.course || "Computer Science"}
Semester: ${config.semester || "N/A"}
Supervisor: ${config.supervisor || "N/A"}

Include:
1. Cover Page details
2. Abstract
3. Table of Contents
4. At least 6 main chapters (Introduction, Literature Review, Methodology, Implementation, Testing, Results, Conclusion)
5. References

Each section should have proper headings and detailed academic text.
Return plain text only.
`;

  console.log("🔹 Sending full prompt to Gemini...");
  const text = await generateWithGemini(config.apiKey, prompt);
  return text;
}

// ---------------- DOCX Document Builder ----------------
async function createWordDoc(config, reportText) {
  const paragraphs = [];
  const lines = reportText.split("\n").map(l => l.trim()).filter(l => l);

  for (const line of lines) {
    if (line.toUpperCase().startsWith("CHAPTER") || line.toUpperCase().includes("TABLE OF CONTENTS")) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, bold: true, size: 28, font: "Times New Roman" })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 360 }
        })
      );
    } else if (/^(\d+\.)/.test(line)) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, bold: true, size: 26, font: "Times New Roman" })],
          spacing: { before: 360, after: 240 }
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 24, font: "Times New Roman" })],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 120, line: 360 }
        })
      );
    }
  }

  // Add a manual page break between major sections if the report is long
  for (let i = 10; i < paragraphs.length; i += 30) {
    paragraphs.splice(i, 0, new Paragraph({ children: [new PageBreak()] }));
  }

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({
              text: `${config.institution?.toUpperCase() || "INSTITUTION NAME"}`,
              bold: true, size: 32, font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
          }),
          new Paragraph({
            children: [new TextRun({
              text: `${config.projectTitle.toUpperCase()}`,
              bold: true, size: 28, font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 }
          }),
          new Paragraph({
            children: [new TextRun({
              text: `A ${config.reportType} Report Submitted by ${config.studentName}`,
              size: 24, font: "Times New Roman"
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1440 }
          }),
          new Paragraph({ children: [new PageBreak()] }),
          ...paragraphs
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}
