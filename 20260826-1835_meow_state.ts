/**
 * Zettelkasten ID: 20260826-1835
 * Project: @lorik/meow-core
 * Role: Core State Persistence & "Sticky" settings with cross-tab synchronizers
 */

import { useState, useEffect } from 'react';

/**
 * Sticky Settings: Persistent state manager utilizing explicit localStorage keys
 * with automatic fallback defaults and cross-tab/window event notifications [cite: 615, 324].
 */
export function useStickySetting<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.warn(`[MeowState] Failed reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`[MeowState] Failed setting localStorage key "${key}":`, e);
    }
    // Broadcast state mutations to other context tabs/listeners
    window.dispatchEvent(new CustomEvent('meow_setting_sync', { detail: { key, value: state } }));
  }, [key, state]);

  // Sync listener for cross-tab mutations
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.key === key) {
        setState(customEvent.detail.value);
      }
    };
    window.addEventListener('meow_setting_sync', handleSync);
    return () => window.removeEventListener('meow_setting_sync', handleSync);
  }, [key]);

  return [state, setState];
}
