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
export const VALID_CATEGORIES = new Set([
    'librget',
    'librfind',
    'librmanage',
    'libr_ai',
    'shelves',
    'bridge'
]);
export const VALID_SLOTS = new Set([
    'quickbar',
    'book-menu',
    'settings-panel',
    'shelf-rule-provider'
]);
export const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error']);
/**
 * Validate an extension manifest against the Kittlibr Extension Contract v1.0.
 */
export function validateExtensionManifest(manifest) {
    const errors = [];
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
export function createSafeExtensionHost(availableCapabilities = {}, onLog = null, maxLogEntries = 500) {
    const listeners = new Map();
    const logSubscribers = new Set();
    // Bounded ring buffer for diagnostic telemetry
    const logRingBuffer = [];
    const maxEntries = Math.max(50, Number(maxLogEntries) || 500);
    const notifyLog = (entry) => {
        for (const sub of logSubscribers) {
            try {
                sub(entry);
            }
            catch (err) {
                // Safe no-op on listener error
            }
        }
    };
    const log = (entry) => {
        if (!entry)
            return;
        const formatted = {
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
            }
            catch (err) {
                // Safe no-op
            }
        }
        notifyLog(formatted);
    };
    return {
        hasCapability(cap) {
            return Boolean(availableCapabilities[cap]);
        },
        dispatchHook(hookName, payload) {
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
                }
                catch (err) {
                    log({
                        level: 'warn',
                        source: 'hook-dispatcher',
                        stage: 'handler_error',
                        message: `Extension handler failed silently for hook: ${hookName}`,
                        meta: { error: String(err && err.message ? err.message : err) }
                    });
                }
            }
        },
        on(hookName, handler) {
            if (typeof handler !== 'function')
                return () => { };
            if (!listeners.has(hookName)) {
                listeners.set(hookName, []);
            }
            listeners.get(hookName).push(handler);
            return () => {
                const arr = listeners.get(hookName) || [];
                listeners.set(hookName, arr.filter(h => h !== handler));
            };
        },
        async executeWithFallback(task, fallbackValue, stage = 'fallback_stub', source = 'task-runner') {
            try {
                return await task();
            }
            catch (err) {
                log({
                    level: 'warn',
                    source,
                    stage,
                    message: `Task execution failed; seamlessly using fallback value: ${String(err && err.message ? err.message : err)}`,
                    meta: { isFallback: true, error: String(err) }
                });
                return fallbackValue;
            }
        },
        log,
        getLogs(filter = {}) {
            let result = [...logRingBuffer];
            if (filter.level && filter.level !== 'all') {
                result = result.filter(e => e.level === filter.level);
            }
            if (filter.source && filter.source !== 'all') {
                result = result.filter(e => e.source.toLowerCase() === filter.source.toLowerCase());
            }
            if (filter.stage && filter.stage !== 'all') {
                result = result.filter(e => e.stage.toLowerCase() === filter.stage.toLowerCase());
            }
            if (filter.query) {
                const q = filter.query.toLowerCase();
                result = result.filter(e => e.message.toLowerCase().includes(q) ||
                    e.source.toLowerCase().includes(q) ||
                    JSON.stringify(e.meta).toLowerCase().includes(q));
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
        subscribeLogs(listener) {
            if (typeof listener !== 'function')
                return () => { };
            logSubscribers.add(listener);
            return () => {
                logSubscribers.delete(listener);
            };
        }
    };
}
// Global singleton host for in-app diagnostic tracing
export const defaultHostInstance = createSafeExtensionHost({
    local_storage: true,
    indexeddb: true,
    network: true
});
// CJS compatibility bridge if running in Node.js
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
