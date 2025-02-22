export function formatThreatType(type: string): string {
  const formatMap: Record<string, string> = {
    'MALICIOUS_SITE': 'Malicious Website',
    'SOCIAL_ENGINEERING': 'Social Engineering Attack',
    'MALWARE': 'Malware Distribution',
    'UNWANTED_SOFTWARE': 'Unwanted Software',
    'POTENTIALLY_HARMFUL_APPLICATION': 'Harmful Application',
    'PHISHING': 'Phishing Attempt',
    'DECEPTIVE': 'Deceptive Content',
    'SCAM': 'Scam Website'
  };

  return formatMap[type] || 
    type.toLowerCase()
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}
