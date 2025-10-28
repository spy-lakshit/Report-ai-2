/**
 * AI Report Generator – Gemini + DOCX
 * Works on Vercel Node 20
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  PageBreak, Footer, PageNumber
} = require("docx");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ---------- Gemini wrapper ----------
async function askGemini(apiKey, prompt) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const res = await model.generateContent(prompt);
    const txt = res.response?.text();
    return txt?.trim() || "⚠️ Gemini returned no content.";
  } catch (err) {
    console.error("Gemini error →", err);
    return `⚠️ Gemini API error: ${err.message}`;
  }
}

// ---------- API handler ----------
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const cfg = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const need = ["apiKey","studentName","projectTitle","projectDescription","reportType"];
    for (const f of need) if (!cfg[f]) return res.status(400).json({ error: `Missing ${f}` });

    const chapters = [
      "INTRODUCTION","LITERATURE REVIEW","METHODOLOGY",
      "IMPLEMENTATION","TESTING AND RESULTS","CONCLUSION"
    ];

    const gen = {};
    for (const ch of chapters) {
      const prompt = `
Write a detailed academic section titled "${ch}"
for a ${cfg.reportType} on "${cfg.projectTitle}".
Context: ${cfg.projectDescription}
Use formal technical English, multiple paragraphs.`;
      console.log("→ Generating", ch);
      gen[ch] = await askGemini(cfg.apiKey, prompt);
      await new Promise(r => setTimeout(r, 500)); // small delay
    }

    // ---------- Build DOCX ----------
    const p = [];

    // Cover Page
    p.push(
      new Paragraph({
        children:[new TextRun({text:cfg.institution?.toUpperCase()||"INSTITUTION NAME",bold:true,size:32,font:"Times New Roman"})],
        alignment:AlignmentType.CENTER,spacing:{after:720}
      }),
      new Paragraph({
        children:[new TextRun({text:cfg.projectTitle.toUpperCase(),bold:true,size:36,font:"Times New Roman"})],
        alignment:AlignmentType.CENTER,spacing:{after:1440}
      }),
      new Paragraph({
        children:[new TextRun({text:`A ${cfg.reportType.toUpperCase()} REPORT`,bold:true,size:28,font:"Times New Roman"})],
        alignment:AlignmentType.CENTER
      }),
      new Paragraph({
        children:[new TextRun({text:`Submitted by: ${cfg.studentName}`,size:24,font:"Times New Roman"})],
        alignment:AlignmentType.CENTER
      }),
      new Paragraph({children:[new PageBreak()]})
    );

    // Chapters
    for (const [title,text] of Object.entries(gen)) {
      p.push(
        new Paragraph({
          children:[new TextRun({text:title,bold:true,size:28,font:"Times New Roman"})],
          alignment:AlignmentType.CENTER,spacing:{after:480}
        }),
        ...text.split("\n").filter(t=>t.trim()).map(
          t=>new Paragraph({
            children:[new TextRun({text:t.trim(),size:24,font:"Times New Roman"})],
            alignment:AlignmentType.JUSTIFIED,
            spacing:{before:120,after:120,line:360}
          })
        ),
        new Paragraph({children:[new PageBreak()]})
      );
    }

    // References
    p.push(
      new Paragraph({
        children:[new TextRun({text:"REFERENCES",bold:true,size:28,font:"Times New Roman"})],
        alignment:AlignmentType.CENTER
      }),
      new Paragraph({children:[new TextRun({text:"1. Oracle Docs\n2. MySQL Manual\n3. IEEE Software Standards",size:24,font:"Times New Roman"})]})
    );

    const footer = new Footer({
      children:[
        new Paragraph({
          children:[new TextRun({children:[PageNumber.CURRENT],font:"Times New Roman",size:24})],
          alignment:AlignmentType.RIGHT
        })
      ]
    });

    const doc = new Document({sections:[{children:p,footers:{default:footer}}]});
    const buf = await Packer.toBuffer(doc);

    res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition",`attachment; filename="${cfg.studentName.replace(/\s+/g,"_")}_${cfg.reportType}.docx"`);
    res.send(buf);

  } catch (e) {
    console.error("💥 Unhandled error:", e);
    res.status(500).json({error:e.message,stack:e.stack});
  }
};
