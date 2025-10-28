// api/generate-report.js
// 🚀 AI-Powered Dynamic Report Generator using Gemini + DOCX (Vercel Ready)

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

// ==== MAIN HANDLER ====
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    await new Promise((resolve) => req.on("end", resolve));
    const config = body ? JSON.parse(body) : {};

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
      if (!config[field] || config[field].trim() === "") {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    console.log(`📘 Generating dynamic ${config.reportType} for ${config.projectTitle}`);

    const docBuffer = await generateAIReport(config);

    const filename = `${config.studentName.replace(/\s+/g, "_")}_${config.reportType}_Report.docx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(docBuffer);
  } catch (err) {
    console.error("❌ API error:", err);
    res
      .status(500)
      .json({ error: "Failed to generate report", details: err.message });
  }
};

// ==== CORE FUNCTION ====
async function generateAIReport(config) {
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const { chapters } = getChapters(config.reportType);

  // Generate AI text for sections
  const abstract = await aiText(
    model,
    `Write an academic abstract (150–200 words) for a ${config.reportType} titled "${config.projectTitle}". Describe objectives, methods, and key outcomes.`
  );

  const acknowledgement = await aiText(
    model,
    `Write a formal acknowledgement section for a ${config.reportType} supervised by ${config.supervisor} at ${config.institution}.`
  );

  const chapterData = [];
  for (let i = 0; i < chapters.length; i++) {
    const title = chapters[i];
    const prompt = `
Write a detailed ${config.reportType} chapter titled "${title}" for project "${config.projectTitle}".
Project Description: ${config.projectDescription}
Course: ${config.course}, Semester: ${config.semester}, Institution: ${config.institution}.
Length: ~700 words. Use professional academic tone with headings/subheadings.`;
    const text = await aiText(model, prompt);
    chapterData.push({ title, text });
  }

  console.log("✅ All AI content generated, assembling DOCX...");
  return await createWordFile(config, abstract, acknowledgement, chapterData);
}

// ==== GEMINI CALL ====
async function aiText(model, prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("⚠️ Gemini failed:", err.message);
    return "⚠️ Unable to generate this section due to API issue.";
  }
}

// ==== DOCUMENT CREATION ====
async function createWordFile(config, abstract, acknowledgement, chapters) {
  const children = [];

  // Cover Page
  children.push(...coverPage(config), new Paragraph({ children: [new PageBreak()] }));

  // Certificate
  children.push(...certificatePage(config), new Paragraph({ children: [new PageBreak()] }));

  // Acknowledgement
  children.push(...sectionPage("ACKNOWLEDGEMENT", acknowledgement), new Paragraph({ children: [new PageBreak()] }));

  // Abstract
  children.push(...sectionPage("ABSTRACT", abstract), new Paragraph({ children: [new PageBreak()] }));

  // Table of Contents
  children.push(...tableOfContents(chapters), new Paragraph({ children: [new PageBreak()] }));

  // Chapters
  chapters.forEach((ch, i) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `CHAPTER ${i + 1}: ${ch.title}`, bold: true, size: 28, font: "Times New Roman" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 300 },
      })
    );
    ch.text.split("\n").forEach((line) => {
      if (line.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 24, font: "Times New Roman" })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
          })
        );
      }
    });
    children.push(new Paragraph({ children: [new PageBreak()] }));
  });

  // References
  children.push(
    new Paragraph({
      text: "REFERENCES",
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 300 },
      bold: true,
      size: 28,
    }),
    new Paragraph({
      text: "References and citations are AI-generated based on the project context.",
      alignment: AlignmentType.JUSTIFIED,
      size: 24,
    })
  );

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
                children: [new TextRun("Page "), PageNumber.CURRENT],
              }),
            ],
          }),
        },
        children,
        properties: {
          page: {
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// ==== SECTIONS ====
function coverPage(config) {
  return [
    new Paragraph({
      text: config.institution.toUpperCase(),
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 32,
      spacing: { before: 720, after: 300 },
    }),
    new Paragraph({
      text: config.projectTitle.toUpperCase(),
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 36,
      spacing: { before: 400, after: 400 },
    }),
    new Paragraph({
      text: `A ${config.reportType.toUpperCase()} REPORT`,
      alignment: AlignmentType.CENTER,
      size: 26,
      spacing: { after: 600 },
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
      size: 24,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: `${config.course}, ${config.semester}`,
      alignment: AlignmentType.CENTER,
      size: 22,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: new Date().getFullYear().toString(),
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 22,
    }),
  ];
}

function certificatePage(config) {
  return [
    new Paragraph({
      text: "CERTIFICATE",
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 28,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `This is to certify that ${config.studentName} (${config.studentId}) has successfully completed the ${config.reportType.toLowerCase()} titled "${config.projectTitle}" at ${config.institution} under the supervision of ${config.supervisor}.`,
      alignment: AlignmentType.JUSTIFIED,
      size: 24,
      spacing: { after: 300 },
    }),
  ];
}

function sectionPage(title, content) {
  const paras = [
    new Paragraph({
      text: title,
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 28,
      spacing: { after: 300 },
    }),
  ];
  content.split("\n").forEach((p) => {
    if (p.trim())
      paras.push(
        new Paragraph({
          text: p.trim(),
          alignment: AlignmentType.JUSTIFIED,
          size: 24,
          spacing: { after: 200 },
        })
      );
  });
  return paras;
}

function tableOfContents(chapters) {
  const toc = [
    new Paragraph({
      text: "TABLE OF CONTENTS",
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 28,
      spacing: { after: 500 },
    }),
  ];

  chapters.forEach((c, i) => {
    toc.push(
      new Paragraph({
        text: `CHAPTER ${i + 1}: ${c.title}`,
        alignment: AlignmentType.LEFT,
        size: 24,
        spacing: { after: 120 },
      })
    );
  });

  toc.push(
    new Paragraph({
      text: "",
      spacing: { after: 600 },
    }),
    new Paragraph({
      text: "LIST OF FIGURES ..................................................",
      size: 24,
    }),
    new Paragraph({
      text: "LIST OF TABLES ....................................................",
      size: 24,
    })
  );

  return toc;
}

// ==== CHAPTER STRUCTURE ====
function getChapters(type) {
  type = type.toLowerCase();
  if (type === "internship") {
    return {
      chapters: [
        "INTRODUCTION",
        "COMPANY OVERVIEW",
        "TRAINING AND WORK EXPERIENCE",
        "PROJECT DETAILS",
        "LEARNING OUTCOME",
        "CHALLENGES AND SOLUTIONS",
        "CONCLUSION",
      ],
    };
  } else if (type === "thesis") {
    return {
      chapters: [
        "INTRODUCTION",
        "LITERATURE REVIEW",
        "METHODOLOGY",
        "IMPLEMENTATION",
        "RESULTS AND DISCUSSION",
        "CONCLUSION",
      ],
    };
  }
  return {
    chapters: [
      "INTRODUCTION",
      "SYSTEM ANALYSIS",
      "SYSTEM DESIGN",
      "IMPLEMENTATION",
      "TESTING AND RESULTS",
      "CONCLUSION",
    ],
  };
}
