/**
 * Kittlibr Extension Contract & Runtime Validator (`libr-contract.ts`)
 * Version: 1.1.0
 * 🐾 Kawaiianism v3.1 Anti-Slop Directive
 *
 * Implements:
 * 1. `validateExtensionManifest()`: Strict schema check with actionable errors.
 * 2. `createSafeExtensionHost()`: Sandboxed execution wrapper ensuring zero-crash fallback
 *    when network, sibling extensions, or AI tokens are offline.
 * 3. Bounded ring-buffer diagnostic logging (default ~500 entries) with:
 *    `log(entry)`, `getLogs(filter)`, `clearLogs()`, and `subscribeLogs(listener)`.
 * 4. Graceful degradation rules for slots, hooks, and stages.
 */

export type LibrCategory =
  | 'librget'
  | 'librfind'
  | 'librmanage'
  | 'libr_ai'
  | 'shelves'
  | 'bridge';

export type LibrSlot =
  | 'quickbar'
  | 'book-menu'
  | 'settings-panel'
  | 'shelf-rule-provider';

export type DiagnosticLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type DiagnosticLogStage =
  | 'catalog_read'
  | 'fetch'
  | 'fallback_stub'
  | 'render'
  | 'sync'
  | 'dispatch'
  | 'handler_error'
  | 'runtime'
  | string;

export interface DiagnosticLogEntry {
  id?: string;
  timestamp?: string;
  level?: DiagnosticLogLevel;
  source: string;
  stage?: DiagnosticLogStage;
  message: string;
  meta?: Record<string, any>;
}

export interface LogFilter {
  level?: DiagnosticLogLevel | 'all';
  source?: string;
  stage?: string;
  query?: string;
}

export interface LibrExtensionCapabilities {
  required?: Array<'network' | 'local_storage' | 'indexeddb' | 'fsa_handle' | 'file_picker'>;
  optional?: Array<'gemini_ai' | 'rclone_rcd' | 'webdav_proxy' | 'audio_tts'>;
}

export interface LibrExtensionIntegrity {
  sha256?: string;
}

