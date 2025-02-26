const PHISHING_URLS = [
  'https://malware-filter.gitlab.io/malware-filter/phishing-filter.txt',
  'https://malware-filter.gitlab.io/malware-filter/urlhaus-filter.txt',
  'https://malware-filter.gitlab.io/malware-filter/vn-badsite-filter.txt',
];

function isValidTarget(target: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(target)) {
    const parts = target.split('.');
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(target);
}

function extractTarget(line: string): string | null {
  try {
    line = line.trim();
    if (!line || line.startsWith('!') || line.startsWith('#')) {
      return null;
    }
    if (line.includes('://')) {
      try {
        const url = new URL(line);
        return url.hostname;
      } catch {}
    }

    line = line.split('/')[0];

    line = line.split(':')[0];

    return isValidTarget(line) ? line.toLowerCase() : null;
  } catch {
    return null;
  }
}

export const fetchPhishingLists = async (
  progressCallback?: (status: string, details?: any) => void
) => {
  const targets = new Set<string>();
  let totalProcessed = 0;
  let currentUrlIndex = 0;

  for (const url of PHISHING_URLS) {
    currentUrlIndex++;
    try {
      progressCallback?.(`Fetching source ${currentUrlIndex}/${PHISHING_URLS.length}...`, {
        currentSource: currentUrlIndex,
        totalSources: PHISHING_URLS.length,
        url,
      });

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await response.text();
      const lines = text.split(/\r?\n/);

      for (const line of lines) {
        const target = extractTarget(line);
        if (target) {
          targets.add(target);
          totalProcessed++;

          if (totalProcessed % 1000 === 0) {
            progressCallback?.(`Source ${currentUrlIndex}: Found ${targets.size} unique targets`, {
              currentSource: currentUrlIndex,
              totalSources: PHISHING_URLS.length,
              processedLines: totalProcessed,
              uniqueTargets: targets.size,
            });
          }
        }
      }

      progressCallback?.(`✓ Source ${currentUrlIndex} complete: ${targets.size} unique targets`, {
        currentSource: currentUrlIndex,
        totalSources: PHISHING_URLS.length,
        uniqueTargets: targets.size,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`Source ${currentUrlIndex} failed:`, {
        message: err.message,
        stack: err.stack,
      });

      progressCallback?.(`⚠ Source ${currentUrlIndex} failed: ${err.message}`, {
        currentSource: currentUrlIndex,
        totalSources: PHISHING_URLS.length,
        error: true,
        errorDetails: err.message,
      });
    }
  }

  return Array.from(targets);
};
