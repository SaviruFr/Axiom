import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiResult {
  isMalicious: boolean;
  reason: string;
}

export async function Gemini(url: string, apiKey: string): Promise<GeminiResult> {
  try {
    // Validate API key
    if (!apiKey || apiKey.length < 30) {
      console.error('Invalid API key format:', { length: apiKey?.length });
      return { isMalicious: false, reason: 'invalid-key' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0,
        topK: 1,
        topP: 1,
      },
    });

    const prompt = `Security analysis for URL: ${url}
Rules:
1. Check for phishing patterns
2. Look for typosquatting
3. Check domain reputation
4. Identify scam patterns
5. Check for malware indicators

Output format (EXACTLY):
MALICIOUS: true/false
REASON: phishing/scam/malware/suspicious/typosquatting`;

    const result = await model.generateContent(prompt);
    
    // Updated response logging without status
    console.log('Gemini response:', {
      response: result.response?.text(),
      hasResponse: !!result.response
    });

    if (!result.response) {
      return { isMalicious: false, reason: 'no-response' };
    }

    const response = await result.response.text();
    const maliciousMatch = response.match(/MALICIOUS:\s*(true|false)/i);
    const reasonMatch = response.match(/REASON:\s*(\w+)/i);

    if (!maliciousMatch || !reasonMatch) {
      console.error('Failed to parse Gemini response:', response);
      return { isMalicious: false, reason: 'parse-error' };
    }

    const isMalicious = maliciousMatch[1].toLowerCase() === 'true';
    const reason = reasonMatch[1].toLowerCase();

    // Log the parsed result
    console.log('Parsed Gemini result:', { isMalicious, reason });

    return { 
      isMalicious, 
      reason: ['phishing', 'scam', 'malware', 'suspicious', 'typosquatting'].includes(reason) 
        ? reason 
        : 'suspicious'
    };
  } catch (error: any) { // Type as any for error handling
    console.error('Gemini error:', {
      message: error?.message,
      name: error?.name,
      details: error?.toString()
    });
    return { isMalicious: false, reason: 'error' };
  }
}
