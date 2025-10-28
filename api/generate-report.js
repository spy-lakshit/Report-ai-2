// Clean AI Report Generator API - Vercel Serverless Function
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, PageNumber, NumberFormat, TabStopPosition, TabStopType, LeaderType } = require('docx');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const config = req.body;
        
        // Validate required fields
        const required = ['studentName', 'studentId', 'course', 'semester', 'institution', 'supervisor', 'projectTitle', 'projectDescription', 'reportType'];
        
        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                return res.status(400).json({
                    error: `Missing required field: ${field}`
                });
            }
        }
        
        console.log(`🎯 Generating report for: ${config.projectTitle}`);
        
        // Generate the report
        const reportBuffer = await createPerfectDocx(config);
        
        // Create filename
        const filename = `${config.studentName.replace(/\s+/g, '_')}_Report.docx`;
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', reportBuffer.length);
        
        // Send the file
        res.send(reportBuffer);
        
    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate report',
            details: error.message 
        });
    }
};

// Create perfect DOCX function
async function createPerfectDocx(config) {
    try {
        console.log('📝 Creating DOCX...');
        
        const mainBodyContent = [];
        
        // Add simple chapter content
        for (let i = 1; i <= 7; i++) {
            if (i > 1) {
                mainBodyContent.push(new Paragraph({ children: [new PageBreak()] }));
            }
            
            // Chapter title
            mainBodyContent.push(
                new Paragraph({
                    children: [new TextRun({ text: `CHAPTER ${i}: SAMPLE CHAPTER`, bold: true, size: 28, font: "Times New Roman" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 480, after: 240 },
                })
            );
            
            // Chapter content
            mainBodyContent.push(
                new Paragraph({
                    children: [new TextRun({ 
                        text: `This is chapter ${i} content for ${config.projectTitle}. This chapter covers important aspects of the project and provides detailed analysis and implementation details.`,
                        size: 24, 
                        font: "Times New Roman" 
                    })],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { before: 0, after: 120, line: 360, lineRule: "auto" }
                })
            );
        }
        
        // Create document
        const doc = new Document({
            sections: [{
                children: mainBodyContent,
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                }
            }],
            styles: {
                default: {
                    document: {
                        run: {
                            size: 24,
                            font: "Times New Roman",
                        },
                        paragraph: {
                            spacing: {
                                line: 360,
                            },
                        },
                    },
                },
            },
        });

        return await Packer.toBuffer(doc);

    } catch (error) {
        console.error('DOCX generation error:', error);
        throw new Error(`Failed to create DOCX: ${error.message}`);
    }
}