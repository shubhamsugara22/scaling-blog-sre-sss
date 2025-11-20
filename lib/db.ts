import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'blog.db');
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      initializeDatabase(db);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return db;
}

function initializeDatabase(database: Database.Database): void {
  try {
    // Create likes table
    database.exec(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL UNIQUE,
        count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_likes_post_slug ON likes(post_slug);
    `);

    // Create comments table
    database.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL,
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
    `);

    // Create subscribers table
    database.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
    `);

    // Create users table
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'author',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
