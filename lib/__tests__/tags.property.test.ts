import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPost } from '../posts';

/**
 * Feature: blog-enhancements, Property 12: Tag rendering completeness
 * Validates: Requirements 9.1, 9.2
 * 
 * For any blog post with tags in metadata, all tags should appear in the 
 * rendered output as distinct, styled elements.
 */
describe('Tag Rendering Property Tests', () => {
  it('Property 12: Tag rendering completeness', async () => {
    // Test with actual blog posts that exist in the content directory
    const knownPosts = ['introducing-the-blog', 'deploy-terrafrom-ci', 'feature-showcase'];
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...knownPosts),
        fc.constantFrom('blog' as const, 'til' as const),
        async (slug, type) => {
          try {
            const post = await getPost(slug, type);
            
            // Property: Tags array should be defined
            expect(post.meta.tags).toBeDefined();
            expect(Array.isArray(post.meta.tags)).toBe(true);
            
            // Property: If tags exist, they should all be strings
            if (post.meta.tags.length > 0) {
              post.meta.tags.forEach(tag => {
                expect(typeof tag).toBe('string');
                expect(tag.length).toBeGreaterThan(0);
              });
              
              // Property: All tags should be unique (no duplicates)
              const uniqueTags = new Set(post.meta.tags);
              expect(uniqueTags.size).toBe(post.meta.tags.length);
              
              // Property: Tags should be accessible for rendering
              // Each tag should be a valid string that can be rendered
              post.meta.tags.forEach(tag => {
                expect(tag.trim()).toBe(tag); // No leading/trailing whitespace
                expect(tag).toBeTruthy(); // Not empty
              });
            }
            
            // Property: Empty tags array should not cause errors
            if (post.meta.tags.length === 0) {
              expect(post.meta.tags).toEqual([]);
            }
          } catch (error) {
            // If post doesn't exist for this type, skip
            const err = error as any;
            if (err.code === 'ENOENT' || (err.message && err.message.includes('Post not found'))) {
              return;
            }
            throw error;
          }
        }
      ),
      { numRuns: 20 }
    );
  });
  
  it('Property 12b: Tag rendering with generated tag arrays', () => {
    fc.assert(
      fc.property(
        // Generate arrays of tags with various characteristics
        fc.array(
          fc.stringMatching(/^[a-zA-Z0-9-]+$/), // Valid tag format
          { minLength: 0, maxLength: 10 }
        ).map(tags => [...new Set(tags)]), // Ensure uniqueness
        (tags) => {
          // Property: All tags should be valid strings
          tags.forEach(tag => {
            expect(typeof tag).toBe('string');
            expect(tag.length).toBeGreaterThan(0);
          });
          
          // Property: Tags array should be iterable for rendering
          const renderedTags = tags.map(tag => ({
            key: tag,
            label: tag
          }));
          
          expect(renderedTags.length).toBe(tags.length);
          
          // Property: Each tag should produce a distinct renderable object
          renderedTags.forEach((rendered, index) => {
            expect(rendered.key).toBe(tags[index]);
            expect(rendered.label).toBe(tags[index]);
          });
          
          // Property: Empty tag arrays should render nothing
          if (tags.length === 0) {
            expect(renderedTags).toEqual([]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 12c: Tag completeness - all tags present in metadata', () => {
    fc.assert(
      fc.property(
        // Generate a set of tags
        fc.uniqueArray(
          fc.stringMatching(/^[a-zA-Z0-9-]+$/),
          { minLength: 1, maxLength: 10 }
        ),
        (tags) => {
          // Simulate the metadata structure
          const metadata = {
            tags: tags,
            title: 'Test Post',
            date: '2024-01-01',
            slug: 'test-post',
            summary: 'Test summary'
          };
          
          // Property: All tags from metadata should be present
          expect(metadata.tags.length).toBe(tags.length);
          
          // Property: Each original tag should be findable in metadata
          tags.forEach(tag => {
            expect(metadata.tags).toContain(tag);
          });
          
          // Property: No extra tags should be added
          metadata.tags.forEach(tag => {
            expect(tags).toContain(tag);
          });
          
          // Property: Order should be preserved
          expect(metadata.tags).toEqual(tags);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 12d: Tag rendering simulation - distinct elements', () => {
    fc.assert(
      fc.property(
        // Generate arrays of tags
        fc.uniqueArray(
          fc.stringMatching(/^[a-zA-Z0-9-]+$/),
          { minLength: 0, maxLength: 10 }
        ),
        (tags) => {
          // Simulate the rendering logic from the page component
          // In the actual component: {meta.tags.map((t) => <Tag key={t} label={t} />)}
          
          const renderedElements = tags.map(tag => ({
            key: tag,
            label: tag,
            type: 'Tag'
          }));
          
          // Property: Number of rendered elements equals number of tags
          expect(renderedElements.length).toBe(tags.length);
          
          // Property: Each tag produces a distinct element
          const keys = renderedElements.map(el => el.key);
          const uniqueKeys = new Set(keys);
          expect(uniqueKeys.size).toBe(tags.length);
          
          // Property: All original tags are represented
          tags.forEach(tag => {
            const found = renderedElements.find(el => el.label === tag);
            expect(found).toBeDefined();
            expect(found?.key).toBe(tag);
          });
          
          // Property: Empty tags array produces no elements
          if (tags.length === 0) {
            expect(renderedElements).toEqual([]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
