// Download endpoint for completed reports
const reportStorage = new Map();

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { sessionId } = req.query;
    
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }
    
    const reportData = reportStorage.get(sessionId);
    
    if (!reportData || !reportData.completed) {
        return res.status(404).json({ error: 'Report not found or not ready' });
    }
    
    const { buffer, filename } = reportData;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send the file
    res.send(buffer);
    
    // Clean up after download
    setTimeout(() => {
        reportStorage.delete(sessionId);
    }, 60000);
};