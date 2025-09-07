import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default async function TILPage() {
	const til = await getAllPosts(process.cwd() + '/content/til');
	return (
		<section>
			<h1 className="text-2xl font-bold mb-4">TIL — Today I Learned</h1>
			<div className="space-y-3">
				{til.map((t) => (
					<div key={t.slug} className="border rounded-2xl p-4">
						<h3 className="font-semibold text-lg">
							<Link href={`/blog/${t.slug}?type=til`}>{t.title}</Link>
						</h3>
						<p className="text-xs opacity-60">
							{new Date(t.date).toDateString()}
						</p>
						<p className="text-sm mt-2">{t.summary}</p>
					</div>
				))}
			</div>
		</section>
	);
}