import { fetchPhishingLists } from '@server/services/phishing';
import { getDb } from '@db/client';
import { phishingDomains } from '@db/schema';

async function initializeDatabase(env: Env) {
  console.log('Starting initial database population...');

  try {
    const db = getDb({ locals: { runtime: { env } } });

    const existing = await db.select().from(phishingDomains).limit(1);
    if (existing.length > 0) {
      console.log('Database already initialized, skipping...');
      return;
    }

    const domains = await fetchPhishingLists((status) => {
      console.log('Status:', status);
    });

    console.log(`Found ${domains.length} domains to insert`);

    const batchSize = 500;
    for (let i = 0; i < domains.length; i += batchSize) {
      const batch = domains.slice(i, i + batchSize);
      await db.insert(phishingDomains).values(
        batch.map((domain) => ({
          domain: domain.toLowerCase(),
          dateAdded: new Date(),
          lastSeen: new Date(),
        }))
      );

      console.log(
        `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(domains.length / batchSize)}`
      );
    }

    console.log('Initial database population complete!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export { initializeDatabase };
