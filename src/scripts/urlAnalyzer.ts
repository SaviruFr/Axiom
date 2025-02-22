interface UrlAnalysis {
    suspicious: boolean;
    reasons: string[];
    score: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const LEGITIMATE_PATTERNS = [
    /^(?:.*\.)?(google|microsoft|apple|amazon|facebook|twitter|instagram|linkedin|youtube|netflix|spotify|discord|steam|twitch|reddit|pinterest|tiktok|snapchat|whatsapp|telegram|line|wechat)\.(?:com|org|net|co\.uk|co\.jp|de|fr|it|es|ca|com\.au|com\.br|co\.in)$/i,
    /^(?:.*\.)?(walmart|target|bestbuy|ebay|etsy|shopify|aliexpress|amazon|ikea|wayfair|homedepot|costco|nike|adidas|zara|hm|macys|nordstrom)\.(?:com|net|co\.uk|ca|com\.au)$/i,
    /^(?:.*\.)?(amazonaws|cloudfront|azure|cloudflare|akamai|fastly|heroku|digitalocean|googlecloud|ibm|oracle|salesforce|vmware)\.(?:com|net|io|cloud)$/i,
    /^(?:.*\.)?(github|gitlab|bitbucket|stackoverflow|npmjs|docker|kubernetes|terraform|jenkins|jfrog|sonarqube)\.(?:com|org|io)$/i,
    /^(?:.*\.)?(salesforce|zoom|slack|atlassian|office365|microsoft365|asana|trello|notion|hubspot|zendesk)\.(?:com|net)$/i,
    /^(?:.*\.)?(medium|wordpress|squarespace|wix|reuters|bloomberg|cnn|bbc|nytimes|wsj|forbes)\.(?:com|org|co\.uk|net)$/i,
    /^(?:.*\.)?(paypal|visa|mastercard|chase|bankofamerica|wellsfargo|americanexpress|citibank|stripe|square)\.(?:com|net)$/i,
    /\.(gov|edu|mil)$/i,
    /^(?:.*\.)?(gmail|outlook|yahoo|protonmail|tutanota)\.(?:com|net|org)$/i
];

const LEGITIMATE_TLDS = /\.(com|net|org|io|co|ai|app|dev|cloud|tech|shop|store|edu|gov|ltd|inc|company|solutions|agency)$/i;
const SUSPICIOUS_TLD = /\.(xyz|tk|ml|ga|cf|gq|pw|cc|buzz|link|click|party|science|review|top|bid|loan|work|racing|win|stream)$/i;

export function analyzeUrl(url: string): UrlAnalysis {
    let matchCount = 0;
    const reasons: string[] = [];

    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        
        if (LEGITIMATE_PATTERNS.some(pattern => pattern.test(domain))) {
            return {
                suspicious: false,
                reasons: ['Legitimate domain'],
                score: 0,
                riskLevel: 'low'
            };
        }

        if (SUSPICIOUS_TLD.test(domain)) {
            matchCount++;
            reasons.push('Suspicious TLD');
        }

        const subdomainCount = (domain.match(/\./g) || []).length;
        if (subdomainCount > 3) {
            matchCount++;
            reasons.push('Excessive subdomains');
        }

        if (/\d{4,}/.test(domain)) {
            matchCount++;
            reasons.push('Excessive numbers in domain');
        }

        if (/[a-z][0-9]|[0-9][a-z]/i.test(domain)) {
            matchCount++;
            reasons.push('Mixed alphanumeric patterns');
        }

        if (/[-_]/.test(domain)) {
            matchCount++;
            reasons.push('Contains special characters');
        }

        if (domain.length > 30) {
            matchCount++;
            reasons.push('Unusually long domain');
        }

        const score = matchCount > 0 ? (matchCount >= 6 ? 3 : 1) : 0;
        const riskLevel = score === 3 ? 'high' : score === 1 ? 'medium' : 'low';

        return {
            suspicious: score > 0,
            reasons: reasons.length ? reasons : ['No specific concerns'],
            score,
            riskLevel
        };

    } catch (error) {
        return {
            suspicious: true,
            reasons: ['Invalid URL format'],
            score: 3,
            riskLevel: 'critical'
        };
    }
}
