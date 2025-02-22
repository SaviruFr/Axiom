interface ScanData {
  riskLevel: string;
  detectedThreats: Array<{
    source: string;
    type: string;
  }>;
  score: number;
}

interface ThreatMappings {
  [key: string]: string;
}

export function updateUI(data: ScanData, threatMappings: ThreatMappings): void {
  const updateElement = (id: string, value: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const hasSafeBrowsingThreat = data.detectedThreats.some(
    (t) => t.source === 'Google Safe Browsing'
  );
  updateElement('safe-browsing', hasSafeBrowsingThreat ? 'Dangerous' : 'Safe');

  const hasAIThreat = data.detectedThreats.some((t) => t.source === 'AI Analysis');
  updateElement('ai-rating', hasAIThreat ? 'Potentially Malicious' : 'Safe');

  updateElement('risk-level', data.riskLevel);
  updateElement('risk-score', data.score.toString());

  const firstThreat = data.detectedThreats[0];
  if (firstThreat) {
    const threatText =
      firstThreat.source === 'AI Analysis'
        ? threatMappings[firstThreat.type.toLowerCase()] || firstThreat.type
        : firstThreat.type;
    updateElement('threat-type', threatText);
  } else {
    updateElement('threat-type', 'No Threats');
  }
}

export async function fetchScanResults(url: string, threatMappings: ThreatMappings): Promise<void> {
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error('Scan failed');
    const data: ScanData = await response.json();
    updateUI(data, threatMappings);
  } catch (error) {
    const elements = ['risk-level', 'safe-browsing', 'ai-rating', 'threat-type'];
    elements.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = 'Scan Failed';
    });
  }
}
