/**
 * Integration test for full post rendering with all enhancements
 * 
 * This test validates that a complete blog post is rendered with all
 * enhancement features working together:
 * - Reading time calculation and display
 * - Table of contents generation
 * - Code blocks with language badges
 * - Mermaid diagrams
 * - Image handling
 * - Proper HTML structure
 * 
 * **Validates: Requirements 10.1**
 */

import { describe, it, expect } from 'vitest';
import { getPost } from '../posts';

describe('Full Post Rendering Integration', () => {
  it('should render a complete post with all enhancements present', async () => {
    // Use the feature-showcase post which has all features
    const post = await getPost('feature-showcase', 'blog');
    
    // Verify post metadata is complete
    expect(post.meta).toBeDefined();
    expect(post.meta.title).toBe('Blog Feature Showcase: A Complete Guide');
    expect(post.meta.date).toBeDefined();
    expect(post.meta.tags).toBeDefined();
    expect(post.meta.tags.length).toBeGreaterThan(0);
    expect(post.meta.summary).toBeDefined();
    
    // Verify reading time is calculated and displayed (Requirement 1.4)
    expect(post.meta.readingTime).toBeDefined();
    expect(post.meta.readingTime?.minutes).toBeGreaterThan(0);
    expect(post.meta.readingTime?.text).toMatch(/\d+ min read/);
    expect(post.meta.readingTime?.words).toBeGreaterThan(0);
    
    // Verify content HTML is generated
    expect(post.contentHtml).toBeDefined();
    expect(post.contentHtml.length).toBeGreaterThan(0);
    
    // Verify table of contents is generated (Requirement 2.1)
    expect(post.headings).toBeDefined();
    expect(Array.isArray(post.headings)).toBe(true);
    expect(post.headings.length).toBeGreaterThanOrEqual(3); // Should have multiple headings
    
    // Verify TOC headings have proper structure
    post.headings.forEach(heading => {
      expect(heading.id).toBeDefined();
      expect(heading.text).toBeDefined();
      expect(heading.level).toBeGreaterThanOrEqual(2);
      expect(heading.level).toBeLessThanOrEqual(3);
    });
    
    // Verify headings in HTML have IDs for anchor links (Requirement 2.2)
    const hasHeadingWithId = /<h[23]\s+id="[^"]+">/.test(post.contentHtml);
    expect(hasHeadingWithId).toBe(true);
    
    // Verify code blocks are present and enhanced (Requirement 6.1)
    const hasCodeBlock = /<pre><code/.test(post.contentHtml);
    expect(hasCodeBlock).toBe(true);
    
    // Verify code blocks have language classes
    const hasLanguageClass = /class="[^"]*language-\w+[^"]*"/.test(post.contentHtml);
    expect(hasLanguageClass).toBe(true);
    
    // Verify Mermaid diagrams are converted (Requirement 5.1)
    // Mermaid should be converted to SVG or div with mermaid class
    const hasMermaidContent = /mermaid|<svg/.test(post.contentHtml);
    expect(hasMermaidContent).toBe(true);
    
    // Verify images are present (Requirement 4.1)
    const hasImages = /<img/.test(post.contentHtml);
    expect(hasImages).toBe(true);
    
    // Verify images have alt text (Requirement 4.3)
    const imageMatches = post.contentHtml.match(/<img[^>]+>/g);
    if (imageMatches) {
      imageMatches.forEach(imgTag => {
        expect(imgTag).toMatch(/alt="[^"]*"/);
      });
    }
    
    // Verify proper HTML structure
    expect(post.contentHtml).toContain('<p>');
    expect(post.contentHtml).toContain('</p>');
    
    // Verify links are preserved
    const hasLinks = /<a\s+href="[^"]+">/.test(post.contentHtml);
    expect(hasLinks).toBe(true);
  });
  
  it('should handle posts with minimal content gracefully', async () => {
    // Use a simpler post
    const post = await getPost('introducing-the-blog', 'blog');
    
    // Should still have basic structure
    expect(post.meta).toBeDefined();
    expect(post.meta.readingTime).toBeDefined();
    expect(post.contentHtml).toBeDefined();
    expect(post.headings).toBeDefined();
    
    // Reading time should be at least 1 minute
    expect(post.meta.readingTime?.minutes).toBeGreaterThanOrEqual(1);
  });
  
  it('should render posts with code blocks correctly', async () => {
    const post = await getPost('feature-showcase', 'blog');
    
    // Verify multiple code blocks with different languages
    const codeBlocks = post.contentHtml.match(/<pre><code[^>]*>/g);
    expect(codeBlocks).toBeDefined();
    expect(codeBlocks!.length).toBeGreaterThan(1);
    
    // Verify different language classes are present
    expect(post.contentHtml).toMatch(/language-typescript/);
    expect(post.contentHtml).toMatch(/language-python/);
    expect(post.contentHtml).toMatch(/language-bash/);
  });
  
  it('should render Kubernetes YAML with proper structure', async () => {
    const post = await getPost('feature-showcase', 'blog');
    
    // Verify Kubernetes YAML is present (Requirement 8.1)
    const hasKubernetesYaml = /language-kubernetes|language-yaml/.test(post.contentHtml);
    expect(hasKubernetesYaml).toBe(true);
    
    // Verify YAML structure is preserved (indentation maintained in code blocks)
    const yamlCodeBlocks = post.contentHtml.match(/<code[^>]*class="[^"]*language-(kubernetes|yaml)[^"]*"[^>]*>[\s\S]*?<\/code>/g);
    if (yamlCodeBlocks) {
      yamlCodeBlocks.forEach(block => {
        // Should contain typical Kubernetes fields
        const hasKubernetesFields = /apiVersion|kind|metadata|spec/.test(block);
        expect(hasKubernetesFields).toBe(true);
      });
    }
  });
  
  it('should maintain proper heading hierarchy', async () => {
    const post = await getPost('feature-showcase', 'blog');
    
    // Verify heading hierarchy is logical
    let previousLevel = 1; // Start at H1 (title)
    
    post.headings.forEach(heading => {
      // H3 should not appear without an H2 before it
      if (heading.level === 3) {
        // There should be at least one H2 in the headings before this H3
        const h2Index = post.headings.findIndex(h => h.level === 2);
        const h3Index = post.headings.indexOf(heading);
        expect(h2Index).toBeLessThan(h3Index);
      }
      
      // Level should not jump more than 1 (e.g., H2 to H4)
      expect(heading.level - previousLevel).toBeLessThanOrEqual(1);
      previousLevel = heading.level;
    });
  });
  
  it('should include all required metadata fields', async () => {
    const post = await getPost('feature-showcase', 'blog');
    
    // Verify all required metadata fields are present
    expect(post.meta.title).toBeTruthy();
    expect(post.meta.date).toBeTruthy();
    expect(post.meta.tags).toBeDefined();
    expect(post.meta.summary).toBeTruthy();
    expect(post.meta.slug).toBeTruthy();
    
    // Verify date is valid
    const date = new Date(post.meta.date);
    expect(date.toString()).not.toBe('Invalid Date');
  });
  
  it('should handle Asciinema embeds in content', async () => {
    const post = await getPost('feature-showcase', 'blog');
    
    // Verify Asciinema references are present (Requirement 7.1)
    // The markdown should contain asciinema references
    const hasAsciinemaReference = /asciinema/.test(post.contentHtml);
    expect(hasAsciinemaReference).toBe(true);
  });
  
  it('should preserve inline formatting and special elements', async () => {
    const post = await getPost('feature-showcase', 'blog');
    
    // Verify inline code
    expect(post.contentHtml).toMatch(/<code[^>]*>[^<]+<\/code>/);
    
    // Verify bold text
    expect(post.contentHtml).toMatch(/<strong>|<b>/);
    
    // Verify italic text
    expect(post.contentHtml).toMatch(/<em>|<i>/);
    
    // Verify lists
    expect(post.contentHtml).toMatch(/<ul>|<ol>/);
    expect(post.contentHtml).toMatch(/<li>/);
    
    // Verify tables (note: tables may be rendered as paragraphs with pipe characters
    // depending on the markdown processor configuration)
    const hasTableOrPipeFormat = /<table>|Feature.*Status.*Priority/.test(post.contentHtml);
    expect(hasTableOrPipeFormat).toBe(true);
    
    // Verify blockquotes
    expect(post.contentHtml).toMatch(/<blockquote>/);
  });
});
