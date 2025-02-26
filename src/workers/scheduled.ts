import { fetchPhishingLists } from '@server/services/phishing';
import { getDb } from '@db/client';
import { phishingDomains } from '@db/schema';
import { sql } from 'drizzle-orm';

let isFirstRun = true;
let isProcessing = false;
let lastUpdate: Date | null = null;

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    if (isProcessing) {
      console.log('Update already in progress');
      return;
    }

    try {
      isProcessing = true;
      console.log(`Starting ${isFirstRun ? 'initial' : 'scheduled'} update`);

      const domains = await fetchPhishingLists();
      const db = getDb({ locals: { runtime: { env } } });
      
      const batchSize = 500;
      const uniqueDomains = [...new Set(domains.map(d => d.toLowerCase()))];

      for (let i = 0; i < uniqueDomains.length; i += batchSize) {
        const batch = uniqueDomains.slice(i, i + batchSize);
        await db
          .insert(phishingDomains)
          .values(batch.map(domain => ({
            domain,
            dateAdded: new Date(),
            lastSeen: new Date()
          })))
          .onConflictDoUpdate({
            target: phishingDomains.domain,
            set: { lastSeen: new Date() }
          });
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      await db
        .delete(phishingDomains)
        .where(sql`${phishingDomains.lastSeen} < ${thirtyDaysAgo}`);

      lastUpdate = new Date();
      isFirstRun = false;
      console.log(`Update completed at ${lastUpdate.toISOString()}`);

    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      isProcessing = false;
    }
  }
};
