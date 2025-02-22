import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

export default defineConfig({
    integrations: [tailwind(), sitemap(), robotsTxt()],
    output: 'server',
    site: 'https://axiom-new.pages.dev',
    adapter: cloudflare({
        mode: 'directory',
        platformProxy: {
            enabled: true
        },
        runtime: {
            env: {
                DATABASE_URL: 'postgresql://neondb_owner:npg_e0liFk3OqbyP@ep-dawn-band-a4v5iq6k-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
            }
        }
    }),
    vite: {
        build: {
            minify: false
        },
        envPrefix: ['NEON_', 'PUBLIC_'],
    }
});