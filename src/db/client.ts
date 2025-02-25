import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb({ locals }: { locals: App.Locals }) {
  if (!_db) {
    const DATABASE_URL = locals.runtime.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL not found in runtime environment');
    }
    const sql = neon(DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
