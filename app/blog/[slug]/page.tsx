import { getPost } from '@/lib/posts';
import CodeCopyProvider from '@/components/CodeCopyProvider';
import Tag from '@/components/Tag';
import LikeButton from '@/components/LikeButton';
import { getLikeCount } from '@/lib/likes';

export default async function PostPage({
	params,
	searchParams,
}: {
	params: { slug: string };
	searchParams: { type?: 'blog' | 'til' };
}) {
	const type = searchParams?.type === 'til' ? 'til' : 'blog';
	const { meta, contentHtml } = await getPost(params.slug, type);
	
	// Get like count for this post
	const likeCount = getLikeCount(params.slug);

	return (
		<article className="prose dark:prose-invert max-w-none">
			<h1 className="!mb-1">{meta.title}</h1>
			<p className="text-sm opacity-70 !mt-0">
				{new Date(meta.date).toDateString()}
			</p>
			<div className="flex gap-2 flex-wrap my-2">
				{meta.tags.map((t) => (
					<Tag key={t} label={t} />
				))}
			</div>
			<hr />
			<div dangerouslySetInnerHTML={{ __html: contentHtml }} />
			<CodeCopyProvider />
			<div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
				<LikeButton postSlug={params.slug} initialLikes={likeCount} />
			</div>
		</article>
	);
}