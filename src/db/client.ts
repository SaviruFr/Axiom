import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { getDb } from './index';
import { phishingDomains } from './schema';

export async function checkDomain(
  context: { locals: App.Locals },
  domain: string
): Promise<boolean> {
  try {
    const db = await getDb(context);
    const results = await db
      .select()
      .from(phishingDomains)
      .where(eq(phishingDomains.domain, domain));

    return results.length > 0;
  } catch {
    return false;
  }
}

export { getDb };
