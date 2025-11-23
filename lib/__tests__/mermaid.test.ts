import { describe, it, expect } from 'vitest';
import { remark } from 'remark';
import html from 'remark-html';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeMermaid from 'rehype-mermaid';

/**
 * Unit tests for Mermaid diagram types
 * Requirements: 5.2
 * 
 * These tests verify that specific Mermaid diagram types (flowchart, sequence, architecture)
 * are correctly rendered by the markdown processing pipeline.
 */
describe('Mermaid Diagram Types', () => {
  /**
   * Helper function to process markdown with Mermaid diagrams
   */
  async function processMermaidMarkdown(markdown: string): Promise<string> {
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
    
    return String(rehypeProcessed);
  }

  describe('Flowchart rendering', () => {
    it('should render a simple flowchart diagram', async () => {
      const markdown = `# Test Flowchart

\`\`\`mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[End]
    C -->|No| B
\`\`\`

Text after diagram.`;

      const result = await processMermaidMarkdown(markdown);

      // Verify the diagram was converted (not a plain code block)
      expect(result).not.toContain('language-mermaid');
      
      // Verify diagram markup is present (SVG or mermaid div)
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"') ||
                                result.includes('data-mermaid');
      expect(hasDiagramMarkup).toBe(true);
      
      // Verify surrounding content is preserved
      expect(result).toContain('Test Flowchart');
      expect(result).toContain('Text after diagram');
    });

    it('should render a flowchart with different direction (LR)', async () => {
      const markdown = `\`\`\`mermaid
flowchart LR
    Start --> Middle --> End
\`\`\``;

      const result = await processMermaidMarkdown(markdown);

      // Verify conversion occurred
      expect(result).not.toContain('language-mermaid');
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"');
      expect(hasDiagramMarkup).toBe(true);
    });

    it('should render a flowchart with styled nodes', async () => {
      const markdown = `\`\`\`mermaid
flowchart TD
    A[Rectangle] --> B(Rounded)
    B --> C([Stadium])
    C --> D[[Subroutine]]
    D --> E[(Database)]
\`\`\``;

      const result = await processMermaidMarkdown(markdown);

      // Verify conversion occurred
      expect(result).not.toContain('language-mermaid');
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"');
      expect(hasDiagramMarkup).toBe(true);
    });
  });

  describe('Sequence diagram rendering', () => {
    it('should render a simple sequence diagram', async () => {
      const markdown = `# Sequence Diagram Test

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!
\`\`\`

End of test.`;

      const result = await processMermaidMarkdown(markdown);

      // Verify the diagram was converted
      expect(result).not.toContain('language-mermaid');
      
      // Verify diagram markup is present
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"') ||
                                result.includes('data-mermaid');
      expect(hasDiagramMarkup).toBe(true);
      
      // Verify surrounding content is preserved
      expect(result).toContain('Sequence Diagram Test');
      expect(result).toContain('End of test');
    });

    it('should render a sequence diagram with activation boxes', async () => {
      const markdown = `\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>+Server: Request
    Server-->>-Client: Response
\`\`\``;

      const result = await processMermaidMarkdown(markdown);

      // Verify conversion occurred
      expect(result).not.toContain('language-mermaid');
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"');
      expect(hasDiagramMarkup).toBe(true);
    });

    it('should render a sequence diagram with loops and alt blocks', async () => {
      const markdown = `\`\`\`mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Login
    alt successful login
        System->>User: Welcome
    else failed login
        System->>User: Error
    end
    loop Every minute
        System->>System: Check status
    end
\`\`\``;

      const result = await processMermaidMarkdown(markdown);

      // Verify conversion occurred
      expect(result).not.toContain('language-mermaid');
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"');
      expect(hasDiagramMarkup).toBe(true);
    });
  });

  describe('Architecture diagram rendering', () => {
    it('should render a graph diagram (architecture style)', async () => {
      const markdown = `# Architecture Diagram

\`\`\`mermaid
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Web Server 1]
    B --> D[Web Server 2]
    C --> E[Database]
    D --> E
\`\`\`

Architecture description.`;

      const result = await processMermaidMarkdown(markdown);

      // Verify the diagram was converted
      expect(result).not.toContain('language-mermaid');
      
      // Verify diagram markup is present
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"') ||
                                result.includes('data-mermaid');
      expect(hasDiagramMarkup).toBe(true);
      
      // Verify surrounding content is preserved
      expect(result).toContain('Architecture Diagram');
      expect(result).toContain('Architecture description');
    });

    it('should render a graph with subgraphs (for system components)', async () => {
      const markdown = `\`\`\`mermaid
graph TB
    subgraph Frontend
        A[React App]
        B[Static Assets]
    end
    subgraph Backend
        C[API Server]
        D[Worker]
    end
    subgraph Data
        E[PostgreSQL]
        F[Redis]
    end
    A --> C
    C --> E
    C --> F
    D --> E
\`\`\``;

      const result = await processMermaidMarkdown(markdown);

      // Verify conversion occurred
      expect(result).not.toContain('language-mermaid');
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"');
      expect(hasDiagramMarkup).toBe(true);
    });

    it('should render a C4 context diagram (architecture)', async () => {
      const markdown = `\`\`\`mermaid
graph TB
    User[User/Customer]
    System[Software System]
    ExtSystem1[External System 1]
    ExtSystem2[External System 2]
    
    User -->|Uses| System
    System -->|Reads from| ExtSystem1
    System -->|Writes to| ExtSystem2
\`\`\``;

      const result = await processMermaidMarkdown(markdown);

      // Verify conversion occurred
      expect(result).not.toContain('language-mermaid');
      const hasDiagramMarkup = result.includes('<svg') || 
                                result.includes('class="mermaid"');
      expect(hasDiagramMarkup).toBe(true);
    });
  });

  describe('Multiple diagram types in one document', () => {
    it('should render multiple different diagram types correctly', async () => {
      const markdown = `# Multiple Diagrams

## Flowchart

\`\`\`mermaid
flowchart TD
    A[Start] --> B[End]
\`\`\`

## Sequence

\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello
    Bob->>Alice: Hi
\`\`\`

## Architecture

\`\`\`mermaid
graph LR
    Client --> Server
    Server --> Database
\`\`\`

End of document.`;

      const result = await processMermaidMarkdown(markdown);

      // Verify all diagrams were converted
      expect(result).not.toContain('language-mermaid');
      
      // Count diagram markers
      const svgCount = (result.match(/<svg/g) || []).length;
      const mermaidDivCount = (result.match(/class="mermaid"/g) || []).length;
      const totalDiagrams = svgCount + mermaidDivCount;
      
      // Should have at least 3 diagrams (one for each type)
      expect(totalDiagrams).toBeGreaterThanOrEqual(3);
      
      // Verify all headings are preserved
      expect(result).toContain('Multiple Diagrams');
      expect(result).toContain('Flowchart');
      expect(result).toContain('Sequence');
      expect(result).toContain('Architecture');
      expect(result).toContain('End of document');
    });
  });
});
