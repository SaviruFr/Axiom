interface SafeBrowsingMatch {
  threatType: string;
  platformType: string;
  threatEntryType: string;
}

interface ThreatMatch {
  type: string;
  platform: string;
  entryType: string;
}

interface ScanResult {
  scam: boolean;
  threats: ThreatMatch[];
}

interface SafeBrowsingPayload {
  client: {
    clientId: string;
    clientVersion: string;
  };
  threatInfo: {
    threatTypes: string[];
    platformTypes: string[];
    threatEntryTypes: string[];
    threatEntries: { url: string }[];
  };
}

export async function scanUrl(apiKey: string, url: string): Promise<ScanResult> {
    try {
        if (!apiKey || !url) {
            throw new Error('API key and URL are required');
        }

        const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
        
        const payload: SafeBrowsingPayload = {
            client: {
                clientId: "your_client_id",  // Replace with your client ID
                clientVersion: "your_client_version"  // Replace with your client version
            },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: url }]
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.matches && data.matches.length > 0) {
            const threats: ThreatMatch[] = data.matches.map((match: SafeBrowsingMatch) => ({
                type: match.threatType,
                platform: match.platformType,
                entryType: match.threatEntryType
            }));
            return { scam: true, threats };
        }
        
        return { scam: false, threats: [] };
    } catch (error) {
        console.error('Error scanning URL:', error);
        throw error;
    }
}
