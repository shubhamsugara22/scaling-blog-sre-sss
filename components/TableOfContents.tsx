'use client'

import { TocHeading } from '@/lib/toc'

export interface TableOfContentsProps {
  headings: TocHeading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  // Hide component if fewer than 3 headings (Requirement 2.3)
  if (headings.length < 3) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Update URL without triggering navigation
      window.history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <nav 
      className="toc-container mb-8 lg:mb-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
      aria-label="Table of Contents"
    >
      <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-gray-700 dark:text-gray-300">
          Table of Contents
        </h2>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level === 3 ? 'ml-4' : ''}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className="block py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
