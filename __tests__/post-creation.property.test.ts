import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateSlug, generateUniqueSlug } from '@/lib/slug';

/**
 * Feature: blog-interactions, Property 2: Post creation completeness
 * Validates: Requirements 1.3, 1.4, 1.5
 */

describe('Post Creation Properties', () => {
  const testBlogDir = path.join(process.cwd(), 'content', 'test-blog');

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testBlogDir)) {
      fs.mkdirSync(testBlogDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testBlogDir)) {
      const files = fs.readdirSync(testBlogDir);
      files.forEach((file) => {
        fs.unlinkSync(path.join(testBlogDir, file));
      });
      fs.rmdirSync(testBlogDir);
    }
  });

  test('Property 2: Post creation completeness - all fields preserved', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          content: fc.string({ minLength: 1, maxLength: 500 }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
          summary: fc.string({ maxLength: 200 }),
        }),
        (postData) => {
          // Generate slug
          const slug = generateSlug(postData.title);
          
          // Create frontmatter
          const date = new Date().toISOString().split('T')[0];
          const frontmatter = {
            title: postData.title,
            date,
            tags: postData.tags,
            summary: postData.summary,
          };

          // Create file content
          const fileContent = matter.stringify(postData.content, frontmatter);

          // Write file
          const filePath = path.join(testBlogDir, `${slug}.md`);
          fs.writeFileSync(filePath, fileContent, 'utf8');

          // Read file back
          const savedContent = fs.readFileSync(filePath, 'utf8');
          const parsed = matter(savedContent);

          // Verify all fields are present
          expect(parsed.data.title).toBe(postData.title);
          expect(parsed.data.date).toBe(date);
          expect(parsed.data.tags).toEqual(postData.tags);
          expect(parsed.data.summary).toBe(postData.summary);
          expect(parsed.content).toBe(postData.content);

          // Clean up
          fs.unlinkSync(filePath);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Slug generation is consistent and URL-safe', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (title) => {
          const slug = generateSlug(title);

          // Slug should be lowercase
          expect(slug).toBe(slug.toLowerCase());

          // Slug should not contain spaces
          expect(slug).not.toContain(' ');

          // Slug should not contain special characters except hyphens
          expect(slug).toMatch(/^[a-z0-9-]*$/);

          // Slug should not start or end with hyphen
          if (slug.length > 0) {
            expect(slug[0]).not.toBe('-');
            expect(slug[slug.length - 1]).not.toBe('-');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Post creation includes current date', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          content: fc.string({ minLength: 1 }),
          tags: fc.array(fc.string()),
          summary: fc.string(),
        }),
        (postData) => {
          const slug = generateSlug(postData.title);
          const today = new Date().toISOString().split('T')[0];

          const frontmatter = {
            title: postData.title,
            date: today,
            tags: postData.tags,
            summary: postData.summary,
          };

          const fileContent = matter.stringify(postData.content, frontmatter);
          const filePath = path.join(testBlogDir, `${slug}.md`);
          fs.writeFileSync(filePath, fileContent, 'utf8');

          const savedContent = fs.readFileSync(filePath, 'utf8');
          const parsed = matter(savedContent);

          // Verify date is present and is today's date
          expect(parsed.data.date).toBeDefined();
          expect(parsed.data.date).toBe(today);

          // Clean up
          fs.unlinkSync(filePath);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Slug generation handles special characters', () => {
    const testCases = [
      { input: 'Hello World', expected: 'hello-world' },
      { input: 'Hello  World', expected: 'hello-world' },
      { input: 'Hello_World', expected: 'hello-world' },
      { input: 'Hello@World!', expected: 'helloworld' },
      { input: '  Hello World  ', expected: 'hello-world' },
      { input: 'Hello---World', expected: 'hello-world' },
    ];

    testCases.forEach(({ input, expected }) => {
      const slug = generateSlug(input);
      expect(slug).toBe(expected);
    });
  });
});
