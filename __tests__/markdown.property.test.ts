import { describe, test, expect } from '@jest/globals';
import fc from 'fast-check';
import { remark } from 'remark';
import html from 'remark-html';

/**
 * Feature: blog-interactions, Property 1: Markdown preview consistency
 * Validates: Requirements 1.2
 */

describe('Markdown Preview Properties', () => {
  test('Property 1: Markdown preview consistency - headings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 6 }),
        async (text, level) => {
          const markdown = `${'#'.repeat(level)} ${text}`;
          const processed = await remark().use(html, { sanitize: false }).process(markdown);
          const htmlContent = String(processed);

          // Should contain the heading tag
          expect(htmlContent).toContain(`<h${level}`);
          expect(htmlContent).toContain(`</h${level}>`);
          // Should contain the text
          expect(htmlContent).toContain(text);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Markdown preview consistency - lists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        async (items) => {
          const markdown = items.map((item) => `- ${item}`).join('\n');
          const processed = await remark().use(html, { sanitize: false }).process(markdown);
          const htmlContent = String(processed);

          // Should contain ul and li tags
          expect(htmlContent).toContain('<ul>');
          expect(htmlContent).toContain('</ul>');
          expect(htmlContent).toContain('<li>');
          
          // Should contain all items
          items.forEach((item) => {
            expect(htmlContent).toContain(item);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Markdown preview consistency - links', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.webUrl(),
        async (text, url) => {
          const markdown = `[${text}](${url})`;
          const processed = await remark().use(html, { sanitize: false }).process(markdown);
          const htmlContent = String(processed);

          // Should contain anchor tag
          expect(htmlContent).toContain('<a');
          expect(htmlContent).toContain('</a>');
          expect(htmlContent).toContain(text);
          expect(htmlContent).toContain(url);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Markdown preview consistency - code blocks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (code) => {
          const markdown = `\`\`\`\n${code}\n\`\`\``;
          const processed = await remark().use(html, { sanitize: false }).process(markdown);
          const htmlContent = String(processed);

          // Should contain pre and code tags
          expect(htmlContent).toContain('<pre>');
          expect(htmlContent).toContain('<code>');
          expect(htmlContent).toContain('</code>');
          expect(htmlContent).toContain('</pre>');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Markdown preview consistency - paragraphs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (text) => {
          const processed = await remark().use(html, { sanitize: false }).process(text);
          const htmlContent = String(processed);

          // Should contain paragraph tags
          expect(htmlContent).toContain('<p>');
          expect(htmlContent).toContain('</p>');
          expect(htmlContent).toContain(text);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Markdown preview consistency - bold and italic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (text) => {
          const boldMarkdown = `**${text}**`;
          const italicMarkdown = `*${text}*`;

          const boldProcessed = await remark().use(html, { sanitize: false }).process(boldMarkdown);
          const boldHtml = String(boldProcessed);
          expect(boldHtml).toContain('<strong>');
          expect(boldHtml).toContain(text);

          const italicProcessed = await remark().use(html, { sanitize: false }).process(italicMarkdown);
          const italicHtml = String(italicProcessed);
          expect(italicHtml).toContain('<em>');
          expect(italicHtml).toContain(text);
        }
      ),
      { numRuns: 100 }
    );
  });
});
