/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Env {
  GEMINI_API_KEY: string;
  API: string;
  DATABASE_URL: string;
}

type Runtime = import('@astrojs/cloudflare').RuntimeInstance<Env>;

declare namespace App {
  interface Locals {
    runtime: Runtime;
  }
}
