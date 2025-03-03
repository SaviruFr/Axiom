import { GoogleGenerativeAI } from '@google/generative-ai';

const VALID_REASONS: ReadonlySet<ValidReason> = new Set([
  'phishing',
  'scam',
  'malware',
  'suspicious',
  'typosquatting',
]);

function isValidReason(reason: string): reason is ValidReason {
  return VALID_REASONS.has(reason as ValidReason);
}

export async function Gemini(url: string, apiKey: string): Promise<GeminiResult> {
  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0, topK: 1, topP: 1 },
    });

    const response = await model
      .generateContent(
        `Analyze ONLY the URL string ${url} for immediate threats:

1. Typosquatting

- Compare to top 100 brands (Amazon, PayPal, etc.)

- Flag:

  • Character swaps/duplicates (e.g., "paypall-login.com")
  • Missing letters (e.g., "bnkofamerica.com")
  • Wrong TLDs (e.g., "netflix.security" vs official ".com")  

2. Malware Patterns

- Detect in path/parameters:

  • Executable extensions (.exe, .scr, .jar)
  • Obfuscation (?ref=base64 or %-encoding)
  • "download.php?id=" patterns

3. Phishing Signs

- Check for:  

  • Brand names in subdomains (e.g., "apple.verify-service.com")
  • "@" symbol redirects (user@real.com@phish.com)
  • HTTPS mismatch (HTTP URL with "/secure-login")

4. Scam Indicators

- Suspicious keywords in path:

  • "verify", "account", "claim", "reward"
  • Unusual TLDs ( .top, .biz) with generic names

Decision Logic:

MALICIOUS = true if ANY rule above triggers

Output EXACTLY:

MALICIOUS: true/false

REASON: [phishing/scam/malware/typosquatting] (first matched category)`
      )
      .then((result) => result.response?.text() ?? '');

    const [, isMalicious = 'false', reason = 'suspicious'] =
      response.match(/MALICIOUS:\s*(true|false).*REASON:\s*(\w+)/i) || [];
    const normalizedReason = reason.toLowerCase();

    return {
      isMalicious: isMalicious.toLowerCase() === 'true',
      reason: isValidReason(normalizedReason) ? normalizedReason : 'suspicious',
    };
  } catch {
    return { isMalicious: false, reason: 'error' };
  }
}
