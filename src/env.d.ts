/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Env {
  API: string;
  GEMINI_API_KEY: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
