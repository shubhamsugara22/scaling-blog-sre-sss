'use client'

import { TocHeading } from '@/lib/toc'
import { useState } from 'react'

export interface TableOfContentsProps {
  headings: TocHeading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Validate headings prop
  if (!headings || !Array.isArray(headings)) {
    console.warn('TableOfContents: Invalid headings prop');
    return null;
  }
  
  // Hide component if fewer than 3 headings (Requirement 2.3)
  if (headings.length < 3) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    
    try {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Update URL without triggering navigation
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', `#${id}`)
        }
        // Close TOC on mobile after clicking a link
        setIsOpen(false)
      } else {
        console.warn(`TableOfContents: Element with id "${id}" not found`);
      }
    } catch (error) {
      console.error('Error handling TOC link click:', error);
      // Fallback to default anchor behavior
      window.location.hash = id;
    }
  }

  return (
    <nav 
      className="toc-container mb-8 lg:mb-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
      aria-label="Table of Contents"
    >
      <div className="border border-black/10 dark:border-white/10 rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
        {/* Collapsible header for mobile (Requirement 10.3) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden w-full text-left p-4 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-expanded={isOpen}
          aria-controls="toc-content"
          type="button"
        >
          <span>Table of Contents</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Desktop header (always visible) */}
        <h2 className="hidden lg:block text-sm font-semibold uppercase tracking-wide p-4 pb-0 text-gray-700 dark:text-gray-300">
          Table of Contents
        </h2>
        
        {/* TOC content - collapsible on mobile, always visible on desktop */}
        <div
          id="toc-content"
          className={`${isOpen ? 'block' : 'hidden'} lg:block p-4 lg:pt-3`}
        >
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => {
              // Validate heading object
              if (!heading || !heading.id || !heading.text) {
                console.warn('TableOfContents: Invalid heading object', heading);
                return null;
              }
              
              return (
                <li
                  key={heading.id}
                  className={heading.level === 3 ? 'ml-4' : ''}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    className="block py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}
