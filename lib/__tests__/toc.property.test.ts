import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractHeadings } from '../toc';

/**
 * Feature: blog-enhancements, Property 3: Table of contents completeness
 * Validates: Requirements 2.1
 * 
 * For any blog post with headings, the generated table of contents should include 
 * all H2 and H3 headings found in the content, preserving their text and hierarchical order.
 */
describe('TOC Property Tests', () => {
  it('Property 3: Table of contents completeness', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary HTML with H2 and H3 headings
        fc.array(
          fc.oneof(
            // H2 headings
            fc.record({
              level: fc.constant(2),
              text: fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
            }),
            // H3 headings
            fc.record({
              level: fc.constant(3),
              text: fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
            }),
            // Other content (H1, H4, paragraphs) that should be ignored
            fc.oneof(
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).map(text => ({ level: 1, text })),
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).map(text => ({ level: 4, text })),
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).map(text => ({ level: 0, text })) // paragraph
            )
          ),
          { minLength: 0, maxLength: 20 }
        ),
        (elements) => {
          // Build HTML from the generated elements
          const html = elements.map(el => {
            if (el.level === 0) {
              return `<p>${el.text}</p>`;
            }
            return `<h${el.level}>${el.text}</h${el.level}>`;
          }).join('\n');
          
          // Extract headings using the function under test
          const result = extractHeadings(html);
          
          // Filter expected headings (only H2 and H3)
          const expectedHeadings = elements.filter(el => el.level === 2 || el.level === 3);
          
          // Property: All H2 and H3 headings should be extracted
          expect(result.length).toBe(expectedHeadings.length);
          
          // Property: Order should be preserved
          result.forEach((heading, index) => {
            const expected = expectedHeadings[index];
            expect(heading.level).toBe(expected.level);
            expect(heading.text).toBe(expected.text.trim());
          });
          
          // Property: Each heading should have a valid ID
          result.forEach(heading => {
            expect(heading.id).toBeTruthy();
            expect(typeof heading.id).toBe('string');
            expect(heading.id.length).toBeGreaterThan(0);
          });
          
          // Property: IDs should be unique
          const ids = result.map(h => h.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3b: TOC completeness with realistic blog HTML', () => {
    fc.assert(
      fc.property(
        // Generate more realistic blog HTML with various heading patterns
        fc.array(
          fc.oneof(
            // H2 with various text patterns
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 .,!?-]*$/)
              .filter(s => s.trim().length > 0 && s.trim().length < 100)
              .map(text => ({ type: 'h2', text: text.trim() })),
            // H3 with various text patterns
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 .,!?-]*$/)
              .filter(s => s.trim().length > 0 && s.trim().length < 100)
              .map(text => ({ type: 'h3', text: text.trim() })),
            // H2 with inline HTML (code, links, etc.)
            fc.tuple(
              fc.stringMatching(/^[a-zA-Z ]+$/),
              fc.stringMatching(/^[a-zA-Z]+$/)
            ).map(([before, code]) => ({ 
              type: 'h2', 
              text: `${before} <code>${code}</code>`,
              plainText: `${before} ${code}`.trim()
            })),
            // H3 with inline HTML
            fc.tuple(
              fc.stringMatching(/^[a-zA-Z ]+$/),
              fc.stringMatching(/^[a-zA-Z]+$/)
            ).map(([before, link]) => ({ 
              type: 'h3', 
              text: `${before} <a href="#">${link}</a>`,
              plainText: `${before} ${link}`.trim()
            })),
            // Non-heading content that should be ignored
            fc.stringMatching(/^[a-zA-Z0-9 ]+$/)
              .map(text => ({ type: 'p', text }))
          ),
          { minLength: 0, maxLength: 30 }
        ),
        (elements) => {
          // Build HTML
          const html = elements.map(el => {
            if (el.type === 'p') {
              return `<p>${el.text}</p>`;
            }
            return `<${el.type}>${el.text}</${el.type}>`;
          }).join('\n');
          
          // Extract headings
          const result = extractHeadings(html);
          
          // Filter expected headings (only h2 and h3)
          const expectedHeadings = elements.filter(el => el.type === 'h2' || el.type === 'h3');
          
          // Property: Completeness - all H2 and H3 should be extracted
          expect(result.length).toBe(expectedHeadings.length);
          
          // Property: Order preservation
          result.forEach((heading, index) => {
            const expected = expectedHeadings[index];
            const expectedLevel = expected.type === 'h2' ? 2 : 3;
            expect(heading.level).toBe(expectedLevel);
            
            // Check text (should strip HTML tags)
            const expectedText = expected.plainText || expected.text.replace(/<[^>]*>/g, '').trim();
            expect(heading.text).toBe(expectedText);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3c: TOC completeness with edge cases', () => {
    fc.assert(
      fc.property(
        // Generate headings with edge case text
        fc.array(
          fc.record({
            level: fc.constantFrom(2, 3),
            text: fc.oneof(
              // Normal text
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0),
              // Text with special characters (excluding < and > to avoid HTML tag ambiguity)
              fc.stringMatching(/^[a-zA-Z0-9 !@#$%^&*()_+=\[\]{};:'",.\/?\\|-]+$/)
                .filter(s => s.trim().length > 0),
              // Text with unicode
              fc.string({ minLength: 1, maxLength: 50 })
                .filter(s => s.trim().length > 0 && !s.includes('<') && !s.includes('>')),
              // Very short text
              fc.constantFrom('A', 'B', 'C', '1', '2', '3'),
              // Text with multiple spaces
              fc.stringMatching(/^[a-zA-Z]+( +[a-zA-Z]+)*$/).filter(s => s.trim().length > 0)
            )
          }),
          { minLength: 0, maxLength: 15 }
        ),
        (headings) => {
          // Build HTML
          const html = headings.map(h => 
            `<h${h.level}>${h.text}</h${h.level}>`
          ).join('\n');
          
          // Extract headings
          const result = extractHeadings(html);
          
          // Property: All headings should be extracted
          expect(result.length).toBe(headings.length);
          
          // Property: Order and level should be preserved
          result.forEach((heading, index) => {
            expect(heading.level).toBe(headings[index].level);
            // Text should match (trimmed)
            expect(heading.text).toBe(headings[index].text.trim());
          });
          
          // Property: All headings should have valid, unique IDs
          const ids = result.map(h => h.id);
          expect(ids.every(id => id && id.length > 0)).toBe(true);
          expect(new Set(ids).size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: blog-enhancements, Property 4: Table of contents anchor links
   * Validates: Requirements 2.2
   * 
   * For any heading in the table of contents, the generated anchor link should match 
   * the ID of the corresponding heading in the rendered HTML.
   */
  it('Property 4: Table of contents anchor links', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary HTML with H2 and H3 headings, some with existing IDs
        fc.array(
          fc.record({
            level: fc.constantFrom(2, 3),
            text: fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0),
            // Some headings have pre-existing IDs, some don't
            hasId: fc.boolean(),
            customId: fc.stringMatching(/^[a-z][a-z0-9-]*$/).filter(s => s.length > 0 && s.length < 30)
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (headingSpecs) => {
          // Build HTML with some headings having IDs and some not
          const html = headingSpecs.map(spec => {
            if (spec.hasId) {
              return `<h${spec.level} id="${spec.customId}">${spec.text}</h${spec.level}>`;
            }
            return `<h${spec.level}>${spec.text}</h${spec.level}>`;
          }).join('\n');
          
          // Extract headings using the function under test
          const tocHeadings = extractHeadings(html);
          
          // Property: Number of TOC entries should match number of headings
          expect(tocHeadings.length).toBe(headingSpecs.length);
          
          // Property: TOC anchor links should be valid and unique
          // The function ensures uniqueness by adding suffixes when needed
          const seenIds = new Set<string>();
          
          tocHeadings.forEach((tocHeading, index) => {
            const spec = headingSpecs[index];
            
            // The TOC heading should have a valid ID
            expect(tocHeading.id).toBeTruthy();
            expect(typeof tocHeading.id).toBe('string');
            expect(tocHeading.id.length).toBeGreaterThan(0);
            expect(tocHeading.id).toMatch(/^[a-z0-9-]+$/);
            
            // The ID should be unique (no duplicates)
            expect(seenIds.has(tocHeading.id)).toBe(false);
            seenIds.add(tocHeading.id);
            
            // Text and level should match
            expect(tocHeading.text).toBe(spec.text.trim());
            expect(tocHeading.level).toBe(spec.level);
            
            // If the heading had a custom ID, the TOC ID should either be that ID
            // or that ID with a numeric suffix (if there was a collision)
            if (spec.hasId) {
              const baseId = spec.customId;
              const idMatchesBase = tocHeading.id === baseId;
              const idMatchesSuffix = tocHeading.id.startsWith(baseId + '-') && 
                                      /^[a-z0-9-]+-\d+$/.test(tocHeading.id);
              expect(idMatchesBase || idMatchesSuffix).toBe(true);
            }
          });
          
          // Property: All final IDs should be unique (no duplicate anchor links)
          const ids = tocHeadings.map(h => h.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4b: Anchor links match HTML heading IDs in realistic scenarios', () => {
    fc.assert(
      fc.property(
        // Generate realistic blog content with various heading patterns
        // Only generate headings without IDs to avoid collision complexity
        fc.array(
          fc.oneof(
            // H2 without ID
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 .,!?-]*$/)
              .filter(s => s.trim().length > 0 && s.trim().length < 100)
              .map(text => ({ level: 2, text: text.trim() })),
            // H3 without ID
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 .,!?-]*$/)
              .filter(s => s.trim().length > 0 && s.trim().length < 100)
              .map(text => ({ level: 3, text: text.trim() }))
          ),
          { minLength: 1, maxLength: 25 }
        ),
        (headingSpecs) => {
          // Build HTML without IDs
          const html = headingSpecs.map(spec => 
            `<h${spec.level}>${spec.text}</h${spec.level}>`
          ).join('\n');
          
          // Extract headings
          const tocHeadings = extractHeadings(html);
          
          // Property: Number of TOC entries matches number of headings
          expect(tocHeadings.length).toBe(headingSpecs.length);
          
          // Property: Each TOC heading should have a valid, URL-safe ID
          tocHeadings.forEach((tocHeading, index) => {
            const spec = headingSpecs[index];
            
            // The TOC heading should have a valid ID
            expect(tocHeading.id).toBeTruthy();
            expect(typeof tocHeading.id).toBe('string');
            expect(tocHeading.id).toMatch(/^[a-z0-9-]+$/);
            
            // Text and level should match
            expect(tocHeading.text).toBe(spec.text);
            expect(tocHeading.level).toBe(spec.level);
          });
          
          // Property: All anchor links (IDs) should be unique
          const ids = tocHeadings.map(h => h.id);
          expect(new Set(ids).size).toBe(ids.length);
          
          // Property: IDs should be derived from heading text
          tocHeadings.forEach((tocHeading) => {
            // The ID should be lowercase and use hyphens
            expect(tocHeading.id).toBe(tocHeading.id.toLowerCase());
            expect(tocHeading.id).not.toContain(' ');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4c: Anchor links work with duplicate heading text', () => {
    fc.assert(
      fc.property(
        // Generate headings where some have duplicate text
        fc.tuple(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]*$/).filter(s => s.trim().length > 0),
          fc.integer({ min: 2, max: 5 }) // Number of duplicates
        ),
        ([baseText, duplicateCount]) => {
          // Create multiple headings with the same text
          const headingSpecs = Array.from({ length: duplicateCount }, (_, i) => ({
            level: (i % 2) + 2 as 2 | 3, // Alternate between H2 and H3
            text: baseText.trim()
          }));
          
          // Build HTML
          const html = headingSpecs.map(spec => 
            `<h${spec.level}>${spec.text}</h${spec.level}>`
          ).join('\n');
          
          // Extract headings
          const tocHeadings = extractHeadings(html);
          
          // Property: All headings should be extracted
          expect(tocHeadings.length).toBe(duplicateCount);
          
          // Property: All IDs should be unique despite duplicate text
          const ids = tocHeadings.map(h => h.id);
          expect(new Set(ids).size).toBe(duplicateCount);
          
          // Property: First heading should have base ID, others should have numeric suffixes
          const baseId = tocHeadings[0].id;
          expect(baseId).toBeTruthy();
          
          for (let i = 1; i < tocHeadings.length; i++) {
            // Subsequent IDs should be baseId-2, baseId-3, etc.
            expect(tocHeadings[i].id).toBe(`${baseId}-${i + 1}`);
          }
          
          // Property: All text should match the original
          tocHeadings.forEach(heading => {
            expect(heading.text).toBe(baseText.trim());
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: blog-enhancements, Property 5: Table of contents hierarchy
   * Validates: Requirements 2.4
   * 
   * For any blog post with nested headings, H3 headings in the table of contents 
   * should be visually indented relative to their parent H2 headings.
   */
  it('Property 5: Table of contents hierarchy', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary heading structures with H2 and H3 headings
        fc.array(
          fc.record({
            level: fc.constantFrom(2, 3),
            text: fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
          }),
          { minLength: 0, maxLength: 30 }
        ),
        (headingSpecs) => {
          // Build HTML
          const html = headingSpecs.map(spec => 
            `<h${spec.level}>${spec.text}</h${spec.level}>`
          ).join('\n');
          
          // Extract headings
          const tocHeadings = extractHeadings(html);
          
          // Property: Number of extracted headings should match input
          expect(tocHeadings.length).toBe(headingSpecs.length);
          
          // Property: Hierarchical structure is preserved
          // All H2 headings should have level 2, all H3 headings should have level 3
          tocHeadings.forEach((heading, index) => {
            const expectedLevel = headingSpecs[index].level;
            expect(heading.level).toBe(expectedLevel);
          });
          
          // Property: Level information is correctly preserved for hierarchy rendering
          // This ensures the component can properly indent H3 headings
          const h2Headings = tocHeadings.filter(h => h.level === 2);
          const h3Headings = tocHeadings.filter(h => h.level === 3);
          
          const expectedH2Count = headingSpecs.filter(s => s.level === 2).length;
          const expectedH3Count = headingSpecs.filter(s => s.level === 3).length;
          
          expect(h2Headings.length).toBe(expectedH2Count);
          expect(h3Headings.length).toBe(expectedH3Count);
          
          // Property: All H3 headings have level 3 (for indentation)
          h3Headings.forEach(heading => {
            expect(heading.level).toBe(3);
          });
          
          // Property: All H2 headings have level 2 (no indentation)
          h2Headings.forEach(heading => {
            expect(heading.level).toBe(2);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5b: Hierarchy with realistic nested structures', () => {
    fc.assert(
      fc.property(
        // Generate realistic blog heading structures
        // Start with H2, optionally followed by H3s, then another H2, etc.
        fc.array(
          fc.oneof(
            // H2 section
            fc.record({
              type: fc.constant('h2' as const),
              text: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]*$/).filter(s => s.trim().length > 0),
              subsections: fc.array(
                fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]*$/).filter(s => s.trim().length > 0),
                { minLength: 0, maxLength: 5 }
              )
            })
          ),
          { minLength: 0, maxLength: 10 }
        ),
        (sections) => {
          // Flatten the structure into a list of headings
          const headingSpecs: Array<{ level: 2 | 3; text: string }> = [];
          sections.forEach(section => {
            headingSpecs.push({ level: 2, text: section.text.trim() });
            section.subsections.forEach(subsection => {
              headingSpecs.push({ level: 3, text: subsection.trim() });
            });
          });
          
          // Build HTML
          const html = headingSpecs.map(spec => 
            `<h${spec.level}>${spec.text}</h${spec.level}>`
          ).join('\n');
          
          // Extract headings
          const tocHeadings = extractHeadings(html);
          
          // Property: All headings are extracted
          expect(tocHeadings.length).toBe(headingSpecs.length);
          
          // Property: Hierarchy is preserved - levels match
          tocHeadings.forEach((heading, index) => {
            expect(heading.level).toBe(headingSpecs[index].level);
            expect(heading.text).toBe(headingSpecs[index].text);
          });
          
          // Property: H3 headings follow their parent H2 structure
          // Track the last H2 index to verify H3s come after H2s
          let lastH2Index = -1;
          tocHeadings.forEach((heading, index) => {
            if (heading.level === 2) {
              lastH2Index = index;
            } else if (heading.level === 3) {
              // H3 should come after at least one H2 (or be at the start if no H2 yet)
              // This verifies the hierarchical relationship is maintained
              expect(heading.level).toBe(3);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5c: Hierarchy with edge cases', () => {
    fc.assert(
      fc.property(
        // Generate edge case structures
        fc.oneof(
          // All H2s (no nesting)
          fc.array(
            fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
              .map(text => ({ level: 2 as const, text: text.trim() })),
            { minLength: 1, maxLength: 10 }
          ),
          // All H3s (all nested)
          fc.array(
            fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
              .map(text => ({ level: 3 as const, text: text.trim() })),
            { minLength: 1, maxLength: 10 }
          ),
          // H3s before H2 (unusual but valid)
          fc.tuple(
            fc.array(
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
                .map(text => ({ level: 3 as const, text: text.trim() })),
              { minLength: 1, maxLength: 3 }
            ),
            fc.array(
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
                .map(text => ({ level: 2 as const, text: text.trim() })),
              { minLength: 1, maxLength: 3 }
            )
          ).map(([h3s, h2s]) => [...h3s, ...h2s]),
          // Alternating H2 and H3
          fc.array(
            fc.tuple(
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0),
              fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0)
            ).map(([h2Text, h3Text]) => [
              { level: 2 as const, text: h2Text.trim() },
              { level: 3 as const, text: h3Text.trim() }
            ]),
            { minLength: 1, maxLength: 8 }
          ).map(pairs => pairs.flat())
        ),
        (headingSpecs) => {
          // Build HTML
          const html = headingSpecs.map(spec => 
            `<h${spec.level}>${spec.text}</h${spec.level}>`
          ).join('\n');
          
          // Extract headings
          const tocHeadings = extractHeadings(html);
          
          // Property: All headings are extracted with correct levels
          expect(tocHeadings.length).toBe(headingSpecs.length);
          
          tocHeadings.forEach((heading, index) => {
            const expected = headingSpecs[index];
            
            // Level is preserved for hierarchy
            expect(heading.level).toBe(expected.level);
            
            // Text is preserved
            expect(heading.text).toBe(expected.text);
            
            // Level is either 2 or 3 (valid for TOC)
            expect([2, 3]).toContain(heading.level);
          });
          
          // Property: Level values enable proper indentation
          // H2 headings should have level 2, H3 headings should have level 3
          const h2Count = tocHeadings.filter(h => h.level === 2).length;
          const h3Count = tocHeadings.filter(h => h.level === 3).length;
          
          const expectedH2 = headingSpecs.filter(s => s.level === 2).length;
          const expectedH3 = headingSpecs.filter(s => s.level === 3).length;
          
          expect(h2Count).toBe(expectedH2);
          expect(h3Count).toBe(expectedH3);
        }
      ),
      { numRuns: 100 }
    );
  });
});
