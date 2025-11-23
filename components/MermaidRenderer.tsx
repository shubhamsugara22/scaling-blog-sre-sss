'use client'

import { useEffect, useRef, useState } from 'react'

export interface MermaidRendererProps {
  chart: string
  id?: string
}

export default function MermaidRenderer({ chart, id }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const renderMermaid = async () => {
      try {
        setIsLoading(true)
        setError(null)

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

        if (!isMounted || !containerRef.current) return

        // Generate unique ID for this diagram
        const diagramId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, chart)

        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
          setIsLoading(false)
        }
      }
    }

    renderMermaid()

    return () => {
      isMounted = false
    }
  }, [chart, id])

  if (error) {
    return (
      <div className="my-4 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">
          Mermaid Diagram Error
        </p>
        <pre className="text-xs text-red-500 dark:text-red-300 overflow-x-auto">
          {error}
        </pre>
        <details className="mt-2">
          <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
            Show diagram source
          </summary>
          <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
            {chart}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className="my-6 flex justify-center">
      <div
        ref={containerRef}
        className={`mermaid-diagram ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`}
        style={{ maxWidth: '100%', overflow: 'auto' }}
      >
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        )}
      </div>
    </div>
  )
}
