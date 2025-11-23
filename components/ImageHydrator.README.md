# ImageHydrator Component

## Overview

The `ImageHydrator` component is a client-side React component that enhances image handling in the blog by replacing static `<img>` tags with Next.js `<Image>` components for local images. This provides automatic image optimization, lazy loading, and better performance.

## How It Works

1. **Server-Side Processing**: During markdown processing, the `rehype-image-handler` plugin detects images and:
   - Marks local images with `data-next-image="true"` attribute
   - Adds `data-src` attribute with the image path
   - Preserves alt text for all images
   - Adds `loading="lazy"` for lazy loading
   - Marks Cloudinary images with `data-cloudinary="true"`

2. **Client-Side Hydration**: After the page loads, the `ImageHydrator` component:
   - Finds all images marked with `data-next-image="true"`
   - Replaces them with Next.js `<Image>` components
   - Applies optimization and responsive sizing

## Image Types Supported

### Local Images
Images stored in the `public` directory or relative paths:
```markdown
![Alt text](/images/my-image.jpg)
![Alt text](./relative-image.png)
```

These are automatically optimized using Next.js Image component.

### External Images
Images hosted on external domains:
```markdown
![Alt text](https://example.com/image.jpg)
```

These preserve their original URLs and add lazy loading.

### Cloudinary Images
Images hosted on Cloudinary CDN:
```markdown
![Alt text](https://res.cloudinary.com/demo/image/upload/sample.jpg)
```

These are marked with `data-cloudinary="true"` for potential future enhancements.

## Usage

The component is automatically included in blog post pages:

```tsx
import ImageHydrator from '@/components/ImageHydrator';

export default function PostPage() {
  return (
    <article>
      {/* Post content */}
      <ImageHydrator />
    </article>
  );
}
```

## Benefits

- **Automatic Optimization**: Local images are optimized by Next.js
- **Lazy Loading**: All images load lazily to improve performance
- **Alt Text Preservation**: Accessibility is maintained
- **Responsive Images**: Images adapt to different screen sizes
- **CDN Support**: Cloudinary and other CDN URLs are supported

## Technical Details

- Uses `react-dom/client` for mounting React components
- Runs only on the client side (marked with `'use client'`)
- Executes after initial page load via `useEffect`
- Replaces DOM nodes in place to maintain layout
