import { defineConfig } from 'drizzle-kit';

// For CLI commands like drizzle-kit push
const config = defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_e0liFk3OqbyP@ep-dawn-band-a4v5iq6k-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  },
  verbose: true,
  strict: true,
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public'
  }
});

// For runtime usage
export function getRuntimeConfig(context: { locals: { runtime: { env: any } } }) {
  const { env } = context.locals.runtime;
  return {
    ...config,
    dbCredentials: {
      url: env.TABA
    }
  };
}

// Default export for drizzle-kit
export default config;
