import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateReadingTime } from '../reading-time';

/**
 * Feature: blog-enhancements, Property 1: Reading time calculation accuracy
 * Validates: Requirements 1.1, 1.2
 * 
 * For any blog post content, the calculated reading time in minutes should equal 
 * the word count divided by 225 (±25 words per minute tolerance), rounded to the 
 * nearest minute with a minimum of 1 minute.
 */
describe('Reading Time Property Tests', () => {
  it('Property 1: Reading time calculation accuracy', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary strings that represent blog content
        fc.string({ minLength: 0, maxLength: 10000 }),
        (content) => {
          const result = calculateReadingTime(content);
          
          // The result should always have valid structure
          expect(result).toHaveProperty('minutes');
          expect(result).toHaveProperty('words');
          expect(result).toHaveProperty('text');
          
          // Minutes should always be at least 1
          expect(result.minutes).toBeGreaterThanOrEqual(1);
          
          // Word count should be non-negative
          expect(result.words).toBeGreaterThanOrEqual(0);
          
          // Text should match the format
          expect(result.text).toBe(`${result.minutes} min read`);
          
          // Core property: reading time should match formula
          // For content with words, verify the calculation
          if (result.words > 0) {
            // Calculate expected minutes using 225 words per minute
            const expectedMinutes = Math.max(1, Math.round(result.words / 225));
            expect(result.minutes).toBe(expectedMinutes);
          } else {
            // Empty content should return 1 minute minimum
            expect(result.minutes).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1b: Reading time with realistic blog content', () => {
    fc.assert(
      fc.property(
        // Generate more realistic blog content with words, markdown, and HTML
        fc.array(
          fc.oneof(
            // Regular words
            fc.stringMatching(/^[a-zA-Z]+$/),
            // Markdown headings
            fc.tuple(fc.constantFrom('#', '##', '###'), fc.stringMatching(/^[a-zA-Z ]+$/))
              .map(([prefix, text]) => `${prefix} ${text}`),
            // Markdown bold/italic
            fc.stringMatching(/^[a-zA-Z ]+$/)
              .map(text => fc.sample(fc.constantFrom(`**${text}**`, `*${text}*`, `__${text}__`, `_${text}_`), 1)[0]),
            // Markdown links
            fc.tuple(fc.stringMatching(/^[a-zA-Z ]+$/), fc.webUrl())
              .map(([text, url]) => `[${text}](${url})`),
            // HTML tags
            fc.stringMatching(/^[a-zA-Z ]+$/)
              .map(text => `<p>${text}</p>`),
            // Code blocks
            fc.stringMatching(/^[a-zA-Z0-9 ]+$/)
              .map(code => `\`\`\`\n${code}\n\`\`\``),
            // Whitespace
            fc.constantFrom(' ', '\n', '\t')
          ),
          { minLength: 0, maxLength: 500 }
        ).map(parts => parts.join(' ')),
        (content) => {
          const result = calculateReadingTime(content);
          
          // Verify minimum 1 minute
          expect(result.minutes).toBeGreaterThanOrEqual(1);
          
          // Verify the calculation formula
          const expectedMinutes = Math.max(1, Math.round(result.words / 225));
          expect(result.minutes).toBe(expectedMinutes);
          
          // Verify text format
          expect(result.text).toBe(`${result.minutes} min read`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1c: Reading time tolerance (200-250 words per minute)', () => {
    fc.assert(
      fc.property(
        // Generate a specific number of words
        fc.integer({ min: 1, max: 5000 }),
        (wordCount) => {
          // Create content with exact word count
          const content = Array(wordCount).fill('word').join(' ');
          const result = calculateReadingTime(content);
          
          // Verify word count is accurate
          expect(result.words).toBe(wordCount);
          
          // Verify reading time is within tolerance
          // Using 225 words per minute (with ±25 tolerance = 200-250 range)
          const minMinutes = Math.max(1, Math.round(wordCount / 250));
          const maxMinutes = Math.max(1, Math.round(wordCount / 200));
          
          expect(result.minutes).toBeGreaterThanOrEqual(minMinutes);
          expect(result.minutes).toBeLessThanOrEqual(maxMinutes);
          
          // Verify it matches the exact formula (225 wpm)
          const expectedMinutes = Math.max(1, Math.round(wordCount / 225));
          expect(result.minutes).toBe(expectedMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });
});
