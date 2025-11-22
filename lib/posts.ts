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
	const base = type === 'blog' ? BLOG_PATH : TIL_PATH;
	const file = path.join(base, `${slug}.md`);
	const raw = fs.readFileSync(file, 'utf8');
	const { data, content } = matter(raw);
	
	// Calculate reading time from raw markdown content
	const readingTime = calculateReadingTime(content);
	
	// Process markdown with enhanced pipeline
	// Note: rehype plugins need to be applied after converting to HTML
	const processed = await remark()
		.use(remarkAsciinema) // Transform Asciinema syntax before converting to HTML
		.use(html, { sanitize: false })
		.use(() => (tree) => tree) // Pass-through for remark
		.process(content);
	
	let contentHtml = String(processed);
	
	// Apply rehype plugins manually by using unified with rehype
	const { unified } = await import('unified');
	const rehypeParse = (await import('rehype-parse')).default;
	const rehypeStringify = (await import('rehype-stringify')).default;
	
	const rehypeProcessed = await unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, {
			behavior: 'wrap',
			properties: {
				className: ['anchor-link']
			}
		})
		.use(rehypeStringify)
		.process(contentHtml);
	
	contentHtml = String(rehypeProcessed);
	
	// Extract headings for table of contents
	const headings = extractHeadings(contentHtml);
	
	return {
		meta: {
			slug,
			title: data.title as string,
			date: data.date as string,
			tags: (data.tags || []) as string[],
			summary: (data.summary || '') as string,
			readingTime,
		},
		contentHtml,
		headings,
	};
}
