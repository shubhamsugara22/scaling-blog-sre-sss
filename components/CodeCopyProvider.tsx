'use client'
import { useEffect } from 'react'

export default function CodeCopyProvider() {
	useEffect(() => {
		try {
			const blocks = Array.from(document.querySelectorAll('pre > code')) as HTMLElement[]
			
			blocks.forEach((code) => {
				try {
					const pre = code.parentElement
					
					// Validate parent element exists
					if (!pre) {
						console.warn('Code block has no parent pre element');
						return;
					}
					
					// Skip if already enhanced
					if (pre.querySelector('.copy-btn')) return
					
					// Extract language from class name (e.g., "language-typescript" -> "typescript")
					const languageClass = Array.from(code.classList).find(cls => cls.startsWith('language-'))
					const language = languageClass ? languageClass.replace('language-', '') : 'code'
					
					// Check if it's Kubernetes YAML
					const isKubernetes = language === 'yaml' || language === 'kubernetes'
					
					// Add aria-label to pre element for screen readers
					pre.setAttribute('aria-label', `${language} code block`)
					
					// Create language badge (positioned in top-right)
					const badge = document.createElement('span')
					badge.textContent = language
					badge.className = `language-badge absolute right-16 sm:right-20 top-3 text-xs px-2 py-1 rounded font-mono ${
						isKubernetes 
							? 'bg-blue-600 text-white border border-blue-700' 
							: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
					}`
					badge.setAttribute('aria-hidden', 'true') // Hide from screen readers since pre has aria-label
					
					// Create copy button (positioned to the right of the language badge)
					// Touch-friendly sizing on mobile (Requirement 10.3)
					const btn = document.createElement('button')
					btn.textContent = 'Copy'
					btn.type = 'button'
					btn.className = 'copy-btn absolute right-3 top-3 text-xs px-2 py-1 sm:px-2 sm:py-1 border rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation min-h-[32px] min-w-[48px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
					btn.setAttribute('aria-label', `Copy ${language} code to clipboard`)
					btn.addEventListener('click', async () => {
						try {
							// Check if clipboard API is available
							if (!navigator.clipboard) {
								console.error('Clipboard API not available');
								btn.textContent = 'Error';
								setTimeout(() => {
									btn.textContent = 'Copy'
								}, 1500);
								return;
							}
							
							await navigator.clipboard.writeText(code.textContent || '')
							btn.textContent = 'Copied!'
							btn.setAttribute('aria-label', `${language} code copied to clipboard`)
							setTimeout(() => {
								btn.textContent = 'Copy'
								btn.setAttribute('aria-label', `Copy ${language} code to clipboard`)
							}, 1500)
						} catch (error) {
							console.error('Failed to copy code to clipboard:', error);
							btn.textContent = 'Error';
							setTimeout(() => {
								btn.textContent = 'Copy'
							}, 1500);
						}
					})
					
					// Make pre relative for absolute positioning
					pre.classList.add('relative')
					
					// Add padding to top to make room for badges
					pre.style.paddingTop = '2.5rem'
					
					// Append both badge and button
					pre.appendChild(badge)
					pre.appendChild(btn)
				} catch (error) {
					console.error('Error enhancing individual code block:', error);
					// Continue processing other code blocks
				}
			})
		} catch (error) {
			console.error('Error in CodeCopyProvider:', error);
			// Fail silently to not break the page
		}
	}, [])
	return null
}
