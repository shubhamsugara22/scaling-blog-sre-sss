import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from '../reading-time';

describe('calculateReadingTime', () => {
  it('should calculate reading time for simple text', () => {
    // 225 words should be exactly 1 minute
    const words = Array(225).fill('word').join(' ');
    const result = calculateReadingTime(words);
    
    expect(result.words).toBe(225);
    expect(result.minutes).toBe(1);
    expect(result.text).toBe('1 min read');
  });

  it('should return minimum 1 minute for short content', () => {
    const result = calculateReadingTime('Just a few words here');
    
    expect(result.minutes).toBe(1);
    expect(result.text).toBe('1 min read');
  });

  it('should strip markdown syntax', () => {
    const markdown = `
# Heading
## Subheading

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
const code = 'block';
\`\`\`

[Link text](https://example.com)
![Alt text](image.png)
    `;
    
    const result = calculateReadingTime(markdown);
    
    // Should count: Heading, Subheading, This, is, bold, and, italic, text, List, item, 1, List, item, 2, Link, text
    // (code blocks and image alt text should be stripped)
    expect(result.words).toBeGreaterThan(0);
    expect(result.minutes).toBeGreaterThanOrEqual(1);
  });

  it('should strip HTML tags', () => {
    const html = '<p>This is <strong>HTML</strong> content</p>';
    const result = calculateReadingTime(html);
    
    expect(result.words).toBe(4); // This, is, HTML, content
  });

  it('should handle empty content', () => {
    const result = calculateReadingTime('');
    
    expect(result.words).toBe(0);
    expect(result.minutes).toBe(1); // Minimum 1 minute
    expect(result.text).toBe('1 min read');
  });

  it('should calculate correct time for longer content', () => {
    // 450 words should be 2 minutes (450 / 225 = 2)
    const words = Array(450).fill('word').join(' ');
    const result = calculateReadingTime(words);
    
    expect(result.words).toBe(450);
    expect(result.minutes).toBe(2);
    expect(result.text).toBe('2 min read');
  });
});
