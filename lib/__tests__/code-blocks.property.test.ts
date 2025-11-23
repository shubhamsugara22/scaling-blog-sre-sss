import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { remark } from 'remark';
import html from 'remark-html';

/**
 * Feature: blog-enhancements, Property 9: Code block language badges
 * Validates: Requirements 6.1, 6.4
 * 
 * For any code block in markdown, the rendered output should include a language badge 
 * displaying either the specified language or "code" if no language is specified.
 */
describe('Code Block Language Badge Property Tests', () => {
  it('Property 9: Code block language badges - specified language', async () => {
    // Generator for common programming languages
    const languageArb = fc.constantFrom(
      'typescript', 'javascript', 'python', 'rust', 'go', 
      'java', 'cpp', 'c', 'ruby', 'php', 'bash', 'shell',
      'yaml', 'json', 'xml', 'html', 'css', 'sql', 'hcl',
      'kubernetes', 'dockerfile', 'markdown'
    );
    
    // Generator for code content
    const codeContentArb = fc.string({ minLength: 1, maxLength: 200 });
    
    await fc.assert(
      fc.asyncProperty(
        languageArb,
        codeContentArb,
        async (language, codeContent) => {
          // Create markdown with a code block that has a specified language
          const markdown = `\`\`\`${language}\n${codeContent}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Property: The HTML should contain a code element with the language class
          // The class format is "language-{language}"
          const expectedClass = `language-${language}`;
          expect(contentHtml).toContain(expectedClass);
          
          // Property: The HTML should have a <pre><code> structure
          expect(contentHtml).toContain('<pre>');
          expect(contentHtml).toContain('<code');
          expect(contentHtml).toContain('</code>');
          expect(contentHtml).toContain('</pre>');
          
          // Property: The code element should have the language class attribute
          const codeTagRegex = new RegExp(`<code[^>]*class="[^"]*${expectedClass}[^"]*"`);
          expect(codeTagRegex.test(contentHtml)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 9: Code block language badges - no language specified', async () => {
    // Generator for code content
    const codeContentArb = fc.string({ minLength: 1, maxLength: 200 });
    
    await fc.assert(
      fc.asyncProperty(
        codeContentArb,
        async (codeContent) => {
          // Create markdown with a code block that has NO specified language
          const markdown = `\`\`\`\n${codeContent}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Property: The HTML should still contain a <pre><code> structure
          expect(contentHtml).toContain('<pre>');
          expect(contentHtml).toContain('<code>');
          expect(contentHtml).toContain('</code>');
          expect(contentHtml).toContain('</pre>');
          
          // Property: When no language is specified, the code element should NOT have a language-* class
          // This is important because the CodeCopyProvider will detect this and show "code" badge
          const hasLanguageClass = /class="[^"]*language-[^"]*"/.test(contentHtml);
          expect(hasLanguageClass).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 9: Code block language badges - multiple code blocks', async () => {
    // Generator for multiple code blocks with different languages
    const codeBlockArb = fc.array(
      fc.record({
        language: fc.option(
          fc.constantFrom('typescript', 'python', 'bash', 'yaml', 'json'),
          { nil: undefined }
        ),
        content: fc.string({ minLength: 1, maxLength: 100 })
      }),
      { minLength: 1, maxLength: 5 }
    );
    
    await fc.assert(
      fc.asyncProperty(
        codeBlockArb,
        async (codeBlocks) => {
          // Create markdown with multiple code blocks
          const markdown = codeBlocks
            .map(block => {
              const lang = block.language || '';
              return `\`\`\`${lang}\n${block.content}\n\`\`\``;
            })
            .join('\n\n');
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Property: Each code block should be rendered
          const codeBlockCount = (contentHtml.match(/<code/g) || []).length;
          expect(codeBlockCount).toBe(codeBlocks.length);
          
          // Property: Each code block with a language should have the correct class
          codeBlocks.forEach(block => {
            if (block.language) {
              const expectedClass = `language-${block.language}`;
              expect(contentHtml).toContain(expectedClass);
            }
          });
          
          // Property: Count code blocks without language
          const blocksWithoutLanguage = codeBlocks.filter(b => !b.language).length;
          const codeTagsWithoutLanguage = contentHtml.match(/<code>(?!.*class)/g) || [];
          
          // At least some code blocks without language should not have a class attribute
          if (blocksWithoutLanguage > 0) {
            expect(codeTagsWithoutLanguage.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 9: Code block language badges - Kubernetes YAML special case', async () => {
    // Generator for Kubernetes-related languages
    const k8sLanguageArb = fc.constantFrom('yaml', 'kubernetes');
    const yamlContentArb = fc.string({ minLength: 1, maxLength: 200 });
    
    await fc.assert(
      fc.asyncProperty(
        k8sLanguageArb,
        yamlContentArb,
        async (language, yamlContent) => {
          // Create markdown with Kubernetes YAML code block
          const markdown = `\`\`\`${language}\n${yamlContent}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Property: The HTML should contain the language class
          const expectedClass = `language-${language}`;
          expect(contentHtml).toContain(expectedClass);
          
          // Property: The structure should be preserved (pre > code)
          expect(contentHtml).toContain('<pre>');
          expect(contentHtml).toContain('<code');
          
          // Property: The code element should have the correct language class
          const codeTagRegex = new RegExp(`<code[^>]*class="[^"]*${expectedClass}[^"]*"`);
          expect(codeTagRegex.test(contentHtml)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
