import { getDb } from '@db/client';
import { phishingDomains } from '@db/schema';
import { fetchPhishingLists } from '@services/phishing';

export async function updatePhishingDatabase(context: any) {
  const db = getDb(context);
  const domains = await fetchPhishingLists();

  const chunkSize = 100;
  for (let i = 0; i < domains.length; i += chunkSize) {
    const chunk = domains.slice(i, i + chunkSize);
    await db
      .insert(phishingDomains)
      .values(chunk.map((domain) => ({ domain, lastSeen: new Date() })))
      .onConflictDoUpdate({
        target: [phishingDomains.domain],
        set: { lastSeen: new Date() },
      });
  }
}

export default {
  async scheduled(event: any, env: any, ctx: any) {
    ctx.waitUntil(updatePhishingDatabase({ locals: { runtime: { env } } }));
  },
};
