import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

interface Task {
  id: string;
  title: string;
  category: string;
  recurrent: boolean;
  accumulatedCount: number; // How many times it triggered while away
}

export const GoogleTaskStyleSyncWidget: React.FC = () => {
  // Stored list of active/accumulated tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Take 2mg Intuniv', category: 'Health', recurrent: true, accumulatedCount: 1 },
    { id: '2', title: 'Hydration Check (Sip Sip Sip)', category: 'Health', recurrent: true, accumulatedCount: 3 },
    { id: '3', title: 'Sort & Fold Laundry Sprint', category: 'Chore', recurrent: false, accumulatedCount: 1 },
    { id: '4', title: 'Log Mood & Telemetry', category: 'Mind', recurrent: true, accumulatedCount: 2 }
  ]);

  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  // Synthesize a legally clean, beautiful high-dopamine chime using Web Audio API
  const playSovereignChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // First Note (Warm/Mellow)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      // Second Note (Bright/Sparkly - Slightly Delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start();
      osc1.stop(ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Handles checking off a single item with the Google-style circle fade transition
  const handleCompleteSingle = (id: string) => {
    setAnimatingTaskId(id);
    playSovereignChime();

    // Trigger local global confetti framework (hooked up by Antigravity)
    if ((window as any).confetti) {
      (window as any).confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
    }

    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== id));
      setAnimatingTaskId(null);
    }, 600); // Allow animation to play
  };

  // SWEEP ALL: The Double Checkmark Button for piled-up timers
  const handleSweepAll = () => {
    playSovereignChime();
    
    // Burst massive confetti
    if ((window as any).confetti) {
      (window as any).confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    // Save a joint transaction card to your local vault
    const nowISO = new Date().toISOString();
    const zettelId = nowISO.split('T')[0].replace(/-/g, '') + '-' + nowISO.split('T')[1].substring(0, 5).replace(/:/g, '');
    
    const sweepZettel = {
      zettel_id: zettelId,
      title: `🧹 Massive Task Sweep Catch-Up`,
      tags: ['#tasks', '#sweep_all', '#non_zero', '#telemetry'],
      content: `Returned to workspace and swept ${tasks.length} pending accumulated task instances cleanly into history. Zero shame, total focus restored!`
    };
    
    console.log(\"Saving Catch-Up Sweep Card:\", sweepZettel);

    // Fade all out
    setTasks([]);
  };

  const totalAccumulated = tasks.reduce((sum, t) => sum + t.accumulatedCount, 0);

  return (
    <WidgetPanel 
      title=\"🎯 Task Sync & Dopamine Studio\" 
      badge={totalAccumulated > 0 ? `🚨 ${totalAccumulated} Stacked` : \"✅ Clear\"}
      className=\"border-4 border-black shadow-[4px_4px_0_#000] bg-white p-3 rounded-none max-w-md\"
    >
      <div className=\"flex flex-col gap-3\">
        
        {/* HEADER CATCH-UP PROMPT */}
        {totalAccumulated > 0 ? (
          <div className=\"bg-yellow-100 border-2 border-black p-2 text-xs font-bold leading-snug\">
            ⚠️ <strong>Since you've been gone:</strong> {totalAccumulated} recurring task instances have stacked up! Let's clear them with zero guilt.
          </div>
        ) : (
          <div className=\"bg-green-100 border-2 border-black p-2 text-xs font-bold text-green-900 text-center\">
            ✨ All clean! Your workspace is calm and ready.
          </div>
        )}

        {/* THE TASK LIST */}
        <div className=\"flex flex-col gap-2 max-h-60 overflow-y-auto pr-1\">
          {tasks.map(task => {
            const isAnimating = animatingTaskId === task.id;
            return (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-2 border-2 border-black transition-all duration-500 bg-white ${
                  isAnimating ? 'opacity-0 scale-95 bg-green-50 border-green-500' : 'shadow-[2px_2px_0_#000]'
                }`}
              >
                <div className=\"flex items-center gap-2.5 flex-1\">
                  {/* Google-style circular checkmark button */}
                  <button 
                    onClick={() => handleCompleteSingle(task.id)}
                    className={`w-5 h-5 rounded-full border-2 border-black flex items-center justify-center transition-colors hover:bg-green-100 active:scale-90 ${
                      isAnimating ? 'bg-green-500 border-green-500' : 'bg-white'
                    }`}
                  >
                    {isAnimating && (
                      <svg className=\"w-3 h-3 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                        <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"3\" d=\"M5 13l4 4L19 7\" />
                      </svg>
                    )}
                  </button>

                  <div className=\"flex flex-col\">
                    <span className={`text-xs font-black ${isAnimating ? 'line-through text-gray-400' : 'text-black'}`}>
                      {task.title}
                    </span>
                    {task.accumulatedCount > 1 && (
                      <span className=\"text-[9px] bg-red-100 text-red-800 border border-red-300 font-bold px-1 py-0.2 w-max mt-0.5\">
                        Stacked x{task.accumulatedCount} while away
                      </span>
                    )}
                  </div>
                </div>

                <span className=\"text-[9px] bg-gray-100 border border-black font-mono px-1 font-bold\">
                  {task.category}
                </span>
              </div>
            );
          })}
        </div>

        {/* THE DOUBLE CHECKMARK SWEEP ALL BUTTON */}
        {tasks.length > 0 && (
          <button 
            onClick={handleSweepAll}
            className=\"w-full bg-emerald-200 hover:bg-emerald-300 border-4 border-black text-xs font-black uppercase p-2.5 flex items-center justify-center gap-2 shadow-[4px_4px_0_#000] active:translate-y-[2px] active:shadow-none transition-transform\"
            title=\"Sweep all pending instances with zero guilt\"
          >
            ✔️✔️ Complete & Clear All Stacked Timers
          </button>
        )}

      </div>
    </WidgetPanel>
  );
};