import type { APIRoute } from 'astro';
import { scanUrl } from '@scripts/safeBrowsing';

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = "AIzaSyDyy43B-HaxvuwP8_IvYyNEdxKrVJF2U4w";
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const result = await scanUrl(apiKey, url);
    if (!result) {
      throw new Error('Scan failed - no result');
    }

    return new Response(JSON.stringify({
      scanResult: result.scam,
      threatType: result.threats?.[0]?.type || null,
      score: result.scam ? 10 : 0
    }), {
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
