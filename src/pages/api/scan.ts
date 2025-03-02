import type { APIRoute } from 'astro';
import type { ThreatSource, ThreatMatch } from '../../types/scan';
import { getDb, checkDomain } from '../../db/client';
import { formatUrl, formatThreatType } from '@scripts/formatters';
import { Gemini } from '@scripts/ai';
import { scanUrl } from '@scripts/scanner';

interface ScanRequest {
  url: string;
}

const createJsonResponse = (data: unknown, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || !('url' in body) || typeof body.url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid URL is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { url } = body as ScanRequest;

    const { GEMINI_API_KEY: geminiKey, API: safeBrowsingKey } = locals.runtime.env;
    if (!geminiKey || !safeBrowsingKey) {
      return createJsonResponse({ error: 'Missing API configuration' }, 500);
    }

    const formattedUrl = formatUrl(url);
    const domain = new URL(formattedUrl).hostname;
    const db = getDb({ locals });

    const [inDatabase, aiResult, safeBrowsingResult] = await Promise.all([
      checkDomain(db, domain),
      Gemini(formattedUrl, geminiKey),
      scanUrl(safeBrowsingKey, formattedUrl)
    ]);

    const threats: Array<{ source: ThreatSource; type: string }> = [];
    let finalScore = 0;
    let finalRiskLevel = 'Safe';

    if (inDatabase) {
      finalScore = 10;
      finalRiskLevel = 'High Risk';
      threats.push({
        source: 'Database' as const,
        type: formatThreatType('MALICIOUS_SITE')
      });
    }

    if (aiResult.isMalicious) {
      finalScore = Math.max(finalScore, 7);
      finalRiskLevel = finalScore >= 7 ? 'High Risk' : 'Medium Risk';
      threats.push({
        source: 'AI Analysis' as const,
        type: formatThreatType(aiResult.reason.toUpperCase())
      });
    }

    if (safeBrowsingResult.scam) {
      finalScore = 10;
      finalRiskLevel = 'High Risk';
      threats.push(...safeBrowsingResult.threats.map((threat: ThreatMatch) => ({
        source: 'Google Safe Browsing' as const,
        type: formatThreatType(threat.type)
      })));
    }

    return createJsonResponse({
      riskLevel: finalRiskLevel,
      detectedThreats: threats,
      score: finalScore,
      inDatabase,
      aiRating: aiResult.isMalicious ? 'Potentially Malicious' : 'Safe',
      safeBrowsing: safeBrowsingResult.scam ? 'Dangerous' : 'Safe'
    });
  } catch (error) {
    console.error('Scan failed:', error);
    return createJsonResponse({ error: 'Scan failed' }, 500);
  }
};
