// Universal AI-Powered Report Generator - Works for ANY Topic
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, PageNumber, NumberFormat, TabStopType, LeaderType } = require('docx');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const config = req.body;
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType'];
        
        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        console.log(`🌍 Starting UNIVERSAL report generation for ANY topic: ${config.projectTitle}`);
        
        // Generate comprehensive report for ANY topic
        const reportBuffer = await generateUniversalReport(config);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${config.studentName.replace(/\s+/g, '_')}_${config.reportType}_Report_${timestamp}.docx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);
        
        console.log(`✅ Universal report generated: ${reportBuffer.length} bytes`);
        res.send(reportBuffer);
        
    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({ error: 'Failed to generate report', details: error.message });
    }
};

// Main universal report generation function
async function generateUniversalReport(config) {
    console.log('🔍 Analyzing topic and generating content strategy...');
    await delay(500);
    
    // Analyze ANY topic to determine content approach
    const analysis = analyzeUniversalTopic(config);
    console.log(`📊 Topic analysis: ${analysis.category} | ${analysis.approach} | ${analysis.focus}`);
    
    // Generate dynamic chapter structure for ANY topic
    const chapters = generateUniversalChapterStructure(analysis, config);
    console.log(`📚 Generated ${chapters.length} chapters for ${config.reportType} on ${analysis.category}`);
    
    // Generate comprehensive content for each chapter
    const generatedChapters = [];
    for (let i = 0; i < chapters.length; i++) {
        console.log(`🔄 Generating Chapter ${i + 1}: ${chapters[i].title}`);
        await delay(600 + Math.random() * 800); // Realistic AI processing time