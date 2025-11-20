import fs from 'fs';
import path from 'path';

/**
 * Generate a URL-safe slug from a title
 * @param title - The post title
 * @returns A URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if a slug already exists in the blog directory
 * @param slug - The slug to check
 * @param type - The content type ('blog' or 'til')
 * @returns True if the slug exists, false otherwise
 */
export function slugExists(slug: string, type: 'blog' | 'til' = 'blog'): boolean {
  const dir = type === 'blog' 
    ? path.join(process.cwd(), 'content', 'blog')
    : path.join(process.cwd(), 'content', 'til');
  
  const filePath = path.join(dir, `${slug}.md`);
  return fs.existsSync(filePath);
}

/**
 * Generate a unique slug by appending a number if necessary
 * @param title - The post title
 * @param type - The content type ('blog' or 'til')
 * @returns A unique slug
 */
export function generateUniqueSlug(title: string, type: 'blog' | 'til' = 'blog'): string {
  let slug = generateSlug(title);
  let counter = 1;
  
  while (slugExists(slug, type)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
  
  return slug;
}
