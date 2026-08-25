import React, { useState } from 'react';
import type { PluginId } from '../types/plugins';
import { X, BookOpen, Sparkles, ChevronRight, ChevronLeft, ExternalLink, Puzzle, Check, HardDrive, Globe, Layers, Filter, Palette } from 'lucide-react';
import { BookcaseIcon } from './BookcaseIcon';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCraftingOfChess: () => void;
  onApplyPersonalizedPlugins?: (enabledPlugins: Record<PluginId, boolean>, localAccessMode: 'read-only' | 'read-write') => void;
}

export type HostingMode = 'offline' | 'cloud';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectCraftingOfChess,
  onApplyPersonalizedPlugins,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hostingMode, setHostingMode] = useState<HostingMode>('offline');
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['books', 'tcg', 'collectibles']);
  const [isKuEnabled, setIsKuEnabled] = useState(true);
  const [appliedPersonalization, setAppliedPersonalization] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleApplyDeclutter = () => {
    if (onApplyPersonalizedPlugins) {
      const enabled: Record<PluginId, boolean> = {
        'library-view': true,
        'list-view': true,
        'carousel-view': true,
        'bookshelf-spines': true,
        'wardrobe-hangers': selectedInterests.includes('wardrobe') || selectedInterests.includes('books'),
        'selective-metadata': true,
        'micro-tweets': true,
        'moonplus-rel-root': false,
        'epub-engine': true,
        'calibre-db': true,
        'obsidian-notion-sync': true,
        'webnovel-reader': true,
        'webdav-indexer': hostingMode === 'cloud',
        'theme-engine': true,
        'custom-monetizer-plugin': false,
      };

      onApplyPersonalizedPlugins(enabled, hostingMode === 'offline' ? 'read-write' : 'read-write');
      setAppliedPersonalization(true);
    }
  };

  const steps = [
    {
      title: "Step 1: Hosting & File Setup Mode",
      subtitle: "Choose Online Self-Hosted Cloud or Offline Local Vault",
      icon: <HardDrive className="w-6 h-6 text-amber-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p className="font-medium text-slate-200">
            How would you like to access and store your library files and companion sidecars?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Offline Local Mode */}
            <div
              onClick={() => setHostingMode('offline')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                hostingMode === 'offline'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>📁 Offline Local Mode</span>
                </span>
                {hostingMode === 'offline' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] text-slate-300">
                Keep all books, TCG cards, and Markdown sidecars 100% offline on your device or local Obsidian folder bridge. Zero network requirements.
              </p>
            </div>

            {/* Online Self-Hosted Cloud Mode */}
            <div
              onClick={() => setHostingMode('cloud')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                hostingMode === 'cloud'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>☁️ Self-Hosted Cloud Mode</span>
                </span>
                {hostingMode === 'cloud' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-300">
                Connect your self-hosted WebDAV server (Filejump, Nextcloud, NAS, or Google Drive bridge) for remote synchronization and public HTML publishing!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Creator & Maker Portfolio Profile",
      subtitle: "Are you an Artist, Designer, Author, or Craftsperson documenting your own works?",
      icon: <Palette className="w-6 h-6 text-amber-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p className="font-medium text-slate-200">
            Tell us how you intend to use Library Companion MD:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Collector Mode */}
            <div
              onClick={() => setIsCreatorMode(false)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                !isCreatorMode
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>🏛️ Collector & Curator</span>
                </span>
                {!isCreatorMode && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] text-slate-300">
                Cataloging acquired books, TCG card slabs, physical items, movies, and media collections.
              </p>
            </div>

            {/* Creator / Maker Mode */}
            <div
              onClick={() => setIsCreatorMode(true)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                isCreatorMode
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>🎨 Creator, Artist & Designer</span>
                </span>
                {isCreatorMode && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-[11px] text-slate-300">
                Documenting your own original creations (paintings, 3D models, book manuscripts, leatherwork, design proofs, edition #s, and medium/tools).
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Collector Interest Profile",
      subtitle: "Select Built-In Options for Physical Goods & Collectibles",
      icon: <Layers className="w-6 h-6 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p className="font-medium text-slate-200">
            What types of items do you plan to track in your meow vault? (Select all that apply)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'books', name: '📚 Books & Ebooks', desc: 'Hardcovers, paperbacks, EPUBs' },
              { id: 'tcg', name: '🃏 TCG & Cards', desc: 'Pokemon, MTG, PSA Slabs' },
              { id: 'collectibles', name: '🏛️ Pop Figures / Relics', desc: 'Funko Pops, statues, Loki notes' },
              { id: 'movies', name: '🎬 Movies & Steelbooks', desc: '4K UHD Blu-rays & DVDs' },
              { id: 'paintings', name: '🖼️ Art & Paintings', desc: 'Canvas prints & gallery mounts' },
              { id: 'shoes', name: '👟 Shoes & Sneakers', desc: 'Jordan drop boxes & footwear' },
              { id: 'wardrobe', name: '👗 Wardrobe & Outfits', desc: 'Hanging coat dress hangers' },
              { id: 'games', name: '🎮 Video Games', desc: 'Retro cartridges & discs' },
            ].map((interest) => {
              const isSel = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSel
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-bold text-xs truncate">{interest.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{interest.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Auto-Clutter Reduction & Personalization",
      subtitle: "Automatically Disable Unused Plugins to Clean Up UI",
      icon: <Filter className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 text-xs flex items-center space-x-1.5">
                <Puzzle className="w-4 h-4 text-purple-400" />
                <span>Smart Plugin De-Cluttering Engine</span>
              </span>
              {appliedPersonalization && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  ✓ PERSONALIZATION APPLIED
                </span>
              )}
            </div>

            <p className="text-slate-300">
              Based on your selection (<strong>{hostingMode.toUpperCase()}</strong> hosting & <strong>{selectedInterests.length} interest categories</strong>), we can automatically configure plugin toggles to hide unnecessary buttons and keep your navigation bar lean!
            </p>

            <button
              type="button"
              onClick={handleApplyDeclutter}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply Personalized Setup & De-Clutter UI Now</span>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Featured Sourcing Demo",
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
              Follow Nate in the virtual fantasy world of <em>Fair Quest</em> as he leverages real-world chess strategy to level up his crafting skills and outsmart opponents!
            </p>

            {/* Kindle Unlimited (KU) Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-amber-300 font-mono text-[11px] font-bold">
                📚 Kindle Unlimited (KU) Sourcing:
              </span>
              <button
                type="button"
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
            type="button"
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
                type="button"
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
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? "🚀 Complete Setup & Start Demo" : "Next Step"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
