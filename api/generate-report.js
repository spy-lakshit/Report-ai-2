// api/generate-report.js
// Gemini-powered report generator BUT with exact layout from test-lakshay-simple-offline.js
// - Validates provided API key once
// - Uses Gemini per-chapter, with offline fallback if Gemini fails for that chapter
// - Produces DOCX with same layout/TOC/list/footer formatting

const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, PageNumber, NumberFormat, TabStopType, LeaderType } = require("docx");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- IMPORTANT: copy the offline helper functions from your test file. ---
// To keep this file self-contained I've included condensed versions
// of the layout/format functions (cover, certificate, TOC, lists, footer, formatted paragraphs, offline chapter text).
// These are adapted from test-lakshay-simple-offline.js with the same style/spacing/fonts.

function createCoverPage(details) {
  return [
    new Paragraph({ children: [new TextRun({ text: (details.institution || "INSTITUTION").toUpperCase(), bold: true, size: 32, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 720, after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: details.department || `Department of ${details.course || ""}`, bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 720 } }),
    new Paragraph({ children: [new TextRun({ text: (details.projectTitle || "").toUpperCase(), bold: true, size: 36, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 1440, after: 1440 } }),
    new Paragraph({ children: [new TextRun({ text: `AN ${(details.reportType || "REPORT").toUpperCase()}`, bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 720 } }),
    new Paragraph({ children: [new TextRun({ text: "Submitted by:", size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: details.studentName || "", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: `Student ID: ${details.studentId || ""}`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: details.course || "", size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: details.semester || "", size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 720 } }),
    new Paragraph({ children: [new TextRun({ text: "Under the guidance of:", size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: details.supervisor || "", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 720 } }),
    new Paragraph({ children: [new TextRun({ text: new Date().getFullYear().toString(), bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 720 } })
  ];
}

function createCertificatePage(details) {
  return [
    new Paragraph({ children: [new TextRun({ text: "TRAINING CERTIFICATE", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 480 } }),
    new Paragraph({ children: [new TextRun({ text: `This is to certify that ${details.studentName} (Student ID: ${details.studentId}) has successfully completed the ${details.reportType || ""} work on "${details.projectTitle}" as part of the curriculum for ${details.course} at ${details.institution}.`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 360, after: 360 } }),
    new Paragraph({ children: [new TextRun({ text: `The work was carried out under the supervision of ${details.supervisor} during the academic year ${new Date().getFullYear()}.`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 360, after: 720 } }),
    new Paragraph({ children: [new TextRun({ text: "Date: _______________", size: 24, font: "Times New Roman" })], alignment: AlignmentType.LEFT, spacing: { before: 720, after: 360 } }),
    new Paragraph({ children: [new TextRun({ text: "Signature of Supervisor", size: 24, font: "Times New Roman" })], alignment: AlignmentType.RIGHT, spacing: { before: 720 } }),
    new Paragraph({ children: [new TextRun({ text: details.supervisor || "", bold: true, size: 24, font: "Times New Roman" })], alignment: AlignmentType.RIGHT, spacing: { after: 240 } })
  ];
}

function createAcknowledgementPage(details) {
  return [
    new Paragraph({ children: [new TextRun({ text: "ACKNOWLEDGEMENT", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 480 } }),
    new Paragraph({ children: [new TextRun({ text: `I would like to express my sincere gratitude to my supervisor, ${details.supervisor}, for valuable guidance, continuous support, and encouragement throughout the development of this ${details.reportType?.toLowerCase() || "report"}.`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 360, after: 360 } }),
    new Paragraph({ children: [new TextRun({ text: `I am also thankful to the faculty members of ${details.department || `Department of ${details.course}`}, ${details.institution}, for their support and for providing the necessary resources and facilities required for this work.`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 360, after: 360 } }),
    new Paragraph({ children: [new TextRun({ text: "I would also like to thank my family and friends for their constant encouragement and moral support throughout this journey.", size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 360, after: 720 } }),
    new Paragraph({ children: [new TextRun({ text: details.studentName || "", bold: true, size: 24, font: "Times New Roman" })], alignment: AlignmentType.RIGHT, spacing: { before: 720 } }),
    new Paragraph({ children: [new TextRun({ text: details.studentId || "", size: 24, font: "Times New Roman" })], alignment: AlignmentType.RIGHT, spacing: { after: 240 } })
  ];
}

function createAbstractPage(details, analysisText) {
  return [
    new Paragraph({ children: [new TextRun({ text: "ABSTRACT", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 480 } }),
    new Paragraph({ children: [new TextRun({ text: `This ${details.reportType?.toLowerCase() || "report"} presents the comprehensive study and implementation of "${details.projectTitle}". ${details.projectDescription}`, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 360, after: 360 } }),
    ...(analysisText ? [ new Paragraph({ children: [new TextRun({ text: analysisText, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 360, after: 360 } }) ] : []),
    new Paragraph({ children: [new TextRun({ text: `Keywords: ${details.course || ""}, ${details.projectTitle || ""}`, bold: true, size: 24, font: "Times New Roman" })], alignment: AlignmentType.LEFT, spacing: { before: 360 } })
  ];
}

function createTableOfContentsPage() {
  // We'll produce a static TOC layout with expected headings and page numbers placeholders
  const tocItems = [
    "Training Certificate ..................................... i",
    "Acknowledgement .......................................... ii",
    "Abstract .................................................. iii",
    "Table of Contents .................................... iv-v",
    "List of Tables ........................................ vi",
    "List of Figures ........................................ vii",
    "Chapter 1: Introduction .......................... 1-9",
    "Chapter 2: Literature Review .................. 10-17",
    "Chapter 3: Methodology ........................ 18-24",
    "Chapter 4: System Analysis and Design ..... 25-32",
    "Chapter 5: Implementation ........................ 33-39",
    "Chapter 6: Testing and Validation ........... 40-47",
    "Chapter 7: Conclusion .......................... 48-50",
    "References ............................................ 51"
  ];

  return [
    new Paragraph({ children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 480 } }),
    ...tocItems.map(item =>
      new Paragraph({ children: [new TextRun({ text: item, size: 24, font: "Times New Roman" })], spacing: { after: 120 } })
    )
  ];
}

function createListOfTablesPage() {
  return [
    new Paragraph({ children: [new TextRun({ text: "LIST OF TABLES", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 480 } }),
    new Paragraph({ children: [new TextRun({ text: "Table 3.1: System Requirements Specification .................................. 20", size: 24, font: "Times New Roman" })], spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: "Table 4.1: Database Schema Design .............................................. 27", size: 24, font: "Times New Roman" })], spacing: { after: 120 } })
  ];
}

function createListOfFiguresPage() {
  return [
    new Paragraph({ children: [new TextRun({ text: "LIST OF FIGURES", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 480 } }),
    new Paragraph({ children: [new TextRun({ text: "Figure 3.1: System Architecture Diagram ...................................... 22", size: 24, font: "Times New Roman" })], spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: "Figure 4.1: ER Diagram ................................................................. 28", size: 24, font: "Times New Roman" })], spacing: { after: 120 } })
  ];
}

function createFooter() {
  return new Footer({
    children: [
      new Paragraph({
        children: [ new TextRun({ children: [ PageNumber.CURRENT ], size: 24, font: "Times New Roman" }) ],
        alignment: AlignmentType.RIGHT
      })
    ]
  });
}

// Offline fallback chapter content generator (taken from your test file)
function generateOfflineChapterText(chapterNum) {
  const offline = {
    1: `1.1 Background and Motivation

Java is a high-level, object-oriented programming language developed by Sun Microsystems in 1995... (offline text continues as in your template)`,
    2: `2.1 Theoretical Background

The theoretical foundation of Java programming is rooted in object-oriented programming principles...`,
    3: `3.1 Development Approach

The project follows an iterative development approach with clear phases including requirement analysis...`,
    4: `4.1 Requirements Analysis

This section describes requirements and architecture...`,
    5: `5.1 Development & Implementation

Implementation details, code structure, database integration...`,
    6: `6.1 Testing & Validation

Testing strategy, unit tests, integration tests, performance...`,
    7: `7.1 Conclusion

Project summary, achievements, future work...`
  };
  return offline[chapterNum] || `Section content for chapter ${chapterNum}.`;
}

// -------------------- Gemini Helpers --------------------

// Validate API key by making a tiny test call.
// Returns { ok: true } on success, or { ok: false, error: "..." }.
async function validateGeminiKey(apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Simple prompt that should always return a short text
    const result = await model.generateContent("Respond with: OK");
    const text = result?.response?.text?.()?.trim?.();
    if (text && text.toLowerCase().includes("ok")) return { ok: true };
    // If it returned something else still consider valid usually
    if (text && text.length > 0) return { ok: true };
    return { ok: false, error: "Empty response from Gemini during API key validation." };
  } catch (err) {
    console.error("Gemini validation error:", err);
    // Provide clearer messages for common cases
    if (err.message && err.message.toLowerCase().includes("quota")) return { ok: false, error: "Gemini quota/billing issue: " + err.message };
    if (err.message && (err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid"))) return { ok: false, error: "Invalid Gemini API key." };
    return { ok: false, error: "Gemini validation failed: " + (err.message || String(err)) };
  }
}

async function generateChapterViaGemini(apiKey, chapterTitle, config, approxWords = 700) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Write a professional academic section titled "${chapterTitle}" for a ${config.reportType} on "${config.projectTitle}".
Project description: ${config.projectDescription}
Institution: ${config.institution || "N/A"}; Course: ${config.course || "N/A"}.
Write approximately ${approxWords} words, with headings and paragraphs. Keep tone formal and clear.
Return plain text only.
`;
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.();
    if (!text || !text.trim()) throw new Error("Empty text from Gemini for chapter.");
    return text.trim();
  } catch (err) {
    console.error(`Gemini chapter error (${chapterTitle}):`, err?.message || err);
    return null; // caller will use offline fallback
  }
}

// -------------------- Main handler --------------------

module.exports = async (req, res) => {
  // CORS / preflight handled earlier if needed; but double-check
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const config = raw || {};

    // Required fields
    const required = ["studentName", "projectTitle", "projectDescription", "reportType", "apiKey"];
    for (const f of required) if (!config[f] || String(config[f]).trim() === "") {
      return res.status(400).json({ error: `Missing required field: ${f}` });
    }

    // Validate Gemini key ONCE
    console.log("Validating Gemini API key...");
    const val = await validateGeminiKey(config.apiKey);
    if (!val.ok) {
      console.error("Gemini key validation failed:", val.error);
      // Return a helpful error so user knows to fix key (instead of silent per-chapter failures)
      return res.status(401).json({ error: "Gemini API key validation failed", detail: val.error });
    }
    console.log("Gemini key valid. Proceeding to generate chapters...");

    // Chapter titles (match your offline template exactly)
    const chapterTitles = [
      "INTRODUCTION TO JAVA PROGRAMMING AND DATABASE SYSTEMS",
      "LITERATURE REVIEW AND TECHNOLOGY ANALYSIS",
      "METHODOLOGY AND SYSTEM DESIGN",
      "IMPLEMENTATION AND DEVELOPMENT",
      "TESTING AND VALIDATION",
      "RESULTS AND ANALYSIS",
      "CONCLUSION"
    ];

    // Generate chapters via Gemini (with fallback to offline text)
    const chapters = [];
    for (let i = 0; i < chapterTitles.length; i++) {
      const title = chapterTitles[i];
      console.log(`Generating chapter ${i + 1}: ${title}`);
      const generated = await generateChapterViaGemini(config.apiKey, title, config, 700);
      if (generated && generated.length > 50) {
        chapters.push({ number: i + 1, title, text: generated });
        console.log(`Chapter ${i + 1} generated (length ${generated.length}).`);
      } else {
        console.warn(`Chapter ${i + 1} Gemini failed or returned too short — using offline fallback.`);
        const fallback = generateOfflineChapterText(i + 1);
        chapters.push({ number: i + 1, title, text: fallback + "\n\n[Used offline fallback content]" });
      }
    }

    // Build DOCX using the same order/layout as your sample
    const docChildren = [];

    // Cover
    docChildren.push(...createCoverPage(config), new Paragraph({ children: [new PageBreak()] }));

    // Certificate
    docChildren.push(...createCertificatePage(config), new Paragraph({ children: [new PageBreak()] }));

    // Acknowledgement
    docChildren.push(...createAcknowledgementPage(config), new Paragraph({ children: [new PageBreak()] }));

    // Abstract (we ask Gemini briefly for an abstract too)
    let abstractText = null;
    try {
      abstractText = await (async () => {
        const gen = await generateWithGemini(config.apiKey, `Write a 150-200 word academic abstract for the ${config.reportType} titled "${config.projectTitle}". Project description: ${config.projectDescription}`);
        return gen && !gen.startsWith("⚠️") ? gen : null;
      })();
    } catch (e) { abstractText = null; }
    docChildren.push(...createAbstractPage(config, abstractText || null), new Paragraph({ children: [new PageBreak()] }));

    // TOC / Lists (static placeholders matching your template)
    docChildren.push(...createTableOfContentsPage(), new Paragraph({ children: [new PageBreak()] }));
    docChildren.push(...createListOfTablesPage(), new Paragraph({ children: [new PageBreak()] }));
    docChildren.push(...createListOfFiguresPage(), new Paragraph({ children: [new PageBreak()] }));

    // Chapters content
    for (const ch of chapters) {
      // Chapter title (formatted like your sample)
      docChildren.push(
        new Paragraph({ children: [new TextRun({ text: `CHAPTER ${ch.number}: ${ch.title}`, bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360 } })
      );

      // Convert chapter text into paragraphs with the same formatting rules
      const paras = ch.text.split("\n").map(l => l.trim()).filter(Boolean);
      for (const p of paras) {
        // if line looks like a numbered heading (1.1 etc.) make it bold heading
        if (/^\d+\.\d+/.test(p) || /^Chapter\s+\d+/i.test(p)) {
          docChildren.push(new Paragraph({ children: [new TextRun({ text: p, bold: true, size: 26, font: "Times New Roman" })], alignment: AlignmentType.LEFT, spacing: { before: 360, after: 240 } }));
        } else {
          docChildren.push(new Paragraph({ children: [new TextRun({ text: p, size: 24, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 360 } }));
        }
      }
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // References placeholder
    docChildren.push(new Paragraph({ children: [new TextRun({ text: "REFERENCES", bold: true, size: 28, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360 } }));
    docChildren.push(new Paragraph({ children: [new TextRun({ text: "1. https://docs.oracle.com/javase", size: 24, font: "Times New Roman" })] }));
    docChildren.push(new Paragraph({ children: [new TextRun({ text: "2. https://dev.mysql.com/doc", size: 24, font: "Times New Roman" })] }));

    // Assemble doc with footer (page numbers)
    const doc = new Document({
      sections: [{
        headers: { default: new Header({ children: [] }) },
        footers: { default: createFooter() },
        children: docChildren,
        properties: {
          page: { pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } }
        }
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${(config.studentName || "student").replace(/\s+/g, "_")}_${(config.reportType || "report").replace(/\s+/g, "_")}.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (err) {
    console.error("Unhandled server error:", err);
    res.status(500).json({ error: "Server error while generating report", detail: err?.message || String(err) });
  }
};
