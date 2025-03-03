import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

<<<<<<< HEAD
export const phishingDomains = pgTable(
  'phishing_domains',
  {
    domain: text('domain').primaryKey(),
    dateAdded: timestamp('date_added')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    lastSeen: timestamp('last_seen')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex('domains_idx').on(table.domain)]
);
=======
export const phishingDomains = pgTable('phishing_domain', {
  tenant_id: uuid('tenant_id').notNull(),
  id: uuid('id').notNull().default(sql`gen_random_uuid()`),
  domain: text('domain').notNull(),
  date_added: timestamp('date_added').notNull().default(sql`CURRENT_TIMESTAMP`),
  last_seen: timestamp('last_seen').notNull().default(sql`CURRENT_TIMESTAMP`)
});
>>>>>>> 4f6d7cd (refactor: update database configuration and schema)

export type PhishingDomain = typeof phishingDomains.$inferSelect;
