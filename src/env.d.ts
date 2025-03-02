/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />
/// <reference path="../.astro/types.d.ts" />

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
declare global {
  type ValidReason = 'phishing' | 'scam' | 'malware' | 'suspicious' | 'typosquatting';
  type ThreatType =
    | 'MALWARE'
    | 'SOCIAL_ENGINEERING'
    | 'UNWANTED_SOFTWARE'
    | 'POTENTIALLY_HARMFUL_APPLICATION'
    | 'THREAT_TYPE_UNSPECIFIED';
  type ThreatSource = 'Google Safe Browsing' | 'AI Analysis' | 'Database';
  type PlatformType = 'ANY_PLATFORM' | 'WINDOWS' | 'LINUX' | 'ANDROID' | 'OSX' | 'IOS';

  interface GeminiResult {
    isMalicious: boolean;
    reason: ValidReason | 'error';
  }

  interface ScanResult {
    scam: boolean;
    threats: Array<{
      type: ThreatType;
      platform: PlatformType;
      entryType: 'URL';
    }>;
  }

  interface Threat {
    readonly source: ThreatSource;
    readonly type: string;
  }

  interface ScanData {
    readonly riskLevel: string;
    readonly detectedThreats: readonly Threat[];
    readonly score: number;
  }

  interface ThreatMatch {
    readonly type: ThreatType;
    readonly platform: PlatformType;
    readonly entryType: 'URL';
  }

  type ThreatMappings = Readonly<Record<string, string>>;

  interface ScanResponse {
    riskLevel: string;
    detectedThreats: Array<{
      source: ThreatSource;
      type: string;
    }>;
    score: number;
    inDatabase: boolean;
    aiRating: string;
    safeBrowsing: string;
  }
}
