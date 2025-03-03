import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

let client: Client | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb(context: { locals: App.Locals }) {
  if (_db) return _db;

  const dbUrl = context.locals.runtime.env.NILEDB_URL;
  if (!dbUrl) throw new Error('Database URL not configured in environment');

  client = new Client(dbUrl);
  await client.connect();
  _db = drizzle(client);
  return _db;
}

export async function disconnect() {
  if (client) {
    await client.end();
    client = null;
    _db = null;
  }
}
