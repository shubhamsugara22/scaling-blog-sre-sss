import { describe, it, expect } from 'vitest';
import { extractHeadings } from '../toc';

describe('extractHeadings', () => {
  it('should extract H2 and H3 headings from HTML', () => {
    const html = `
      <h1>Main Title</h1>
      <h2>Introduction</h2>
      <p>Some content</p>
      <h3>Subsection</h3>
      <h2>Conclusion</h2>
    `;
    
    const headings = extractHeadings(html);
    
    expect(headings).toHaveLength(3);
    expect(headings[0]).toEqual({
      id: 'introduction',
      text: 'Introduction',
      level: 2
    });
    expect(headings[1]).toEqual({
      id: 'subsection',
      text: 'Subsection',
      level: 3
    });
    expect(headings[2]).toEqual({
      id: 'conclusion',
      text: 'Conclusion',
      level: 2
    });
  });

  it('should handle duplicate heading text with numeric suffixes', () => {
    const html = `
      <h2>Setup</h2>
      <h2>Setup</h2>
      <h2>Setup</h2>
    `;
    
    const headings = extractHeadings(html);
    
    expect(headings).toHaveLength(3);
    expect(headings[0].id).toBe('setup');
    expect(headings[1].id).toBe('setup-2');
    expect(headings[2].id).toBe('setup-3');
  });

  it('should generate URL-safe IDs from heading text', () => {
    const html = `
      <h2>Hello World!</h2>
      <h2>Getting Started: A Guide</h2>
      <h2>What's Next?</h2>
      <h3>Step 1: Installation</h3>
    `;
    
    const headings = extractHeadings(html);
    
    expect(headings[0].id).toBe('hello-world');
    expect(headings[1].id).toBe('getting-started-a-guide');
    expect(headings[2].id).toBe('whats-next');
    expect(headings[3].id).toBe('step-1-installation');
  });

  it('should strip HTML tags from heading content', () => {
    const html = `
      <h2>Code with <code>inline</code> tags</h2>
      <h3>Link with <a href="#">anchor</a> text</h3>
    `;
    
    const headings = extractHeadings(html);
    
    expect(headings[0].text).toBe('Code with inline tags');
    expect(headings[1].text).toBe('Link with anchor text');
  });

  it('should return empty array when no H2/H3 headings exist', () => {
    const html = `
      <h1>Only H1</h1>
      <p>Some content</p>
      <h4>Only H4</h4>
    `;
    
    const headings = extractHeadings(html);
    
    expect(headings).toHaveLength(0);
  });

  it('should preserve existing IDs if present', () => {
    const html = `
      <h2 id="custom-id">Custom Heading</h2>
      <h3 id="another-custom">Another One</h3>
    `;
    
    const headings = extractHeadings(html);
    
    expect(headings[0].id).toBe('custom-id');
    expect(headings[1].id).toBe('another-custom');
  });

  it('should handle headings with special characters', () => {
    const html = `
      <h2>C++ Programming</h2>
      <h2>Node.js & Express</h2>
      <h3>@mentions and #hashtags</h3>
    `;
    
    const headings = extractHeadings(html);
    
    expect(headings[0].id).toBe('c-programming');
    expect(headings[1].id).toBe('nodejs-express');
    expect(headings[2].id).toBe('mentions-and-hashtags');
  });

  it('should handle empty or whitespace-only headings', () => {
    const html = `
      <h2>   </h2>
      <h2></h2>
    `;
    
    const headings = extractHeadings(html);
    
    // Empty headings should be skipped (error handling behavior)
    expect(headings).toHaveLength(0);
  });
});
