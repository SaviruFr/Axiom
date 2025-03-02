import type { ThreatType, PlatformType, ScanResult } from '../types/scan';

interface SafeBrowsingResponse {
  matches?: Array<{
    threatType: ThreatType;
    platformType: PlatformType;
    threatEntryType: 'URL';
  }>;
}

const THREAT_CONFIG = {
  threatTypes: [
    'MALWARE',
    'SOCIAL_ENGINEERING',
    'UNWANTED_SOFTWARE',
    'POTENTIALLY_HARMFUL_APPLICATION',
    'THREAT_TYPE_UNSPECIFIED',
  ],
  platformTypes: ['ANY_PLATFORM', 'WINDOWS', 'LINUX', 'ANDROID', 'OSX', 'IOS'],
} as const;

export async function scanUrl(apiKey: string, url: string): Promise<ScanResult> {
  const requestBody = {
    client: {
      clientId: 'axiom',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: THREAT_CONFIG.threatTypes,
      platformTypes: THREAT_CONFIG.platformTypes,
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  };

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    const data = (await response.json().catch(() => ({}))) as SafeBrowsingResponse;
    const matches = data?.matches || [];

    return {
      scam: matches.length > 0,
      threats: matches.map(({ threatType, platformType, threatEntryType }) => ({
        type: threatType,
        platform: platformType,
        entryType: threatEntryType,
      })),
    };
  } catch {
    return { scam: false, threats: [] };
  }
}
