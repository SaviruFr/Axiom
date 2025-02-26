import cron from 'node-cron';
import { fetchPhishingLists } from './phishing';
import { getDb } from '@db/client';
import { phishingDomains } from '@db/schema';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
import { initializeDatabase } from '../db/init';

config(); // Load environment variables

class DatabaseUpdater {
  private isRunning = false;

  async updateDatabase() {
    if (this.isRunning) {
      console.log('Update already in progress');
      return;
    }

    try {
      this.isRunning = true;
      console.log('Starting database update...');

      // Fetch and deduplicate domains
      const domains = await fetchPhishingLists();
      const uniqueDomains = [...new Set(domains.map(d => d.toLowerCase()))];
      console.log(`Found ${uniqueDomains.length} unique domains`);

      // Connect to database
      const db = getDb({ locals: { runtime: { env: process.env } } });
      
      // Process in batches
      const batchSize = 500;
      let processed = 0;

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

        processed += batch.length;
        console.log(`Processed ${processed}/${uniqueDomains.length} domains`);
      }

      // Cleanup old entries
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await db
        .delete(phishingDomains)
        .where(sql`${phishingDomains.lastSeen} < ${thirtyDaysAgo}`)
        .returning();
        
      console.log(`Cleaned up ${result.length} old entries`);
      console.log(`Update completed at ${new Date().toISOString()}`);

    } catch (error) {
      console.error('Database update failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async start() {
    try {
      // Initialize database first
      await initializeDatabase();
      
      // Run initial update
      await this.updateDatabase();

      // Schedule daily updates
      cron.schedule('0 0 * * *', () => {
        console.log('Running scheduled update');
        this.updateDatabase();
      });

      console.log('Database updater started successfully');
    } catch (error) {
      console.error('Failed to start database updater:', error);
      process.exit(1);
    }
  }
}

// Start the updater
new DatabaseUpdater().start();
