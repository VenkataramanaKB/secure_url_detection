const express = require('express');
const { checkPhishing } = require('./phishingCheck');
const config = require('./config');

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Phishing check endpoint
app.post('/check-phishing', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const result = await checkPhishing(url);
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});