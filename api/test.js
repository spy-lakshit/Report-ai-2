// Simple test API to verify Vercel deployment
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Return success response
    res.json({ 
        message: "✅ Vercel API is working!",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        status: "success"
    });
};