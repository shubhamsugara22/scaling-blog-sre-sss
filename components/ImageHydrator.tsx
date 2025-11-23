'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { createRoot } from 'react-dom/client';

/**
 * Client-side component that hydrates static img tags marked for Next.js Image optimization
 * This runs after the page loads and replaces marked images with Next.js Image components
 */
export default function ImageHydrator() {
	useEffect(() => {
		try {
			// Find all images marked for Next.js Image optimization
			const images = document.querySelectorAll('img[data-next-image="true"]');
			
			images.forEach((img) => {
				try {
					const src = img.getAttribute('data-src') || img.getAttribute('src');
					const alt = img.getAttribute('alt') || '';
					const widthAttr = img.getAttribute('width') || '800';
					const heightAttr = img.getAttribute('height') || '600';
					const width = parseInt(widthAttr, 10);
					const height = parseInt(heightAttr, 10);
					
					// Validate required attributes
					if (!src) {
						console.warn('Image marked for hydration missing src attribute');
						return;
					}
					
					// Validate dimensions
					if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
						console.warn(`Invalid image dimensions for ${src}: ${widthAttr}x${heightAttr}`);
						// Use defaults
					}
					
					// Warn if alt text is missing
					if (!alt) {
						console.warn(`Image missing alt text: ${src}`);
					}
					
					// Create a wrapper div to mount the React component
					const wrapper = document.createElement('div');
					wrapper.className = 'next-image-wrapper';
					
					// Check if parent exists
					if (!img.parentNode) {
						console.error('Image has no parent node, cannot hydrate');
						return;
					}
					
					// Replace the img element with the wrapper
					img.parentNode.replaceChild(wrapper, img);
					
					// Mount the Next.js Image component
					const root = createRoot(wrapper);
					root.render(
						<Image
							src={src}
							alt={alt}
							width={isNaN(width) || width <= 0 ? 800 : width}
							height={isNaN(height) || height <= 0 ? 600 : height}
							loading="lazy"
							className="rounded-lg"
							style={{ width: '100%', height: 'auto' }}
							onError={(e) => {
								console.error(`Failed to load image: ${src}`);
								// Next.js Image component will show its default error state
							}}
						/>
					);
				} catch (error) {
					console.error('Error hydrating individual image:', error);
					// Continue processing other images
				}
			});
		} catch (error) {
			console.error('Error in ImageHydrator:', error);
			// Fail silently to not break the page
		}
	}, []);
	
	return null;
}
