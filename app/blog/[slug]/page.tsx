import { getPost } from '@/lib/posts';
import CodeCopyProvider from '@/components/CodeCopyProvider';
import Tag from '@/components/Tag';
import AsciinemaHydrator from '@/components/AsciinemaHydrator';

export default async function PostPage({
	params,
	searchParams,
}: {
	params: { slug: string };
	searchParams: { type?: 'blog' | 'til' };
}) {
	const type = searchParams?.type === 'til' ? 'til' : 'blog';
	const { meta, contentHtml } = await getPost(params.slug, type);

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
			<AsciinemaHydrator />
		</article>
	);
}