// ✅ AI-Powered Dynamic Report Generator (Gemini + DOCX)
// Works with Vercel Node 20.x

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

// ===== HTTP ENTRY POINT =====
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
    for (const field of required) {
      if (!config[field] || config[field].trim() === "") {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    console.log(`🚀 Generating report for ${config.projectTitle}...`);

    const reportBuffer = await generateDynamicReport(config);
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
    res.send(reportBuffer);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ===== MAIN WORKFLOW =====
async function generateDynamicReport(config) {
  const analysis = analyzeProject(config);
  const chapters = getChapters(config, analysis);
  const chapterContents = [];

  for (const [i, ch] of chapters.entries()) {
    console.log(`📖 Generating Chapter ${i + 1}: ${ch.title}`);
    const text = await generateChapterText(config, ch, i + 1);
    chapterContents.push({ ...ch, text });
    await delay(500);
  }

  return await createDocument(config, analysis, chapterContents);
}

// ===== AI TEXT GENERATION =====
async function generateChapterText(config, chapter, num) {
  try {
    const prompt = `
You are writing part of a ${config.reportType} report titled "${config.projectTitle}".
Topic Description: ${config.projectDescription}

Write detailed, academic, and professional content for Chapter ${num}: ${chapter.title}
Include sub-sections: ${chapter.sections.join(", ")}.
Keep it formal and structured, about 350-400 words total.
`;
    const text = await callGemini(config.apiKey, prompt);
    return text;
  } catch (e) {
    console.error("⚠️ Gemini chapter error:", e);
    return `⚠️ Unable to generate section due to API issue.`;
  }
}

async function callGemini(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ===== PROJECT ANALYSIS =====
function analyzeProject(cfg) {
  const title = cfg.projectTitle.toLowerCase();
  if (title.includes("java") || title.includes("mysql"))
    return { category: "Java-Database", tech: ["Java", "MySQL"] };
  if (title.includes("ai") || title.includes("machine"))
    return { category: "AI-ML", tech: ["Python", "TensorFlow"] };
  if (title.includes("web"))
    return { category: "Web Development", tech: ["React", "Node.js"] };
  return { category: "Software Project", tech: ["General Technologies"] };
}

// ===== CHAPTER STRUCTURE =====
function getChapters(cfg, analysis) {
  return [
    {
      title: "INTRODUCTION",
      sections: ["Background", "Problem Statement", "Objectives", "Scope"],
    },
    {
      title: "LITERATURE REVIEW",
      sections: ["Previous Works", "Technology Overview", "Comparative Analysis"],
    },
    {
      title: "METHODOLOGY",
      sections: ["System Design", "Architecture", "Implementation Approach"],
    },
    {
      title: "RESULTS AND DISCUSSION",
      sections: ["Performance", "Findings", "Evaluation"],
    },
    {
      title: "CONCLUSION",
      sections: ["Summary", "Limitations", "Future Work"],
    },
  ];
}

// ===== DOCUMENT CREATION =====
async function createDocument(cfg, analysis, chapters) {
  const doc = new Document({
    sections: [
      // COVER PAGE
      {
        children: [
          new Paragraph({
            text: cfg.institution.toUpperCase(),
            heading: "Title",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Department of ${cfg.course}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          new Paragraph({
            text: cfg.projectTitle.toUpperCase(),
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `A ${cfg.reportType.toUpperCase()} REPORT`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          new Paragraph({
            text: `Submitted by ${cfg.studentName} (${cfg.studentId})`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Under the Guidance of ${cfg.supervisor}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: new Date().getFullYear().toString(),
            alignment: AlignmentType.CENTER,
          }),
        ],
      },

      // CERTIFICATE PAGE
      {
        children: [
          new Paragraph({
            text: "CERTIFICATE",
            heading: "Title",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `This is to certify that ${cfg.studentName} has completed the work titled "${cfg.projectTitle}" under my supervision at ${cfg.institution}.`,
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),
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
            heading: "Title",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `I would like to express my gratitude to ${cfg.supervisor} for guidance and support. I also thank ${cfg.institution} for resources and encouragement.`,
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
            heading: "Title",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${cfg.projectDescription}`,
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph({
            text: `Keywords: ${analysis.tech.join(", ")}`,
            bold: true,
          }),
        ],
      },

      // TABLE OF CONTENTS
      {
        children: [
          new Paragraph({
            text: "TABLE OF CONTENTS",
            heading: "Title",
            alignment: AlignmentType.CENTER,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: chapters.map(
              (ch, i) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph(`Chapter ${i + 1}: ${ch.title}`)],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "..." })],
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                  ],
                })
            ),
          }),
        ],
      },

      // MAIN CONTENT
      {
        children: chapters.flatMap((ch, i) => [
          new Paragraph({ text: "", children: [new PageBreak()] }),
          new Paragraph({
            text: `CHAPTER ${i + 1}: ${ch.title}`,
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
          }),
          ...splitIntoParagraphs(ch.text || ""),
        ]),
      },

      // REFERENCES
      {
        children: [
          new Paragraph({
            text: "REFERENCES",
            heading: "Title",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "1. IEEE Standards Association (2023). Software Engineering Standards.",
          }),
          new Paragraph({
            text: "2. Fowler, M. (2019). Refactoring: Improving the Design of Existing Code.",
          }),
        ],
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
  });

  return await Packer.toBuffer(doc);
}

// ===== HELPERS =====
function splitIntoParagraphs(text) {
  return text
    .split(/\n+/)
    .filter((p) => p.trim())
    .map(
      (p) =>
        new Paragraph({
          text: p.trim(),
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120 },
        })
    );
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
