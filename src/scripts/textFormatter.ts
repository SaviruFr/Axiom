interface TextFormatterOptions {
  maxLength?: number;
  ellipsis?: string;
  toLowerCase?: boolean;
}

const defaultMaxLength = 15;
const defaultEllipsis = '...';
const defaultLowerCase = true;

export function truncateText(text: string, options: TextFormatterOptions = {}): string {
  const {
    maxLength = defaultMaxLength,
    ellipsis = defaultEllipsis,
    toLowerCase = defaultLowerCase,
  } = options;

  if (!text) {
    return text;
  }

  text = text.replace(/^https?:\/\//, '');

  text = toLowerCase ? text.toLowerCase() : text;

  return text.length > maxLength ? text.substring(0, maxLength - ellipsis.length) + ellipsis : text;
}
