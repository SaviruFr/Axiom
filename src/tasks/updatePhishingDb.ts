import { db } from '../db/client';
import { phishingDomains } from '../db/schema';
import { sql } from 'drizzle-orm';

async function fetchPhishingList() {
  const response = await fetch('https://malware-filter.gitlab.io/malware-filter/phishing-filter.txt');
  const text = await response.text();
  
  // Extract domains from the filter list
  const domains = text
    .split('\n')
    .filter(line => line.startsWith('||'))
    .map(line => line.slice(2).split('^')[0])
    .filter(domain => domain.length > 0);
    
  return domains;
}

export async function updatePhishingDatabase() {
  try {
    const domains = await fetchPhishingList();
    
    // Use a transaction to update the database
    await db.transaction(async (tx) => {
      // Update existing domains' lastSeen timestamp
      await tx.execute(sql`
        INSERT INTO ${phishingDomains} (domain, last_seen)
        VALUES ${sql.join(
          domains.map(domain => sql`(${domain}, NOW())`),
          ','
        )}
        ON CONFLICT (domain) 
        DO UPDATE SET last_seen = NOW();
      `);
    });
    
    console.log(`Successfully updated phishing database with ${domains.length} domains`);
  } catch (error) {
    console.error('Failed to update phishing database:', error);
  }
}
