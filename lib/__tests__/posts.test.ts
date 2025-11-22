import { describe, it, expect } from 'vitest';
import { getPost } from '../posts';

describe('Enhanced Markdown Processing Pipeline', () => {
  it('should return enhanced post data with reading time and headings', async () => {
    // Test with an actual blog post
    const post = await getPost('introducing-the-blog', 'blog');
    
    // Verify meta includes reading time
    expect(post.meta).toBeDefined();
    expect(post.meta.readingTime).toBeDefined();
    expect(post.meta.readingTime?.minutes).toBeGreaterThan(0);
    expect(post.meta.readingTime?.text).toMatch(/\d+ min read/);
    
    // Verify contentHtml is generated
    expect(post.contentHtml).toBeDefined();
    expect(post.contentHtml.length).toBeGreaterThan(0);
    
    // Verify headings are extracted
    expect(post.headings).toBeDefined();
    expect(Array.isArray(post.headings)).toBe(true);
  });
  
  it('should add IDs to headings in HTML output', async () => {
    const post = await getPost('introducing-the-blog', 'blog');
    
    // Check that headings have IDs (from rehype-slug)
    const hasHeadingWithId = /<h[23]\s+id="[^"]+">/.test(post.contentHtml);
    expect(hasHeadingWithId).toBe(true);
  });
  
  it('should add anchor links to headings', async () => {
    const post = await getPost('introducing-the-blog', 'blog');
    
    // Check that headings have anchor links (from rehype-autolink-headings)
    const hasAnchorLink = /<a[^>]*class="[^"]*anchor-link[^"]*"/.test(post.contentHtml);
    expect(hasAnchorLink).toBe(true);
  });
  
  it('should extract headings with correct structure', async () => {
    const post = await getPost('introducing-the-blog', 'blog');
    
    // Verify heading structure
    post.headings.forEach(heading => {
      expect(heading.id).toBeDefined();
      expect(heading.text).toBeDefined();
      expect(heading.level).toBeGreaterThanOrEqual(2);
      expect(heading.level).toBeLessThanOrEqual(3);
    });
  });
});
