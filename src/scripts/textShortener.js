const defaultMaxLength = 15;
const defaultEllipsis = "...";

export function truncateText(text, options = {}) {
  const { maxLength = defaultMaxLength, ellipsis = defaultEllipsis } = options;
  if (!text) {
    return text;
  }
    text = text.replace(/^https?:\/\//, "");

  return text.length > maxLength ? text.substring(0, maxLength - ellipsis.length) + ellipsis : text;
}
