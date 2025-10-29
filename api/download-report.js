// Report Download API Endpoint
const { getProgress } = require('./generate-report-async');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { id, filename } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Report ID is required' });
        }

        const progress = getProgress(id);

        if (!progress) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (progress.status !== 'completed') {
            return res.status(400).json({ 
                error: 'Report not ready for download', 
                status: progress.status,
                percentage: progress.percentage 
            });
        }

        if (!progress.reportBuffer) {
            return res.status(500).json({ error: 'Report file not available' });
        }

        const downloadFilename = filename || progress.filename || 'report.docx';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Length', progress.reportBuffer.length);

        console.log(`📥 Report downloaded: ${id} - ${downloadFilename}`);
        res.send(progress.reportBuffer);

    } catch (error) {
        console.error('❌ Download error:', error);
        res.status(500).json({ error: 'Failed to download report', details: error.message });
    }
};