interface TextFormatterOptions {
  readonly maxLength?: number;
  readonly ellipsis?: string;
  readonly toLowerCase?: boolean;
}

const FORMAT_MAP = {
  MALICIOUS_SITE: 'Malicious Website',
  SOCIAL_ENGINEERING: 'Social Engineering Attack',
  MALWARE: 'Malware Distribution',
  UNWANTED_SOFTWARE: 'Unwanted Software',
  POTENTIALLY_HARMFUL_APPLICATION: 'Harmful Application',
  PHISHING: 'Phishing Attempt',
  DECEPTIVE: 'Deceptive Content',
  SCAM: 'Scam Website',
} as const;

export const formatUrl = (url: string): string =>
  url ? (!/^https?:\/\//.test(url) ? `https://${url}` : url) : '';

export function formatThreatType<T extends string>(type: T): string {
  return (FORMAT_MAP[type as keyof typeof FORMAT_MAP] ??
    type
      .toLowerCase()
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')) as string;
}

export const truncateText = (
  text: string,
  { maxLength = 15, ellipsis = '...', toLowerCase = true } = {}
): string => {
  if (!text) return text;
  text = text.replace(/^https?:\/\//, '');
  text = toLowerCase ? text.toLowerCase() : text;
  return text.length > maxLength ? text.slice(0, maxLength - ellipsis.length) + ellipsis : text;
};
