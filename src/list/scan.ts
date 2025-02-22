export type RiskLevel = 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk';

export interface ThreatMatch {
  source: 'Google Safe Browsing' | 'AI Analysis' | 'Pattern Analysis';
  type: string;
}

export interface ScanResponse {
  scanResult: boolean;
  riskLevel: RiskLevel;
  threatType: string | null;
  score: number;
  detectedThreats: ThreatMatch[];
  timestamp: string;
  scanId?: string;
  heuristicReasons?: string[];
}
