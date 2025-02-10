const defaultMaxLength = 15;
const defaultEllipsis = "...";
const defaultLowerCase = true;

export function truncateText(text, options = {}) {
  const { 
    maxLength = defaultMaxLength, 
    ellipsis = defaultEllipsis,
    toLowerCase = defaultLowerCase 
  } = options;

  if (!text) {
    return text;
  }

  // Remove http:// or https:// from start
  text = text.replace(/^https?:\/\//, "");
  
  // Convert to lowercase if option is enabled
  text = toLowerCase ? text.toLowerCase() : text;

  return text.length > maxLength 
    ? text.substring(0, maxLength - ellipsis.length) + ellipsis 
    : text;
}
