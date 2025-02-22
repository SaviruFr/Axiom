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

export async function scanUrl(apiKey: string, url: string): Promise<ScanResult> {
  try {
    if (!apiKey || !url) {
      throw new Error('API key and URL are required');
    }

    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: {
          clientId: "axiom-scanner",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: [
            "THREAT_TYPE_UNSPECIFIED",
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION"
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      })
    });

    if (!response.ok) {
      console.error('Safe Browsing API error:', await response.text());
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Debug log
    console.log('Safe Browsing API response:', JSON.stringify(data, null, 2));

    // Check if there are any matches
    const hasMatches = data.matches && Array.isArray(data.matches) && data.matches.length > 0;

    return {
      scam: hasMatches,
      threats: hasMatches ? data.matches.map((match: SafeBrowsingMatch) => ({
        type: match.threatType,
        platform: match.platformType,
        entryType: match.threatEntryType
      })) : []
    };

  } catch (error) {
    console.error('Error in scanUrl:', error);
    // Return safe result on error instead of throwing
    return { scam: false, threats: [] };
  }
}
