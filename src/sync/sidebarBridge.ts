export interface AnymdState {
  mode: string;       // e.g. 'WORK' | 'PLAY' | 'PERSONAL'
  category: string;   // e.g. 'Books' | 'Journal Vaults' | 'Blueprints' | 'Sandboxes'
  activeVault: string;// e.g. 'anymd-main' | 'signalstack-discovery' | 'storycraft-lore'
  viewLayout: string; // e.g. 'Grid' | 'List' | '3D' | 'Spines' | 'Hangers'
}

type StateListener = (state: AnymdState) => void;
const listeners: Set<StateListener> = new Set();

let currentState: AnymdState = {
  mode: 'WORK',
  category: 'Books',
  activeVault: 'anymd-main',
  viewLayout: 'Grid',
};

if (typeof window !== 'undefined') {
  // Listen for sync events from the Chrome Extension side panel
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ANYMD_STATE_SYNC') {
      const newState = event.data.payload as AnymdState;
      if (newState) {
        currentState = { ...currentState, ...newState };
        listeners.forEach((listener) => listener(currentState));
      }
    }
  });
}

export const sidebarBridge = {
  getState: (): AnymdState => currentState,
  
  setState: (newState: Partial<AnymdState>) => {
    currentState = { ...currentState, ...newState };
    
    // Broadcast state to Chrome Extension side panel (postMessage)
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'ANYMD_STATE_SYNC', payload: currentState }, '*');
      // Also attempt Chrome Extension runtime message if running inside extension context
      try {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: 'ANYMD_STATE_SYNC', payload: currentState });
        }
      } catch (e) {
        // Safe to ignore if chrome extension context is not active
      }
    }
    
    listeners.forEach((listener) => listener(currentState));
  },
  
  subscribe: (listener: StateListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
