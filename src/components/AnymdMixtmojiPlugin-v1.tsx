import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Smile, HelpCircle, Info, X, Copy, Download, RefreshCw, Volume2, VolumeX, CheckSquare, Square } from 'lucide-react';

// ==========================================
// 1. Types & Core Data Structures
// ==========================================

interface EmojiItem {
  char: string;
  name: string;
  category: 'somatic' | 'mental' | 'creative' | 'sensory';
  description: string;
}

interface MixtmojiCombination {
  name: string;
  emoji: string;
  ascii: string;
  somaticPhase: string;
  tags: string[];
  description: string;
}

const EMOJI_POOL: EmojiItem[] = [
  { char: '🐱', name: 'Cat', category: 'creative', description: 'Silly mascot energy & local-first purr' },
  { char: '🐧', name: 'Piplup', category: 'sensory', description: 'Dawn Contest Ribbon sanctuary & radar' },
  { char: '☕', name: 'Coffee', category: 'somatic', description: 'Gastrocolic reflex & CNS headache vasoconstrictor' },
  { char: '🚽', name: 'Pee', category: 'somatic', description: 'Sips-to-Pee biotelemetry (<3m duration)' },
  { char: '💩', name: 'Poop', category: 'somatic', description: 'Gut health telemetry (>=3m duration)' },
  { char: '🍎', name: 'Apple', category: 'somatic', description: 'Non-caloric body fuel & activity priming' },
  { char: '🍫', name: 'Chocolate', category: 'somatic', description: 'Dopamine reward & executive dysfunction buffer' },
  { char: '🧘', name: 'Calm', category: 'mental', description: 'Box breathing, slow rest & sensory reset' },
  { char: '🎨', name: 'Create', category: 'creative', description: 'Vibe-coding, UI mapping & worldbuilding' },
  { char: '📚', name: 'Consume', category: 'creative', description: 'TBR backlog, webnovels & audio pacing' },
  { char: '💀', name: 'Distress', category: 'mental', description: 'Executive paralysis, sensory overload or low state' },
  { char: '😍', name: 'Super Happy', category: 'mental', description: 'Peak flow states & extreme satisfaction' },
];

const COMBINATIONS: Record<string, MixtmojiCombination> = {
  '🐱+🍫': {
    name: 'Dopaminergic Cat',
    emoji: '🐱🍫',
    ascii: '  /\\_/\\\n ( >.< )  ⚡ *dopamine rush!*\n (  🍫 ) \n  u--u',
    somaticPhase: 'collaborate',
    tags: ['#mbb_cat', '#dopamine_victory', '#silly_goose'],
    description: 'Silly cat chewing on chocolate, completely bypassing executive paralysis.'
  },
  '☕+🚽': {
    name: 'Caffeine Excretion Relay',
    emoji: '☕🚽',
    ascii: ' ┌───┐\n │ ☕ │ ➔ 🚽 *vasoconstriction check!*\n └───┘',
    somaticPhase: 'chow_down',
    tags: ['#coffee', '#pee', '#bio_telemetry', '#hydration_station'],
    description: 'Coffee-stimulated headache relief and subsequent sips-to-pee biotelemetry.'
  },
  '🍎+🍫': {
    name: 'Non-Caloric Activity Priming',
    emoji: '🍎🍫',
    ascii: ' 🍎 + 🍫 ➔ 🚀 *focus readiness: HIGH*',
    somaticPhase: 'chow_down',
    tags: ['#activity_priming', '#body_fuel', '#anti_diet'],
    description: 'Re-framed food as positive somatic fuel to prime your next building sprint.'
  },
  '🧘+💀': {
    name: 'Executive Paralysis Reset',
    emoji: '🧘💀',
    ascii: ' 🧘 ➔ 🌬️ (Inhale 4s ➔ Hold 4s ➔ Exhale 4s) ➔ 🛡️',
    somaticPhase: 'calm',
    tags: ['#somatic_recovery', '#box_breathing', '#calm_mode'],
    description: 'Triggers a 60-second box breathing routine to reset cortisol and clear burnout.'
  },
  '🎨+📚': {
    name: 'StoryCraft Lore Ingest',
    emoji: '🎨📚',
    ascii: ' 🎨 [[Lore]] + 📚 [[Story]] ➔ ✍️ *prose compiled*',
    somaticPhase: 'create',
    tags: ['#storycraft', '#author_bible', '#zettelkasten'],
    description: ' centralizes reading resonance and casting tables into portable sidecars.'
  },
  '🐧+😍': {
    name: 'Happy Piplup Sanctuary',
    emoji: '🐧😍',
    ascii: '  ( • ө • )  ✨ *dawn ribbon active!*\n 🫧 ( 🐧 ) 🫧',
    somaticPhase: 'calm',
    tags: ['#piplup_radar', '#dawn_ribbon', '#sanctuary_mode'],
    description: 'Sweet Pokemon Contest sapphire cameo offering a protective, high-contrast shelter.'
  }
};

