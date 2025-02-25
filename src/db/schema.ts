import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const phishingDomains = pgTable('phishing_domains', {
  domain: text('domain').primaryKey(),
  dateAdded: timestamp('date_added').defaultNow(),
  lastSeen: timestamp('last_seen').defaultNow(),
});
