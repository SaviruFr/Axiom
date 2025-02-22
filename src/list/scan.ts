export interface ThreatMatch {
  source: string;
  type: string;
}

export interface ScanResponse {
  scanResult: boolean;
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk';
  threatType: string | null;
  score: number;
  heuristicReasons: string[];
  detectedThreats: ThreatMatch[];
}
