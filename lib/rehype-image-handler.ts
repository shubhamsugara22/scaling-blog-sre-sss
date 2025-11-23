import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

/**
 * Rehype plugin to enhance image handling
 * - Detects local vs external images
 * - Transforms local images to use Next.js Image component
 * - Preserves alt text for all images
 * - Adds lazy loading attributes
 * - Supports Cloudinary URLs for external images
 */
export default function rehypeImageHandler() {
	return (tree: Root) => {
		visit(tree, 'element', (node: Element) => {
			if (node.tagName === 'img') {
				try {
					const src = node.properties?.src as string | undefined;
					const alt = node.properties?.alt as string | undefined;
					
					// Handle missing src attribute
					if (!src) {
						console.warn('Image found without src attribute');
						// Add error placeholder
						node.properties = {
							...node.properties,
							src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E',
							alt: alt || 'Missing image',
							'data-error': 'missing-src',
						};
						return;
					}
					
					// Warn if alt text is missing (accessibility)
					if (!alt) {
						console.warn(`Image missing alt text: ${src}`);
					}
					
					// Determine if image is local or external
					const isLocal = isLocalImage(src);
					const isCloudinary = isCloudinaryUrl(src);
					
					if (isLocal) {
						// Transform to Next.js Image component placeholder
						// We'll use a custom data attribute that can be hydrated client-side
						node.properties = {
							...node.properties,
							'data-next-image': 'true',
							'data-src': src,
							alt: alt || '',
							loading: 'lazy',
							// Add width/height placeholders - these should ideally be determined from actual images
							width: '800',
							height: '600',
						};
					} else {
						// For external images (including Cloudinary), preserve URL and add lazy loading
						node.properties = {
							...node.properties,
							src,
							alt: alt || '',
							loading: 'lazy',
							...(isCloudinary && {
								'data-cloudinary': 'true',
							}),
						};
					}
				} catch (error) {
					console.error('Error processing image node:', error);
					// Add error indicator but don't break the build
					node.properties = {
						...node.properties,
						'data-error': 'processing-failed',
					};
				}
			}
		});
	};
}

/**
 * Check if an image URL is local (relative path or starts with /)
 */
function isLocalImage(src: string): boolean {
	// Local images start with / or are relative paths
	// They don't start with http://, https://, or //
	return !src.startsWith('http://') && 
	       !src.startsWith('https://') && 
	       !src.startsWith('//');
}

/**
 * Check if an image URL is from Cloudinary
 */
function isCloudinaryUrl(src: string): boolean {
	return src.includes('cloudinary.com') || src.includes('res.cloudinary.com');
}
