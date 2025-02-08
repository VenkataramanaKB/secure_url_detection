const axios = require('axios');
const config = require('./config');

async function checkPhishing(url) {
    try {
        if (!config.GOOGLE_API_KEY) {
            throw new Error('error');
        }

        const requestBody = {
            client: {
                clientId: "yourCompanyName",
                clientVersion: "1.0.0"
            },
            threatInfo: {
                threatTypes: [
                    "MALWARE",
                    "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE",
                    "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ "url": url }]
            }
        };
        
        const response = await axios.post(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${config.GOOGLE_API_KEY}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const isPhishing = response.data.matches && response.data.matches.length > 0;
        let analysis = [];

        if (isPhishing) {
            response.data.matches.forEach(match => {
                analysis.push(`Detected ${match.threatType} threat`);
            });
        }

        return {
            url,
            isPhishing,
            confidence: isPhishing ? 'high' : 'low',
            analysis: isPhishing ? analysis : ['No threats detected'],
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        throw new Error(`Failed to check URL: ${error.response ? error.response.data : error.message}`);
    }
}

module.exports = { checkPhishing }; 