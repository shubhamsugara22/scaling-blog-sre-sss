import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { remark } from 'remark';
import html from 'remark-html';

/**
 * Feature: blog-enhancements, Property 11: Kubernetes YAML preservation
 * Validates: Requirements 8.1, 8.3, 8.4
 * 
 * For any code block with language "yaml" or "kubernetes", the rendered output 
 * should preserve the exact indentation and structure of the original YAML content.
 */
describe('Kubernetes YAML Preservation Property Tests', () => {
  /**
   * Helper function to extract code content from HTML
   */
  function extractCodeContent(html: string): string {
    const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
    if (!codeMatch) return '';
    
    // Decode HTML entities
    let content = codeMatch[1];
    content = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x26;/g, '&')  // Decode hex-encoded ampersand
      .replace(/&#x3C;/g, '<')  // Decode hex-encoded less-than
      .replace(/&#x3E;/g, '>'); // Decode hex-encoded greater-than
    
    return content;
  }

  /**
   * Helper function to normalize whitespace for comparison
   * Preserves line structure and indentation but handles HTML rendering quirks
   */
  function normalizeWhitespace(text: string): string {
    return text
      .split('\n')
      .map(line => line.trimEnd()) // Remove trailing spaces but keep leading
      .filter((line, index, arr) => {
        // Remove trailing empty lines (HTML rendering adds these)
        if (index === arr.length - 1 && line === '') return false;
        return true;
      })
      .join('\n')
      .trim();
  }

  it('Property 11: YAML code blocks preserve exact indentation', async () => {
    // Generator for YAML-like content with various indentation levels
    const yamlContentArb = fc.array(
      fc.record({
        indent: fc.integer({ min: 0, max: 8 }),
        key: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
        value: fc.oneof(
          fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
          fc.integer({ min: 0, max: 1000 }).map(n => n.toString()),
          fc.constant('true'),
          fc.constant('false')
        )
      }),
      { minLength: 1, maxLength: 10 }
    ).map(lines => 
      lines.map(line => ' '.repeat(line.indent * 2) + `${line.key}: ${line.value}`).join('\n')
    );

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('yaml', 'kubernetes'),
        yamlContentArb,
        async (language, yamlContent) => {
          // Create markdown with YAML code block
          const markdown = `\`\`\`${language}\n${yamlContent}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Extract the code content from HTML
          const extractedCode = extractCodeContent(contentHtml);
          
          // Property: The extracted code should match the original YAML content
          // We normalize whitespace to handle trailing spaces but preserve indentation
          const normalizedOriginal = normalizeWhitespace(yamlContent);
          const normalizedExtracted = normalizeWhitespace(extractedCode);
          
          expect(normalizedExtracted).toBe(normalizedOriginal);
          
          // Property: Each line's indentation should be preserved
          // Filter out trailing empty lines that HTML rendering may add
          const originalLines = yamlContent.split('\n').filter((line, idx, arr) => 
            idx < arr.length - 1 || line.trim() !== ''
          );
          const extractedLines = extractedCode.split('\n').filter((line, idx, arr) => 
            idx < arr.length - 1 || line.trim() !== ''
          );
          
          // Line count should match (allowing for HTML rendering quirks)
          expect(extractedLines.length).toBe(originalLines.length);
          
          // Check that indentation is preserved for each line
          for (let i = 0; i < Math.min(originalLines.length, extractedLines.length); i++) {
            const originalIndent = originalLines[i].match(/^(\s*)/)?.[1].length || 0;
            const extractedIndent = extractedLines[i].match(/^(\s*)/)?.[1].length || 0;
            
            expect(extractedIndent).toBe(originalIndent);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11: Kubernetes manifests preserve structure', async () => {
    // Generator for realistic Kubernetes manifest structures
    const k8sManifestArb = fc.record({
      apiVersion: fc.constantFrom('v1', 'apps/v1', 'batch/v1', 'networking.k8s.io/v1'),
      kind: fc.constantFrom('Pod', 'Deployment', 'Service', 'ConfigMap', 'Job'),
      name: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
      namespace: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
      replicas: fc.integer({ min: 1, max: 10 }),
      image: fc.constantFrom('nginx:latest', 'redis:alpine', 'postgres:14'),
      port: fc.integer({ min: 80, max: 9000 })
    }).map(data => `apiVersion: ${data.apiVersion}
kind: ${data.kind}
metadata:
  name: ${data.name}
  namespace: ${data.namespace}
spec:
  replicas: ${data.replicas}
  template:
    spec:
      containers:
      - name: ${data.name}
        image: ${data.image}
        ports:
        - containerPort: ${data.port}`);

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('yaml', 'kubernetes'),
        k8sManifestArb,
        async (language, manifest) => {
          // Create markdown with Kubernetes manifest
          const markdown = `\`\`\`${language}\n${manifest}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Extract the code content
          const extractedCode = extractCodeContent(contentHtml);
          
          // Property: The structure should be preserved
          const normalizedOriginal = normalizeWhitespace(manifest);
          const normalizedExtracted = normalizeWhitespace(extractedCode);
          
          expect(normalizedExtracted).toBe(normalizedOriginal);
          
          // Property: Key Kubernetes fields should be present and properly indented
          expect(extractedCode).toContain('apiVersion:');
          expect(extractedCode).toContain('kind:');
          expect(extractedCode).toContain('metadata:');
          expect(extractedCode).toContain('spec:');
          
          // Property: Nested fields should maintain their indentation
          const lines = extractedCode.split('\n');
          const metadataLineIndex = lines.findIndex(l => l.trim() === 'metadata:');
          const specLineIndex = lines.findIndex(l => l.trim() === 'spec:');
          
          if (metadataLineIndex >= 0 && metadataLineIndex + 1 < lines.length) {
            const metadataIndent = lines[metadataLineIndex].match(/^(\s*)/)?.[1].length || 0;
            const nextLineIndent = lines[metadataLineIndex + 1].match(/^(\s*)/)?.[1].length || 0;
            
            // The line after 'metadata:' should be more indented
            expect(nextLineIndent).toBeGreaterThan(metadataIndent);
          }
          
          if (specLineIndex >= 0 && specLineIndex + 1 < lines.length) {
            const specIndent = lines[specLineIndex].match(/^(\s*)/)?.[1].length || 0;
            const nextLineIndent = lines[specLineIndex + 1].match(/^(\s*)/)?.[1].length || 0;
            
            // The line after 'spec:' should be more indented
            expect(nextLineIndent).toBeGreaterThan(specIndent);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11: Complex nested YAML structures preserve indentation', async () => {
    // Generator for deeply nested YAML structures
    const nestedYamlArb = fc.integer({ min: 2, max: 5 }).chain(depth => {
      let yaml = '';
      for (let i = 0; i < depth; i++) {
        const indent = ' '.repeat(i * 2);
        yaml += `${indent}level${i}:\n`;
        yaml += `${indent}  key${i}: value${i}\n`;
      }
      return fc.constant(yaml.trimEnd());
    });

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('yaml', 'kubernetes'),
        nestedYamlArb,
        async (language, yamlContent) => {
          // Create markdown with nested YAML
          const markdown = `\`\`\`${language}\n${yamlContent}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Extract the code content
          const extractedCode = extractCodeContent(contentHtml);
          
          // Property: Exact indentation should be preserved
          // Filter out trailing empty lines that HTML rendering may add
          const originalLines = yamlContent.split('\n').filter((line, idx, arr) => 
            idx < arr.length - 1 || line.trim() !== ''
          );
          const extractedLines = extractedCode.split('\n').filter((line, idx, arr) => 
            idx < arr.length - 1 || line.trim() !== ''
          );
          
          expect(extractedLines.length).toBe(originalLines.length);
          
          // Check each line's indentation precisely
          for (let i = 0; i < Math.min(originalLines.length, extractedLines.length); i++) {
            const originalLine = originalLines[i];
            const extractedLine = extractedLines[i];
            
            // Count leading spaces
            const originalSpaces = originalLine.match(/^(\s*)/)?.[1].length || 0;
            const extractedSpaces = extractedLine.match(/^(\s*)/)?.[1].length || 0;
            
            expect(extractedSpaces).toBe(originalSpaces);
            
            // Content after spaces should match
            expect(extractedLine.trim()).toBe(originalLine.trim());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11: YAML with special characters preserves structure', async () => {
    // Generator for YAML with special characters that might be HTML-encoded
    const specialYamlArb = fc.record({
      key1: fc.constant('command'),
      value1: fc.constantFrom(
        'echo "Hello World"',
        'curl -X GET http://example.com',
        'grep -r "pattern" /path',
        'sed -i "s/old/new/g" file.txt'
      ),
      key2: fc.constant('env'),
      value2: fc.constantFrom(
        'KEY=value',
        'PATH=/usr/bin:/bin',
        'URL=https://example.com?param=value&other=123'
      )
    }).map(data => `${data.key1}: ${data.value1}
${data.key2}: ${data.value2}`);

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('yaml', 'kubernetes'),
        specialYamlArb,
        async (language, yamlContent) => {
          // Create markdown with YAML containing special characters
          const markdown = `\`\`\`${language}\n${yamlContent}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Extract the code content
          const extractedCode = extractCodeContent(contentHtml);
          
          // Property: Content should be preserved (HTML entities decoded)
          const normalizedOriginal = normalizeWhitespace(yamlContent);
          const normalizedExtracted = normalizeWhitespace(extractedCode);
          
          expect(normalizedExtracted).toBe(normalizedOriginal);
          
          // Property: Special characters should be present
          if (yamlContent.includes('"')) {
            expect(extractedCode).toContain('"');
          }
          if (yamlContent.includes('&')) {
            expect(extractedCode).toContain('&');
          }
          if (yamlContent.includes('<') || yamlContent.includes('>')) {
            expect(extractedCode).toContain('<') || expect(extractedCode).toContain('>');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11: Multi-document YAML preserves separators and structure', async () => {
    // Generator for multi-document YAML (common in Kubernetes)
    const multiDocYamlArb = fc.array(
      fc.record({
        apiVersion: fc.constantFrom('v1', 'apps/v1'),
        kind: fc.constantFrom('Service', 'Deployment', 'ConfigMap'),
        name: fc.stringMatching(/^[a-z][a-z0-9-]*$/)
      }),
      { minLength: 2, maxLength: 3 }
    ).map(docs => 
      docs.map(doc => `apiVersion: ${doc.apiVersion}
kind: ${doc.kind}
metadata:
  name: ${doc.name}`).join('\n---\n')
    );

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('yaml', 'kubernetes'),
        multiDocYamlArb,
        async (language, yamlContent) => {
          // Create markdown with multi-document YAML
          const markdown = `\`\`\`${language}\n${yamlContent}\n\`\`\``;
          
          // Process markdown to HTML
          const processed = await remark()
            .use(html, { sanitize: false })
            .process(markdown);
          
          const contentHtml = String(processed);
          
          // Extract the code content
          const extractedCode = extractCodeContent(contentHtml);
          
          // Property: Document separators should be preserved
          const originalSeparators = (yamlContent.match(/^---$/gm) || []).length;
          const extractedSeparators = (extractedCode.match(/^---$/gm) || []).length;
          
          expect(extractedSeparators).toBe(originalSeparators);
          
          // Property: Overall structure should be preserved
          const normalizedOriginal = normalizeWhitespace(yamlContent);
          const normalizedExtracted = normalizeWhitespace(extractedCode);
          
          expect(normalizedExtracted).toBe(normalizedOriginal);
        }
      ),
      { numRuns: 100 }
    );
  });
});
