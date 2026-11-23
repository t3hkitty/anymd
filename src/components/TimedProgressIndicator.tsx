/**
 * TimedProgressIndicator.tsx
 * 🐾 Kawaiianism v3.1 Anti-Slop Directive
 *
 * Reusable progressive linear progress indicator with:
 * 1. Exact step / count progress (`Step 2/5 • 40%` or `importing 12/150`)
 * 2. Live elapsed timer (`00:14`)
 * 3. Dynamic ETA check-back calculation (`Usually takes ~30–45s — check back around 3:12 PM`)
 * 4. High-contrast hard offset shadows (4px 4px 0px #000) and soft Kawaiian lavender/indigo styling
 * 5. Completion chime ("DING") via Web Audio API synthesized bell note with mute preference
 */

import React, { useEffect, useState, useRef } from 'react';
import { Clock, Sparkles, CheckCircle2, Volume2, VolumeX } from 'lucide-react';

export interface TimedProgressIndicatorProps {
  currentCount?: number;
  totalCount?: number;
  percent?: number;
  statusText?: string;
  stageLabel?: string;
  isComplete?: boolean;
  estimatedTotalSeconds?: number;
  onFinishNotice?: string;
  showMuteToggle?: boolean;
}

export function playCompletionChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone cheerful bell (E6 -> B6)
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1975.53, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.75);
  } catch {
    // Graceful no-op in headless/unsupported environments
  }
}

export const TimedProgressIndicator: React.FC<TimedProgressIndicatorProps> = ({
  currentCount = 0,
  totalCount = 0,
  percent: propPercent,
  statusText = 'Processing...',
  stageLabel,
  isComplete = false,
  estimatedTotalSeconds = 45,
  onFinishNotice,
  showMuteToggle = true
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('anymd_progress_chime_muted') === 'true');
  const startTimeRef = useRef<number>(Date.now());
  const chimePlayedRef = useRef(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Compute calculated percentage
  const computedPercent = propPercent !== undefined
    ? Math.min(100, Math.max(0, Math.round(propPercent)))
    : totalCount > 0
    ? Math.min(100, Math.max(0, Math.round((currentCount / totalCount) * 100)))
    : Math.min(95, Math.round((elapsed / Math.max(60, estimatedTotalSeconds)) * 100));

  // Trigger completion sound once on complete
  useEffect(() => {
    if (isComplete && !chimePlayedRef.current) {
      chimePlayedRef.current = true;
      if (!isMuted) {
        playCompletionChime();
      }
    }
  }, [isComplete, isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('anymd_progress_chime_muted', String(next));
      return next;
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Estimate check-back hint
  const getEtaHint = () => {
    if (isComplete) return 'Done!';
    if (totalCount > 0 && currentCount > 0) {
      const rate = currentCount / Math.max(1, elapsed);
      const remainingSecs = Math.max(5, Math.round((totalCount - currentCount) / rate));
      const checkBackDate = new Date(Date.now() + remainingSecs * 1000);
      const timeStr = checkBackDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `~${Math.ceil(remainingSecs / 60)}m left — check back around ${timeStr}`;
    }
    const checkBackDate = new Date(Date.now() + Math.max(45, estimatedTotalSeconds - elapsed) * 1000);
    const timeStr = checkBackDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Usually takes ~${estimatedTotalSeconds}s — check back around ${timeStr}`;
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-slate-950/90 border-2 border-indigo-500/50 text-slate-100 font-mono shadow-[4px_4px_0px_#000] space-y-3">
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 truncate">
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          )}
          <span className="font-bold text-indigo-300 truncate">{statusText}</span>
          {stageLabel && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700/60 text-[10px]">
              {stageLabel}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {showMuteToggle && (
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute finish chime' : 'Mute finish chime'}
              className="text-slate-400 hover:text-amber-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Elapsed: {formatTime(elapsed)}</span>
          </span>
          <span className="font-bold text-amber-300 text-sm">
            {computedPercent}%
          </span>
        </div>
      </div>

      {/* Progressive Bar */}
      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 shadow-md shadow-indigo-500/50'
          }`}
          style={{ width: `${computedPercent}%` }}
        />
      </div>

      {/* Bottom Sub-bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <div>
          {totalCount > 0 ? (
            <span className="text-slate-300 font-bold">
              Importing <strong className="text-amber-300">#{currentCount}</strong> / {totalCount} files
            </span>
          ) : (
            <span>Processing sidecar stream...</span>
          )}
        </div>
        <div className="text-right text-indigo-300 font-sans text-[11px]">
          {isComplete ? (
            <span className="text-emerald-400 font-bold">
              {onFinishNotice || `Done in ${elapsed}s ✨`}
            </span>
          ) : (
            <span>{getEtaHint()}</span>
          )}
        </div>
      </div>
    </div>
  );
};
