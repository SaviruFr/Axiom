import type { APIContext } from 'astro';
import { getDb } from '../db/client';
import { phishingDomains } from '../db/schema';

export async function getDomains(context: APIContext) {
  try {
    const db = getDb(context);
    return await db.select().from(phishingDomains);
  } catch (error) {
    throw new Error('Database error');
  }
}

export async function addDomain(context: APIContext, domain: string) {
  try {
    const db = getDb(context);
    await db.insert(phishingDomains)
      .values({ domain })
      .onConflictDoUpdate({
        target: phishingDomains.domain,
        set: { lastSeen: new Date() }
      });
    return true;
  } catch (error) {
    throw new Error('Failed to update database');
  }
}
