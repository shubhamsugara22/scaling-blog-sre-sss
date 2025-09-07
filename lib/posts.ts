import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const BLOG_PATH = path.join(process.cwd(), 'content', 'blog');
const TIL_PATH = path.join(process.cwd(), 'content', 'til');

export type PostMeta = {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	summary: string;
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

export async function getPost(slug: string, type: 'blog' | 'til' = 'blog') {
	const base = type === 'blog' ? BLOG_PATH : TIL_PATH;
	const file = path.join(base, `${slug}.md`);
	const raw = fs.readFileSync(file, 'utf8');
	const { data, content } = matter(raw);
	const processed = await remark().use(html, { sanitize: false }).process(content);
	const contentHtml = String(processed);
	return {
		meta: {
			slug,
			title: data.title as string,
			date: data.date as string,
			tags: (data.tags || []) as string[],
			summary: (data.summary || '') as string,
		},
		contentHtml,
	};
}
