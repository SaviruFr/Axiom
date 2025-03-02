import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb({ locals }: { locals: App.Locals }) {
  if (_db) return _db;
  
  const dbUrl = locals.runtime.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL not configured');
  
  _db = drizzle(neon(dbUrl), { schema });
  return _db;
}

export async function checkDomain(db: ReturnType<typeof drizzle>, domain: string): Promise<boolean> {
  try {
    const results = await db
      .select()
      .from(schema.phishingDomains)
      .where(eq(schema.phishingDomains.domain, domain));
    
    return results.length > 0;
  } catch {
    return false;
  }
}
