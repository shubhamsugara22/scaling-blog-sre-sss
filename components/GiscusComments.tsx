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

  useEffect(() => {
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
  }, [])

  return (
    <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10">
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
    </div>
  )
}
