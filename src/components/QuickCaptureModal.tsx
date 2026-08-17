import React, { useState, useEffect } from 'react';
import { EMOTIONAL_PRESETS } from '../data/emotionalPresets';
import type { EmotionalTier, ReadingPosition, ResonanceEntry } from '../types/resonance';
import { X, Sparkles, Send, Clock, Percent, Anchor, Flame, CheckCircle2, Quote } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickCaptureModalProps {
  isOpen: boolean;
  position: ReadingPosition;
  onClose: () => void;
  onCommitResonance: (entry: ResonanceEntry) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  position,
  onClose,
  onCommitResonance,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<EmotionalTier | null>('diaper-emergency');
  const [rawText, setRawText] = useState<string>('');
  const [intensityScore, setIntensityScore] = useState<number>(5);
  const [customCategory, setCustomCategory] = useState<string>('');

  // Update text when preset changes
  useEffect(() => {
    if (selectedPreset) {
      const presetObj = EMOTIONAL_PRESETS.find(p => p.id === selectedPreset);
      if (presetObj) {
        setRawText(presetObj.exampleQuote);
        setCustomCategory(presetObj.badgeCategory);
      }
    }
  }, [selectedPreset]);

  if (!isOpen) return null;

  const handlePresetSelect = (presetId: EmotionalTier) => {
    setSelectedPreset(presetId);
    const presetObj = EMOTIONAL_PRESETS.find(p => p.id === presetId);
    if (presetObj) {
      setRawText(presetObj.exampleQuote);
      setCustomCategory(presetObj.badgeCategory);
    }
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const timestampStr = now.toISOString();

    const newEntry: ResonanceEntry = {
      id: `res-${Date.now()}`,
      timestamp: timestampStr,
      formattedDate,
      progressPercent: position.progressPercent,
      category: customCategory || 'General Reaction',
      presetTier: selectedPreset || undefined,
      rawText: rawText.trim().toUpperCase(),
      cfi: position.cfi,
      chapterTitle: position.chapterTitle,
      paragraphIndex: position.paragraphIndex,
      paragraphSnippet: position.paragraphSnippet,
      intensityScore
    };

    // Confetti celebration burst
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }

    onCommitResonance(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Reader Resonance Stream</h3>
              <p className="text-xs text-slate-400">Expressive Micro-Logging &bull; Private Sovereign Layer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCommit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* Target Telemetry Snapshot Pill */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/60 pb-2">
              <span className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <Percent className="w-3.5 h-3.5" />
                <span>{position.progressPercent}% Read</span>
              </span>
              <span className="flex items-center space-x-1.5 text-indigo-400">
                <Anchor className="w-3.5 h-3.5" />
                <span className="truncate max-w-[280px]">{position.cfi}</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date().toISOString().split('T')[0]}</span>
              </span>
            </div>

            <div className="flex items-start space-x-2 text-xs text-slate-300 italic pt-1">
              <Quote className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="line-clamp-2">"{position.paragraphSnippet}"</p>
            </div>
          </div>

          {/* Section 3.8.B2: Pre-filled Sentimental Context Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Pre-Filled Sentimental Context Archetypes (Emotional Presets)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMOTIONAL_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex items-start space-x-3 ${
                      isSelected
                        ? 'shadow-lg scale-[1.02]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      background: isSelected ? preset.bgGradient : undefined,
                      borderColor: isSelected ? preset.borderColor : undefined,
                    }}
                  >
                    <span className="text-2xl shrink-0 leading-none">{preset.emoji}</span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs" style={{ color: preset.color }}>
                          {preset.tierName}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Raw Visceral Reaction Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Raw Unfiltered Reaction Text
              </label>
              <span className="text-[11px] text-amber-400 font-mono">Will commit straight into sidecar .md</span>
            </div>
            
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={3}
              placeholder="Type raw visceral thoughts... e.g. LAUGHED SO HARD THE RIBS SEIZED..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 placeholder-slate-600 shadow-inner"
              required
            />
          </div>

          {/* Category Badge & Intensity Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Badge Category Header
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Collision Intensity
              </label>
              <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 justify-around">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensityScore(lvl)}
                    className={`p-1 rounded-lg transition-transform ${
                      intensityScore >= lvl ? 'text-amber-400 scale-110' : 'text-slate-700'
                    }`}
                  >
                    <Flame className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Atomic Commit to .md Sidecar</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
