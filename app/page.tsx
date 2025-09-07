import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { getAllPosts } from '@/lib/posts'


export default async function Home() {
const posts = await getAllPosts()
const til = await getAllPosts(process.cwd() + '/content/til')


return (
<div className="space-y-12">
<section>
<h2 className="text-2xl font-bold mb-4">Latest Posts</h2>
<div className="grid gap-4 md:grid-cols-2">
{posts.slice(0, 6).map(p => (
<PostCard key={p.slug} {...p} />
))}
</div>
</section>


<section>
<div className="flex items-baseline justify-between">
<h2 className="text-2xl font-bold mb-4">TIL — Today I Learned</h2>
<Link href="/til" className="text-sm underline">See all</Link>
</div>
<ul className="list-disc pl-5 space-y-2">
{til.slice(0, 6).map(t => (
<li key={t.slug}>
<Link href={`/blog/${t.slug}?type=til`}>{t.title}</Link>
<span className="text-xs opacity-60 ml-2">{new Date(t.date).toDateString()}</span>
</li>
))}
</ul>
</section>
</div>
)
}
