import type { APIRoute, APIContext } from 'astro';
import { scanUrl } from '@scripts/safeBrowsing';
import { analyzeUrl } from '@scripts/urlAnalyzer';
import type { ScanResponse, ThreatMatch } from '@/list/scan';

export const POST: APIRoute = async (context: APIContext): Promise<Response> => {
  const { request } = context;
  
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { url } = body as { url: string };
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey: string = context.locals.runtime.env.API;

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const [safeBrowsingResult, heuristicResult] = await Promise.all([
      scanUrl(apiKey, url),
      Promise.resolve(analyzeUrl(url))
    ]);

    let finalScore: number;
    let finalRiskLevel: ScanResponse['riskLevel'];

    if (safeBrowsingResult.scam) {
      finalScore = 10;
      finalRiskLevel = 'High Risk';
    } else if (heuristicResult.score > 0) {
      finalScore = heuristicResult.score;
      finalRiskLevel = 'Low Risk';
    } else {
      // Nothing detected
      finalScore = 0;
      finalRiskLevel = 'Safe';
    }

    // Combine threat detections
    const detectedThreats: ThreatMatch[] = [];
    
    if (safeBrowsingResult.threats?.length > 0) {
      detectedThreats.push(...safeBrowsingResult.threats.map(t => ({
        source: 'Google Safe Browsing',
        type: t.type
      })));
    } else if (heuristicResult.score > 0) {
      detectedThreats.push({
        source: 'Pattern Analysis',
        type: heuristicResult.reasons.join(', ')
      });
    }

    const response: ScanResponse = {
      scanResult: finalScore > 0,
      riskLevel: finalRiskLevel,
      threatType: safeBrowsingResult.threats?.[0]?.type || null,
      score: finalScore,
      heuristicReasons: heuristicResult.reasons,
      detectedThreats
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Scan failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
