import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'


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
</body>
</html>
)
}