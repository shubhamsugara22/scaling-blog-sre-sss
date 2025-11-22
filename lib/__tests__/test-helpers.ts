/**
 * Test helper utilities for blog enhancement tests
 */

/**
 * Generate sample markdown content for testing
 */
export function generateMarkdownContent(options: {
  headings?: { level: number; text: string }[];
  wordCount?: number;
  codeBlocks?: { language: string; code: string }[];
  images?: { src: string; alt: string }[];
}): string {
  const { headings = [], wordCount = 100, codeBlocks = [], images = [] } = options;

  let content = '';

  // Add headings
  headings.forEach((heading) => {
    const hashes = '#'.repeat(heading.level);
    content += `${hashes} ${heading.text}\n\n`;
  });

  // Add body text with specified word count
  const words = Array(wordCount).fill('word').join(' ');
  content += `${words}\n\n`;

  // Add code blocks
  codeBlocks.forEach((block) => {
    content += `\`\`\`${block.language}\n${block.code}\n\`\`\`\n\n`;
  });

  // Add images
  images.forEach((image) => {
    content += `![${image.alt}](${image.src})\n\n`;
  });

  return content.trim();
}

/**
 * Generate sample HTML content for testing
 */
export function generateHtmlContent(options: {
  headings?: { level: number; text: string; id?: string }[];
  paragraphs?: number;
  codeBlocks?: { language: string; code: string }[];
}): string {
  const { headings = [], paragraphs = 1, codeBlocks = [] } = options;

  let html = '';

  // Add headings
  headings.forEach((heading) => {
    const id = heading.id || heading.text.toLowerCase().replace(/\s+/g, '-');
    html += `<h${heading.level} id="${id}">${heading.text}</h${heading.level}>\n`;
  });

  // Add paragraphs
  for (let i = 0; i < paragraphs; i++) {
    html += '<p>This is a test paragraph with some content.</p>\n';
  }

  // Add code blocks
  codeBlocks.forEach((block) => {
    html += `<pre><code class="language-${block.language}">${block.code}</code></pre>\n`;
  });

  return html;
}

/**
 * Strip HTML tags from content (simple implementation for testing)
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
