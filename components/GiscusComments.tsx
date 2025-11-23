'use client'

import Giscus from '@giscus/react'
import { useEffect, useState } from 'react'

export interface GiscusConfig {
  repo: `${string}/${string}` // e.g., "username/repo"
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title'
  reactionsEnabled?: boolean
  emitMetadata?: boolean
  inputPosition?: 'top' | 'bottom'
  lang?: string
  loading?: 'lazy' | 'eager'
}

export default function GiscusComments({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  reactionsEnabled = true,
  emitMetadata = false,
  inputPosition = 'bottom',
  lang = 'en',
  loading = 'lazy',
}: GiscusConfig) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Validate required configuration
      if (!repo || !repoId || !category || !categoryId) {
        console.error('Giscus: Missing required configuration');
        setError('Comments configuration is incomplete');
        return;
      }

      // Check initial theme from localStorage and document class
      const isDark = 
        localStorage.getItem('theme') === 'dark' || 
        document.documentElement.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')

      // Listen for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isDark = document.documentElement.classList.contains('dark')
            setTheme(isDark ? 'dark' : 'light')
          }
        })
      })

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })

      return () => observer.disconnect()
    } catch (err) {
      console.error('Error initializing Giscus:', err);
      setError('Failed to initialize comments');
    }
  }, [repo, repoId, category, categoryId])

  if (error) {
    return (
      <section 
        className="mt-8 pt-8 border-t border-black/10 dark:border-white/10"
        aria-labelledby="comments-heading"
      >
        <h2 id="comments-heading" className="text-2xl font-bold mb-4">
          Comments
        </h2>
        <div className="border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-4 rounded-md" role="alert">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Comments Unavailable:</strong> {error}
          </p>
          <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
            Please check back later or contact the site administrator.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section 
      className="mt-8 pt-8 border-t border-black/10 dark:border-white/10"
      aria-labelledby="comments-heading"
    >
      <h2 id="comments-heading" className="text-2xl font-bold mb-4">
        Comments
      </h2>
      <Giscus
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping={mapping}
        reactionsEnabled={reactionsEnabled ? '1' : '0'}
        emitMetadata={emitMetadata ? '1' : '0'}
        inputPosition={inputPosition}
        theme={theme}
        lang={lang}
        loading={loading}
      />
    </section>
  )
}
