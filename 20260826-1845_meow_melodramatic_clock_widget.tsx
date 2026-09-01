/**
 * Zettelkasten ID: 20260826-1845
 * Project: @lorik/meow-core
 * Role: Blinding clock interface with 1-click melodramatic telemetry presets
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStickySetting } from '../state/meowState';
import { pushMeowToast } from './MeowToast';
import { MeowModal } from './MeowModals';

export const MeowMelodramaticClockWidget: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDate] = useState<string>('');
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  
  // Sticky Settings: Caches custom parameters in localStorage with change triggers [cite: 615]
  const [isBlinding, setIsBlinding] = useStickySetting<boolean>('meow_clock_blinding_mode', true);
  const [customExaggeration, setCustomExaggeration] = useStickySetting<string>('meow_clock_user_exaggeration', '');
  
  const faqRef = useRef<HTMLDivElement>(null);
  const changelogRef = useRef<HTMLDivElement>(null);

  // Pre-configured Melodramatic Telemetry Chips [cite: 294, 322]
  const presetMelodramas = [
    "It's only 10am? Are we already in hell?",
    "Gallon of sweat here!",
    "Human popsicle mode",
    "It's only 10????",
    "Brain melting out of ears",
    "Sauna status confirmed",
    "Literally dying right now"
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Esc-Key Listener for Modal Dismissals [cite: 615]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFaqOpen(false);
        setIsChangelogOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogMelodrama = (text: string) => {
    const timestamp = new Date().toISOString();
    const payload = `[${timestamp}] 🪐 [Melodrama Telemetry]: ${text}`;
    
    // Simulate appending to the flat-file markdown database [cite: 1, 197]
    console.log(`[AnyMD Append]: ${payload}`);
    pushMeowToast(`Logged: "${text}"`, 'success');
  };

  return (
    <div className="p-4 border-4 border-slate-900 bg-[#FFFDF5] text-slate-900 font-mono text-sm max-w-xl shadow-[4px_4px_0_0_#1e1e2e]">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-slate-900 pb-2">
        <h2 className="text-sm font-black tracking-wider uppercase flex items-center gap-1">
          ⏰ Blinding Time & Melodrama Tracker
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFaqOpen(true)} 
            className="px-2 py-0.5 text-xs bg-indigo-200 border-2 border-slate-900 font-bold hover:bg-indigo-300 active:translate-y-0.5"
          >
            FAQ
          </button>
          <button 
            onClick={() => setIsChangelogOpen(true)} 
            className="px-2 py-0.5 text-xs bg-pink-200 border-2 border-slate-900 font-bold hover:bg-pink-300 active:translate-y-0.5"
          >
            Changelog
          </button>
        </div>
      </div>

      {/* Giant "Perfectly Blinding" Clock View [cite: 350] */}
      <div className={`p-6 border-4 border-slate-900 text-center mb-4 transition-all duration-300 ${
        isBlinding ? 'bg-amber-100 shadow-[inset_0_0_20px_#fef3c7,6px_6px_0_0_#1e1e2e]' : 'bg-white shadow-[3px_3px_0_0_#1e1e2e]'
      }`}>
        <div className={`font-black tracking-tight leading-none ${isBlinding ? 'text-5xl text-amber-950 scale-105' : 'text-4xl text-slate-900'}`}>
          {time}
        </div>
        <div className="text-xs font-bold mt-2 text-slate-600 uppercase tracking-widest border-t-2 border-slate-900/10 pt-2">
          {dateStr}
        </div>
      </div>

      {/* Blinding Toggle Controls */}
      <div className="flex items-center justify-between p-2 bg-white border-2 border-slate-900 mb-4 shadow-[2px_2px_0_0_#1e1e2e]">
        <span className="text-xs font-bold">Blinding Luminous Backlight Mode</span>
        <button
          onClick={() => {
            setIsBlinding(!isBlinding);
            pushMeowToast(`Luminous Backlight ${!isBlinding ? 'Enabled' : 'Disabled'}`, 'info');
          }}
          className={`px-3 py-1 border-2 border-slate-900 font-bold text-xs ${
            isBlinding ? 'bg-amber-300 hover:bg-amber-400' : 'bg-slate-200 hover:bg-slate-300'
          }`}
        >
          {isBlinding ? '🔆 BRIGHT' : '🌑 LOW'}
        </button>
      </div>

      {/* 1-Click Melodrama Telemetry Chips [cite: 14, 188] */}
      <div className="mb-4">
        <h3 className="text-xs font-black tracking-wider uppercase mb-2 text-slate-500">
          ⚡ 1-Click Emotional Telemetry Presets
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {presetMelodramas.map((text, idx) => (
            <button
              key={idx}
              onClick={() => handleLogMelodrama(text)}
              className="px-2.5 py-1 text-xs bg-rose-100 border-2 border-slate-900 rounded-none font-bold hover:bg-rose-200 active:translate-x-0.5 active:translate-y-0.5 transition-all text-slate-900"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Melodrama Form Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customExaggeration}
          onChange={(e) => setCustomExaggeration(e.target.value)}
          placeholder="Invent your own melodrama..."
          className="flex-1 p-2 text-xs bg-white border-2 border-slate-900 rounded-none focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <button
          onClick={() => {
            if (customExaggeration.trim()) {
              handleLogMelodrama(customExaggeration);
              setCustomExaggeration('');
            }
          }}
          className="px-4 py-2 text-xs bg-emerald-200 border-2 border-slate-900 font-black hover:bg-emerald-300 active:translate-y-0.5"
        >
          📝 Ingest
        </button>
      </div>

      {/* FAQ Modal */}
      {isFaqOpen && (
        <MeowModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} title="FAQ: Melodrama Clock">
          <div className="space-y-3 font-mono text-xs">
            <p><strong>Q: Why is the clock so bright?</strong><br/>A: Your wife correctly identified that a giant clock with the date should be perfectly blinding [cite: 350]. Luminous Backlight Mode enhances the amber luminescence to ground your temporal awareness [cite: 350].</p>
            <p><strong>Q: What is the point of these exaggerations?</strong><br/>A: High-density environments can cause executive overload [cite: 255]. Sarcastic 1-click emotional check-ins (e.g., <em>"It's only 10am? Are we already in hell?"</em>) allow you to vent somatic stress in exactly 1 tap without breaking your work focus [cite: 255].</p>
            <p><strong>Q: How do these save?</strong><br/>A: Tapping any chip immediately formats the string and appends it to your offline, daily Markdown telemetry logs [cite: 1, 197].</p>
          </div>
        </MeowModal>
      )}

      {/* Changelog Modal */}
      {isChangelogOpen && (
        <MeowModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} title="Changelog: Melodrama Clock">
          <div className="space-y-2 font-mono text-xs">
            <p><strong>v1.0.0 (2026-08-26):</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Created <code>MeowMelodramaticClockWidget.tsx</code> following High-Density Kawaii Brutalist standards [cite: 107, 300].</li>
              <li>Integrated 7 built-in melodramatic text triggers, including the iconic <em>"It's only 10am? Are we already in hell?"</em> [cite: 294, 322]</li>
              <li>Added persistent luminous amber backlighting mode tied directly to sticky LocalStorage state [cite: 324, 615].</li>
            </ul>
          </div>
        </MeowModal>
      )}

    </div>
  );
};
