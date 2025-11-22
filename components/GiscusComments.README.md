# GiscusComments Component

A React component that integrates GitHub Discussions-based comments using Giscus.

## Features

- ✅ GitHub Discussions integration
- ✅ Automatic theme switching (light/dark mode)
- ✅ Responsive design
- ✅ Configurable mapping strategies
- ✅ Lazy loading support

## Configuration

### Step 1: Enable GitHub Discussions

1. Go to your GitHub repository
2. Navigate to Settings → General
3. Scroll to "Features" section
4. Enable "Discussions"

### Step 2: Install Giscus App

1. Visit https://github.com/apps/giscus
2. Click "Install"
3. Select your repository

### Step 3: Get Configuration Values

1. Visit https://giscus.app
2. Enter your repository name (e.g., `username/repo`)
3. Select a discussions category (e.g., "General" or "Announcements")
4. Choose mapping strategy (recommended: `pathname`)
5. Copy the generated configuration values:
   - `data-repo`
   - `data-repo-id`
   - `data-category`
   - `data-category-id`

### Step 4: Use the Component

```tsx
import GiscusComments from '@/components/GiscusComments'

export default function BlogPost() {
  return (
    <article>
      {/* Your blog post content */}
      
      <GiscusComments
        repo="username/repo"
        repoId="R_kgDOxxxxxxx"
        category="General"
        categoryId="DIC_kwDOxxxxxxx"
        mapping="pathname"
      />
    </article>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `repo` | `string` | **required** | GitHub repository in format `owner/repo` |
| `repoId` | `string` | **required** | GitHub repository ID |
| `category` | `string` | **required** | Discussions category name |
| `categoryId` | `string` | **required** | Discussions category ID |
| `mapping` | `'pathname' \| 'url' \| 'title' \| 'og:title'` | `'pathname'` | How to map pages to discussions |
| `reactionsEnabled` | `boolean` | `true` | Enable reactions on comments |
| `emitMetadata` | `boolean` | `false` | Emit discussion metadata |
| `inputPosition` | `'top' \| 'bottom'` | `'bottom'` | Position of comment input box |
| `lang` | `string` | `'en'` | Language code |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Loading strategy |

## Theme Switching

The component automatically detects and responds to theme changes:

- Reads initial theme from `localStorage` and document class
- Listens for changes to the `dark` class on `<html>` element
- Updates Giscus theme in real-time

## Styling

The component includes:
- Top margin and padding for separation from content
- Border separator matching blog design
- Responsive container that adapts to parent width

## Example with Environment Variables

For better security, store configuration in environment variables:

```tsx
// .env.local
NEXT_PUBLIC_GISCUS_REPO=username/repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxx
```

```tsx
// Usage
<GiscusComments
  repo={process.env.NEXT_PUBLIC_GISCUS_REPO!}
  repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
  category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY!}
  categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
/>
```

## Requirements Validated

- ✅ **Requirement 3.1**: Embeds Giscus commenting widget at bottom of post
- ✅ **Requirement 3.2**: Uses GitHub Discussions for comment storage
- ✅ **Requirement 3.4**: Applies theme settings matching blog design
