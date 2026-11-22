/**
 * AnyMD Extension Hook Registry (`extension_hook_registry.ts`)
 * Implements pluggable extension lifecycle hooks (onFileDiscovered, onSidecarWrite, onShardCompact, onQueryTranslate, onCloudSync).
 */

export type HookEvent = 'onFileDiscovered' | 'onSidecarWrite' | 'onShardCompact' | 'onQueryTranslate' | 'onCloudSync';

export class ExtensionHookRegistry {
  private listeners: Map<HookEvent, Function[]> = new Map();

  public registerHook(event: HookEvent, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    console.log(`[ExtensionHookRegistry] Registered listener for hook: ${event}`);
  }

  public async triggerHook(event: HookEvent, payload: any): Promise<any> {
    const callbacks = this.listeners.get(event) || [];
    let currentPayload = payload;
    for (const cb of callbacks) {
      currentPayload = await cb(currentPayload) ?? currentPayload;
    }
    return currentPayload;
  }
}
