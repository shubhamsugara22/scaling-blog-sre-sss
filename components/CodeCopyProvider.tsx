'use client'
import { useEffect } from 'react'

export default function CodeCopyProvider() {
	useEffect(() => {
		const blocks = Array.from(document.querySelectorAll('pre > code')) as HTMLElement[]
		blocks.forEach((code) => {
			const pre = code.parentElement!
			if (pre.querySelector('.copy-btn')) return
			const btn = document.createElement('button')
			btn.textContent = 'Copy'
			btn.className = 'copy-btn absolute right-3 top-3 text-xs px-2 py-1 border rounded'
			btn.addEventListener('click', async () => {
				await navigator.clipboard.writeText(code.textContent || '')
				btn.textContent = 'Copied!'
				setTimeout(() => (btn.textContent = 'Copy'), 1500)
			})
			pre.classList.add('relative')
			pre.appendChild(btn)
		})
	}, [])
	return null
}
