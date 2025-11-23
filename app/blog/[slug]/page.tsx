import { getPost } from '@/lib/posts';
import CodeCopyProvider from '@/components/CodeCopyProvider';
import Tag from '@/components/Tag';
import AsciinemaHydrator from '@/components/AsciinemaHydrator';
import ImageHydrator from '@/components/ImageHydrator';
import MermaidHydrator from '@/components/MermaidHydrator';
import TableOfContents from '@/components/TableOfContents';
import GiscusComments from '@/components/GiscusComments';

export default async function PostPage({
	params,
	searchParams,
}: {
	params: { slug: string };
	searchParams: { type?: 'blog' | 'til' };
}) {
	const type = searchParams?.type === 'til' ? 'til' : 'blog';
	
	let meta, contentHtml, headings;
	
	try {
		const post = await getPost(params.slug, type);
		meta = post.meta;
		contentHtml = post.contentHtml;
		headings = post.headings;
	} catch (error) {
		console.error(`Error loading post ${params.slug}:`, error);
		// Let Next.js handle with 404 or error page
		throw error;
	}

	return (
		<div className="max-w-7xl mx-auto">
			{/* Skip link for accessibility */}
			<a 
				href="#main-content" 
				className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
			>
				Skip to main content
			</a>
			
			<div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-8">
				{/* Main content area */}
				<article id="main-content" className="prose dark:prose-invert max-w-none" aria-labelledby="post-title">
					<h1 id="post-title" className="!mb-1">{meta.title}</h1>
					
					{/* Publication date and reading time (Requirement 1.4) */}
					<p className="text-sm opacity-70 !mt-0">
						{new Date(meta.date).toDateString()}
						{meta.readingTime && (
							<>
								{' • '}
								<span>{meta.readingTime.text}</span>
							</>
						)}
					</p>
					
					{/* Tags (Requirements 9.1, 9.2) */}
					{meta.tags.length > 0 && (
						<div className="flex gap-2 flex-wrap my-2" role="list" aria-label="Post tags">
							{meta.tags.map((t) => (
								<Tag key={t} label={t} />
							))}
						</div>
					)}
					
					<hr />
					
					{/* Table of Contents - inline on mobile (Requirement 2.1, 10.3) */}
					<div className="lg:hidden">
						<TableOfContents headings={headings} />
					</div>
					
					{/* Post content */}
					<div dangerouslySetInnerHTML={{ __html: contentHtml }} />
					
					<CodeCopyProvider />
					<AsciinemaHydrator />
					<ImageHydrator />
					<MermaidHydrator />
					
					{/* Comments section (Requirement 3.1) */}
					{process.env.NEXT_PUBLIC_GISCUS_REPO && 
					 process.env.NEXT_PUBLIC_GISCUS_REPO_ID && 
					 process.env.NEXT_PUBLIC_GISCUS_CATEGORY && 
					 process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID && (
						<GiscusComments
							repo={process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
							repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID}
							category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY}
							categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID}
						/>
					)}
				</article>
				
				{/* Table of Contents - sidebar on desktop (Requirements 2.1, 10.2) */}
				<aside className="hidden lg:block">
					<TableOfContents headings={headings} />
				</aside>
			</div>
		</div>
	);
}