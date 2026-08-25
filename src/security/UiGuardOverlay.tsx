import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Unlock, Sparkles } from 'lucide-react';

interface UiGuardOverlayProps {
  isOpen: boolean;
  onUnlock: () => void;
  onBypass: () => void;
  onExternalOpen: () => void;
  correctPin: string;
}

export const UiGuardOverlay: React.FC<UiGuardOverlayProps> = ({
  isOpen,
  onUnlock,
  onBypass,
  onExternalOpen,
  correctPin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPin) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPinInput('');
    }
  };

  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-6 z-40 font-mono text-xs">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <div className="p-4 bg-sky-950/40 text-sky-400 rounded-full border border-sky-500/20 animate-pulse">
            <ShieldAlert size={36} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-widest">
            🔒 Vault Data Locked
          </h2>
          <p className="text-neutral-500 leading-relaxed text-[11px]">
            This vault requires a 4-6 digit numeric PIN to view raw notes. 
            All background indexing, file syncing, and n8n webhooks continue to run in the background.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex justify-center">
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="ENTER PIN"
              className="bg-neutral-950 border border-neutral-800 text-center tracking-widest text-lg font-bold text-sky-300 rounded-xl px-4 py-2.5 outline-none focus:border-sky-500/50 w-44"
            />
          </div>
          {error && (
            <div className="text-rose-500 font-bold text-[10px]">
              ⚠️ Incorrect PIN. Try again.
            </div>
          )}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-xl transition-colors cursor-pointer font-bold"
          >
            <Unlock size={14} />
            <span>Unlock Vault</span>
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-800/60 flex flex-col space-y-2">
          <button
            onClick={onExternalOpen}
            className="w-full flex items-center justify-center space-x-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 py-2 rounded-xl transition-all cursor-pointer"
          >
            <ExternalLink size={12} />
            <span>Open in External Editor (shell.openPath)</span>
          </button>

          <button
            onClick={onBypass}
            className="w-full flex items-center justify-center space-x-1.5 bg-neutral-950/30 hover:bg-neutral-800/40 text-neutral-500 hover:text-neutral-300 py-1.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-neutral-800"
            title="Sets ui_guard.enabled to false to instantly clear the lock"
          >
            <Sparkles size={11} />
            <span>Simulate YAML Bypass (ui_guard.enabled: false)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
