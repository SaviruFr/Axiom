import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb({ locals }: { locals: App.Locals }) {
  if (!_db) {
    const { env } = locals.runtime;
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found in runtime environment');
    }
    const sql = neon(env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
