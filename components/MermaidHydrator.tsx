'use client'

import { useEffect } from 'react'

/**
 * Client component that finds all mermaid placeholders and renders them
 * using the mermaid library directly
 */
export default function MermaidHydrator() {
  useEffect(() => {
    let isMounted = true

    const renderMermaidDiagrams = async () => {
      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#2563eb',
            lineColor: '#6b7280',
            secondaryColor: '#10b981',
            tertiaryColor: '#f59e0b',
          },
        })

        // Find all mermaid placeholder divs
        const placeholders = document.querySelectorAll('.mermaid-placeholder:not([data-processed])')
        
        for (let i = 0; i < placeholders.length; i++) {
          const placeholder = placeholders[i]
          const mermaidCode = placeholder.getAttribute('data-mermaid')
          
          if (mermaidCode && placeholder instanceof HTMLElement && isMounted) {
            try {
              // Generate unique ID for this diagram
              const diagramId = `mermaid-${Math.random().toString(36).substr(2, 9)}`
              
              // Render the diagram
              const { svg } = await mermaid.render(diagramId, mermaidCode)
              
              if (isMounted) {
                // Replace placeholder content with rendered SVG
                placeholder.innerHTML = svg
                placeholder.setAttribute('data-processed', 'true')
                placeholder.classList.add('mermaid-rendered')
              }
            } catch (err) {
              console.error('Mermaid rendering error:', err)
              if (isMounted) {
                // Show error message
                placeholder.innerHTML = `
                  <div class="my-4 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p class="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">
                      Mermaid Diagram Error
                    </p>
                    <pre class="text-xs text-red-500 dark:text-red-300 overflow-x-auto">${err instanceof Error ? err.message : 'Failed to render diagram'}</pre>
                    <details class="mt-2">
                      <summary class="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                        Show diagram source
                      </summary>
                      <pre class="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">${mermaidCode}</pre>
                    </details>
                  </div>
                `
                placeholder.setAttribute('data-processed', 'true')
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading Mermaid library:', err)
      }
    }

    renderMermaidDiagrams()

    return () => {
      isMounted = false
    }
  }, [])

  return null
}
