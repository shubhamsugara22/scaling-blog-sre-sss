import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

/**
 * Rehype plugin to transform Mermaid code blocks into custom component placeholders
 * that will be hydrated on the client side
 */
export default function rehypeMermaidComponent() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      // Look for <pre><code class="language-mermaid">...</code></pre>
      if (
        node.tagName === 'pre' &&
        node.children &&
        node.children.length > 0
      ) {
        const codeNode = node.children[0] as Element
        
        if (
          codeNode.type === 'element' &&
          codeNode.tagName === 'code' &&
          codeNode.properties &&
          Array.isArray(codeNode.properties.className)
        ) {
          const classes = codeNode.properties.className as string[]
          const isMermaid = classes.some(
            (cls) => cls === 'language-mermaid' || cls === 'mermaid'
          )

          if (isMermaid && codeNode.children && codeNode.children.length > 0) {
            // Extract the mermaid code
            const textNode = codeNode.children[0]
            if (textNode.type === 'text') {
              const mermaidCode = textNode.value

              // Create a placeholder div that will be replaced by the React component
              // We use a data attribute to store the mermaid code
              const placeholderNode: Element = {
                type: 'element',
                tagName: 'div',
                properties: {
                  className: ['mermaid-placeholder'],
                  'data-mermaid': mermaidCode,
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'pre',
                    properties: {
                      className: ['mermaid-loading'],
                    },
                    children: [
                      {
                        type: 'text',
                        value: 'Loading diagram...',
                      },
                    ],
                  },
                ],
              }

              // Replace the pre node with our placeholder
              if (parent && typeof index === 'number') {
                parent.children[index] = placeholderNode
              }
            }
          }
        }
      }
    })
  }
}
