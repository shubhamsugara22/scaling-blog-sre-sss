import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import rehypeImageHandler from '../rehype-image-handler';

/**
 * Feature: blog-enhancements, Property 6: Image rendering with attributes
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 * 
 * For any markdown image, the rendered output should preserve the alt text and include 
 * either Next.js Image optimization attributes (for local images) or the original URL 
 * (for external images like Cloudinary).
 */
describe('Image Rendering Property Tests', () => {
  it('Property 6: Image rendering with attributes', async () => {
    // Generator for alt text (can be empty or contain text)
    // Use only safe characters that won't be HTML-encoded or break markdown
    const altTextGen = fc.oneof(
      fc.constant(''),
      fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{1,100}$/)
    );
    
    // Generator for local image paths - must be valid file paths
    const localImageGen = fc.oneof(
      fc.constant('/test-image.jpg'),
      fc.constant('/images/photo.png'),
      fc.constant('/relative/path/image.gif'),
      fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}$/)
        .map(s => `/${s}.jpg`)
    );
    
    // Generator for external image URLs - must be valid URLs
    const externalImageGen = fc.oneof(
      fc.constant('https://example.com/image.png'),
      fc.constant('http://test.org/photo.jpg'),
      fc.stringMatching(/^[a-zA-Z0-9_-]{5,20}$/)
        .map(s => `https://example.com/${s}.png`)
    );
    
    // Generator for Cloudinary URLs
    const cloudinaryImageGen = fc.oneof(
      fc.constant('https://res.cloudinary.com/demo/image/upload/sample.jpg'),
      fc.constant('https://cloudinary.com/test/image.png'),
      fc.stringMatching(/^[a-zA-Z0-9_-]{5,20}$/)
        .map(s => `https://res.cloudinary.com/demo/${s}.jpg`)
    );
    
    // Generator for any image URL (local or external)
    const imageUrlGen = fc.oneof(
      localImageGen,
      externalImageGen,
      cloudinaryImageGen
    );
    
    await fc.assert(
      fc.asyncProperty(
        imageUrlGen,
        altTextGen,
        async (imageUrl, altText) => {
          // Create markdown with the image
          const markdown = `![${altText}](${imageUrl})`;
          
          // Process through the markdown pipeline with our image handler
          const { remark } = await import('remark');
          const html = await import('remark-html');
          const { unified } = await import('unified');
          const rehypeParse = (await import('rehype-parse')).default;
          const rehypeStringify = (await import('rehype-stringify')).default;
          
          // First convert markdown to HTML
          const remarkProcessed = await remark()
            .use(html.default, { sanitize: false })
            .process(markdown);
          
          const htmlContent = String(remarkProcessed);
          
          // Then apply rehype plugins including our image handler
          const rehypeProcessed = await unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeImageHandler)
            .use(rehypeStringify)
            .process(htmlContent);
          
          const finalHtml = String(rehypeProcessed);
          
          // Determine if the image is local or external
          const isLocal = !imageUrl.startsWith('http://') && 
                         !imageUrl.startsWith('https://') && 
                         !imageUrl.startsWith('//');
          const isCloudinary = imageUrl.includes('cloudinary.com');
          
          // Property 1: Alt text must be preserved
          expect(finalHtml).toContain(`alt="${altText}"`);
          
          // Property 2: Image must have lazy loading
          expect(finalHtml).toContain('loading="lazy"');
          
          if (isLocal) {
            // Property 3: Local images must have Next.js Image optimization attributes
            expect(finalHtml).toContain('data-next-image="true"');
            expect(finalHtml).toContain(`data-src="${imageUrl}"`);
            
            // Property 4: Local images must have width and height attributes
            expect(finalHtml).toMatch(/width="\d+"/);
            expect(finalHtml).toMatch(/height="\d+"/);
          } else {
            // Property 5: External images must preserve the original URL
            expect(finalHtml).toContain(`src="${imageUrl}"`);
            
            // Property 6: Cloudinary images should be marked
            if (isCloudinary) {
              expect(finalHtml).toContain('data-cloudinary="true"');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 6b: Multiple images preserve individual attributes', async () => {
    // Test that multiple images in the same document each preserve their attributes
    const imageGen = fc.tuple(
      fc.constantFrom('/local1.jpg', 'https://example.com/ext1.png', 'https://res.cloudinary.com/test.jpg'),
      fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{0,50}$/)
    );
    
    await fc.assert(
      fc.asyncProperty(
        fc.array(imageGen, { minLength: 1, maxLength: 5 }),
        async (images) => {
          // Create markdown with multiple images
          const markdown = images
            .map(([url, alt]) => `![${alt}](${url})`)
            .join('\n\n');
          
          // Process through the markdown pipeline
          const { remark } = await import('remark');
          const html = await import('remark-html');
          const { unified } = await import('unified');
          const rehypeParse = (await import('rehype-parse')).default;
          const rehypeStringify = (await import('rehype-stringify')).default;
          
          // First convert markdown to HTML
          const remarkProcessed = await remark()
            .use(html.default, { sanitize: false })
            .process(markdown);
          
          const htmlContent = String(remarkProcessed);
          
          // Then apply rehype plugins
          const rehypeProcessed = await unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeImageHandler)
            .use(rehypeStringify)
            .process(htmlContent);
          
          const finalHtml = String(rehypeProcessed);
          
          // Property: Each image must preserve its own attributes
          for (const [url, alt] of images) {
            const isLocal = !url.startsWith('http://') && 
                           !url.startsWith('https://') && 
                           !url.startsWith('//');
            
            // Alt text must be preserved
            expect(finalHtml).toContain(`alt="${alt}"`);
            
            if (isLocal) {
              // Local images must have optimization attributes
              expect(finalHtml).toContain('data-next-image="true"');
              expect(finalHtml).toContain(`data-src="${url}"`);
            } else {
              // External images must preserve URL
              expect(finalHtml).toContain(`src="${url}"`);
            }
          }
          
          // Property: All images must have lazy loading
          const imgCount = (finalHtml.match(/<img/g) || []).length;
          const lazyCount = (finalHtml.match(/loading="lazy"/g) || []).length;
          expect(lazyCount).toBe(imgCount);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 6c: Image attributes are consistent across processing', async () => {
    // Test that processing the same image multiple times produces consistent results
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/test.jpg', 'https://example.com/test.png', 'https://res.cloudinary.com/test.jpg'),
        fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{0,50}$/),
        async (url, alt) => {
          const markdown = `![${alt}](${url})`;
          
          const { remark } = await import('remark');
          const html = await import('remark-html');
          const { unified } = await import('unified');
          const rehypeParse = (await import('rehype-parse')).default;
          const rehypeStringify = (await import('rehype-stringify')).default;
          
          // Process the same markdown twice
          const remarkProcessed1 = await remark()
            .use(html.default, { sanitize: false })
            .process(markdown);
          
          const rehypeProcessed1 = await unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeImageHandler)
            .use(rehypeStringify)
            .process(String(remarkProcessed1));
          
          const html1 = String(rehypeProcessed1);
          
          const remarkProcessed2 = await remark()
            .use(html.default, { sanitize: false })
            .process(markdown);
          
          const rehypeProcessed2 = await unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeImageHandler)
            .use(rehypeStringify)
            .process(String(remarkProcessed2));
          
          const html2 = String(rehypeProcessed2);
          
          // Property: Processing should be deterministic
          expect(html1).toBe(html2);
        }
      ),
      { numRuns: 50 }
    );
  });
});
