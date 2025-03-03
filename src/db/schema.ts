import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const phishingDomains = pgTable('phishing_domain', {
  tenant_id: uuid('tenant_id').notNull(),
  id: uuid('id').notNull().default(sql`gen_random_uuid()`),
  domain: text('domain').notNull(),
  date_added: timestamp('date_added').notNull().default(sql`CURRENT_TIMESTAMP`),
  last_seen: timestamp('last_seen').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export type PhishingDomain = typeof phishingDomains.$inferSelect;
