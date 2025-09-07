import Link from 'next/link'
import Tag from './Tag'


export default function PostCard({ slug, title, date, summary, tags }: { slug: string; title: string; date: string; summary: string; tags: string[] }) {
return (
<article className="border rounded-2xl p-4 hover:shadow-sm transition">
<h3 className="text-lg font-semibold mb-1">
<Link href={`/blog/${slug}`}>{title}</Link>
</h3>
<p className="text-xs opacity-70 mb-2">{new Date(date).toDateString()}</p>
<p className="text-sm mb-3">{summary}</p>
<div className="flex gap-2 flex-wrap">{tags?.map((t) => <Tag key={t} label={t} />)}</div>
</article>
)
}