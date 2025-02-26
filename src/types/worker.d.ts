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
