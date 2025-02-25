import type { APIRoute } from 'astro';
import { getDb } from '../../db/client';
import { phishingDomains } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { formatUrl } from '../../scripts/urlFormatter';
import { Gemini } from '@scripts/geminiScanner';
import { scanUrl } from '@scripts/safeBrowsing';
import { formatThreatType } from '../../scripts/threatFormatter';

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formattedUrl = formatUrl(url);
    const domain = new URL(formattedUrl).hostname;

    console.log('Checking domain:', domain);
    console.log('Available runtime env:', Object.keys(locals.runtime.env));

    const db = getDb({ locals });
    const results = await db.select()
      .from(phishingDomains)
      .where(eq(phishingDomains.domain, domain));

    const inDatabase = results.length > 0;

    // Use Cloudflare environment variables
    const geminiKey = locals.runtime.env.GEMINI_API_KEY;
    console.log('GEMINI_API_KEY length:', geminiKey?.length); // Debug length without exposing key
    
    if (!geminiKey || typeof geminiKey !== 'string' || geminiKey.trim() === '') {
      throw new Error('Invalid or missing Gemini API key');
    }

    // Check if the key starts with expected format (usually 'AI')
    if (!geminiKey.startsWith('AI')) {
      console.warn('Gemini API key may be malformed - should start with AI');
    }

    const safeBrowsingKey = locals.runtime.env.API;
    if (!safeBrowsingKey) {
      throw new Error('Missing Safe Browsing API key');
    }

    const [aiResult, safeBrowsingResult] = await Promise.all([
      Gemini(formattedUrl, geminiKey.trim()),
      scanUrl(safeBrowsingKey, formattedUrl)
    ]);

    console.log('AI Analysis Result:', aiResult); // Debug log

    let finalScore = inDatabase ? 10 : 0;
    let finalRiskLevel = inDatabase ? 'High Risk' : 'Safe';
    const threats = [];

    if (inDatabase) {
      threats.push({
        source: 'Database',
        type: formatThreatType('MALICIOUS_SITE')
      });
    }

    if (aiResult.isMalicious || aiResult.reason !== 'error') {
      finalScore = Math.max(finalScore, 7); // Increased from 5 to 7
      finalRiskLevel = finalScore >= 7 ? 'High Risk' : 'Medium Risk';
      threats.push({
        source: 'AI Analysis',
        type: formatThreatType(aiResult.reason.toUpperCase())
      });
    }

    if (safeBrowsingResult.scam) {
      finalScore = 10;
      finalRiskLevel = 'High Risk';
      threats.push(...safeBrowsingResult.threats.map(t => ({
        source: 'Google Safe Browsing',
        type: formatThreatType(t.type)
      })));
    }

    return new Response(JSON.stringify({
      riskLevel: finalRiskLevel,
      detectedThreats: threats,
      score: finalScore,
      inDatabase,
      aiRating: aiResult.isMalicious ? 'Potentially Malicious' : 'Safe',
      safeBrowsing: safeBrowsingResult.scam ? 'Dangerous' : 'Safe'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scan error:', error);
    return new Response(JSON.stringify({ error: 'Scan failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
