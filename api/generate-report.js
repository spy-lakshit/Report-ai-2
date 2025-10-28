// 🌐 Universal AI-Powered Dynamic Report Generator (Gemini 1.5 Flash + DOCX)
// Author: MG Invisible x ChatGPT
// Works on Vercel (Node 20.x runtime)

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Table,
  TableRow,
  TableCell,
  WidthType,
} = require("docx");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Main API function (Vercel handler)
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const config = req.body;
    const required = [
      "apiKey",
      "studentName",
      "studentId",
      "course",
      "semester",
      "institution",
      "supervisor",
      "projectTitle",
      "projectDescription",
      "reportType",
    ];

    for (const f of required) {
      if (!config[f] || config[f].trim() === "")
        return res.status(400).json({ error: `Missing field: ${f}` });
    }

    console.log(`🚀 Generating report for ${config.projectTitle}`);

    const buffer = await generateDynamicReport(config);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${config.studentName.replace(
      /\s+/g,
      "_"
    )}_${config.reportType}_Report_${timestamp}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error("❌ Report generation error:", err);
    res
      .status(500)
      .json({ error: "Report generation failed", details: err.message });
  }
};

// =============================
// 🔹 Generate Dynamic Report
// =============================
async function generateDynamicReport(cfg) {
  const analysis = analyzeTopic(cfg);
  const chapters = getChapters(cfg, analysis);
  const content = [];

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    console.log(`📘 Generating Chapter ${i + 1}: ${ch.title}`);

    try {
      const prompt = `
Write a ${cfg.reportType} report chapter titled "${ch.title}" for the project "${cfg.projectTitle}".
Topic Description: ${cfg.projectDescription}
Include sections: ${ch.sections.join(", ")}.
Make it professional, structured, academic and detailed (~400 words).
`;
      const text = await callGemini(cfg.apiKey, prompt);
      content.push({ ...ch, text });
    } catch (e) {
      console.error(`⚠️ Chapter ${i + 1} AI Error:`, e);
      content.push({
        ...ch,
        text: "⚠️ Unable to generate section due to API issue.",
      });
    }

    await delay(400);
  }

  return await createDoc(cfg, analysis, content);
}

// =============================
// 🔹 Gemini API Caller
// =============================
async function callGemini(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// =============================
// 🔹 Topic Analyzer
// =============================
function analyzeTopic(cfg) {
  const title = cfg.projectTitle.toLowerCase();
  if (title.includes("java") || title.includes("mysql"))
    return { category: "Software (Java + MySQL)", focus: "technical" };
  if (title.includes("ai") || title.includes("machine"))
    return { category: "Artificial Intelligence", focus: "research" };
  if (title.includes("web"))
    return { category: "Web Development", focus: "technical" };
  if (title.includes("business"))
    return { category: "Business Study", focus: "analytical" };
  return { category: "General Research", focus: "academic" };
}

// =============================
// 🔹 Chapter Generator
// =============================
function getChapters(cfg, analysis) {
  return [
    {
      title: "INTRODUCTION",
      sections: ["Background", "Problem Statement", "Objectives", "Scope"],
    },
    {
      title: "LITERATURE REVIEW",
      sections: ["Previous Work", "Technology Overview", "Comparative Study"],
    },
    {
      title: "METHODOLOGY",
      sections: ["Approach", "Tools Used", "Implementation Strategy"],
    },
    {
      title: "RESULTS AND DISCUSSION",
      sections: ["Results", "Evaluation", "Findings"],
    },
    {
      title: "CONCLUSION AND FUTURE WORK",
      sections: ["Summary", "Conclusion", "Future Scope"],
    },
  ];
}

// =============================
// 🔹 DOCX Creator
// =============================
async function createDoc(cfg, analysis, chapters) {
  const doc = new Document({
    sections: [
      // COVER PAGE
      {
        children: [
          new Paragraph({
            text: cfg.institution.toUpperCase(),
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ bold: true, size: 36 })],
          }),
          new Paragraph({
            text: `DEPARTMENT OF ${cfg.course.toUpperCase()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          new Paragraph({
            text: cfg.projectTitle.toUpperCase(),
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ bold: true, size: 32 })],
          }),
          new Paragraph({
            text: `A ${cfg.reportType.toUpperCase()} REPORT`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: `Submitted by ${cfg.studentName} (${cfg.studentId})`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Under the guidance of ${cfg.supervisor}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: new Date().getFullYear().toString(),
            alignment: AlignmentType.CENTER,
          }),
        ],
      },

      // CERTIFICATE
      {
        children: [
          new Paragraph({
            text: "CERTIFICATE",
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 32 })],
          }),
          new Paragraph({
            text: `This is to certify that ${cfg.studentName} has successfully completed the work titled "${cfg.projectTitle}" under my supervision at ${cfg.institution}.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: `Supervisor: ${cfg.supervisor}`,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },

      // ACKNOWLEDGEMENT
      {
        children: [
          new Paragraph({
            text: "ACKNOWLEDGEMENT",
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 32 })],
          }),
          new Paragraph({
            text: `I would like to express my sincere gratitude to ${cfg.supervisor} for their valuable guidance and ${cfg.institution} for providing the required facilities.`,
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph({
            text: cfg.studentName,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },

      // ABSTRACT
      {
        children: [
          new Paragraph({
            text: "ABSTRACT",
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 32 })],
          }),
          new Paragraph({
            text: cfg.projectDescription,
            alignment: AlignmentType.JUSTIFIED,
          }),
        ],
      },

      // TABLE OF CONTENTS
      {
        children: [
          new Paragraph({
            text: "TABLE OF CONTENTS",
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 32 })],
          }),
          ...chapters.map(
            (ch, i) =>
              new Paragraph({
                text: `Chapter ${i + 1}: ${ch.title}`,
                alignment: AlignmentType.LEFT,
                spacing: { after: 120 },
              })
          ),
        ],
      },

      // MAIN CHAPTERS
      {
        children: chapters.flatMap((ch, i) => [
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({
            text: `CHAPTER ${i + 1}: ${ch.title}`,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 28 })],
            spacing: { after: 240 },
          }),
          ...ch.text
            .split(/\n+/)
            .filter((p) => p.trim())
            .map(
              (p) =>
                new Paragraph({
                  text: p,
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 120 },
                })
            ),
        ]),
      },

      // REFERENCES
      {
        children: [
          new Paragraph({
            children: [new PageBreak()],
          }),
          new Paragraph({
            text: "REFERENCES",
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 32 })],
          }),
          new Paragraph({
            text: "1. IEEE Standards Association. Software Engineering Standards (2023).",
          }),
          new Paragraph({
            text: "2. Fowler, M. Refactoring: Improving the Design of Existing Code (2018).",
          }),
          new Paragraph({
            text: "3. Oracle Java Docs, MySQL Documentation, Google AI Papers (2024).",
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// =============================
// 🔹 Utility
// =============================
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
