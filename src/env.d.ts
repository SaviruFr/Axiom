/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface RuntimeConfig {
  API: string;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: RuntimeConfig;
    };
  }
}
