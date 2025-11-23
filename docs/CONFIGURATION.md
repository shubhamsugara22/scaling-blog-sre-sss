# Configuration Guide

Complete configuration guide for the DevOps & SRE Blog platform.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Giscus Comments Setup](#giscus-comments-setup)
- [Next.js Configuration](#nextjs-configuration)
- [Tailwind CSS Customization](#tailwind-css-customization)
- [Markdown Processing](#markdown-processing)
- [Testing Configuration](#testing-configuration)
- [Deployment Configuration](#deployment-configuration)

## Environment Variables

Create a `.env.local` file in the root directory for local development:

```bash
# Copy the example file
cp .env.local.example .env.local
```

### Required Variables

```bash
# Giscus Comments Configuration
NEXT_PUBLIC_GISCUS_REPO=username/repository
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxx
```

### Optional Variables

```bash
# Analytics (if you add analytics later)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourblog.com
NEXT_PUBLIC_SITE_NAME=Your Blog Name

# Feature Flags
NEXT_PUBLIC_ENABLE_COMMENTS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Environment Variable Precedence

1. `.env.local` - Local overrides (not committed to git)
2. `.env.production` - Production defaults
3. `.env.development` - Development defaults
4. `.env` - Shared defaults

## Giscus Comments Setup

### Step-by-Step Configuration

#### 1. Enable GitHub Discussions

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Features** section
4. Check **Discussions**
5. Click **Set up discussions**
6. Customize the welcome post (optional)

#### 2. Install Giscus App

1. Visit https://github.com/apps/giscus
2. Click **Install**
3. Choose **Only select repositories**
4. Select your blog repository
5. Click **Install**

#### 3. Configure Giscus

1. Visit https://giscus.app
2. Fill in the configuration form:

**Repository:**
```
username/repository
```

**Page ↔️ Discussions Mapping:**
- Choose **pathname** (recommended)
- This maps each blog post URL to a unique discussion

**Discussion Category:**
- Choose **General** or create a new category like **Blog Comments**
- Use **Announcements** if you want only you to create discussions

**Features:**
- ✅ Enable reactions
- ✅ Emit discussion metadata
- Choose **Comment box above comments** or **below**

**Theme:**
- Choose a theme or use **Preferred color scheme**
- The blog automatically handles theme switching

3. Copy the generated values:

```html
<script src="https://giscus.app/client.js"
        data-repo="username/repo"
        data-repo-id="R_kgDOxxxxxxx"
        data-category="General"
        data-category-id="DIC_kwDOxxxxxxx"
        ...>
</script>
```

#### 4. Add to Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_GISCUS_REPO=username/repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxx
```

#### 5. Update Component (if needed)

The `GiscusComments` component in `app/blog/[slug]/page.tsx` should already be configured to use environment variables:

```tsx
<GiscusComments
  repo={process.env.NEXT_PUBLIC_GISCUS_REPO!}
  repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
  category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY!}
  categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
  mapping="pathname"
/>
```

#### 6. Test Locally

1. Start the development server:
```bash
npm run dev
```

2. Navigate to a blog post
3. Scroll to the comments section
4. Verify Giscus loads correctly
5. Try posting a test comment

#### 7. Deploy

When deploying to Vercel, Netlify, or other platforms:

1. Add environment variables in the platform's dashboard
2. Redeploy the site
3. Test comments on production

### Giscus Customization

#### Custom Theme

To use a custom theme, create a CSS file and host it:

```css
/* custom-giscus-theme.css */
:root {
  --color-primary: #0066cc;
  --color-background: #ffffff;
  --color-text: #24292e;
}
```

Then reference it in the component:

```tsx
<GiscusComments
  theme="https://yourdomain.com/custom-giscus-theme.css"
  ...
/>
```

#### Disable Comments on Specific Posts

Add to post frontmatter:

```markdown
---
title: "My Post"
comments: false
---
```

Then conditionally render:

```tsx
{post.meta.comments !== false && (
  <GiscusComments ... />
)}
```

## Next.js Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: [
      'res.cloudinary.com', // Cloudinary
      'images.unsplash.com', // Unsplash
      // Add other image domains here
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Markdown files as static assets
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },

  // Environment variables available to browser
  env: {
    SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'DevOps & SRE Blog',
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  // Redirects (optional)
  async redirects() {
    return [
      {
        source: '/posts/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## Tailwind CSS Customization

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // Add more custom colors
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            // Customize prose styles
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.primary.600'),
              '&:hover': {
                color: theme('colors.primary.700'),
              },
            },
            code: {
              color: theme('colors.pink.600'),
              backgroundColor: theme('colors.gray.100'),
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingTop: '2px',
              paddingBottom: '2px',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.primary.400'),
            },
            code: {
              color: theme('colors.pink.400'),
              backgroundColor: theme('colors.gray.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

### Custom CSS (app/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 dark:bg-gray-600 rounded;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400 dark:bg-gray-500;
  }
}

@layer components {
  /* Code block enhancements */
  .code-block {
    @apply relative rounded-lg overflow-hidden;
  }

  .language-badge {
    @apply absolute top-2 right-2 px-2 py-1 text-xs font-mono;
    @apply bg-gray-700 text-gray-100 rounded;
  }

  /* Mermaid diagram container */
  .mermaid {
    @apply flex justify-center my-8;
  }

  /* Table of contents */
  .toc-link {
    @apply text-gray-600 dark:text-gray-400 hover:text-primary-600;
    @apply dark:hover:text-primary-400 transition-colors;
  }

  .toc-link.active {
    @apply text-primary-600 dark:text-primary-400 font-medium;
  }
}

@layer utilities {
  /* Smooth scrolling */
  .scroll-smooth {
    scroll-behavior: smooth;
  }

  /* Focus visible styles */
  .focus-visible-ring {
    @apply focus-visible:outline-none focus-visible:ring-2;
    @apply focus-visible:ring-primary-500 focus-visible:ring-offset-2;
  }
}
```

## Markdown Processing

### Remark/Rehype Pipeline

The markdown processing pipeline is configured in `lib/posts.ts`:

```typescript
import { remark } from 'remark';
import html from 'remark-html';
import remarkMermaid from 'remark-mermaidjs';
import remarkAsciinema from './remark-asciinema';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeImageHandler from './rehype-image-handler';

const processor = remark()
  .use(remarkMermaid, {
    theme: 'default',
    // Mermaid configuration
  })
  .use(remarkAsciinema)
  .use(html, { sanitize: false })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'wrap',
    properties: {
      className: ['anchor-link'],
    },
  })
  .use(rehypeHighlight, {
    ignoreMissing: true,
  })
  .use(rehypeImageHandler);
```

### Custom Plugins

#### Mermaid Configuration

```typescript
.use(remarkMermaid, {
  theme: 'default',
  themeVariables: {
    primaryColor: '#0ea5e9',
    primaryTextColor: '#fff',
    primaryBorderColor: '#0284c7',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#e2e8f0',
  },
})
```

#### Syntax Highlighting

```typescript
.use(rehypeHighlight, {
  ignoreMissing: true,
  languages: {
    terraform: terraformLanguage,
    hcl: hclLanguage,
    // Add custom language definitions
  },
})
```

## Testing Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### vitest.setup.ts

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### Property-Based Testing

Configure fast-check in test files:

```typescript
import fc from 'fast-check';

// Configure for all tests
fc.configureGlobal({
  numRuns: 100, // Run each property 100 times
  verbose: true,
  seed: 42, // For reproducibility
});
```

## Deployment Configuration

### Vercel

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_GISCUS_REPO": "@giscus_repo",
    "NEXT_PUBLIC_GISCUS_REPO_ID": "@giscus_repo_id",
    "NEXT_PUBLIC_GISCUS_CATEGORY": "@giscus_category",
    "NEXT_PUBLIC_GISCUS_CATEGORY_ID": "@giscus_category_id"
  }
}
```

### Netlify

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/posts/*"
  to = "/blog/:splat"
  status = 301
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

## Performance Optimization

### Image Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};
```

### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

## Security Configuration

### Content Security Policy

Add to `next.config.js`:

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' giscus.app;
  frame-src giscus.app;
`;

async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
        },
      ],
    },
  ];
}
```

## Troubleshooting

### Build Errors

**Module not found:**
```bash
npm install
npm run build
```

**Type errors:**
```bash
npm run type-check
```

### Runtime Errors

**Hydration mismatch:**
- Check for client-only code in server components
- Use `'use client'` directive when needed

**Image optimization errors:**
- Verify image domains in `next.config.js`
- Check image paths are correct

### Performance Issues

**Slow build times:**
- Enable SWC minification
- Use `output: 'standalone'` in next.config.js
- Optimize images before adding to project

**Large bundle size:**
- Run bundle analyzer
- Use dynamic imports for heavy components
- Remove unused dependencies

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Giscus Documentation](https://giscus.app)
- [Vitest Documentation](https://vitest.dev)
- [fast-check Documentation](https://fast-check.dev)
