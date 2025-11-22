'use client'
import { useEffect } from 'react'

export default function CodeCopyProvider() {
	useEffect(() => {
		const blocks = Array.from(document.querySelectorAll('pre > code')) as HTMLElement[]
		blocks.forEach((code) => {
			const pre = code.parentElement!
			
			// Skip if already enhanced
			if (pre.querySelector('.copy-btn')) return
			
			// Extract language from class name (e.g., "language-typescript" -> "typescript")
			const languageClass = Array.from(code.classList).find(cls => cls.startsWith('language-'))
			const language = languageClass ? languageClass.replace('language-', '') : 'code'
			
			// Check if it's Kubernetes YAML
			const isKubernetes = language === 'yaml' || language === 'kubernetes'
			
			// Create language badge (positioned in top-right)
			const badge = document.createElement('span')
			badge.textContent = language
			badge.className = `language-badge absolute right-20 top-3 text-xs px-2 py-1 rounded font-mono ${
				isKubernetes 
					? 'bg-blue-600 text-white border border-blue-700' 
					: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
			}`
			
			// Create copy button (positioned to the right of the language badge)
			const btn = document.createElement('button')
			btn.textContent = 'Copy'
			btn.className = 'copy-btn absolute right-3 top-3 text-xs px-2 py-1 border rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
			btn.addEventListener('click', async () => {
				await navigator.clipboard.writeText(code.textContent || '')
				btn.textContent = 'Copied!'
				setTimeout(() => (btn.textContent = 'Copy'), 1500)
			})
			
			// Make pre relative for absolute positioning
			pre.classList.add('relative')
			
			// Add padding to top to make room for badges
			pre.style.paddingTop = '2.5rem'
			
			// Append both badge and button
			pre.appendChild(badge)
			pre.appendChild(btn)
		})
	}, [])
	return null
}
