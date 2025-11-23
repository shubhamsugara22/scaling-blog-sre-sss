import { visit } from 'unist-util-visit';
import type { Root, Code, Html } from 'mdast';

/**
 * Remark plugin to transform Asciinema code blocks into HTML placeholders
 * that will be replaced with the AsciinemaPlayer component on the client side.
 * 
 * Supports two syntaxes:
 * 1. Code block with language "asciinema":
 *    ```asciinema
 *    cast-id: 123456
 *    theme: monokai
 *    speed: 1.5
 *    ```
 * 
 * 2. Shortcode syntax:
 *    [asciinema:123456]
 *    [asciinema:123456:monokai:1.5]
 */
export default function remarkAsciinema() {
  return (tree: Root) => {
    try {
      visit(tree, 'code', (node: Code, index, parent) => {
        if (node.lang === 'asciinema') {
          try {
            // Parse the code block content for configuration
            const config = parseAsciinemaConfig(node.value);
            
            if (config.castId) {
              // Replace the code block with an HTML node containing a data attribute
              const htmlNode: Html = {
                type: 'html',
                value: createAsciinemaHtml(config),
              };
              
              if (parent && typeof index === 'number') {
                parent.children[index] = htmlNode;
              }
            } else {
              console.warn('Asciinema code block missing cast-id');
              // Keep the original code block with an error message
              const errorNode: Html = {
                type: 'html',
                value: '<div class="asciinema-error"><p><strong>Error:</strong> Asciinema block missing cast-id</p></div>',
              };
              if (parent && typeof index === 'number') {
                parent.children[index] = errorNode;
              }
            }
          } catch (error) {
            console.error('Error processing Asciinema code block:', error);
            // Keep original code block on error
          }
        }
      });

      // Also handle shortcode syntax [asciinema:123456]
      visit(tree, 'text', (node, index, parent) => {
        try {
          const text = node.value;
          const shortcodeRegex = /\[asciinema:([^\]]+)\]/g;
          
          if (shortcodeRegex.test(text)) {
            const parts: any[] = [];
            let lastIndex = 0;
            
            text.replace(shortcodeRegex, (match, params, offset) => {
              try {
                // Add text before the shortcode
                if (offset > lastIndex) {
                  parts.push({
                    type: 'text',
                    value: text.slice(lastIndex, offset),
                  });
                }
                
                // Parse shortcode parameters
                const paramParts = params.split(':');
                const castId = paramParts[0];
                
                if (!castId) {
                  console.warn('Asciinema shortcode missing cast ID');
                  parts.push({
                    type: 'text',
                    value: match, // Keep original text
                  });
                } else {
                  const config = {
                    castId,
                    theme: paramParts[1] || 'monokai',
                    speed: paramParts[2] ? parseFloat(paramParts[2]) : 1,
                  };
                  
                  // Add HTML node for Asciinema player
                  parts.push({
                    type: 'html',
                    value: createAsciinemaHtml(config),
                  });
                }
                
                lastIndex = offset + match.length;
              } catch (error) {
                console.error('Error processing Asciinema shortcode:', error);
                // Keep original text on error
                parts.push({
                  type: 'text',
                  value: match,
                });
                lastIndex = offset + match.length;
              }
              return match;
            });
            
            // Add remaining text
            if (lastIndex < text.length) {
              parts.push({
                type: 'text',
                value: text.slice(lastIndex),
              });
            }
            
            // Replace the text node with the parts
            if (parent && typeof index === 'number' && parts.length > 0) {
              parent.children.splice(index, 1, ...parts);
            }
          }
        } catch (error) {
          console.error('Error processing text node for Asciinema shortcodes:', error);
          // Keep original text node on error
        }
      });
    } catch (error) {
      console.error('Fatal error in remarkAsciinema plugin:', error);
      // Don't modify tree on fatal error
    }
  };
}

interface AsciinemaConfig {
  castId: string;
  theme?: string;
  speed?: number;
  autoPlay?: boolean;
  loop?: boolean;
  cols?: number;
  rows?: number;
}

function parseAsciinemaConfig(content: string): AsciinemaConfig {
  const config: AsciinemaConfig = { castId: '' };
  
  const lines = content.trim().split('\n');
  for (const line of lines) {
    const [key, value] = line.split(':').map(s => s.trim());
    
    switch (key) {
      case 'cast-id':
      case 'castId':
        config.castId = value;
        break;
      case 'theme':
        config.theme = value;
        break;
      case 'speed':
        config.speed = parseFloat(value);
        break;
      case 'autoPlay':
      case 'auto-play':
        config.autoPlay = value === 'true';
        break;
      case 'loop':
        config.loop = value === 'true';
        break;
      case 'cols':
        config.cols = parseInt(value, 10);
        break;
      case 'rows':
        config.rows = parseInt(value, 10);
        break;
    }
  }
  
  return config;
}

function createAsciinemaHtml(config: AsciinemaConfig): string {
  const attrs = [
    `data-cast-id="${config.castId}"`,
    config.theme ? `data-theme="${config.theme}"` : '',
    config.speed ? `data-speed="${config.speed}"` : '',
    config.autoPlay ? `data-auto-play="true"` : '',
    config.loop ? `data-loop="true"` : '',
    config.cols ? `data-cols="${config.cols}"` : '',
    config.rows ? `data-rows="${config.rows}"` : '',
  ].filter(Boolean).join(' ');
  
  return `<div class="asciinema-embed" ${attrs}></div>`;
}
