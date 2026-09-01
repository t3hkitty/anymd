/**
 * Zettelkasten ID: 20260826-1837
 * Project: @lorik/meow-core
 * Role: Status Toast Notifications with Kinetic Brutalist Pills [cite: 615, 300]
 */

import React, { useState, useEffect } from 'react';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export const MeowToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handlePushToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { text, type = 'info' } = customEvent.detail;
      const newToast: ToastMessage = {
        id: Math.random().toString(36).substring(2, 9),
        text,
        type
      };
      
      setToasts((prev) => [...prev, newToast]);
      
      // Auto-expire toast in 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    window.addEventListener('meow_toast_push', handlePushToast);
    return () => window.removeEventListener('meow_toast_push', handlePushToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none font-mono">
      {toasts.map((toast) => {
        const bgStyle = 
          toast.type === 'success' ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-emerald-400' :
          toast.type === 'error' ? 'bg-rose-100 border-rose-500 text-rose-900 shadow-rose-400' :
          'bg-indigo-100 border-indigo-500 text-indigo-900 shadow-indigo-400';

        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto p-3 border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-between gap-4 animate-slide-in ${bgStyle}`}
          >
            <span className="text-xs font-bold font-mono">⚡ {toast.text}</span>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-xs hover:text-slate-500 active:scale-90"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Trigger helper to programmatically push status toast notifications [cite: 615]
 */
export function pushMeowToast(text: string, type: 'success' | 'error' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('meow_toast_push', { detail: { text, type } }));
}
