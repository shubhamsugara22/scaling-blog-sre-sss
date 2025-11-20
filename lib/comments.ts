import { getDatabase } from './db';
import type { Comment } from './types';

/**
 * Get all comments for a post
 * @param postSlug - The post slug
 * @returns Array of comments sorted by newest first
 */
export function getComments(postSlug: string): Comment[] {
  try {
    const db = getDatabase();
    const results = db
      .prepare(
        'SELECT * FROM comments WHERE post_slug = ? ORDER BY created_at DESC'
      )
      .all(postSlug) as any[];

    return results.map((row) => ({
      id: row.id,
      postSlug: row.post_slug,
      authorName: row.author_name,
      content: row.content,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}

/**
 * Create a new comment
 * @param postSlug - The post slug
 * @param authorName - The comment author's name
 * @param content - The comment content
 * @returns The created comment
 */
export function createComment(
  postSlug: string,
  authorName: string,
  content: string
): Comment {
  try {
    const db = getDatabase();

    // Insert comment
    const result = db
      .prepare(
        'INSERT INTO comments (post_slug, author_name, content) VALUES (?, ?, ?)'
      )
      .run(postSlug, authorName, content);

    // Get the created comment
    const comment = db
      .prepare('SELECT * FROM comments WHERE id = ?')
      .get(result.lastInsertRowid) as any;

    return {
      id: comment.id,
      postSlug: comment.post_slug,
      authorName: comment.author_name,
      content: comment.content,
      createdAt: comment.created_at,
    };
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * Get comment count for a post
 * @param postSlug - The post slug
 * @returns The number of comments
 */
export function getCommentCount(postSlug: string): number {
  try {
    const db = getDatabase();
    const result = db
      .prepare('SELECT COUNT(*) as count FROM comments WHERE post_slug = ?')
      .get(postSlug) as { count: number };

    return result.count;
  } catch (error) {
    console.error('Error getting comment count:', error);
    throw error;
  }
}

/**
 * Delete a comment (for admin purposes)
 * @param commentId - The comment ID
 */
export function deleteComment(commentId: number): void {
  try {
    const db = getDatabase();
    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}
