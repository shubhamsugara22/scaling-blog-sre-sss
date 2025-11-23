import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { calculateReadingTime, ReadingTimeResult } from './reading-time';
import { extractHeadings, TocHeading } from './toc';
import remarkAsciinema from './remark-asciinema';
import rehypeImageHandler from './rehype-image-handler';
import rehypeMermaidComponent from './rehype-mermaid-component';

const BLOG_PATH = path.join(process.cwd(), 'content', 'blog');
const TIL_PATH = path.join(process.cwd(), 'content', 'til');

export type PostMeta = {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	summary: string;
	readingTime?: ReadingTimeResult;
};

export type EnhancedPost = {
	meta: PostMeta;
	contentHtml: string;
	headings: TocHeading[];
};

export async function getAllPosts(dir = BLOG_PATH): Promise<PostMeta[]> {
	const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
	const posts = files.map((file) => {
		const slug = file.replace(/\.md$/, '');
		const raw = fs.readFileSync(path.join(dir, file), 'utf8');
		const { data } = matter(raw);
		return {
			slug,
			title: data.title as string,
			date: data.date as string,
			tags: (data.tags || []) as string[],
			summary: (data.summary || '') as string,
		};
	});
	return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPost(slug: string, type: 'blog' | 'til' = 'blog'): Promise<EnhancedPost> {
	try {
		const base = type === 'blog' ? BLOG_PATH : TIL_PATH;
		const file = path.join(base, `${slug}.md`);
		
		// Check if file exists
		if (!fs.existsSync(file)) {
			throw new Error(`Post not found: ${slug}`);
		}
		
		const raw = fs.readFileSync(file, 'utf8');
		const { data, content } = matter(raw);
		
		// Validate required metadata
		if (!data.title || !data.date) {
			console.warn(`Post ${slug} missing required metadata (title or date)`);
		}
		
		// Calculate reading time from raw markdown content
		const readingTime = calculateReadingTime(content);
		
		let contentHtml = '';
		
		try {
			// Use unified pipeline to process markdown through remark and rehype
			const { unified } = await import('unified');
			const remarkParse = (await import('remark-parse')).default;
			const { default: remarkGfm } = await import('remark-gfm');
			const { default: remarkRehype } = await import('remark-rehype');
			const { default: rehypeRaw } = await import('rehype-raw');
			const rehypeStringify = (await import('rehype-stringify')).default;
			
			const processed = await unified()
				// Parse markdown
				.use(remarkParse)
				// Enable GitHub Flavored Markdown (tables, strikethrough, task lists, etc.)
				.use(remarkGfm)
				// Transform Asciinema syntax before converting to HTML
				.use(remarkAsciinema)
				// Convert markdown to HTML (hast)
				.use(remarkRehype, { allowDangerousHtml: true })
				// Parse raw HTML nodes
				.use(rehypeRaw)
				// Apply rehype plugins
				.use(rehypeSlug)
				.use(rehypeAutolinkHeadings, {
					behavior: 'wrap',
					properties: {
						className: ['anchor-link']
					}
				})
				.use(rehypeMermaidComponent)
				.use(rehypeImageHandler)
				// Convert back to HTML string
				.use(rehypeStringify)
				.process(content);
			
			contentHtml = String(processed);
		} catch (error) {
			console.error(`Error processing markdown for ${slug}:`, error);
			// Fallback to basic HTML conversion
			try {
				const processed = await remark()
					.use(html, { sanitize: false })
					.process(content);
				contentHtml = String(processed);
			} catch (fallbackError) {
				console.error(`Fallback processing also failed for ${slug}:`, fallbackError);
				contentHtml = `<div class="error-message"><p><strong>Error processing markdown content.</strong></p><pre>${content}</pre></div>`;
			}
		}
		
		// Extract headings for table of contents
		const headings = extractHeadings(contentHtml);
		
		return {
			meta: {
				slug,
				title: (data.title as string) || 'Untitled Post',
				date: (data.date as string) || new Date().toISOString(),
				tags: (data.tags || []) as string[],
				summary: (data.summary || '') as string,
				readingTime,
			},
			contentHtml,
			headings,
		};
	} catch (error) {
		console.error(`Fatal error loading post ${slug}:`, error);
		// Re-throw to let Next.js handle with 404 or error page
		throw error;
	}
}
