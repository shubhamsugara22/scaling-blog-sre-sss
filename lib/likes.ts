import { getDatabase } from './db';
import type { Like } from './types';

/**
 * Get the like count for a post
 * @param postSlug - The post slug
 * @returns The like count
 */
export function getLikeCount(postSlug: string): number {
  try {
    const db = getDatabase();
    const result = db
      .prepare('SELECT count FROM likes WHERE post_slug = ?')
      .get(postSlug) as { count: number } | undefined;

    return result?.count || 0;
  } catch (error) {
    console.error('Error getting like count:', error);
    throw error;
  }
}

/**
 * Toggle like for a post (increment if not liked, decrement if liked)
 * @param postSlug - The post slug
 * @param liked - Current liked state (true if already liked)
 * @returns The new like count and liked state
 */
export function toggleLike(postSlug: string, liked: boolean): { count: number; liked: boolean } {
  try {
    const db = getDatabase();

    // Check if record exists
    const existing = db
      .prepare('SELECT count FROM likes WHERE post_slug = ?')
      .get(postSlug) as { count: number } | undefined;

    let newCount: number;
    let newLiked: boolean;

    if (!existing) {
      // Create new record with count 1
      db.prepare(
        'INSERT INTO likes (post_slug, count, updated_at) VALUES (?, 1, CURRENT_TIMESTAMP)'
      ).run(postSlug);
      newCount = 1;
      newLiked = true;
    } else {
      // Update existing record
      if (liked) {
        // Unlike: decrement count
        newCount = Math.max(0, existing.count - 1);
        newLiked = false;
      } else {
        // Like: increment count
        newCount = existing.count + 1;
        newLiked = true;
      }

      db.prepare(
        'UPDATE likes SET count = ?, updated_at = CURRENT_TIMESTAMP WHERE post_slug = ?'
      ).run(newCount, postSlug);
    }

    return { count: newCount, liked: newLiked };
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Get all likes (for admin purposes)
 * @returns Array of all likes
 */
export function getAllLikes(): Like[] {
  try {
    const db = getDatabase();
    const results = db.prepare('SELECT * FROM likes ORDER BY count DESC').all() as any[];

    return results.map((row) => ({
      id: row.id,
      postSlug: row.post_slug,
      count: row.count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Error getting all likes:', error);
    throw error;
  }
}
