import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const phishingDomains = pgTable('phishing_domains', 
{
  domain: text('domain').primaryKey(),
  dateAdded: timestamp('date_added').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeen: timestamp('last_seen').notNull().default(sql`CURRENT_TIMESTAMP`)
}, 
(table) => [
  uniqueIndex('domains_idx').on(table.domain)
]);

export type PhishingDomain = typeof phishingDomains.$inferSelect;
