const PHISHING_URLS = [
  'https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-online.txt',
  'https://malware-filter.gitlab.io/malware-filter/phishing-filter.txt',
];

export async function fetchPhishingLists() {
  const domains = new Set<string>();

  for (const url of PHISHING_URLS) {
    try {
      const response = await fetch(url);
      const text = await response.text();

      const lines = text
        .trim()
        .split(/\r?\n/)
        .filter((line) => !line.startsWith('!'))
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      lines.forEach((line) => domains.add(line));
    } catch (error) {
      console.error(`Failed to fetch from ${url}:`, error);
    }
  }

  return Array.from(domains);
}
