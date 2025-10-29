// Complete AI Report Generator - Full Academic Features (Optimized for Vercel)
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, NumberFormat, TabStopPosition, TabStopType, LeaderType, PageNumber } = require('docx');

// Gemini AI Configuration
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const config = req.body;
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType', 'apiKey'];

        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        console.log(`🎓 Starting COMPLETE academic report generation for: ${config.projectTitle}`);

        // Generate complete academic report with all features
        const reportBuffer = await generateCompleteAcademicReport(config, config.apiKey);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.studentId}_Complete_Report_${timestamp}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);

        console.log(`✅ Complete academic report generated: ${reportBuffer.length} bytes`);
        res.send(reportBuffer);

    } catch (error) {
        console.error('❌ Report generation error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        
        let errorMessage = 'Failed to generate report';
        if (error.message.includes('API key')) {
            errorMessage = 'Invalid API key. Please check your Gemini API key.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
        }
        
        res.status(500).json({ 
            error: errorMessage, 
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Generate complete academic report with all professional features
async function generateCompleteAcademicReport(config, apiKey) {
    console.log('📚 Generating COMPLETE academic report with all features...');

    // Generate dynamic chapter titles based on project type
    const chapterTitles = await generateDynamicChapterTitles(config, apiKey);
    console.log(`📖 Using ${chapterTitles.length} chapters: ${chapterTitles.join(', ')}`);

    const generatedChapters = [];
    let totalWords = 0;
    let currentPage = 8; // Start after front matter (cover, cert, ack, abstract, toc, figures, tables)

    // Generate 6 main chapters for comprehensive coverage
    for (let i = 0; i < Math.min(chapterTitles.length, 6); i++) {
        const chapterTitle = chapterTitles[i];
        console.log(`📝 AI generating Chapter ${i + 1}: ${chapterTitle}...`);

        // Generate 3 sections per chapter for better coverage
        const sections = await generateChapterSections(chapterTitle, i, config, apiKey);
        
        let chapterContent = '';
        let chapterWords = 0;

        sections.forEach((section, sectionIndex) => {
            chapterContent += `${i + 1}.${sectionIndex + 1} ${section.title}\n\n${section.content}\n\n`;
            chapterWords += section.wordCount;
        });

        const startPage = currentPage;
        const endPage = currentPage + Math.ceil(chapterWords / 300) - 1;
        currentPage = endPage + 1;

        generatedChapters.push({
            number: i + 1,
            title: chapterTitle,
            content: chapterContent.trim(),
            wordCount: chapterWords,
            startPage: startPage,
            endPage: endPage
        });

        totalWords += chapterWords;
        console.log(`✅ Chapter ${i + 1} completed: ${chapterWords} words (Pages ${startPage}-${endPage})`);
    }

    console.log(`🎉 Complete academic report generated: ${totalWords} total words!`);
    return await createCompleteAcademicDocument(config, generatedChapters);
}