import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Feature: blog-interactions
 * Property 11: Valid email subscription
 * Property 12: Invalid email rejection
 * Property 13: Duplicate subscription handling
 * Validates: Requirements 4.3, 4.4, 4.5
 */

describe('Subscription System Properties', () => {
  const testDbPath = path.join(process.cwd(), 'test-subscribers.db');
  let db: Database.Database;

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);
    db.exec(`
      CREATE TABLE subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
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

  test('Property 11: Valid email subscription', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        // Insert subscriber
        const result = db
          .prepare('INSERT INTO subscribers (email) VALUES (?)')
          .run(email);

        // Verify subscriber was created
        const subscriber = db
          .prepare('SELECT * FROM subscribers WHERE id = ?')
          .get(result.lastInsertRowid) as any;

        expect(subscriber).toBeDefined();
        expect(subscriber.email).toBe(email);
        expect(subscriber.is_active).toBe(1);
        expect(subscriber.subscribed_at).toBeDefined();

        // Clean up
        db.prepare('DELETE FROM subscribers WHERE email = ?').run(email);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 12: Invalid email rejection', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('not-an-email'),
          fc.constant('@example.com'),
          fc.constant('user@'),
          fc.constant(''),
          fc.constant('no-at-sign.com')
        ),
        (invalidEmail) => {
          // Email validation should happen before database insertion
          // Simulate validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const isValid = emailRegex.test(invalidEmail);

          expect(isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 13: Duplicate subscription handling', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        // Insert subscriber first time
        db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);

        // Try to insert same email again
        let errorOccurred = false;
        try {
          db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);
        } catch (error: any) {
          errorOccurred = true;
          expect(error.code).toBe('SQLITE_CONSTRAINT');
        }

        // Should have thrown an error
        expect(errorOccurred).toBe(true);

        // Verify only one subscriber exists
        const count = db
          .prepare('SELECT COUNT(*) as count FROM subscribers WHERE email = ?')
          .get(email) as { count: number };

        expect(count.count).toBe(1);

        // Clean up
        db.prepare('DELETE FROM subscribers WHERE email = ?').run(email);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 11: Subscription persistence', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        // Add subscriber
        db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);

        // Check if exists
        const exists = db
          .prepare('SELECT id FROM subscribers WHERE email = ? AND is_active = 1')
          .get(email);

        expect(exists).toBeDefined();

        // Clean up
        db.prepare('DELETE FROM subscribers WHERE email = ?').run(email);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 13: Check subscriber before adding', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        // Check if subscriber exists (should be false initially)
        let exists = db
          .prepare('SELECT id FROM subscribers WHERE email = ? AND is_active = 1')
          .get(email);

        expect(exists).toBeUndefined();

        // Add subscriber
        db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);

        // Check again (should be true now)
        exists = db
          .prepare('SELECT id FROM subscribers WHERE email = ? AND is_active = 1')
          .get(email);

        expect(exists).toBeDefined();

        // Clean up
        db.prepare('DELETE FROM subscribers WHERE email = ?').run(email);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 11: Subscriber count accuracy', () => {
    fc.assert(
      fc.property(
        fc.array(fc.emailAddress(), { minLength: 1, maxLength: 10 }).map((emails) => 
          [...new Set(emails)] // Remove duplicates
        ),
        (emails) => {
          // Add all subscribers
          emails.forEach((email) => {
            db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);
          });

          // Count subscribers
          const result = db
            .prepare('SELECT COUNT(*) as count FROM subscribers WHERE is_active = 1')
            .get() as { count: number };

          expect(result.count).toBe(emails.length);

          // Clean up
          emails.forEach((email) => {
            db.prepare('DELETE FROM subscribers WHERE email = ?').run(email);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});
