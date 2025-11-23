import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { remark } from 'remark';
import html from 'remark-html';
import remarkAsciinema from '../remark-asciinema';

/**
 * Feature: blog-enhancements, Property 10: Asciinema player embedding
 * Validates: Requirements 7.1, 7.2
 * 
 * For any Asciinema recording reference in markdown, the rendered output should 
 * include an Asciinema player component with the correct recording ID.
 */
describe('Asciinema Embedding Property Tests', () => {
  it('Property 10: Asciinema player embedding with code block syntax', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary cast IDs (alphanumeric strings)
        fc.stringMatching(/^[a-zA-Z0-9]{6,12}$/),
        // Generate optional theme
        fc.option(fc.constantFrom('asciinema', 'monokai', 'solarized-dark', 'solarized-light')),
        // Generate optional speed
        fc.option(fc.double({ min: 0.5, max: 3.0, noNaN: true })),
        async (castId, theme, speed) => {
          // Create markdown with Asciinema code block
          let markdown = '```asciinema\n';
          markdown += `cast-id: ${castId}\n`;
          if (theme) {
            markdown += `theme: ${theme}\n`;
          }
          if (speed !== null) {
            markdown += `speed: ${speed}\n`;
          }
          markdown += '```';
          
          // Process markdown with remark-asciinema plugin
          const processed = await remark()
            .use(remarkAsciinema)
            .use(html, { sanitize: false })
            .process(markdown);
          
          const output = String(processed);
          
          // Property: Output should contain an Asciinema embed div
          expect(output).toContain('class="asciinema-embed"');
          
          // Property: Output should contain the cast ID
          expect(output).toContain(`data-cast-id="${castId}"`);
          
          // Property: If theme was specified, it should be in the output
          if (theme) {
            expect(output).toContain(`data-theme="${theme}"`);
          }
          
          // Property: If speed was specified, it should be in the output
          if (speed !== null) {
            expect(output).toContain(`data-speed="${speed}"`);
          }
          
          // Property: Output should NOT contain the original code block
          expect(output).not.toContain('```asciinema');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10b: Asciinema player embedding with shortcode syntax', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary cast IDs
        fc.stringMatching(/^[a-zA-Z0-9]{6,12}$/),
        async (castId) => {
          // Create markdown with Asciinema shortcode
          const markdown = `Some text before [asciinema:${castId}] and some text after.`;
          
          // Process markdown with remark-asciinema plugin
          const processed = await remark()
            .use(remarkAsciinema)
            .use(html, { sanitize: false })
            .process(markdown);
          
          const output = String(processed);
          
          // Property: Output should contain an Asciinema embed div
          expect(output).toContain('class="asciinema-embed"');
          
          // Property: Output should contain the cast ID
          expect(output).toContain(`data-cast-id="${castId}"`);
          
          // Property: Output should NOT contain the original shortcode
          expect(output).not.toContain(`[asciinema:${castId}]`);
          
          // Property: Surrounding text should be preserved
          expect(output).toContain('Some text before');
          expect(output).toContain('and some text after');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10c: Asciinema player embedding with shortcode and parameters', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary cast IDs
        fc.stringMatching(/^[a-zA-Z0-9]{6,12}$/),
        // Generate theme
        fc.constantFrom('asciinema', 'monokai', 'solarized-dark', 'solarized-light'),
        // Generate speed
        fc.double({ min: 0.5, max: 3.0, noNaN: true }),
        async (castId, theme, speed) => {
          // Create markdown with Asciinema shortcode with parameters
          const markdown = `[asciinema:${castId}:${theme}:${speed}]`;
          
          // Process markdown with remark-asciinema plugin
          const processed = await remark()
            .use(remarkAsciinema)
            .use(html, { sanitize: false })
            .process(markdown);
          
          const output = String(processed);
          
          // Property: Output should contain an Asciinema embed div
          expect(output).toContain('class="asciinema-embed"');
          
          // Property: Output should contain the cast ID
          expect(output).toContain(`data-cast-id="${castId}"`);
          
          // Property: Output should contain the theme
          expect(output).toContain(`data-theme="${theme}"`);
          
          // Property: Output should contain the speed
          expect(output).toContain(`data-speed="${speed}"`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10d: Multiple Asciinema embeds in same document', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of cast IDs
        fc.array(fc.stringMatching(/^[a-zA-Z0-9]{6,12}$/), { minLength: 2, maxLength: 5 }),
        async (castIds) => {
          // Create markdown with multiple Asciinema shortcodes
          const markdown = castIds.map(id => `[asciinema:${id}]`).join('\n\n');
          
          // Process markdown with remark-asciinema plugin
          const processed = await remark()
            .use(remarkAsciinema)
            .use(html, { sanitize: false })
            .process(markdown);
          
          const output = String(processed);
          
          // Property: Output should contain all cast IDs
          castIds.forEach(castId => {
            expect(output).toContain(`data-cast-id="${castId}"`);
          });
          
          // Property: Number of embed divs should match number of cast IDs
          const embedCount = (output.match(/class="asciinema-embed"/g) || []).length;
          expect(embedCount).toBe(castIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10e: Asciinema embedding preserves surrounding content', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate cast ID
        fc.stringMatching(/^[a-zA-Z0-9]{6,12}$/),
        // Generate surrounding content (words that will form paragraphs)
        fc.array(fc.stringMatching(/^[a-zA-Z]{5,15}$/), { minLength: 4, maxLength: 10 }),
        async (castId, words) => {
          // Create markdown with Asciinema embed surrounded by content
          const beforeContent = words.slice(0, Math.floor(words.length / 2)).join(' ');
          const afterContent = words.slice(Math.floor(words.length / 2)).join(' ');
          const markdown = `${beforeContent}\n\n[asciinema:${castId}]\n\n${afterContent}`;
          
          // Process markdown with remark-asciinema plugin
          const processed = await remark()
            .use(remarkAsciinema)
            .use(html, { sanitize: false })
            .process(markdown);
          
          const output = String(processed);
          
          // Property: Asciinema embed should be present
          expect(output).toContain(`data-cast-id="${castId}"`);
          
          // Property: Surrounding content should be preserved (words will be in HTML)
          // Note: Markdown processor wraps content in <p> tags, so we check for word presence
          words.forEach(word => {
            expect(output).toContain(word);
          });
          
          // Property: The structure should have content before and after the embed
          const embedIndex = output.indexOf('class="asciinema-embed"');
          const beforeIndex = output.indexOf(words[0]);
          const afterIndex = output.indexOf(words[words.length - 1]);
          
          // Verify ordering: before content < embed < after content
          expect(beforeIndex).toBeLessThan(embedIndex);
          expect(embedIndex).toBeLessThan(afterIndex);
        }
      ),
      { numRuns: 100 }
    );
  });
});
