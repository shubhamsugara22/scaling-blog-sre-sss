export interface ReadingTimeResult {
  minutes: number;
  words: number;
  text: string; // e.g., "5 min read"
}

/**
 * Calculate reading time for blog post content
 * @param content - Raw markdown content
 * @returns Reading time result with minutes, word count, and formatted text
 */
export function calculateReadingTime(content: string): ReadingTimeResult {
  // Strip markdown syntax and HTML tags
  const plainText = stripMarkdownAndHtml(content);
  
  // Count words
  const words = countWords(plainText);
  
  // Calculate reading time (225 words per minute average)
  const minutes = Math.max(1, Math.round(words / 225));
  
  // Format output
  const text = `${minutes} min read`;
  
  return {
    minutes,
    words,
    text
  };
}

/**
 * Strip markdown syntax and HTML tags from content
 * @param content - Raw markdown content
 * @returns Plain text content
 */
function stripMarkdownAndHtml(content: string): string {
  let text = content;
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Remove markdown images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '$1');
  
  // Remove markdown links: [text](url)
  text = text.replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1');
  
  // Remove markdown headings: # ## ### etc
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // Remove markdown bold/italic: **text** or *text* or __text__ or _text_
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Remove markdown code blocks: ```code```
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code: `code`
  text = text.replace(/`([^`]*)`/g, '$1');
  
  // Remove markdown blockquotes: > text
  text = text.replace(/^>\s+/gm, '');
  
  // Remove markdown horizontal rules: --- or ***
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');
  
  // Remove markdown list markers: - or * or 1.
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');
  
  return text;
}

/**
 * Count words in plain text
 * @param text - Plain text content
 * @returns Word count
 */
function countWords(text: string): number {
  // Trim whitespace and split by whitespace
  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  return words.length;
}
