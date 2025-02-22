import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiResult {
  isMalicious: boolean;
  reason: string;
}

export async function analyzeWithGemini(url: string, apiKey: string): Promise<GeminiResult> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze the URL: ${url}
Perform a detailed analysis of its structure, domain, and context to minimize false positives. Check for subtle anomalies—such as slight misspellings, mismatches between the URL and the claimed domain, or unusual parameters—that may indicate phishing, scam, malware, suspicious behavior, or typosquatting. Only flag as malicious when solid evidence supports one of these specific risks.
Use ONLY these terms for REASON: phishing/scam/malware/suspicious/typosquatting
Reply EXACTLY in this format:
MALICIOUS: true/false
REASON: [one term from the list]`;

    const result = await model.generateContent(prompt);
    if (!result.response) return { isMalicious: false, reason: 'analysis-failed' };

    const response = await result.response.text();

    const maliciousMatch = response.match(/MALICIOUS:\s*(true|false)/i);
    const reasonMatch = response.match(/REASON:\s*(\w+)/i);

    if (!maliciousMatch || !reasonMatch) {
      return { isMalicious: false, reason: 'invalid-format' };
    }

    const reason = reasonMatch[1].toLowerCase();
    const isMalicious = ['phishing', 'scam', 'malware', 'typosquatting'].includes(reason);

    return { isMalicious, reason };
  } catch (error) {
    return { isMalicious: false, reason: 'error' };
  }
}
