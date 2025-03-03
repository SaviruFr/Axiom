import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { getDb } from './index';
import { phishingDomains } from './schema';

<<<<<<< HEAD
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb({ locals }: { locals: App.Locals }) {
  if (_db) return _db;

  const dbUrl = locals.runtime.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL not configured');

  _db = drizzle(neon(dbUrl), { schema });
  return _db;
}

export async function checkDomain(
  db: ReturnType<typeof drizzle>,
  domain: string
): Promise<boolean> {
=======
export async function checkDomain(context: { locals: App.Locals }, domain: string): Promise<boolean> {
>>>>>>> 4f6d7cd (refactor: update database configuration and schema)
  try {
    const db = await getDb(context);
    const results = await db
      .select()
<<<<<<< HEAD
      .from(schema.phishingDomains)
      .where(eq(schema.phishingDomains.domain, domain));

=======
      .from(phishingDomains)
      .where(eq(phishingDomains.domain, domain));
    
>>>>>>> 4f6d7cd (refactor: update database configuration and schema)
    return results.length > 0;
  } catch {
    return false;
  }
}

export { getDb };
