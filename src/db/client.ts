import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: import.meta.env.DATABASE_URL });
export const db = drizzle(pool);
