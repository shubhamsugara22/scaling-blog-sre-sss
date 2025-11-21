# DevOps & SRE Blog

A simple, clean blog built with Next.js 14 for sharing DevOps and SRE knowledge.

## Features

- 📝 Markdown blog posts
- 🎨 Clean, modern UI with Tailwind CSS
- 🌙 Dark mode support
- 📱 Fully responsive
- ⚡ Fast with Next.js 14 App Router
- 🔍 Syntax highlighting for code blocks

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: remark, remark-html, rehype-highlight

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd devops-sre-blog
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

## Adding Blog Posts

Create markdown files in the `content/blog/` directory:

```markdown
---
title: "Your Post Title"
date: "2024-01-15"
tags: ["devops", "kubernetes"]
summary: "A brief summary of your post"
---

Your markdown content here...
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── blog/              # Blog post pages
│   └── til/               # Today I Learned pages
├── components/            # React components
├── content/              # Markdown content
│   ├── blog/            # Blog posts
│   └── til/             # TIL posts
└── lib/                  # Utility functions
    └── posts.ts         # Post loading logic
```

## Deploying to Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Vercel will auto-detect Next.js and deploy

That's it! Your blog is live.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License - feel free to use this for your own blog!
