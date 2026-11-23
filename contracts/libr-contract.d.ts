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
export type LibrCategory = 'librget' | 'librfind' | 'librmanage' | 'libr_ai' | 'shelves' | 'bridge';
export type LibrSlot = 'quickbar' | 'book-menu' | 'settings-panel' | 'shelf-rule-provider';
export type DiagnosticLogLevel = 'debug' | 'info' | 'warn' | 'error';
export type DiagnosticLogStage = 'catalog_read' | 'fetch' | 'fallback_stub' | 'render' | 'sync' | 'dispatch' | 'handler_error' | 'runtime' | string;
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
    executeWithFallback<T>(task: () => Promise<T>, fallbackValue: T, stage?: DiagnosticLogStage, source?: string): Promise<T>;
    log(entry: DiagnosticLogEntry): void;
    getLogs(filter?: LogFilter): DiagnosticLogEntry[];
    clearLogs(): void;
    subscribeLogs(listener: (entry: DiagnosticLogEntry) => void): () => void;
}
export declare const VALID_CATEGORIES: Set<LibrCategory>;
export declare const VALID_SLOTS: Set<LibrSlot>;
export declare const VALID_LEVELS: Set<DiagnosticLogLevel>;
/**
 * Validate an extension manifest against the Kittlibr Extension Contract v1.0.
 */
export declare function validateExtensionManifest(manifest: Record<string, any>): ValidationResult;
/**
 * Creates a defensive, no-op safe extension host context with bounded diagnostic logging.
 */
export declare function createSafeExtensionHost(availableCapabilities?: Record<string, boolean>, onLog?: ((entry: DiagnosticLogEntry) => void) | null, maxLogEntries?: number): SafeExtensionHost;
export declare const defaultHostInstance: SafeExtensionHost;
