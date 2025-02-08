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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Phishing check endpoint
app.post('/api/check-phishing', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const result = await checkPhishing(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Remove the app.listen() call since Vercel handles this
module.exports = app;