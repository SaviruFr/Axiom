import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb(context: { locals: { runtime: { env: any } } }) {
  try {
    if (!_db) {
      const { env } = context.locals.runtime;
      console.log('Runtime env vars:', Object.keys(env));

      // Check for database URL in runtime env
      if (!env.TABA) {
        throw new Error('TABA not found in runtime environment');
      }

      const sql = neon(env.TABA);
      _db = drizzle(sql, { schema });
      console.log('Database connection established');
    }
    return _db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}
