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
    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    const requestBody = {
      client: {
        clientId: "axiom",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION",
          "THREAT_TYPE_UNSPECIFIED"
        ],
        platformTypes: ["ANY_PLATFORM", "WINDOWS", "LINUX", "ANDROID", "OSX", "IOS"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    if (!response.ok) {
      return { scam: false, threats: [] };
    }

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      return { scam: false, threats: [] };
    }

    if (!data || Object.keys(data).length === 0) {
      return { scam: false, threats: [] };
    }

    const hasMatches = data.matches && Array.isArray(data.matches) && data.matches.length > 0;

    if (!hasMatches) {
      return { scam: false, threats: [] };
    }

    const threats = data.matches.map((match: SafeBrowsingMatch) => ({
      type: match.threatType,
      platform: match.platformType,
      entryType: match.threatEntryType
    }));

    return {
      scam: true,
      threats
    };

  } catch (error) {
    return { scam: false, threats: [] };
  }
}
