import type { APIRoute, APIContext } from 'astro';
import { scanUrl } from '@scripts/safeBrowsing';
import { analyzeWithGemini } from '@scripts/geminiScanner';
import type { ScanResponse, ThreatMatch } from '@/list/scan';

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  try {
    const { url } = await request.json();

    const runtime = locals.runtime;
    if (!runtime?.env) {
      throw new Error('Runtime environment not available');
    }

    const safeBrowsingKey = runtime.env.API;
    const geminiKey = runtime.env.GEMINI_API_KEY;

    if (!safeBrowsingKey || !geminiKey) {
      throw new Error(
        `API keys not configured (Safe Browsing: ${!!safeBrowsingKey}, Gemini: ${!!geminiKey})`
      );
    }

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [safeBrowsingResult, geminiResult] = await Promise.all([
      scanUrl(safeBrowsingKey, url),
      analyzeWithGemini(url, geminiKey),
    ]);

    let finalScore = 0;
    let finalRiskLevel: ScanResponse['riskLevel'] = 'Safe';
    const detectedThreats: ThreatMatch[] = [];

    if (safeBrowsingResult.scam) {
      finalScore = 10;
      finalRiskLevel = 'High Risk';
      detectedThreats.push(
        ...safeBrowsingResult.threats.map((t) => ({
          source: 'Google Safe Browsing' as const,
          type: t.type,
        }))
      );
    }

    if (geminiResult.isMalicious) {
      finalScore = Math.max(finalScore, 5);
      finalRiskLevel = finalScore === 10 ? 'High Risk' : 'Medium Risk';
      detectedThreats.push({
        source: 'AI Analysis' as const,
        type: geminiResult.reason,
      });
    }

    const response: ScanResponse = {
      scanResult: finalScore > 0,
      riskLevel: finalRiskLevel,
      threatType: detectedThreats[0]?.type || null,
      score: finalScore,
      detectedThreats,
      timestamp: new Date().toISOString(),
      scanId: crypto.randomUUID(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Scan failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
