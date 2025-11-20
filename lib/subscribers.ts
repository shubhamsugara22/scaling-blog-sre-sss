import { getDatabase } from './db';
import type { Subscriber } from './types';

/**
 * Add a new subscriber
 * @param email - The subscriber's email
 * @returns The created subscriber
 */
export function addSubscriber(email: string): Subscriber {
  try {
    const db = getDatabase();

    // Insert subscriber
    const result = db
      .prepare('INSERT INTO subscribers (email) VALUES (?)')
      .run(email);

    // Get the created subscriber
    const subscriber = db
      .prepare('SELECT * FROM subscribers WHERE id = ?')
      .get(result.lastInsertRowid) as any;

    return {
      id: subscriber.id,
      email: subscriber.email,
      subscribedAt: subscriber.subscribed_at,
      isActive: Boolean(subscriber.is_active),
    };
  } catch (error: any) {
    // Check for unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE')) {
      throw new Error('Email already subscribed');
    }
    console.error('Error adding subscriber:', error);
    throw error;
  }
}

/**
 * Check if an email is already subscribed
 * @param email - The email to check
 * @returns True if subscribed, false otherwise
 */
export function checkSubscriber(email: string): boolean {
  try {
    const db = getDatabase();
    const result = db
      .prepare('SELECT id FROM subscribers WHERE email = ? AND is_active = 1')
      .get(email);

    return result !== undefined;
  } catch (error) {
    console.error('Error checking subscriber:', error);
    throw error;
  }
}

/**
 * Get all active subscribers
 * @returns Array of active subscribers
 */
export function getAllSubscribers(): Subscriber[] {
  try {
    const db = getDatabase();
    const results = db
      .prepare('SELECT * FROM subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC')
      .all() as any[];

    return results.map((row) => ({
      id: row.id,
      email: row.email,
      subscribedAt: row.subscribed_at,
      isActive: Boolean(row.is_active),
    }));
  } catch (error) {
    console.error('Error getting subscribers:', error);
    throw error;
  }
}

/**
 * Unsubscribe an email
 * @param email - The email to unsubscribe
 */
export function unsubscribe(email: string): void {
  try {
    const db = getDatabase();
    db.prepare('UPDATE subscribers SET is_active = 0 WHERE email = ?').run(email);
  } catch (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }
}

/**
 * Get subscriber count
 * @returns The number of active subscribers
 */
export function getSubscriberCount(): number {
  try {
    const db = getDatabase();
    const result = db
      .prepare('SELECT COUNT(*) as count FROM subscribers WHERE is_active = 1')
      .get() as { count: number };

    return result.count;
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    throw error;
  }
}