export interface LibrExtensionManifest {
  $schema?: string;
  contractVersion: string;
  minHostVersion?: string;
  id: string;
  name: string;
  version: string;
  author?: string;
  description: string;
  category: LibrCategory;
  entrypoint: string;
  slots?: LibrSlot[];
  hooks?: string[];
  capabilities?: LibrExtensionCapabilities;
  integrity?: LibrExtensionIntegrity;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface SafeExtensionHost {
  hasCapability(cap: string): boolean;
  dispatchHook(hookName: string, payload: any): void;
  on(hookName: string, handler: (payload: any) => void): () => void;
  executeWithFallback<T>(
    task: () => Promise<T>,
    fallbackValue: T,
    stage?: DiagnosticLogStage,
    source?: string
  ): Promise<T>;
  log(entry: DiagnosticLogEntry): void;
  getLogs(filter?: LogFilter): DiagnosticLogEntry[];
  clearLogs(): void;
  subscribeLogs(listener: (entry: DiagnosticLogEntry) => void): () => void;
}

export const VALID_CATEGORIES = new Set<LibrCategory>([
  'librget',
  'librfind',
  'librmanage',
  'libr_ai',
  'shelves',
  'bridge'
]);

export const VALID_SLOTS = new Set<LibrSlot>([
  'quickbar',
  'book-menu',
  'settings-panel',
  'shelf-rule-provider'
]);

export const VALID_LEVELS = new Set<DiagnosticLogLevel>(['debug', 'info', 'warn', 'error']);

/**
 * Validate an extension manifest against the Kittlibr Extension Contract v1.0.
 */
export function validateExtensionManifest(manifest: Record<string, any>): ValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be a non-null object.'] };
  }

  // Required fields check
  const required = ['contractVersion', 'id', 'name', 'version', 'description', 'category', 'entrypoint'];
  for (const field of required) {
    if (!manifest[field] || typeof manifest[field] !== 'string' || manifest[field].trim() === '') {
      errors.push(`Missing or invalid required field: "${field}"`);
    }
  }

  // Format checks
  if (manifest.id && !/^[a-z0-9-_]+$/.test(manifest.id)) {
    errors.push(`Field "id" must be lowercase alphanumeric with hyphens or underscores: "${manifest.id}"`);
  }

  if (manifest.category && !VALID_CATEGORIES.has(manifest.category)) {
    errors.push(`Invalid category: "${manifest.category}". Allowed: ${Array.from(VALID_CATEGORIES).join(', ')}`);
  }

  if (manifest.slots && Array.isArray(manifest.slots)) {
    for (const slot of manifest.slots) {
      if (!VALID_SLOTS.has(slot)) {
        errors.push(`Invalid slot name: "${slot}". Allowed: ${Array.from(VALID_SLOTS).join(', ')}`);
      }
    }
  }

  if (manifest.integrity && manifest.integrity.sha256) {
    if (!/^[a-fA-F0-9]{64}$/.test(manifest.integrity.sha256)) {
      errors.push('Integrity sha256 must be a 64-character hex string.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a defensive, no-op safe extension host context with bounded diagnostic logging.
 */
export function createSafeExtensionHost(
  availableCapabilities: Record<string, boolean> = {},
  onLog: ((entry: DiagnosticLogEntry) => void) | null = null,
  maxLogEntries = 500
): SafeExtensionHost {
  const listeners = new Map<string, Array<(payload: any) => void>>();
  const logSubscribers = new Set<(entry: DiagnosticLogEntry) => void>();
  
  // Bounded ring buffer for diagnostic telemetry
  const logRingBuffer: DiagnosticLogEntry[] = [];
  const maxEntries = Math.max(50, Number(maxLogEntries) || 500);

  const notifyLog = (entry: DiagnosticLogEntry) => {
    for (const sub of logSubscribers) {
      try {
        sub(entry);
      } catch (err) {
        // Safe no-op on listener error
      }
    }
  };

  const log = (entry: DiagnosticLogEntry) => {
    if (!entry) return;
    const formatted: DiagnosticLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      level: entry.level && VALID_LEVELS.has(entry.level) ? entry.level : 'info',
      source: String(entry.source || 'host'),
      stage: String(entry.stage || 'runtime'),
      message: String(entry.message || ''),
      meta: entry.meta && typeof entry.meta === 'object' ? entry.meta : {}
    };

    if (logRingBuffer.length >= maxEntries) {
      logRingBuffer.shift();
    }
    logRingBuffer.push(formatted);

    // Call external callback if registered
    if (typeof onLog === 'function') {
      try {
        onLog(formatted);
      } catch (err) {
        // Safe no-op
      }
    }

    notifyLog(formatted);
  };

  return {
    hasCapability(cap: string) {
      return Boolean(availableCapabilities[cap]);
    },

    dispatchHook(hookName: string, payload: any) {
      log({
        level: 'debug',
        source: 'hook-dispatcher',
        stage: 'dispatch',
        message: `Dispatching hook "${hookName}"`,
        meta: { payload: typeof payload === 'object' ? Object.keys(payload || {}) : typeof payload }
      });
      const handlers = listeners.get(hookName) || [];
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (err) {
          log({
            level: 'warn',
            source: 'hook-dispatcher',
            stage: 'handler_error',
            message: `Extension handler failed silently for hook: ${hookName}`,
            meta: { error: String(err && (err as any).message ? (err as any).message : err) }
          });
        }
      }
    },

    on(hookName: string, handler: (payload: any) => void) {
      if (typeof handler !== 'function') return () => {};
      if (!listeners.has(hookName)) {
        listeners.set(hookName, []);
      }
      listeners.get(hookName)!.push(handler);
      return () => {
        const arr = listeners.get(hookName) || [];
        listeners.set(hookName, arr.filter(h => h !== handler));
      };
    },

    async executeWithFallback<T>(
      task: () => Promise<T>,
      fallbackValue: T,
      stage: DiagnosticLogStage = 'fallback_stub',
      source = 'task-runner'
    ): Promise<T> {
      try {
        return await task();
      } catch (err) {
        log({
          level: 'warn',
          source,
          stage,
          message: `Task execution failed; seamlessly using fallback value: ${String(err && (err as any).message ? (err as any).message : err)}`,
          meta: { isFallback: true, error: String(err) }
        });
        return fallbackValue;
      }
    },

    log,

    getLogs(filter: LogFilter = {}) {
      let result = [...logRingBuffer];
      if (filter.level && filter.level !== 'all') {
        result = result.filter(e => e.level === filter.level);
      }
      if (filter.source && filter.source !== 'all') {
        result = result.filter(e => e.source.toLowerCase() === filter.source!.toLowerCase());
      }
      if (filter.stage && filter.stage !== 'all') {
        result = result.filter(e => e.stage!.toLowerCase() === filter.stage!.toLowerCase());
      }
      if (filter.query) {
        const q = filter.query.toLowerCase();
        result = result.filter(e => 
          e.message.toLowerCase().includes(q) || 
          e.source.toLowerCase().includes(q) ||
          JSON.stringify(e.meta).toLowerCase().includes(q)
        );
      }
      return result;
    },

    clearLogs() {
      logRingBuffer.length = 0;
      notifyLog({
        id: `log-clear-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        source: 'host',
        stage: 'log_clear',
        message: 'Log buffer cleared.',
        meta: {}
      });
    },

    subscribeLogs(listener: (entry: DiagnosticLogEntry) => void) {
      if (typeof listener !== 'function') return () => {};
      logSubscribers.add(listener);
      return () => {
        logSubscribers.delete(listener);
      };
    }
  };
}

// Global singleton host for in-app diagnostic tracing
export const defaultHostInstance: SafeExtensionHost = createSafeExtensionHost({
  local_storage: true,
  indexeddb: true,
  network: true
});

// Optional CJS bridge
declare const module: any;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateExtensionManifest,
    createSafeExtensionHost,
    defaultHostInstance,
    VALID_CATEGORIES,
    VALID_SLOTS,
    VALID_LEVELS
  };
}
