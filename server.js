const express = require('express');
const { checkPhishing } = require('./phishingCheck');
const config = require('./config');

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Health check endpoint that also checks configuration
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        hasApiKey: !!config.GOOGLE_API_KEY,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Phishing check endpoint
app.post('/api/check-phishing', async (req, res) => {
    try {
        // Check if API key exists
        if (!config.GOOGLE_API_KEY) {
            return res.status(500).json({
                error: 'Configuration Error',
                message: 'Google API key is not configured',
                timestamp: new Date().toISOString()
            });
        }

        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'URL is required',
                timestamp: new Date().toISOString()
            });
        }

        const result = await checkPhishing(url);
        res.json(result);
    } catch (error) {
        console.error('Error in check-phishing:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Add this condition for local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('API Key exists:', !!config.GOOGLE_API_KEY);
    });
}

module.exports = app;