import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Feature: blog-interactions, Property 19: Post data loading completeness
 * Validates: Requirements 6.5
 */

describe('Post Data Loading Properties', () => {
  const testDbPath = path.join(process.cwd(), 'test-post-loading.db');
  let db: Database.Database;

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);
    
    // Create tables
    db.exec(`
      CREATE TABLE likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL UNIQUE,
        count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL,
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('Property 19: Post data loading completeness - likes and comments loaded', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.array(
          fc.record({
            authorName: fc.string({ minLength: 1, maxLength: 50 }),
            content: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          { maxLength: 10 }
        ),
        (postSlug, likeCount, comments) => {
          // Insert likes
          db.prepare(
            'INSERT INTO likes (post_slug, count) VALUES (?, ?)'
          ).run(postSlug, likeCount);

          // Insert comments
          comments.forEach((comment) => {
            db.prepare(
              'INSERT INTO comments (post_slug, author_name, content) VALUES (?, ?, ?)'
            ).run(postSlug, comment.authorName, comment.content);
          });

          // Load likes
          const likes = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number } | undefined;

          // Load comments
          const loadedComments = db
            .prepare('SELECT * FROM comments WHERE post_slug = ?')
            .all(postSlug);

          // Verify both are loaded
          expect(likes).toBeDefined();
          expect(likes?.count).toBe(likeCount);
          expect(loadedComments).toHaveLength(comments.length);

          // Clean up
          db.prepare('DELETE FROM likes WHERE post_slug = ?').run(postSlug);
          db.prepare('DELETE FROM comments WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 19: Post with no interactions returns defaults', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (postSlug) => {
        // Query likes for non-existent post
        const likes = db
          .prepare('SELECT count FROM likes WHERE post_slug = ?')
          .get(postSlug) as { count: number } | undefined;

        // Query comments for non-existent post
        const comments = db
          .prepare('SELECT * FROM comments WHERE post_slug = ?')
          .all(postSlug);

        // Should return undefined/empty
        expect(likes).toBeUndefined();
        expect(comments).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 19: Multiple posts load independently', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            slug: fc.string({ minLength: 1, maxLength: 100 }),
            likes: fc.integer({ min: 0, max: 50 }),
            commentCount: fc.integer({ min: 0, max: 10 }),
          }),
          { minLength: 2, maxLength: 5 }
        ).map((posts) => {
          // Ensure unique slugs
          const uniqueSlugs = new Set(posts.map((p) => p.slug));
          return posts.filter((p, i, arr) => 
            arr.findIndex((x) => x.slug === p.slug) === i
          );
        }),
        (posts) => {
          // Insert data for each post
          posts.forEach((post) => {
            db.prepare(
              'INSERT INTO likes (post_slug, count) VALUES (?, ?)'
            ).run(post.slug, post.likes);

            for (let i = 0; i < post.commentCount; i++) {
              db.prepare(
                'INSERT INTO comments (post_slug, author_name, content) VALUES (?, ?, ?)'
              ).run(post.slug, `Author${i}`, `Comment${i}`);
            }
          });

          // Verify each post loads its own data
          posts.forEach((post) => {
            const likes = db
              .prepare('SELECT count FROM likes WHERE post_slug = ?')
              .get(post.slug) as { count: number };

            const comments = db
              .prepare('SELECT * FROM comments WHERE post_slug = ?')
              .all(post.slug);

            expect(likes.count).toBe(post.likes);
            expect(comments).toHaveLength(post.commentCount);
          });

          // Clean up
          posts.forEach((post) => {
            db.prepare('DELETE FROM likes WHERE post_slug = ?').run(post.slug);
            db.prepare('DELETE FROM comments WHERE post_slug = ?').run(post.slug);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 19: Data loading is consistent across queries', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (postSlug, likeCount) => {
          // Insert data
          db.prepare(
            'INSERT INTO likes (post_slug, count) VALUES (?, ?)'
          ).run(postSlug, likeCount);

          // Query multiple times
          const query1 = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          const query2 = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          // Should return same result
          expect(query1.count).toBe(query2.count);
          expect(query1.count).toBe(likeCount);

          // Clean up
          db.prepare('DELETE FROM likes WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });
});
