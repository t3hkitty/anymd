export type HookEventName = 'onCrmGiftUrlGenerated' | 'onNoteCreated' | 'onSidecarExport';

export interface HookPayload {
  originalUrl?: string;
  affiliateId?: string;
  provider?: string;
  [key: string]: any;
}

export type HookCallback = (payload: HookPayload) => any;

export class AnymdHookRegistryClass {
  private hooks: Map<HookEventName, HookCallback[]> = new Map();

  register(event: HookEventName, callback: HookCallback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push(callback);
  }

  trigger(event: HookEventName, payload: HookPayload) {
    const callbacks = this.hooks.get(event) || [];
    let current = { ...payload };
    for (const cb of callbacks) {
      const res = cb(current);
      if (res) current = { ...current, ...res };
    }
    return current;
  }
}

export const AnymdHookRegistry = new AnymdHookRegistryClass();
