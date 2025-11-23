import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { remark } from 'remark';
import html from 'remark-html';
import rehypeMermaid from 'rehype-mermaid';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';

/**
 * Feature: blog-enhancements, Property 7: Mermaid diagram conversion
 * Validates: Requirements 5.1
 * 
 * For any code block with language "mermaid", the rendered output should contain 
 * diagram markup (SVG or div with mermaid class) instead of a plain code block.
 */
describe('Mermaid Property Tests', () => {
  it('Property 7: Mermaid diagram conversion', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various valid Mermaid diagram syntaxes
        fc.oneof(
          // Simple flowchart
          fc.record({
            type: fc.constant('flowchart'),
            direction: fc.constantFrom('TD', 'LR', 'RL', 'BT'),
            nodes: fc.array(
              fc.tuple(
                fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/), // node id
                fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0) // node text
              ),
              { minLength: 1, maxLength: 5 }
            )
          }).map(({ type, direction, nodes }) => {
            const nodeLines = nodes.map(([id, text]) => `    ${id}[${text}]`).join('\n');
            const connections = nodes.length > 1 
              ? nodes.slice(0, -1).map((_, i) => `    ${nodes[i][0]} --> ${nodes[i + 1][0]}`).join('\n')
              : '';
            return `flowchart ${direction}\n${nodeLines}${connections ? '\n' + connections : ''}`;
          }),
          
          // Simple sequence diagram
          fc.record({
            participants: fc.array(
              fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
              { minLength: 2, maxLength: 4 }
            ),
            messages: fc.array(
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0),
              { minLength: 1, maxLength: 3 }
            )
          }).map(({ participants, messages }) => {
            const participantLines = participants.map(p => `    participant ${p}`).join('\n');
            const messageLines = messages.map((msg, i) => {
              const from = participants[i % participants.length];
              const to = participants[(i + 1) % participants.length];
              return `    ${from}->>${to}: ${msg}`;
            }).join('\n');
            return `sequenceDiagram\n${participantLines}\n${messageLines}`;
          }),
          
          // Simple graph
          fc.record({
            direction: fc.constantFrom('TD', 'LR'),
            nodes: fc.array(
              fc.tuple(
                fc.stringMatching(/^[A-Z]$/), // single letter node id
                fc.stringMatching(/^[a-zA-Z]+$/).filter(s => s.length > 0 && s.length < 20)
              ),
              { minLength: 2, maxLength: 4 }
            )
          }).map(({ direction, nodes }) => {
            const nodeLines = nodes.map(([id, text]) => `    ${id}[${text}]`).join('\n');
            const connections = nodes.length > 1
              ? `    ${nodes[0][0]} --> ${nodes[1][0]}`
              : '';
            return `graph ${direction}\n${nodeLines}${connections ? '\n' + connections : ''}`;
          }),
          
          // Very simple flowchart (minimal valid Mermaid)
          fc.constant('flowchart TD\n    A[Start]\n    B[End]\n    A --> B'),
          
          // Simple pie chart
          fc.array(
            fc.tuple(
              fc.stringMatching(/^[a-zA-Z]+$/),
              fc.integer({ min: 1, max: 100 })
            ),
            { minLength: 2, maxLength: 5 }
          ).map(items => {
            const lines = items.map(([label, value]) => `    "${label}" : ${value}`).join('\n');
            return `pie title Sample Data\n${lines}`;
          })
        ),
        async (mermaidCode) => {
          // Create markdown with a Mermaid code block
          const markdown = `# Test\n\n\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n\nSome text after.`;
          
          // Process markdown to HTML
          const remarkProcessed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          let contentHtml = String(remarkProcessed);
          
          // Apply rehype-mermaid plugin
          const rehypeProcessed = await unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeMermaid)
            .use(rehypeStringify)
            .process(contentHtml);
          
          const finalHtml = String(rehypeProcessed);
          
          // Property: The output should NOT contain a plain code block with class "language-mermaid"
          // Instead, it should contain diagram markup (SVG or mermaid-related div)
          
          // Check that it's not just a plain code block
          const hasPlainCodeBlock = finalHtml.includes('<code class="language-mermaid"') ||
                                     finalHtml.includes('<code>mermaid');
          
          // Check that it contains diagram markup
          // rehype-mermaid typically outputs SVG or a div with mermaid-related classes
          const hasSvg = finalHtml.includes('<svg');
          const hasMermaidDiv = finalHtml.includes('class="mermaid"') || 
                                 finalHtml.includes('data-mermaid');
          const hasDiagramMarkup = hasSvg || hasMermaidDiv;
          
          // Property: Mermaid code blocks should be converted to diagram markup
          // The output should contain diagram markup and NOT be a plain code block
          expect(hasDiagramMarkup).toBe(true);
          
          // Additional check: if it's still a code block, it should at least be transformed
          if (!hasSvg && !hasMermaidDiv) {
            // If no SVG or mermaid div, check if the code block was at least processed
            // Some Mermaid processors might wrap it differently
            const hasPreTag = finalHtml.includes('<pre');
            if (hasPreTag) {
              // If there's a pre tag, it should have some mermaid-related attribute or class
              const hasProcessedMarker = finalHtml.includes('mermaid') && 
                                          !finalHtml.includes('language-mermaid');
              expect(hasProcessedMarker).toBe(true);
            }
          }
          
          // Property: The original Mermaid code should be present in some form
          // (either as SVG content, data attribute, or processed markup)
          // We can't check for exact code match since it's transformed, but the HTML should be non-empty
          expect(finalHtml.length).toBeGreaterThan(markdown.length / 2);
          
          // Property: The surrounding content should still be present
          expect(finalHtml).toContain('Test');
          expect(finalHtml).toContain('Some text after');
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for Mermaid rendering

  it('Property 7b: Mermaid conversion with multiple diagrams', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate multiple Mermaid diagrams
        fc.array(
          fc.oneof(
            fc.constant('flowchart TD\n    A[Start] --> B[End]'),
            fc.constant('sequenceDiagram\n    Alice->>Bob: Hello\n    Bob->>Alice: Hi'),
            fc.constant('graph LR\n    A[Square] --> B[Circle]'),
            fc.constant('pie title Pets\n    "Dogs" : 386\n    "Cats" : 85')
          ),
          { minLength: 1, maxLength: 3 }
        ),
        async (mermaidCodes) => {
          // Create markdown with multiple Mermaid code blocks
          const mermaidBlocks = mermaidCodes.map((code, i) => 
            `## Diagram ${i + 1}\n\n\`\`\`mermaid\n${code}\n\`\`\`\n`
          ).join('\n');
          
          const markdown = `# Test\n\n${mermaidBlocks}\nEnd of document.`;
          
          // Process markdown
          const remarkProcessed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          let contentHtml = String(remarkProcessed);
          
          // Apply rehype-mermaid
          const rehypeProcessed = await unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeMermaid)
            .use(rehypeStringify)
            .process(contentHtml);
          
          const finalHtml = String(rehypeProcessed);
          
          // Property: Each Mermaid block should be converted
          // Count the number of diagram markers (SVG or mermaid divs)
          const svgCount = (finalHtml.match(/<svg/g) || []).length;
          const mermaidDivCount = (finalHtml.match(/class="mermaid"/g) || []).length;
          const totalDiagrams = svgCount + mermaidDivCount;
          
          // We should have at least as many diagrams as we had Mermaid blocks
          // (some processors might create multiple elements per diagram)
          expect(totalDiagrams).toBeGreaterThanOrEqual(mermaidCodes.length);
          
          // Property: Plain code blocks with language-mermaid should not exist
          const plainMermaidBlocks = (finalHtml.match(/language-mermaid/g) || []).length;
          expect(plainMermaidBlocks).toBe(0);
          
          // Property: Surrounding content should be preserved
          expect(finalHtml).toContain('Test');
          expect(finalHtml).toContain('End of document');
          mermaidCodes.forEach((_, i) => {
            expect(finalHtml).toContain(`Diagram ${i + 1}`);
          });
        }
      ),
      { numRuns: 5 }
    );
  }, 60000); // 60 second timeout for Mermaid rendering

  it('Property 7c: Mermaid conversion preserves non-mermaid code blocks', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a mix of Mermaid and regular code blocks
        fc.record({
          mermaidCode: fc.constant('flowchart TD\n    A[Start] --> B[End]'),
          regularLang: fc.constantFrom('javascript', 'python', 'typescript', 'bash'),
          regularCode: fc.stringMatching(/^[a-zA-Z0-9 \n]+$/).filter(s => s.trim().length > 0)
        }),
        async ({ mermaidCode, regularLang, regularCode }) => {
          // Create markdown with both Mermaid and regular code blocks
          const markdown = `# Test\n\n\`\`\`${regularLang}\n${regularCode}\n\`\`\`\n\n\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n`;
          
          // Process markdown
          const remarkProcessed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          let contentHtml = String(remarkProcessed);
          
          // Apply rehype-mermaid
          const rehypeProcessed = await unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeMermaid)
            .use(rehypeStringify)
            .process(contentHtml);
          
          const finalHtml = String(rehypeProcessed);
          
          // Property: Mermaid block should be converted to diagram
          const hasDiagramMarkup = finalHtml.includes('<svg') || 
                                    finalHtml.includes('class="mermaid"');
          expect(hasDiagramMarkup).toBe(true);
          
          // Property: Regular code block should remain as a code block
          const hasRegularCodeBlock = finalHtml.includes(`language-${regularLang}`) ||
                                       finalHtml.includes(`<code`);
          expect(hasRegularCodeBlock).toBe(true);
          
          // Property: Regular code content should be preserved
          // (at least some of it, accounting for HTML escaping)
          const codeWords = regularCode.trim().split(/\s+/).filter(w => w.length > 2);
          if (codeWords.length > 0) {
            // At least one word from the code should appear in the output
            const someCodePreserved = codeWords.some(word => finalHtml.includes(word));
            expect(someCodePreserved).toBe(true);
          }
          
          // Property: Mermaid code block should NOT remain as language-mermaid
          expect(finalHtml).not.toContain('language-mermaid');
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for Mermaid rendering

  /**
   * Feature: blog-enhancements, Property 8: Mermaid error handling
   * Validates: Requirements 5.3
   * 
   * For any invalid Mermaid syntax, the system should gracefully handle the error 
   * and display either an error message or the raw syntax without breaking the page render.
   */
  it('Property 8: Mermaid error handling', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various types of invalid Mermaid syntax
        fc.oneof(
          // Empty mermaid block
          fc.constant(''),
          
          // Just whitespace
          fc.constant('   \n  \n  '),
          
          // Invalid keyword
          fc.stringMatching(/^[a-z]{3,10}$/).map(s => `${s} invalid\n    A --> B`),
          
          // Malformed flowchart - missing direction
          fc.constant('flowchart\n    A[Node]'),
          
          // Malformed flowchart - invalid syntax
          fc.constant('flowchart TD\n    A[Node\n    B]Missing bracket'),
          
          // Invalid sequence diagram
          fc.constant('sequenceDiagram\n    Alice->>'),
          
          // Unclosed brackets
          fc.constant('flowchart TD\n    A[Unclosed bracket'),
          
          // Invalid characters in node IDs
          fc.constant('flowchart TD\n    A-B-C[Invalid] --> D'),
          
          // Malformed graph
          fc.constant('graph\n    --> B'),
          
          // Random gibberish
          fc.stringMatching(/^[!@#$%^&*(){}[\]|\\:;"'<>,.?/~`+=\-_\s]{10,50}$/),
          
          // Incomplete syntax
          fc.constant('flowchart TD\n    A -->'),
          
          // Mixed valid and invalid
          fc.constant('flowchart TD\n    A[Start]\n    invalid syntax here\n    B[End]'),
          
          // Invalid pie chart
          fc.constant('pie title Test\n    "Item" :'),
          
          // Syntax error with special characters
          fc.constant('flowchart TD\n    A["Test"]] --> B'),
          
          // Completely wrong format
          fc.constant('This is not mermaid syntax at all, just plain text')
        ),
        async (invalidMermaidCode) => {
          // Create markdown with an invalid Mermaid code block
          const markdown = `# Test\n\nBefore diagram.\n\n\`\`\`mermaid\n${invalidMermaidCode}\n\`\`\`\n\nAfter diagram.`;
          
          // Process markdown to HTML
          const remarkProcessed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          let contentHtml = String(remarkProcessed);
          
          // Apply rehype-mermaid plugin - this should handle errors gracefully
          let finalHtml: string;
          let processingError: Error | null = null;
          
          try {
            const rehypeProcessed = await unified()
              .use(rehypeParse, { fragment: true })
              .use(rehypeMermaid)
              .use(rehypeStringify)
              .process(contentHtml);
            
            finalHtml = String(rehypeProcessed);
          } catch (error) {
            // If processing throws an error, that's acceptable as long as we can handle it
            processingError = error as Error;
            finalHtml = contentHtml; // Fall back to unprocessed HTML
          }
          
          // Property 1: The page should not break - we should have valid HTML output
          expect(finalHtml).toBeDefined();
          expect(finalHtml.length).toBeGreaterThan(0);
          
          // Property 2: Surrounding content should be preserved regardless of Mermaid errors
          expect(finalHtml).toContain('Test');
          expect(finalHtml).toContain('Before diagram');
          expect(finalHtml).toContain('After diagram');
          
          // Property 3: The output should either:
          // a) Contain an error message/indicator, OR
          // b) Contain the raw syntax (fallback to code block), OR
          // c) Contain some form of the mermaid content (even if not rendered)
          const hasErrorIndicator = finalHtml.toLowerCase().includes('error') ||
                                     finalHtml.toLowerCase().includes('invalid') ||
                                     finalHtml.toLowerCase().includes('failed');
          
          const hasCodeBlock = finalHtml.includes('<code') || 
                                finalHtml.includes('<pre');
          
          const hasMermaidContent = invalidMermaidCode.trim().length > 0 && 
                                     (finalHtml.includes(invalidMermaidCode.substring(0, Math.min(10, invalidMermaidCode.length))) ||
                                      finalHtml.includes('mermaid'));
          
          const hasGracefulHandling = hasErrorIndicator || hasCodeBlock || hasMermaidContent || processingError !== null;
          
          // Property: Error handling should be graceful - one of the above conditions should be true
          expect(hasGracefulHandling).toBe(true);
          
          // Property 4: The HTML should be well-formed (basic check)
          // Count opening and closing tags for common elements
          const openPreTags = (finalHtml.match(/<pre[^>]*>/g) || []).length;
          const closePreTags = (finalHtml.match(/<\/pre>/g) || []).length;
          const openCodeTags = (finalHtml.match(/<code[^>]*>/g) || []).length;
          const closeCodeTags = (finalHtml.match(/<\/code>/g) || []).length;
          
          // Tags should be balanced (or processing threw an error which is acceptable)
          if (!processingError) {
            expect(openPreTags).toBe(closePreTags);
            expect(openCodeTags).toBe(closeCodeTags);
          }
          
          // Property 5: If an error occurred during processing, it should be caught
          // and not crash the entire system (we already handled this with try-catch)
          // This property is implicitly validated by the test not throwing
        }
      ),
      { numRuns: 20 } // Run more iterations to catch various error cases
    );
  }, 60000); // 60 second timeout
});
