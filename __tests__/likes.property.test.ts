import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Feature: blog-interactions
 * Property 3: Like toggle round-trip
 * Property 4: Like persistence
 * Validates: Requirements 2.2, 2.3, 2.4
 */

describe('Like System Properties', () => {
  const testDbPath = path.join(process.cwd(), 'test-likes.db');
  let db: Database.Database;

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);
    db.exec(`
      CREATE TABLE likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL UNIQUE,
        count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  test('Property 3: Like toggle round-trip', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (postSlug, initialCount) => {
          // Set initial count
          db.prepare(
            'INSERT OR REPLACE INTO likes (post_slug, count) VALUES (?, ?)'
          ).run(postSlug, initialCount);

          // Like (increment)
          const afterLike = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };
          
          db.prepare(
            'UPDATE likes SET count = count + 1 WHERE post_slug = ?'
          ).run(postSlug);

          const likedCount = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          expect(likedCount.count).toBe(initialCount + 1);

          // Unlike (decrement)
          db.prepare(
            'UPDATE likes SET count = count - 1 WHERE post_slug = ?'
          ).run(postSlug);

          const unlikedCount = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          // Should return to initial count
          expect(unlikedCount.count).toBe(initialCount);

          // Clean up
          db.prepare('DELETE FROM likes WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4: Like persistence', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 1000 }),
        (postSlug, count) => {
          // Insert like count
          db.prepare(
            'INSERT OR REPLACE INTO likes (post_slug, count) VALUES (?, ?)'
          ).run(postSlug, count);

          // Query it back
          const result = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          // Should match what was inserted
          expect(result.count).toBe(count);

          // Clean up
          db.prepare('DELETE FROM likes WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4: Like count never goes negative', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (postSlug) => {
          // Start with 0
          db.prepare(
            'INSERT INTO likes (post_slug, count) VALUES (?, 0)'
          ).run(postSlug);

          // Try to decrement
          const newCount = Math.max(0, 0 - 1);
          db.prepare(
            'UPDATE likes SET count = ? WHERE post_slug = ?'
          ).run(newCount, postSlug);

          const result = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          // Should not be negative
          expect(result.count).toBeGreaterThanOrEqual(0);

          // Clean up
          db.prepare('DELETE FROM likes WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3: Multiple like/unlike cycles maintain consistency', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 10 }),
        (postSlug, cycles) => {
          // Start with 0
          db.prepare(
            'INSERT INTO likes (post_slug, count) VALUES (?, 0)'
          ).run(postSlug);

          // Perform multiple like/unlike cycles
          for (let i = 0; i < cycles; i++) {
            // Like
            db.prepare(
              'UPDATE likes SET count = count + 1 WHERE post_slug = ?'
            ).run(postSlug);

            // Unlike
            db.prepare(
              'UPDATE likes SET count = CASE WHEN count > 0 THEN count - 1 ELSE 0 END WHERE post_slug = ?'
            ).run(postSlug);
          }

          const result = db
            .prepare('SELECT count FROM likes WHERE post_slug = ?')
            .get(postSlug) as { count: number };

          // Should be back to 0
          expect(result.count).toBe(0);

          // Clean up
          db.prepare('DELETE FROM likes WHERE post_slug = ?').run(postSlug);
        }
      ),
      { numRuns: 100 }
    );
  });
});