// ==========================================
// 2. React UI Component & Layout
// ==========================================

export const AnymdMixtmojiPlugin: React.FC = () => {
  // Sticky Settings (localStorage)
  const [chimeEnabled, setChimeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('anymd_mixtmoji_chime');
    return saved !== null ? saved === 'true' : true;
  });
  const [autoCopy, setAutoCopy] = useState<boolean>(() => {
    const saved = localStorage.getItem('anymd_mixtmoji_autocopy');
    return saved !== null ? saved === 'true' : true;
  });

  // Editor State
  const [emoji1, setEmoji1] = useState<EmojiItem | null>(null);
  const [emoji2, setEmoji2] = useState<EmojiItem | null>(null);
  const [result, setResult] = useState<MixtmojiCombination | null>(null);
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isFaqOpen, setIsFaqOpen] = useState<boolean>(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('anymd_mixtmoji_chime', String(chimeEnabled));
  }, [chimeEnabled]);

  useEffect(() => {
    localStorage.setItem('anymd_mixtmoji_autocopy', String(autoCopy));
  }, [autoCopy]);

  // Esc and click-outside trigger setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFaqOpen(false);
        setIsChangelogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Synthesize dual-oscillator chime sound (Procedural Web Audio API)
  const playMixChime = () => {
    if (!chimeEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // Satisfying dual major third chord chime
      playTone(523.25, ctx.currentTime, 0.4); // C5
      playTone(659.25, ctx.currentTime + 0.05, 0.55); // E5
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  const handleEmojiSelect = (emoji: EmojiItem) => {
    if (activeSlot === 1) {
      setEmoji1(emoji);
      setActiveSlot(2);
    } else {
      setEmoji2(emoji);
      setActiveSlot(1);
    }
  };

  const handleReset = () => {
    setEmoji1(null);
    setEmoji2(null);
    setResult(null);
    setActiveSlot(1);
    showToast('Workspace cleared. Make today non-zero!');
  };

  const handleBake = () => {
    if (!emoji1 || !emoji2) {
      showToast('⚠️ Please select both primary and secondary emojis first.');
      return;
    }

    const key1 = `${emoji1.char}+${emoji2.char}`;
    const key2 = `${emoji2.char}+${emoji1.char}`;
    const combo = COMBINATIONS[key1] || COMBINATIONS[key2];

    let finalCombo: MixtmojiCombination;

    if (combo) {
      finalCombo = combo;
    } else {
      // Fallback procedural merge
      const mergedEmoji = emoji1.char + emoji2.char;
      finalCombo = {
        name: `Mashed ${emoji1.name}-${emoji2.name}`,
        emoji: mergedEmoji,
        ascii: `  \\*_*\\ \n (${emoji1.char} _ ${emoji2.char}) ✨ *baked local-first!* \n  u---u`,
        somaticPhase: 'create',
        tags: [`#mashed_${emoji1.name.toLowerCase()}`, `#mashed_${emoji2.name.toLowerCase()}`, '#mixtmoji'],
        description: `Procedural mix combining ${emoji1.description} with ${emoji2.description}.`
      };
    }

    setResult(finalCombo);
    playMixChime();
    showToast(`✨ Successfully baked ${finalCombo.name}!`);

    if (autoCopy) {
      handleCopy(finalCombo);
    }
  };

  const formatZettelMarkdown = (combo: MixtmojiCombination): string => {
    const timestamp = new Date().toISOString().slice(0,16).replace(/[-T:]/g, '').slice(0, 12);
    return `---
type: "mixtmoji_session"
zettel_id: "ZK-${timestamp}-MIX"
title: "${combo.name}"
combined_emojis: "${combo.emoji}"
somatic_phase: "${combo.somaticPhase}"
tags:
${combo.tags.map(t => `  - "${t}"`).join('\n')}
---

# ⚡ Mixtmoji Session: ${combo.name} (${combo.emoji})

### 🌌 Visual Composition & ASCII Sketch:
\`\`\`
${combo.ascii}
\`\`\`

### 💡 Tactical Description & Somatic Integration:
- **Core Concept**: ${combo.description}
- **Ecosystem Role**: Automatically indexed under anymddb local workspace manifest.
- **Somatic Phase Anchor**: Linked to the **${combo.somaticPhase.toUpperCase()}** phase of the creator cycle.
`;
  };

  const handleCopy = (combo: MixtmojiCombination) => {
    const text = formatZettelMarkdown(combo);
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Markdown copied to clipboard!'))
      .catch(() => showToast('❌ Failed to copy to clipboard.'));
  };

  const handleDownload = (combo: MixtmojiCombination) => {
    const text = formatZettelMarkdown(combo);
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, '');
    link.href = url;
    link.download = `ZK-${timestamp}_mixtmoji_${combo.name.toLowerCase().replace(/\s+/g, '_')}.companion.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Downloaded companion Markdown sidecar!');
  };

  return (
    <div className="relative font-sans text-stone-900 bg-[#fbf9f4] border-2 border-stone-950 p-6 max-w-4xl mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-grid-pattern">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-stone-950 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="text-yellow-500 fill-yellow-500" />
            Mixtmoji & Emoji Kitchen
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Pure Markdown Zettel Ingestion • High-Density Kawaii Brutalism
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setIsFaqOpen(true)}
            className="flex items-center gap-1 text-xs font-bold uppercase bg-sky-200 border-2 border-stone-950 px-3 py-1.5 hover:bg-sky-300 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <HelpCircle size={14} /> FAQ
          </button>
          <button
            onClick={() => setIsChangelogOpen(true)}
            className="flex items-center gap-1 text-xs font-bold uppercase bg-purple-200 border-2 border-stone-950 px-3 py-1.5 hover:bg-purple-300 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Info size={14} /> Changelog
          </button>
        </div>
      </div>

      {/* 2. Toast Notifications */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#e0f2fe] border-2 border-stone-950 px-4 py-2 font-black text-xs uppercase tracking-wider text-sky-900 flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-bounce">
          <Sparkles size={14} /> {toastMessage}
        </div>
      )}

      {/* 3. Main Dashboard Workspace Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Emoji Selection Grid (7/12 width) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="bg-[#fefce8] border-2 border-stone-950 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-black uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>Select Somatic & Mind State Emojis</span>
              <span className="text-xs font-normal text-stone-500 font-mono">
                Slot {activeSlot} Active
              </span>
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {EMOJI_POOL.map((emoji) => {
                const isSelected = emoji1?.char === emoji.char || emoji2?.char === emoji.char;
                return (
                  <button
                    key={emoji.char}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`group relative flex flex-col items-center justify-center border-2 p-2 aspect-square transition-all ${
                      isSelected 
                        ? 'bg-yellow-200 border-stone-950 scale-95 shadow-none translate-y-0.5' 
                        : 'bg-white border-stone-950 hover:bg-stone-50 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{emoji.char}</span>
                    <span className="text-[10px] font-black uppercase mt-1 text-stone-700">{emoji.name}</span>
                    
                    {/* Hover detail tooltip */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-stone-900 text-white text-[9px] p-2 rounded shadow-lg pointer-events-none z-10 font-sans normal-case">
                      <p className="font-bold text-yellow-300">{emoji.name} ({emoji.char})</p>
                      <p className="text-stone-300 mt-0.5">{emoji.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persistent Sticky Settings Panel */}
          <div className="bg-[#f0fdf4] border-2 border-stone-950 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black uppercase tracking-wide">Sticky Configuration Settings</h3>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setChimeEnabled(!chimeEnabled)}
                  className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-stone-950"
                >
                  {chimeEnabled ? <CheckSquare size={16} className="text-green-600" /> : <Square size={16} />}
                  Enable Procedural Chime (Web Audio API)
                </button>
                <button
                  onClick={() => setAutoCopy(!autoCopy)}
                  className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-stone-950"
                >
                  {autoCopy ? <CheckSquare size={16} className="text-green-600" /> : <Square size={16} />}
                  Auto-Copy Markdown on Bake
                </button>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs font-black uppercase bg-red-100 border-2 border-stone-950 px-3 py-2 hover:bg-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <RefreshCw size={14} /> Clear Board
            </button>
          </div>
        </div>

        {/* Right Column: In-Line Mixing Board (5/12 width) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-[#fffbeb] border-2 border-stone-950 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-stone-950 pb-2">
                Oven Mixing Board
              </h2>
              <div className="flex items-center justify-around py-4">
                {/* Slot 1 */}
                <div className={`flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed ${
                  activeSlot === 1 ? 'border-yellow-500 bg-yellow-50' : 'border-stone-400 bg-stone-50'
                }`}>
                  {emoji1 ? (
                    <span className="text-4xl">{emoji1.char}</span>
                  ) : (
                    <span className="text-xs font-bold text-stone-400 uppercase">Slot 1</span>
                  )}
                </div>

                <Plus className="text-stone-500" size={24} />

                {/* Slot 2 */}
                <div className={`flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed ${
                  activeSlot === 2 ? 'border-yellow-500 bg-yellow-50' : 'border-stone-400 bg-stone-50'
                }`}>
                  {emoji2 ? (
                    <span className="text-4xl">{emoji2.char}</span>
                  ) : (
                    <span className="text-xs font-bold text-stone-400 uppercase">Slot 2</span>
                  )}
                </div>
              </div>

              {/* Bake Button */}
              <button
                onClick={handleBake}
                disabled={!emoji1 || !emoji2}
                className={`w-full flex items-center justify-center gap-2 font-black uppercase border-2 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  emoji1 && emoji2 
                    ? 'bg-amber-300 border-stone-950 hover:bg-amber-400 active:translate-y-0.5 active:shadow-none' 
                    : 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Sparkles size={16} /> Bake Mixtmoji
              </button>
            </div>

            {/* Baking Output Result Showcase */}
            {result && (
              <div className="mt-6 border-t-2 border-stone-950 pt-4 animate-fade-in">
                <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider">Bake Output:</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-4xl">{result.emoji}</span>
                  <div>
                    <h4 className="font-black text-sm uppercase">{result.name}</h4>
                    <p className="text-[10px] text-stone-600 mt-0.5">{result.description}</p>
                  </div>
                </div>

                {/* ASCII Art Box */}
                <div className="bg-stone-900 border-2 border-stone-950 p-3 mt-3 rounded shadow-inner">
                  <pre className="text-green-400 font-mono text-[10px] overflow-x-auto select-all leading-normal whitespace-pre-wrap">
                    {result.ascii}
                  </pre>
                </div>

                {/* In-Line Export Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleCopy(result)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase bg-stone-100 border-2 border-stone-950 py-2 hover:bg-stone-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Copy size={14} /> Copy MD
                  </button>
                  <button
                    onClick={() => handleDownload(result)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase bg-emerald-200 border-2 border-stone-950 py-2 hover:bg-emerald-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          4. Modals (Gated via persistent key listeners)
         ========================================== */}

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#fefce8] border-4 border-stone-950 p-6 max-w-lg w-full relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setIsFaqOpen(false)}
              className="absolute top-4 right-4 border-2 border-stone-950 p-1 bg-white hover:bg-stone-100"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-1.5">
              <HelpCircle className="text-yellow-600" />
              Somatic Mixtmoji FAQ Guide
            </h3>
            <div className="space-y-4 text-xs max-h-96 overflow-y-auto pr-2 text-stone-800 leading-relaxed normal-case">
              <div>
                <h4 className="font-black text-stone-950 uppercase mb-1">What is an AnyMD Mixtmoji?</h4>
                <p>It is an offline-first behavioral recipe combining somatic and cognitive emojis (like coffee, pee, chocolate, focus) into structured, portable Markdown sidecars (.md) to feed your central Zettelkasten.</p>
              </div>
              <div>
                <h4 className="font-black text-stone-950 uppercase mb-1">How does the Web Audio API work?</h4>
                <p>To comply with standard licensing rules and avoid bulky, copyrighted audio assets, the chime sounds are synthesized in real-time inside your browser using raw mathematical oscillator waves. It works 100% offline!</p>
              </div>
              <div>
                <h4 className="font-black text-stone-950 uppercase mb-1">Why is this layout zero-radius?</h4>
                <p>It adheres strictly to high-density Kawaii Brutalist design standards. Rounded buttons and pill selectors are retired in favor of sharp 0px corners, high-contrast black board frames, and offset shadows to prevent cognitive fatigue.</p>
              </div>
            </div>
            <div className="mt-6 border-t-2 border-stone-950 pt-4 flex justify-end">
              <button
                onClick={() => setIsFaqOpen(false)}
                className="bg-white border-2 border-stone-950 px-4 py-2 text-xs font-black uppercase hover:bg-stone-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Close FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      {isChangelogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#faf5ff] border-4 border-stone-950 p-6 max-w-lg w-full relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setIsChangelogOpen(false)}
              className="absolute top-4 right-4 border-2 border-stone-950 p-1 bg-white hover:bg-stone-100"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-1.5">
              <Info className="text-purple-600" />
              Mixtmoji System Changelog
            </h3>
            <div className="space-y-4 text-xs max-h-96 overflow-y-auto pr-2 text-stone-800 leading-normal normal-case">
              <div className="border-b border-purple-200 pb-2">
                <h4 className="font-black text-stone-950 uppercase flex justify-between">
                  <span>v1.0.0 (Release Build)</span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 font-mono">Stable</span>
                </h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Deployed: August 25, 2026</p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-stone-600">
                  <li>Decoupled microkernel-ready AnyMD emoji integration.</li>
                  <li>Somatic combination registry matching coffee, body fuel and resets.</li>
                  <li>Real-time procedural dual-oscillator Audio chime triggers.</li>
                  <li>Persistent settings key mappings via window.localStorage.</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 border-t-2 border-stone-950 pt-4 flex justify-end">
              <button
                onClick={() => setIsChangelogOpen(false)}
                className="bg-white border-2 border-stone-950 px-4 py-2 text-xs font-black uppercase hover:bg-stone-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
