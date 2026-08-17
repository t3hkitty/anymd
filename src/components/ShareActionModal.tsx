import React, { useState } from 'react';
import type { ResonanceEntry } from '../types/resonance';
import { PLUGGABLE_SHARE_HANDLERS } from '../plugins/shareActionsPlugin';
import { X, Share2, Check, ExternalLink } from 'lucide-react';

interface ShareActionModalProps {
  isOpen: boolean;
  entry: ResonanceEntry | null;
  bookTitle: string;
  onClose: () => void;
}

export const ShareActionModal: React.FC<ShareActionModalProps> = ({
  isOpen,
  entry,
  bookTitle,
  onClose,
}) => {
  const [successHandlerId, setSuccessHandlerId] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  const handleExecuteShare = async (handlerId: string) => {
    const handler = PLUGGABLE_SHARE_HANDLERS.find(h => h.id === handlerId);
    if (handler) {
      const ok = await handler.execute(entry, bookTitle);
      if (ok) {
        setSuccessHandlerId(handlerId);
        setTimeout(() => setSuccessHandlerId(null), 2500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Pluggable Share & Intent Handlers</h3>
              <p className="text-xs text-slate-400">Share Micro-Reactions & Launch Intent Apps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Reaction Target Preview */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-amber-400 font-mono font-bold">
              [{entry.formattedDate} | {entry.progressPercent}%] [Category: {entry.category}]
            </span>
            <p className="text-xs text-slate-200 italic font-medium">"{entry.rawText}"</p>
          </div>

          {/* Share Handlers List */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Pluggable Share Action
            </label>

            <div className="space-y-2">
              {PLUGGABLE_SHARE_HANDLERS.map((h) => {
                const isDone = successHandlerId === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => handleExecuteShare(h.id)}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <h5 className="font-bold text-xs text-slate-100">{h.name}</h5>
                        <p className="text-[11px] text-slate-400">{h.description}</p>
                      </div>
                    </div>

                    {isDone ? (
                      <span className="text-emerald-400 flex items-center space-x-1 text-xs font-bold">
                        <Check className="w-4 h-4" />
                        <span>Done</span>
                      </span>
                    ) : (
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
