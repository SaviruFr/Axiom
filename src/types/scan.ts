export type ValidReason = 'phishing' | 'scam' | 'malware' | 'suspicious' | 'typosquatting';
export type ThreatType = 'MALWARE' | 'SOCIAL_ENGINEERING' | 'UNWANTED_SOFTWARE' | 'POTENTIALLY_HARMFUL_APPLICATION' | 'THREAT_TYPE_UNSPECIFIED';
export type ThreatSource = 'Google Safe Browsing' | 'AI Analysis' | 'Database';
export type PlatformType = 'ANY_PLATFORM' | 'WINDOWS' | 'LINUX' | 'ANDROID' | 'OSX' | 'IOS';

export interface GeminiResult {
  isMalicious: boolean;
  reason: ValidReason | 'error';
}

export interface ScanResult {
  scam: boolean;
  threats: Array<{
    type: ThreatType;
    platform: PlatformType;
    entryType: 'URL';
  }>;
}

export interface Threat {
  source: ThreatSource;
  type: string;
}

export interface ThreatMatch {
  type: ThreatType;
  platform: PlatformType;
  entryType: 'URL';
}

export interface ScanData {
  riskLevel: string;
  detectedThreats: Array<{
    source: ThreatSource;
    type: string;
  }>;
  score: number;
}

export type ThreatMappings = Readonly<Record<string, string>>;
