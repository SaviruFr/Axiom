/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly API: string;
  readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type RuntimeConfig = {
  readonly API: string;
  readonly GEMINI_API_KEY: string;
};

declare namespace App {
  interface Locals {
    runtime: {
      env: RuntimeConfig;
    };
  }
}
