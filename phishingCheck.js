const axios = require('axios');
const config = require('./config');

async function checkPhishing(url) {
    try {
        if (!config.GOOGLE_API_KEY) {
            throw new Error('Hello World');
        }

        const requestBody = {
            client: {
                clientId: "secureUrlDetection",
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
        
        const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${config.GOOGLE_API_KEY}`;
        
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(error => {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                throw new Error('No response received from API');
            } else {
                throw new Error(`Request Error: ${error.message}`);
            }
        });

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
        throw new Error(`URL check failed: ${error.message}`);
    }
}

module.exports = { checkPhishing }; 