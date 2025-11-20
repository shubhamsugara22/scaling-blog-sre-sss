'use client';

import { useState, useEffect } from 'react';

interface LikeButtonProps {
  postSlug: string;
  initialLikes: number;
}

export default function LikeButton({ postSlug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load liked state from localStorage
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setLiked(likedPosts.includes(postSlug));
  }, [postSlug]);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);

    // Optimistic update
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);
    setLiked(newLiked);
    setLikes(newLikes);

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postSlug,
          liked: !newLiked, // Send the previous state
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();

      // Update with server response
      setLikes(data.count);
      setLiked(data.liked);

      // Update localStorage
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      if (data.liked) {
        if (!likedPosts.includes(postSlug)) {
          likedPosts.push(postSlug);
        }
      } else {
        const index = likedPosts.indexOf(postSlug);
        if (index > -1) {
          likedPosts.splice(index, 1);
        }
      }
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setLiked(!newLiked);
      setLikes(likes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        liked
          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
    >
      <svg
        className={`w-5 h-5 ${liked ? 'fill-current' : 'stroke-current fill-none'}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="font-medium">{likes}</span>
    </button>
  );
}
