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
    }),
    vite: {
        build: {
            minify: false
        },
    }
});