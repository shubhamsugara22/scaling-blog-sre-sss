import { describe, it, expect } from 'vitest';
import { getPost } from '../posts';

describe('Image Handling', () => {
	it('should add lazy loading to all images', async () => {
		const post = await getPost('test-images', 'blog');
		
		// Check that all images have loading="lazy"
		const imgTags = post.contentHtml.match(/<img[^>]*>/g) || [];
		expect(imgTags.length).toBeGreaterThan(0);
		
		imgTags.forEach(imgTag => {
			expect(imgTag).toContain('loading="lazy"');
		});
	});
	
	it('should preserve alt text for all images', async () => {
		const post = await getPost('test-images', 'blog');
		
		// Check that all images have alt attribute
		const imgTags = post.contentHtml.match(/<img[^>]*>/g) || [];
		expect(imgTags.length).toBeGreaterThan(0);
		
		imgTags.forEach(imgTag => {
			expect(imgTag).toMatch(/alt="[^"]*"/);
		});
	});
	
	it('should mark local images for Next.js Image optimization', async () => {
		const post = await getPost('test-images', 'blog');
		
		// Check that local images have data-next-image attribute
		const hasNextImageMarker = post.contentHtml.includes('data-next-image="true"');
		expect(hasNextImageMarker).toBe(true);
		
		// Check that local images have data-src attribute
		const hasDataSrc = post.contentHtml.includes('data-src="/test-image.jpg"') ||
		                   post.contentHtml.includes('data-src="/another-local.png"');
		expect(hasDataSrc).toBe(true);
	});
	
	it('should preserve external image URLs', async () => {
		const post = await getPost('test-images', 'blog');
		
		// Check that external images keep their src attribute
		const hasExternalSrc = post.contentHtml.includes('src="https://example.com/image.png"');
		expect(hasExternalSrc).toBe(true);
	});
	
	it('should mark Cloudinary images', async () => {
		const post = await getPost('test-images', 'blog');
		
		// Check that Cloudinary images are marked
		const hasCloudinaryMarker = post.contentHtml.includes('data-cloudinary="true"');
		expect(hasCloudinaryMarker).toBe(true);
		
		// Check that Cloudinary URL is preserved
		const hasCloudinaryUrl = post.contentHtml.includes('res.cloudinary.com');
		expect(hasCloudinaryUrl).toBe(true);
	});
	
	it('should add width and height attributes to local images', async () => {
		const post = await getPost('test-images', 'blog');
		
		// Check that local images have width and height
		const localImgPattern = /<img[^>]*data-next-image="true"[^>]*>/g;
		const localImages = post.contentHtml.match(localImgPattern) || [];
		
		expect(localImages.length).toBeGreaterThan(0);
		
		localImages.forEach(imgTag => {
			expect(imgTag).toMatch(/width="\d+"/);
			expect(imgTag).toMatch(/height="\d+"/);
		});
	});
});
