export interface TocHeading {
  id: string;
  text: string;
  level: number; // 2 or 3 for H2/H3
}

/**
 * Extract headings from HTML content for table of contents
 * @param html - Processed HTML content
 * @returns Array of heading objects with id, text, and level
 */
export function extractHeadings(html: string): TocHeading[] {
  try {
    // Handle empty or invalid HTML
    if (!html || typeof html !== 'string') {
      console.warn('TOC extraction: Empty or invalid HTML provided');
      return [];
    }
    
    const headings: TocHeading[] = [];
    const usedIds = new Set<string>();
    
    // Match H2 and H3 tags with their content
    // This regex captures: <h2>content</h2> or <h2 id="...">content</h2>
    const headingRegex = /<h([23])(?:\s+id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
    
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      try {
        const level = parseInt(match[1], 10);
        const existingId = match[2];
        const htmlContent = match[3];
        
        // Strip HTML tags from heading content to get plain text
        const text = stripHtmlTags(htmlContent);
        
        // Skip empty headings
        if (!text.trim()) {
          console.warn('TOC extraction: Skipping empty heading');
          continue;
        }
        
        // Generate or use existing ID
        const baseId = existingId || generateId(text);
        const id = ensureUniqueId(baseId, usedIds);
        
        usedIds.add(id);
        
        headings.push({
          id,
          text,
          level
        });
      } catch (error) {
        console.error('Error processing heading:', error);
        // Continue processing other headings
        continue;
      }
    }
    
    return headings;
  } catch (error) {
    console.error('Error extracting headings:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Generate URL-safe ID from heading text
 * @param text - Heading text
 * @returns URL-safe identifier
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w-]+/g, '')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Fallback for empty strings
    || 'heading';
}

/**
 * Ensure ID is unique by adding numeric suffix if needed
 * @param baseId - Base identifier
 * @param usedIds - Set of already used identifiers
 * @returns Unique identifier
 */
function ensureUniqueId(baseId: string, usedIds: Set<string>): string {
  let id = baseId;
  let counter = 2;
  
  while (usedIds.has(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }
  
  return id;
}

/**
 * Strip HTML tags from content
 * @param html - HTML content
 * @returns Plain text content
 */
function stripHtmlTags(html: string): string {
  // Match actual HTML tags (opening, closing, and self-closing)
  // This regex matches tags that start with a letter (valid HTML tag names)
  // and handles attributes, closing tags, and self-closing tags
  return html
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .trim();
}
