// Progress tracking endpoint for async report generation
const progressTracking = new Map();

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
    
    const progress = progressTracking.get(sessionId) || { 
        progress: 0, 
        status: 'Starting...', 
        timeRemaining: 60 
    };
    
    res.json(progress);
};