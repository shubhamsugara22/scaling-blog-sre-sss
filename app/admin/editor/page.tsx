'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postFormDataSchema } from '@/lib/types';
import { createPost } from './actions';
import MarkdownPreview from '@/components/MarkdownPreview';

export default function EditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parse tags from comma-separated string
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Validate form data
      const validation = postFormDataSchema.safeParse({
        title,
        content,
        tags: tagsArray,
        summary,
      });

      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      // Create post
      const result = await createPost(validation.data);

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Redirect to the new post
      router.push(`/blog/${result.slug}`);
    } catch (err) {
      setError('An error occurred while creating the post');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-sm opacity-70 mt-1">Write and publish a new blog post</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium mb-2">
            Summary
          </label>
          <input
            id="summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            placeholder="Brief summary of the post"
            maxLength={500}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            placeholder="e.g. devops, kubernetes, ci/cd"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-medium">
              Content (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 font-mono text-sm"
              placeholder="Write your post content in Markdown..."
              required
            />
            {showPreview && (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 h-96 overflow-y-auto prose dark:prose-invert max-w-none">
                <MarkdownPreview content={content} />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
