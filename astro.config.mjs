import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  integrations: [tailwind()],
  output: "server",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'load'
  },
    adapter: cloudflare()

});