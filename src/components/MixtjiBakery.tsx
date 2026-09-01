import React, { useState } from 'react';
import { Sparkles, Copy, Plus, X, Check, Utensils } from 'lucide-react';

export interface MixtjiBakeryProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectEmoji?: (bakedEmoji: string) => void;
}

const KAOMOJI_OPTIONS = [
  '(⁠=⁠^⁠.⁠^⁠=⁠)',
  '(⁠ฅ⁠^⁠•⁠ﻌ⁠•⁠^⁠ฅ⁠)',
  '(⁠◕⁠‿⁠◕⁠✿⁠)',
  '(⁠╯⁠°⁠□⁠°⁠)⁠╯⁠︵⁠ ⁠┻⁠━⁠┻',
  '(⁠*⁠^⁠.⁠^⁠*⁠)',
  '૮ ˶- ⊥ -˶ ა',
  '٩(◕‿◕｡)۶'
];

const BASE_EMOJIS = ['🐱', '🌸', '✨', '🐾', '🎀', '🍱', '🍙', '💜', '⚡', '🌙'];

const FRAME_OPTIONS = [
  { id: 'sandwich', label: 'Sandwich [Base+Kaomoji+Base]', format: (k: string, e: string) => `${e}${k}${e}` },
  { id: 'sparkle-bubble', label: 'Sparkle Bubble 🫧', format: (k: string, e: string) => `🫧 ${e} ${k} ${e} 🫧` },
  { id: 'left', label: 'Left Base', format: (k: string, e: string) => `${e} ${k}` },
  { id: 'right', label: 'Right Base', format: (k: string, e: string) => `${k} ${e}` }
];

export const MixtjiBakery: React.FC<MixtjiBakeryProps> = ({
  isOpen,
  onClose,
  onInjectEmoji
}) => {
  const [selectedKaomoji, setSelectedKaomoji] = useState(KAOMOJI_OPTIONS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(BASE_EMOJIS[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAME_OPTIONS[0].id);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFrameObj = FRAME_OPTIONS.find(f => f.id === selectedFrame) || FRAME_OPTIONS[0];
  const bakedResult = currentFrameObj.format(selectedKaomoji, selectedEmoji);

  const handleCopy = () => {
    navigator.clipboard.writeText(bakedResult);
    setToast('📋 Copied to Clipboard!');
    setTimeout(() => setToast(null), 2500);
  };

  const handleInject = () => {
    if (onInjectEmoji) {
      onInjectEmoji(bakedResult);
    } else {
      navigator.clipboard.writeText(bakedResult);
    }
    setToast('📥 Injected into Note!');
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-900 border-2 border-pink-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5 text-slate-100 animate-fadeIn"
        style={{ borderRadius: '32px', boxShadow: '4px 4px 0px #000' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-pink-500/20 border border-pink-500/40 text-pink-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide flex items-center gap-2">
                🐱🎨 Mixtji Bakery &amp; Recipe Mixer
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Recipe-based emoji mixing [Base + Mod]
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Baked Result Output Display */}
        <div className="bg-slate-950 border-2 border-pink-500/50 p-6 rounded-2xl text-center relative flex flex-col items-center justify-center min-h-[100px] shadow-inner">
          <div className="text-2xl font-bold text-white tracking-widest font-mono">
            {bakedResult}
          </div>
          <span className="text-[10px] text-pink-400 font-mono mt-2 uppercase tracking-wider font-bold">
            [ Recipe Baked Result ]
          </span>
        </div>

        {/* Recipe Selection Form */}
        <div className="flex flex-col gap-3">
          {/* Kaomoji Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Kaomoji Expression (Mod)
            </label>
            <select
              value={selectedKaomoji}
              onChange={e => setSelectedKaomoji(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-mono focus:border-pink-500 focus:outline-none"
            >
              {KAOMOJI_OPTIONS.map((k, idx) => (
                <option key={idx} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Base Emoji Chips */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Base Neko Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {BASE_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setSelectedEmoji(e)}
                  className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${
                    selectedEmoji === e
                      ? 'bg-pink-600/30 border-pink-400 scale-110 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Frame Recipe Style */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Recipe Frame Framing
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FRAME_OPTIONS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFrame(f.id)}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold font-mono transition-all text-left ${
                    selectedFrame === f.id
                      ? 'bg-pink-600/20 border-pink-500 text-pink-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {toast && (
          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-center animate-bounce">
            {toast}
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            type="button"
            onClick={handleInject}
            className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            style={{ boxShadow: '2px 2px 0px #000' }}
          >
            <Sparkles className="w-4 h-4" /> Inject into Note
          </button>
        </div>
      </div>
    </div>
  );
};
