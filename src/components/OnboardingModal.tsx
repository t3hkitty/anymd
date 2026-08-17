import React, { useState } from 'react';
import { X, BookOpen, Radio, Cloud, Sparkles, ChevronRight, ChevronLeft, ExternalLink, Puzzle, Check } from 'lucide-react';
import { BookcaseIcon } from './BookcaseIcon';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCraftingOfChess: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectCraftingOfChess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isKuEnabled, setIsKuEnabled] = useState(true);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Library Companion MD (LC-MD)!",
      subtitle: "Featuring 'The Crafting of Chess' by Kit Falbo (ASIN: B07P1YRHTX)",
      icon: <BookcaseIcon className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-sky-300">📖 Featured Onboarding Example:</span>
              <a
                href="https://www.amazon.com/dp/B07P1YRHTX"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>View on Amazon (ASIN: B07P1YRHTX)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">The Crafting of Chess — LitRPG Novel by Kit Falbo</h4>
            <p className="text-slate-300 text-xs">
              Follow Nate in the virtual fantasy world of <em>Fair Quest</em> as he leverages real-world chess strategy to level up his crafting skills, outsmart opponents, and build a sovereign legacy!
            </p>

            {/* Kindle Unlimited (KU) Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-amber-300 font-mono text-[11px] font-bold">
                📚 Kindle Unlimited (KU) Sourcing:
              </span>
              <button
                onClick={() => setIsKuEnabled(!isKuEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1 ${
                  isKuEnabled
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {isKuEnabled ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <BookOpen className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isKuEnabled ? 'KU Borrowed (Nov 8, 2020)' : 'Enable KU Sourcing'}</span>
              </button>
            </div>
          </div>

          <p>
            <strong>Library Companion MD</strong> is your sovereign, zero-bloat reading companion. It pairs your ebook files (.epub, .pdf) with 100% portable Markdown sidecars (<code>.md</code> / <code>.dcmd</code>) without lock-in or messy folder paths.
          </p>
        </div>
      )
    },
    {
      title: "Step 1: Sovereign Reader & Chapter Canvas",
      subtitle: "Chapter CFI Tracking & 5 Presets Visual Themes",
      icon: <BookOpen className="w-6 h-6 text-sky-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Experience seamless reading with precise Canonical Fragment Identifier (CFI) tracking across chapters.
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h5 className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>5 Visual Reading Engine Presets:</span>
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                🌙 Midnight Sovereign (Dark)
              </div>
              <div className="p-2 rounded-xl bg-[#fbf0d9] text-[#433422] font-semibold">
                📜 Solarized Sepia (Paper)
              </div>
              <div className="p-2 rounded-xl bg-[#2e3440] text-[#eceff4]">
                ❄️ Nord Aurora (Cool)
              </div>
              <div className="p-2 rounded-xl bg-[#282a36] text-[#ff79c6]">
                🧛 Dracula (Neon)
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Instant Quick Capture Reactions",
      subtitle: "Alt+R / Ctrl+K Shortcodes & Micro-Tweet #Hashtags",
      icon: <Radio className="w-6 h-6 text-rose-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Never lose a reading thought! Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">Alt+R</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">Ctrl+K</kbd> anywhere in the reader to open the Expressive Reaction Capture modal.
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <p className="text-amber-300 font-bold">⚡ Reaction Categories:</p>
            <p className="text-slate-400">&bull; 🤣 Laughter Exile (Rib-seizing comedy)</p>
            <p className="text-slate-400">&bull; 💡 Mind-Blown Genius Play (LitRPG crafting tactics)</p>
            <p className="text-slate-400">&bull; 😡 Betrayal Rage &bull; 😭 Snot Cascade</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: WebDAV & 1-Click Filejump Scraper",
      subtitle: "On-Screen Pop-Up Bookmarklet & Cloud Synchronization",
      icon: <Cloud className="w-6 h-6 text-sky-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Sync directly with your Filejump, Koofr, or Nextcloud WebDAV cloud storage without CORS issues using our Node.js proxy bridge.
          </p>
          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-1 text-xs">
            <h5 className="font-bold text-sky-300 flex items-center space-x-1.5">
              <Puzzle className="w-3.5 h-3.5 text-sky-400" />
              <span>1-Click Extractor Bookmarklet Included:</span>
            </h5>
            <p className="text-slate-300">
              Scrape all your Filejump book filenames into an On-Screen Pop-Up Box in 1 click!
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSelectCraftingOfChess();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Banner */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-md">
              {currentStepData.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight tracking-tight text-slate-100">
                {currentStepData.title}
              </h3>
              <p className="text-xs text-amber-400 font-mono mt-0.5">
                {currentStepData.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          
          {/* Step Indicator Dots */}
          <div className="flex items-center space-x-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? "🚀 Start Reading 'The Crafting of Chess'" : "Next Step"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
