import type { ScanData, ThreatMappings } from '../types/scan';

export const ElementIds = {
  SafeBrowsing: 'safe-browsing',
  AiRating: 'ai-rating',
  RiskLevel: 'risk-level',
  RiskScore: 'risk-score',
  ThreatType: 'threat-type',
} as const;

type ElementIdType = keyof typeof ElementIds;

export function updateUI(data: ScanData, threatMappings: ThreatMappings): void {
  const elements = Object.fromEntries(
    Object.values(ElementIds).map((id) => [id, document.getElementById(id)])
  ) as Record<(typeof ElementIds)[ElementIdType], HTMLElement>;

  const threats = data.detectedThreats;
  const hasSafeBrowsing = threats.some((t) => t.source === 'Google Safe Browsing');
  const hasAI = threats.some((t) => t.source === 'AI Analysis');

  elements[ElementIds.SafeBrowsing]!.textContent = hasSafeBrowsing ? 'Dangerous' : 'Safe';
  elements[ElementIds.AiRating]!.textContent = hasAI ? 'Potentially Malicious' : 'Safe';
  elements[ElementIds.RiskLevel]!.textContent = data.riskLevel;
  elements[ElementIds.RiskScore]!.textContent = data.score.toString();

  const firstThreat = threats[0];
  elements[ElementIds.ThreatType]!.textContent = firstThreat
    ? firstThreat.source === 'AI Analysis'
      ? threatMappings[firstThreat.type.toLowerCase()] || firstThreat.type
      : firstThreat.type
    : 'No Threats';
}

export async function fetchScanResults(url: string, threatMappings: ThreatMappings): Promise<void> {
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    updateUI(
      response.ok
        ? await response.json()
        : { riskLevel: 'Scan Failed', detectedThreats: [], score: 0 },
      threatMappings
    );
  } catch {
    updateUI({ riskLevel: 'Scan Failed', detectedThreats: [], score: 0 }, threatMappings);
  }
}
