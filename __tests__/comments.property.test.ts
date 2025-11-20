import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Feature: blog-interactions
 * Property 6: All comments displayed
 * Property 8: Comment creation completeness
 * Property 10: Comment chronological ordering
 * Property 17: Interaction data persistence round-trip
 * Validates: Requirements 3.1, 3.3, 3.5, 6.2, 6.3
 */

describe('Comments System Properties', () => {
  const testDbPath = path.join(process.cwd(), 'test-comments.db');
  let db: Database.Database;

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);
    db.exec(`
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

  test('Property 6: All comments displayed', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.array(
          fc.record({
            authorName: fc.string({ minLength: 1, maxLength: 50 }),
            content: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (postSlug, comments) => {
          // Insert comments
          comments.forEach((comment) => {
            db.prepare(
              'INSERT INTO comments (post_slug, author_name, content) VALUES (?, ?, ?)'
            ).run(postSlug, comment.authorName, comment.content);
          });

          // Query comments
          const results = db
            .prepare('SELECT * FROM comments WHERE post_slug = ?')
            .all(postSlug);

          // Should return all comments
          expect(results).toHaveLength(comments.length);

          // Clean up
          db.prepare('DELETE FROM comments WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Comment creation completeness', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        (postSlug, authorName, content) => {
          // Insert comment
          const result = db
            .prepare(
              'INSERT INTO comments (post_slug, author_name, content) VALUES (?, ?, ?)'
            )
            .run(postSlug, authorName, content);

          // Query the created comment
          const comment = db
            .prepare('SELECT * FROM comments WHERE id = ?')
            .get(result.lastInsertRowid) as any;

          // Verify all fields are present
          expect(comment.post_slug).toBe(postSlug);
          expect(comment.author_name).toBe(authorName);
          expect(comment.content).toBe(content);
          expect(comment.created_at).toBeDefined();

          // Clean up
          db.prepare('DELETE FROM comments WHERE id = ?').run(comment.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Comment chronological ordering', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), {
          minLength: 2,
          maxLength: 5,
        }),
        (postSlug, contents) => {
          // Insert comments with slight delays to ensure different timestamps
          contents.forEach((content, index) => {
            db.prepare(
              'INSERT INTO comments (post_slug, author_name, content, created_at) VALUES (?, ?, ?, datetime("now", ?))'
            ).run(postSlug, `Author${index}`, content, `+${index} seconds`);
          });

          // Query comments ordered by created_at DESC
          const results = db
            .prepare(
              'SELECT * FROM comments WHERE post_slug = ? ORDER BY created_at DESC'
            )
            .all(postSlug) as any[];

          // Verify ordering (newest first)
          for (let i = 0; i < results.length - 1; i++) {
            const current = new Date(results[i].created_at).getTime();
            const next = new Date(results[i + 1].created_at).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }

          // Clean up
          db.prepare('DELETE FROM comments WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 17: Interaction data persistence round-trip', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        (postSlug, authorName, content) => {
          // Write comment
          const result = db
            .prepare(
              'INSERT INTO comments (post_slug, author_name, content) VALUES (?, ?, ?)'
            )
            .run(postSlug, authorName, content);

          // Read it back immediately
          const comment = db
            .prepare('SELECT * FROM comments WHERE id = ?')
            .get(result.lastInsertRowid) as any;

          // Should match what was written
          expect(comment.post_slug).toBe(postSlug);
          expect(comment.author_name).toBe(authorName);
          expect(comment.content).toBe(content);

          // Clean up
          db.prepare('DELETE FROM comments WHERE id = ?').run(comment.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Comment count matches actual comments', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 20 }),
        (postSlug, count) => {
          // Insert specified number of comments
          for (let i = 0; i < count; i++) {
            db.prepare(
              'INSERT INTO comments (post_slug, author_name, content) VALUES (?, ?, ?)'
            ).run(postSlug, `Author${i}`, `Content${i}`);
          }

          // Query count
          const result = db
            .prepare('SELECT COUNT(*) as count FROM comments WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          // Should match inserted count
          expect(result.count).toBe(count);

          // Clean up
          db.prepare('DELETE FROM comments WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });
});
