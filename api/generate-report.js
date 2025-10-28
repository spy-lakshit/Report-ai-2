/**
 * ✅ AI-Powered Dynamic Report Generator (Gemini + DOCX)
 * Layout based on test-lakshay-simple-offline.js
 * Works on Vercel Node.js 20
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Footer,
  PageNumber
} = require("docx");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/* -------------------- GEMINI HELPER -------------------- */
async function generateWithGemini(apiKey, prompt) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // ✅ Correct stable endpoint and model ID
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response?.text();
    if (!text || text.trim().length === 0) return ⚠️ Gemini returned empty text.";
    return text;
  } catch (err) {
    console.error("❌ Gemini error:", err);
    return "⚠️ Unable to generate this section due to API issue.";
  }
}

/* -------------------- MAIN HANDLER -------------------- */
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const config = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const required = [
      "studentName",
      "projectTitle",
      "projectDescription",
      "reportType",
      "apiKey"
    ];
    for (const field of required)
      if (!config[field] || config[field].trim() === "")
        return res.status(400).json({ error: `Missing required field: ${field}` });

    console.log(`📘 Generating ${config.reportType} for ${config.studentName}`);

    /* ---------- Chapters to generate ---------- */
    const chapters = [
      "INTRODUCTION",
      "LITERATURE REVIEW AND TECHNOLOGY ANALYSIS",
      "METHODOLOGY AND SYSTEM DESIGN",
      "IMPLEMENTATION AND DEVELOPMENT",
      "TESTING AND VALIDATION",
      "RESULTS AND ANALYSIS",
      "CONCLUSION"
    ];

    /* ---------- Generate each chapter ---------- */
    const generatedChapters = {};
    for (const chapter of chapters) {
      const prompt = `
Write a detailed academic chapter titled "${chapter}" 
for a ${config.reportType} report on "${config.projectTitle}".
Include multiple paragraphs, structured content, and clear flow.
Context: ${config.projectDescription}
Use formal, professional language. 
`;
      console.log("🧠 Generating:", chapter);
      generatedChapters[chapter] = await generateWithGemini(config.apiKey, prompt);
    }

    /* ---------- Assemble DOCX (same structure as offline file) ---------- */
    const paragraphs = [];

    // COVER PAGE
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: config.institution?.toUpperCase() || "INSTITUTION NAME",
            bold: true,
            size: 32,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 240 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: config.department
              ? config.department.toUpperCase()
              : `DEPARTMENT OF ${config.course?.toUpperCase() || "COURSE"}`,
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 720 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: config.projectTitle.toUpperCase(),
            bold: true,
            size: 36,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 1440 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `A ${config.reportType.toUpperCase()} REPORT`,
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Submitted by:", size: 24, font: "Times New Roman" })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: config.studentName,
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Student ID: ${config.studentId || ""}`,
            size: 24,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: config.semester || "",
            size: 24,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Under the guidance of: ${config.supervisor || "________"}`,
            size: 24,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: new Date().getFullYear().toString(),
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // CERTIFICATE PAGE
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "TRAINING CERTIFICATE",
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `This is to certify that ${config.studentName} (${config.studentId}) has successfully completed the ${config.reportType.toLowerCase()} titled "${config.projectTitle}" under the supervision of ${config.supervisor}.`,
            size: 24,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 480, after: 480 }
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // ACKNOWLEDGEMENT
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "ACKNOWLEDGEMENT",
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `I express my sincere gratitude to ${config.supervisor} for invaluable guidance and support during this ${config.reportType.toLowerCase()}.`,
            size: 24,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // ABSTRACT
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "ABSTRACT",
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `This ${config.reportType.toLowerCase()} presents a comprehensive study of "${config.projectTitle}". ${config.projectDescription}`,
            size: 24,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.JUSTIFIED
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // TABLE OF CONTENTS
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "TABLE OF CONTENTS",
            bold: true,
            size: 28,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      ...chapters.map(
        (c, i) =>
          new Paragraph({
            children: [new TextRun({ text: `Chapter ${i + 1}: ${c}`, size: 24, font: "Times New Roman" })]
          })
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // ADD CHAPTERS
    for (const [title, text] of Object.entries(generatedChapters)) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: title, bold: true, size: 28, font: "Times New Roman" })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 480 }
        }),
        ...text
          .split("\n")
          .filter((t) => t.trim())
          .map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line.trim(), size: 24, font: "Times New Roman" })],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 120, after: 120, line: 360 }
              })
          ),
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    // REFERENCES
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: "REFERENCES", bold: true, size: 28, font: "Times New Roman" })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "1. Oracle Java Documentation\n2. MySQL Developer Guide\n3. IEEE Standards for Software Engineering",
            size: 24,
            font: "Times New Roman"
          })
        ],
        alignment: AlignmentType.LEFT
      })
    );

    // FOOTER WITH PAGE NUMBER
    const footer = new Footer({
      children: [
        new Paragraph({
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 24, font: "Times New Roman" })],
          alignment: AlignmentType.RIGHT
        })
      ]
    });

    const doc = new Document({
      sections: [{ children: paragraphs, footers: { default: footer } }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${config.studentName.replace(/\s+/g, "_")}_${config.reportType}_Report.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error("❌ Error generating report:", err);
    res.status(500).json({ error: err.message });
  }
};
