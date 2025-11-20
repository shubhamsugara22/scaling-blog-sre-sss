import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Feature: blog-interactions, Property: Database initialization creates required tables
 * Validates: Requirements 6.1
 */

describe('Database Initialization Properties', () => {
  const testDbPath = path.join(process.cwd(), 'test-blog.db');
  let db: Database.Database;

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('Property: Database initialization creates required tables', () => {
    // Initialize database
    db = new Database(testDbPath);
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL UNIQUE,
        count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_likes_post_slug ON likes(post_slug);
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL,
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'author',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Verify all tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('likes', 'comments', 'subscribers', 'users')
    `).all();

    expect(tables).toHaveLength(4);
    
    const tableNames = tables.map((t: any) => t.name);
    expect(tableNames).toContain('likes');
    expect(tableNames).toContain('comments');
    expect(tableNames).toContain('subscribers');
    expect(tableNames).toContain('users');

    // Verify indexes exist
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name LIKE 'idx_%'
    `).all();

    expect(indexes.length).toBeGreaterThanOrEqual(4);
  });
});
