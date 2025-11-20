import bcrypt from 'bcrypt';
import { getDatabase } from '../lib/db';

async function seedAdmin() {
  const db = getDatabase();
  
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  
  // Check if admin already exists
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (existing) {
    console.log('Admin user already exists');
    return;
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Insert admin user
  db.prepare(`
    INSERT INTO users (email, password_hash, role)
    VALUES (?, ?, 'author')
  `).run(email, passwordHash);
  
  console.log(`Admin user created: ${email}`);
  console.log('Please change the password after first login');
}

seedAdmin().catch(console.error);
