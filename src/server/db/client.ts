import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb(context: { locals: { runtime: { env: any } } }) {
  try {
    if (!_db) {
      const { env } = context.locals.runtime;

      if (!env.DATABASE_URL) {
        throw new Error('Database URL not found in runtime environment');
      }

      const sql = neon(env.DATABASE_URL);
      _db = drizzle(sql, { schema });
    }
    return _db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}
