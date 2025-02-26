import { getDb } from './client';
import { phishingDomains } from './schema';
import { sql } from 'drizzle-orm';

export async function initializeDatabase(env: Env) {
  console.log('Starting database initialization...');

  try {
    const db = getDb({ locals: { runtime: { env } } });

    // Check if table exists
    const result = await db.select().from(phishingDomains).limit(1);
    console.log('Database connection successful');

    if (result.length > 0) {
      console.log('Database already initialized');
      return;
    }

    // Create indices for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_last_seen ON phishing_domains (last_seen);
      CREATE INDEX IF NOT EXISTS idx_date_added ON phishing_domains (date_added);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// For direct execution
if (import.meta.url === import.meta.resolve('./init.ts')) {
  initializeDatabase(process.env as unknown as Env).catch(console.error);
}
