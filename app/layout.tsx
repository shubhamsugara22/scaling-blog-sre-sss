import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Subscribe from '@/components/Subscribe'


export const metadata: Metadata = {
title: 'DevOps & SRE Blog',
description: 'Notes on DevOps, SRE & Infrastructure — with practical snippets and TILs',
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body className="min-h-dvh antialiased">
<Header />
<main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
<footer className="max-w-4xl mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
<Subscribe variant="inline" />
<p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
© {new Date().getFullYear()} DevOps & SRE Blog. All rights reserved.
</p>
</footer>
</body>
</html>
)
}