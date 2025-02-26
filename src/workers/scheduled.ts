import { fetchPhishingLists } from '@server/services/phishing';
import { getDb } from '@db/client';
import { phishingDomains } from '@db/schema';
import { sql } from 'drizzle-orm';
import { initializeDatabase } from '@server/setup/initDb';

type WorkerState = {
  currentStatus: string;
  lastUpdate: string;
  totalDomains: number;
  processedBatches: number;
  isProcessing: boolean;
  currentSource: number;
  totalSources: number;
  sourceProgress: string;
  processingDetails: string;
};

class WorkerStateManager {
  private state: WorkerState = {
    currentStatus: 'Idle',
    lastUpdate: 'Never',
    totalDomains: 0,
    processedBatches: 0,
    isProcessing: false,
    currentSource: 0,
    totalSources: 0,
    sourceProgress: '',
    processingDetails: '',
  };

  private encoder = new TextEncoder();

  async update(updates: Partial<WorkerState>) {
    Object.assign(this.state, updates);
  }

  getState() {
    return this.state;
  }

  createStream() {
    let controller: ReadableStreamDefaultController;
    const stream = new ReadableStream({
      start: (c) => {
        controller = c;
        controller.enqueue(this.encoder.encode(`data: ${JSON.stringify(this.state)}\n\n`));
      },
      cancel: () => {},
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }
}

const stateManager = new WorkerStateManager();

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const state = stateManager.getState();
    if (state.isProcessing) return;

    const isScheduled = event.cron === '0 0 * * *';

    try {
      // Attempt initialization if needed
      if (!state.lastUpdate || state.lastUpdate === 'Never') {
        await stateManager.update({
          isProcessing: true,
          currentStatus: '🚀 Performing first-time initialization...',
        });

        await initializeDatabase(env);

        await stateManager.update({
          lastUpdate: new Date().toISOString(),
          currentStatus: '✨ Initial setup complete',
          isProcessing: false,
        });
        return;
      }

      await stateManager.update({
        isProcessing: true,
        currentStatus: isScheduled
          ? '🕛 Starting scheduled midnight update...'
          : 'Starting manual update...',
      });

      const domains = await fetchPhishingLists(async (status, details) => {
        const updates: Partial<WorkerState> = {
          currentStatus: status,
          totalDomains: details?.uniqueDomains || 0,
        };

        if (details) {
          if (details.currentSource && details.totalSources) {
            updates.currentSource = details.currentSource;
            updates.totalSources = details.totalSources;
            updates.sourceProgress = `Source ${details.currentSource}/${details.totalSources}`;
          }

          if (details.processedLines) {
            updates.processingDetails = `Processed ${details.processedLines.toLocaleString()} entries, Found ${details.uniqueDomains.toLocaleString()} unique domains`;
          }
        }

        await stateManager.update(updates);
      });

      const db = getDb({ locals: { runtime: { env } } });
      const batchSize = 500;
      let processedBatches = 0;
      let updatedCount = 0;
      let newCount = 0;

      // Deduplicate domains before processing
      const uniqueDomains = [...new Set(domains.map((d) => d.toLowerCase()))];

      for (let i = 0; i < uniqueDomains.length; i += batchSize) {
        const batch = uniqueDomains.slice(i, i + batchSize);
        const values = batch.map((domain) => ({
          domain,
          dateAdded: new Date(),
          lastSeen: new Date(),
        }));

        const result = await db
          .insert(phishingDomains)
          .values(values)
          .onConflictDoUpdate({
            target: phishingDomains.domain,
            set: {
              lastSeen: new Date(),
            },
          })
          .returning({
            domain: phishingDomains.domain,
            dateAdded: phishingDomains.dateAdded,
            lastSeen: phishingDomains.lastSeen,
          });

        const batchNewCount = result.filter(
          (r) => r.dateAdded && r.lastSeen && r.dateAdded.getTime() === r.lastSeen.getTime()
        ).length;

        newCount += batchNewCount;
        updatedCount += result.length - batchNewCount;

        processedBatches++;
        await stateManager.update({
          processedBatches,
          currentStatus: `Batch ${processedBatches}: ${newCount} new, ${updatedCount} updated`,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await stateManager.update({
        lastUpdate: new Date().toISOString(),
        currentStatus: `✨ ${isScheduled ? 'Scheduled' : 'Manual'} update complete: ${newCount} new targets, ${updatedCount} updated`,
        isProcessing: false,
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await db.delete(phishingDomains).where(sql`${phishingDomains.lastSeen} < ${thirtyDaysAgo}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await stateManager.update({
        currentStatus: `❌ ${isScheduled ? 'Scheduled' : 'Manual'} update failed: ${error.message}`,
        isProcessing: false,
      });
      console.error('Task failed:', {
        message: error.message,
        stack: error.stack,
      });
    }
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Add initialization endpoint
    if (url.pathname === '/initialize') {
      try {
        await initializeDatabase(env);
        return new Response('Database initialized successfully', { status: 200 });
      } catch (error) {
        return new Response('Failed to initialize database', { status: 500 });
      }
    }

    if (url.pathname === '/status') {
      return new Response(JSON.stringify(stateManager.getState()), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/status-stream') {
      return stateManager.createStream();
    }

    if (url.pathname === '/trigger-update') {
      try {
        ctx.waitUntil(
          this.scheduled({ type: 'scheduled', cron: 'manual', scheduledTime: Date.now() }, env, ctx)
        );
        return new Response('Update triggered');
      } catch (error) {
        return new Response('Update failed', { status: 500 });
      }
    }

    if (url.pathname === '/') {
      return new Response(
        `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Axiom Worker Status</title>
            <style>
              body { 
                background-color: black; 
                font-family: monospace; 
                padding: 20px; 
                color: #fff; 
              }
              .main { font-size: 2rem; }
              .status { 
                margin: 20px 0; 
                padding: 10px; 
                border: 1px solid #fff; 
                font-size: 1.2rem;
              }
              .info { color: white; }
              .button {
                background: #1a1a1a;
                color: #fff;
                border: 1px solid #fff;
                padding: 10px 20px;
                cursor: pointer;
                font-family: monospace;
                font-size: 1rem;
                transition: all 0.3s ease;
              }
              .button:hover {
                background: #fff;
                color: #000;
              }
              .button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
              .status-text {
                animation: fadeIn 0.3s ease;
              }
              @keyframes fadeIn {
                from { opacity: 0.5; }
                to { opacity: 1; }
              }
            </style>
          </head>
          <body>
            <h2 class="main">Axiom Database Update Worker</h2>
            <div class="status">
              <p>Current Status: <span id="currentStatus" class="status-text">Checking...</span></p>
              <p>Source Progress: <span id="sourceProgress" class="status-text">-</span></p>
              <p>Processing Details: <span id="processingDetails" class="status-text">-</span></p>
              <p>Total Domains: <span id="totalDomains" class="status-text">0</span></p>
              <p>Processed Batches: <span id="processedBatches" class="status-text">0</span></p>
              <p class="info">Last Update: <span id="lastUpdate" class="status-text">Never</span></p>
            </div>
            <div class="info">
              <button id="triggerButton" class="button">Trigger Update</button>
              <p>Live updates enabled ⚡</p>
            </div>
            <script>
              const STORAGE_KEY = 'axiom_db_state';
              const LAST_UPDATE_KEY = 'axiom_last_update';
              let retryCount = 0;
              const maxRetries = 5;
              const pollInterval = 2000;
              
              function loadSavedState() {
                try {
                  const savedState = localStorage.getItem(STORAGE_KEY);
                  const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
                  if (savedState) updateUI(JSON.parse(savedState));
                  if (lastUpdate) {
                    document.getElementById('lastUpdate').textContent = new Date(lastUpdate).toLocaleString();
                  }
                } catch (error) {
                  console.error('Error loading state:', error);
                }
              }
              
              function saveState(data) {
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                  if (data.lastUpdate && data.lastUpdate !== 'Never') {
                    localStorage.setItem(LAST_UPDATE_KEY, data.lastUpdate);
                  }
                } catch (error) {
                  console.error('Error saving state:', error);
                }
              }
              
              function updateUI(data) {
                ['currentStatus', 'totalDomains', 'processedBatches', 'lastUpdate', 'sourceProgress', 'processingDetails']
                  .forEach(id => {
                    const element = document.getElementById(id);
                    if (!element) return;
                    const newValue = id === 'lastUpdate' && data[id] !== 'Never' 
                      ? new Date(data[id]).toLocaleString()
                      : data[id];
                    if (element.textContent !== String(newValue)) {
                      element.style.animation = 'none';
                      element.offsetHeight;
                      element.style.animation = null;
                      element.textContent = newValue;
                    }
                  });
                
                const button = document.getElementById('triggerButton');
                if (button) button.disabled = data.isProcessing;
                saveState(data);
              }
              
              async function pollStatus() {
                try {
                  const response = await fetch('/status');
                  if (!response.ok) throw new Error('Status fetch failed');
                  const data = await response.json();
                  updateUI(data);
                  if (data.isProcessing) setTimeout(pollStatus, pollInterval);
                } catch (error) {
                  console.error('Polling error:', error);
                  if (++retryCount < maxRetries) setTimeout(pollStatus, pollInterval * 2);
                }
              }
              
              function init() {
                const button = document.getElementById('triggerButton');
                if (button) {
                  button.addEventListener('click', async () => {
                    button.disabled = true;
                    try {
                      const response = await fetch('/trigger-update');
                      if (!response.ok) throw new Error('Update failed');
                      pollStatus();
                    } catch (error) {
                      console.error('Update error:', error);
                      button.disabled = false;
                    }
                  });
                }
                loadSavedState();
                pollStatus();
              }
              
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
              } else {
                init();
              }
            </script>
          </body>
        </html>
      `,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    return new Response('Not found', { status: 404 });
  },
};
