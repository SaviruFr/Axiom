export async function scanUrl(apiKey, url) {
    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    const payload = {
        client: {
            clientId: "your_client_id",  // Replace with your client ID
            clientVersion: "1.5.2"  // Replace with your client version
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "THREAT_TYPE_UNSPECIFIED"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{url: url}]
        }
    };
  
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
            console.error("Error occurred:", response.status);
            throw new Error(`HTTP error: ${response.status}`);

        }
  
        const data = await response.json();
        if (data.matches && data.matches.length > 0) {
            const threats = data.matches.map(match => ({
                type: match.threatType,
                platform: match.platformType,
                entryType: match.threatEntryType
            }));
            return { scam: true };
        } else {
            return { scam: false, threats };
        }
    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    }
  }
  