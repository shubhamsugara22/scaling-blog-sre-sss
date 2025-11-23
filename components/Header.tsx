'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
	const [dark, setDark] = useState(false)

	useEffect(() => {
		const initial = localStorage.getItem('theme') === 'dark'
		setDark(initial)
		document.documentElement.classList.toggle('dark', initial)
	}, [])

	const toggle = () => {
		const next = !dark
		setDark(next)
		document.documentElement.classList.toggle('dark', next)
		localStorage.setItem('theme', next ? 'dark' : 'light')
	}

	return (
		<header className="w-full sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/30 border-b border-black/5 z-50">
			<div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
				<Link href="/" className="font-bold text-lg">
					DevOps & SRE
				</Link>
				<nav className="flex items-center gap-5 text-sm" aria-label="Main navigation">
					<Link href="/til">TIL</Link>
					<Link href="/about">About</Link>
					<button 
						onClick={toggle} 
						className="px-3 py-1 rounded-xl border text-xs"
						aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
						aria-pressed={dark}
					>
						{dark ? 'Light' : 'Dark'}
					</button>
				</nav>
			</div>
		</header>
	)
}