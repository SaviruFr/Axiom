import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const phishingDomains = pgTable(
  'phishing_domains',
  {
    domain: text('domain').notNull().primaryKey(),
    dateAdded: timestamp('date_added').notNull().defaultNow(),
    lastSeen: timestamp('last_seen').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('phishing_domains_domain_unique_idx').on(table.domain)
  ]
);

export type PhishingDomain = InferSelectModel<typeof phishingDomains>;
export type PhishingDomainInsert = InferInsertModel<typeof phishingDomains>;
