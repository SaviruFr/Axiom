/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ScheduledEvent {
  cron: string;
  type: string;
  scheduledTime: number;
}

interface Env {
  GEMINI_API_KEY: string;
  API: string;
  DATABASE_URL: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

type Runtime = import('@astrojs/cloudflare').RuntimeInstance<Env>;

declare namespace App {
  interface Locals {
    runtime: Runtime;
  }
}
