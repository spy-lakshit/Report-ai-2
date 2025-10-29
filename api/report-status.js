// Real-Time Report Status API Endpoint
const { getProgress } = require('./generate-report-async');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Report ID is required' });
        }

        const progress = getProgress(id);

        if (!progress) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Return progress without sensitive data
        const response = {
            reportId: progress.reportId,
            status: progress.status,
            percentage: progress.percentage,
            currentStage: progress.currentStage,
            currentChapter: progress.currentChapter,
            wordsGenerated: progress.wordsGenerated,
            estimatedTimeRemaining: progress.estimatedTimeRemaining,
            lastUpdated: progress.lastUpdated,
            stageDetails: progress.stageDetails,
            error: progress.error,
            downloadUrl: progress.downloadUrl,
            isComplete: progress.status === 'completed',
            isFailed: progress.status === 'failed'
        };

        res.json(response);

    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(500).json({ error: 'Failed to get report status', details: error.message });
    }
};