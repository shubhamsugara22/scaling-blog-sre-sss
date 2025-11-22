import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPost } from '../posts';

/**
 * Feature: blog-enhancements, Property 2: Reading time display presence
 * Validates: Requirements 1.4
 * 
 * For any rendered blog post, the output should contain both the reading time text 
 * and the publication date.
 */
describe('Post Rendering Property Tests', () => {
  it('Property 2: Reading time display presence', async () => {
    // Test with actual blog posts that exist in the content directory
    // We'll use the known blog posts as our test subjects
    const knownPosts = ['introducing-the-blog', 'deploy-terrafrom-ci'];
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...knownPosts),
        fc.constantFrom('blog' as const, 'til' as const),
        async (slug, type) => {
          // Skip if the post doesn't exist for this type
          try {
            const post = await getPost(slug, type);
            
            // Property: The post metadata must include reading time
            expect(post.meta.readingTime).toBeDefined();
            expect(post.meta.readingTime?.text).toBeDefined();
            expect(post.meta.readingTime?.text).toMatch(/\d+ min read/);
            
            // Property: The post metadata must include a date
            expect(post.meta.date).toBeDefined();
            expect(post.meta.date).toBeTruthy();
            
            // Property: Both reading time and date should be present in metadata
            // This ensures that when rendered, both can be displayed
            const hasReadingTime = post.meta.readingTime !== undefined;
            const hasDate = post.meta.date !== undefined && post.meta.date !== '';
            
            expect(hasReadingTime && hasDate).toBe(true);
            
            // Property: Reading time should be a valid format
            if (post.meta.readingTime) {
              expect(post.meta.readingTime.minutes).toBeGreaterThanOrEqual(1);
              expect(post.meta.readingTime.words).toBeGreaterThanOrEqual(0);
              expect(post.meta.readingTime.text).toBe(`${post.meta.readingTime.minutes} min read`);
            }
            
            // Property: Date should be parseable
            const dateObj = new Date(post.meta.date);
            expect(dateObj.toString()).not.toBe('Invalid Date');
          } catch (error) {
            // If post doesn't exist for this type, skip
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
              return;
            }
            throw error;
          }
        }
      ),
      { numRuns: 20 } // Run fewer times since we're testing with actual files
    );
  });
  
  it('Property 2b: Reading time display presence with simulated rendering', async () => {
    // Test that simulates the rendering logic from the page component
    const knownPosts = ['introducing-the-blog', 'deploy-terrafrom-ci'];
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...knownPosts),
        async (slug) => {
          const post = await getPost(slug, 'blog');
          
          // Simulate the rendering logic from app/blog/[slug]/page.tsx
          const dateDisplay = new Date(post.meta.date).toDateString();
          const readingTimeDisplay = post.meta.readingTime?.text || '';
          
          // Property: Both date and reading time should produce non-empty strings
          expect(dateDisplay).toBeTruthy();
          expect(dateDisplay.length).toBeGreaterThan(0);
          expect(readingTimeDisplay).toBeTruthy();
          expect(readingTimeDisplay.length).toBeGreaterThan(0);
          
          // Property: The rendered output would contain both pieces of information
          // We verify this by checking that both strings are valid and non-empty
          const bothPresent = dateDisplay.length > 0 && readingTimeDisplay.length > 0;
          expect(bothPresent).toBe(true);
          
          // Property: Reading time format should be consistent
          expect(readingTimeDisplay).toMatch(/^\d+ min read$/);
        }
      ),
      { numRuns: 20 }
    );
  });
});
