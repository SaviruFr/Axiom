export function formatUrl(url: string): string {
  if (!url) return '';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}
