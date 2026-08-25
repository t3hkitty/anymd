import React, { useState } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

interface ModuleConfig {
  pack_id: string;
  name: string;
  description: string;
  default_active: boolean;
  emoji: string;
}

export const SomaticSuiteInstaller: React.FC = () => {
  const modules: ModuleConfig[] = [
    {
      pack_id: "anymd-pack-intimacy-ledger",
      name: "Sex-Positive Intimacy Ledger",
      description: "Track intimate encounters, partners, and somatic high-scores with absolute local-first privacy. Zero shaming.",
      default_active: true,
      emoji: "💃"
    },
    {
      pack_id: "anymd-pack-nourishment-fasting",
      name: "Nourishment Routines & Fasting Studio",
      description: "Anxiety-free, calorie-free meal routine logger. Post-hoc fasting metrics and Dr. Fung's tips. 100% food-addiction safe.",
      default_active: false,
      emoji: "🍳"
    },
    {
      pack_id: "anymd-pack-cycles",
      name: "Somatic Cycle & Ovulation Tracker",
      description: "Track menstrual cycles and ovulation to align your creative work cycles. No alarms, just natural biological seasons.",
      default_active: false,
      emoji: "🌸"
    },
    {
      pack_id: "anymd-pack-return-sync",
      name: "Gentle Return Sync & Vacation Mode",
      description: "Sync logs across WebDAV/Local Webhooks after a break. Includes a lavender-themed full system lockout Vacation Mode.",
      default_active: true,
      emoji: "🏡"
    },
    {
      pack_id: "anymd-pack-motivation-helper",
      name: "Chore Motivation Studio (Hype Boss)",
      description: "Launch 5-minute gamified sprints for high-friction chores. Features automated TTS Coach Boss motivational scripts.",
      default_active: true,
      emoji: "🔥"
    }
  ];

  // Map active states
  const [selectedPacks, setSelectedPacks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach(m => {
      initial[m.pack_id] = m.default_active;
    });
    return initial;
  });

  const togglePack = (packId: string) => {
    setSelectedPacks(prev => ({
      ...prev,
      [packId]: !prev[packId]
    }));
  };

  const handleSelectAll = (status: boolean) => {
    const updated: Record<string, boolean> = {};
    modules.forEach(m => {
      updated[m.pack_id] = status;
    });
    setSelectedPacks(updated);
  };

  const handleInstallSuite = () => {
    const activePacks = Object.keys(selectedPacks).filter(key => selectedPacks[key]);
    console.log("Initializing local-first database tables for: ", activePacks);
    alert(`🎉 Somatic Suite Configured! Active Packages: ${activePacks.length}/${modules.length}`);
  };

  return (
    <WidgetPanel 
      title="🌸 Somatic Meowty Master Suite" 
      badge="⚙️ SUITE BUILDER"
      className="border-4 border-black shadow-[4px_4px_0_#000] bg-[#faf5ff] p-4 rounded-none max-w-lg"
    >
      <div className="flex flex-col gap-4">
        
        {/* EXPLAINER PANEL */}
        <div className="bg-white border-2 border-black p-2 text-xs font-bold leading-relaxed shadow-[2px_2px_0_#000]">
          Welcome to your local biological command center. This <strong>\"Bundle of Bundles\"</strong> structure allows you to build your own custom suite. Choose to deploy everything, or toggle off anything that doesn't serve your immediate mental or physical peace.
        </div>

        {/* BULK SELECTION CONTROLS */}
        <div className="flex gap-2 justify-end text-xs font-black uppercase">
          <button 
            onClick={() => handleSelectAll(true)}
            className="bg-white border-2 border-black px-2 py-1 hover:bg-gray-100 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none"
          >
            Select All
          </button>
          <button 
            onClick={() => handleSelectAll(false)}
            className="bg-white border-2 border-black px-2 py-1 hover:bg-gray-100 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none"
          >
            Clear All
          </button>
        </div>

        {/* MODULAR SELECTION CHECKLIST */}
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
          {modules.map((module) => {
            const isActive = selectedPacks[module.pack_id];
            return (
              <div 
                key={module.pack_id}
                onClick={() => togglePack(module.pack_id)}
                className={`border-2 border-black p-3 cursor-pointer transition-all flex items-start gap-3 shadow-[2px_2px_0_#000] active:translate-y-[1px] active:shadow-none ${
                  isActive ? 'bg-pink-100 border-pink-500' : 'bg-white grayscale opacity-70'
                }`}
              >
                {/* LARGE KAWAII BRUTALIST CHECKBOX */}
                <div className={`w-6 h-6 border-2 border-black flex items-center justify-center font-black text-sm select-none shrink-0 ${
                  isActive ? 'bg-pink-500 text-white' : 'bg-white'
                }`}>
                  {isActive ? '✓' : ''}
                </div>

                {/* TEXT METADATA */}
                <div className="flex flex-col text-left">
                  <span className="font-black text-sm text-black">
                    {module.emoji} {module.name}
                  </span>
                  <span className="text-[10px] text-gray-600 font-bold leading-normal mt-0.5">
                    {module.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FINAL DEPLOYMENT ACTION */}
        <button 
          onClick={handleInstallSuite}
          className="w-full bg-pink-300 border-4 border-black font-black uppercase text-sm p-3 hover:bg-pink-400 shadow-[4px_4px_0_#000] active:translate-y-[2px] active:shadow-none transition-transform mt-2"
        >
          🚀 Initialize Selected Somatic Bundles
        </button>

      </div>
    </WidgetPanel>
  );
};