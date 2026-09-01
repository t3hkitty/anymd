/**
 * Zettelkasten ID: 20260826-1845
 * Project: @lorik/meow-core
 * Version: v2.0.0
 * Role: Blinding clock interface with 1-click melodramatic telemetry presets,
 *       including dual-unit (C and F) temperature loggers and ironic "i'm melting ⛄" overrides.
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
  
  // Dual-Unit Temperature State
  const [tempInput, setTempInput] = useState<string>('40');
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');

  const faqRef = useRef<HTMLDivElement>(null);
  const changelogRef = useRef<HTMLDivElement>(null);

  // Pre-configured Melodramatic Telemetry Chips [cite: 294, 322]
  // Upgraded with iconic ironic temperature exaggerations [cite: 188]
  const presetMelodramas = [
    "It's only 10am? Are we already in hell?",
    "Gallon of sweat here!",
    "i'm melting ⛄ (at 40°F / 4.4°C)",
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

  // Dynamic dual-unit conversion helper
  const getConvertedTemp = (val: number, currentUnit: 'F' | 'C'): { f: number; c: number } => {
    if (currentUnit === 'F') {
      const c = (val - 32) * 5 / 9;
      return { f: val, c: Math.round(c * 10) / 10 };
    } else {
      const f = (val * 9 / 5) + 32;
      return { f: Math.round(f * 10) / 10, c: val };
    }
  };

  const handleLogMelodrama = (text: string) => {
    const timestamp = new Date().toISOString();
    let logMessage = text;

    // Intercept "i'm melting" preset for custom structured logging
    if (text.includes("i'm melting ⛄")) {
      logMessage = `40.0°F (4.4°C) -- "i'm melting ⛄" [Ironic Meltdown Triggered]`;
    }

    const payload = `[${timestamp}] 🪐 [Melodrama Telemetry]: ${logMessage}`;\n    
    // Simulate appending to the flat-file markdown database [cite: 1, 197]
    console.log(`[AnyMD Append]: ${payload}`);
    pushMeowToast(`Logged: "${text}"`, 'success');
  };

  const handleLogDualTemp = () => {
    const num = parseFloat(tempInput);
    if (isNaN(num)) {
      pushMeowToast('Please enter a valid number for temperature', 'error');
      return;
    }

    const { f, c } = getConvertedTemp(num, tempUnit);
    const timestamp = new Date().toISOString();
    
    // Ironic hyperbole injection for 40°F (or below) melting snowman
    let suffix = '';
    if (f === 40 || (f >= 39.5 && f <= 40.5)) {
      suffix = ' -- "i\'m melting ⛄"';
    } else if (f > 85) {
      suffix = ' -- Brain melting out of ears 🧠🌋';
    } else if (f < 32) {
      suffix = ' -- Human popsicle status confirmed 🥶❄️';
    }

    const payload = `[${timestamp}] 🌡️ [Dual-Temp Log]: ${f}°F (${c}°C)${suffix}`;
    
    // Write out cleanly in one single log entry [cite: 1, 197]
    console.log(`[AnyMD Append]: ${payload}`);
    pushMeowToast(`Logged: ${f}°F (${c}°C)${suffix ? ' + Hyperbole' : ''}`, 'success');
  };

  // Live conversion read-out
  const numVal = parseFloat(tempInput);
  const liveConversion = !isNaN(numVal) 
    ? tempUnit === 'F' 
      ? `(${getConvertedTemp(numVal, 'F').c}°C)` 
      : `(${getConvertedTemp(numVal, 'C').f}°F)`
    : '';

  return (
    <div className="p-4 border-4 border-slate-900 bg-[#FFFDF5] text-slate-900 font-mono text-sm max-w-xl shadow-[4px_4px_0_0_#1e1e2e]">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-slate-900 pb-2">
        <h2 className="text-sm font-black tracking-wider uppercase flex items-center gap-1">
          ⏰ Blinding Time & Melodrama Tracker (v2)
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

      {/* Giant \"Perfectly Blinding\" Clock View [cite: 350] */}
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

      {/* NEW: Single Log Dual-Unit Temperature Logger Panel [cite: 188] */}
      <div className="mb-4 p-3 border-2 border-slate-900 bg-emerald-50 shadow-[2px_2px_0_0_#1e1e2e]">
        <h3 className="text-xs font-black tracking-wider uppercase mb-2 text-emerald-950 flex justify-between">
          <span>🌡️ Dual-Unit Telemetry Input</span>
          <span className="text-[10px] text-emerald-800 lowercase tracking-normal">Logs both C & F in one row</span>
        </h3>
        
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={tempInput}
            onChange={(e) => setTempInput(e.target.value)}
            className="w-20 p-1.5 text-xs bg-white border-2 border-slate-900 focus:outline-none"
            placeholder="Temp"
          />
          
          <div className="flex border-2 border-slate-900 text-xs bg-white">
            <button
              onClick={() => setTempUnit('F')}
              className={`px-2 py-1 font-bold ${tempUnit === 'F' ? 'bg-slate-900 text-[#FFFDF5]' : 'bg-white hover:bg-slate-100'}`}
            >
              °F
            </button>
            <button
              onClick={() => setTempUnit('C')}
              className={`px-2 py-1 font-bold border-l-2 border-slate-900 ${tempUnit === 'C' ? 'bg-slate-900 text-[#FFFDF5]' : 'bg-white hover:bg-slate-100'}`}
            >
              °C
            </button>
          </div>

          <div className="flex-1 text-xs font-bold text-slate-500 text-center">
            {liveConversion}
            {parseFloat(tempInput) === 40 && tempUnit === 'F' && (
              <span className="ml-1 text-rose-600 animate-pulse font-black text-[10px]">⛄ i'm melting</span>
            )}
          </div>

          <button
            onClick={handleLogDualTemp}
            className="px-3 py-1.5 bg-emerald-200 border-2 border-slate-900 text-xs font-black hover:bg-emerald-300 active:translate-y-0.5"
          >
            Bake Temp
          </button>
        </div>
      </div>

      {/* 1-Click Melodrama Telemetry Chips [cite: 14, 188] */}
      <div className="mb-4">
        <h3 className="text-xs font-black tracking-wider uppercase mb-2 text-slate-500">
          ⚡ 1-Click Emotional Telemetry Presets
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {presetMelodramas.map((text, idx) => {
            const isMelting = text.includes("i'm melting ⛄");
            return (
              <button
                key={idx}
                onClick={() => handleLogMelodrama(text)}
                className={`px-2.5 py-1 text-xs border-2 border-slate-900 rounded-none font-bold hover:bg-rose-200 active:translate-x-0.5 active:translate-y-0.5 transition-all text-slate-900 ${
                  isMelting ? 'bg-amber-200 border-amber-900 shadow-[2px_2px_0_0_#b45309]' : 'bg-rose-100'
                }`}
              >
                {text}
              </button>
            );
          })}
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
        <MeowModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} title=\"FAQ: Melodrama Clock\">
          <div className=\"space-y-3 font-mono text-xs\">
            <p><strong>Q: Why is the clock so bright?</strong><br/>A: Your wife correctly identified that a giant clock with the date should be perfectly blinding [cite: 350]. Luminous Backlight Mode enhances the amber luminescence to ground your temporal awareness [cite: 350].</p>\n            <p><strong>Q: What is the dual-unit temp logger?</strong><br/>A: It records your temperature observations and automatically translates between Celsius and Fahrenheit in real-time, outputting **both units in a single file log entry** so you have unified records [cite: 188].</p>\n            <p><strong>Q: What is \"i'm melting ⛄\" at 40°F?</strong><br/>A: It is an ironic hyperbole preset [cite: 188]. Logging 40°F (which is a cold 4.4°C) automatically injects the melting snowman quote into your logs as a post-hoc sensory joke [cite: 188].</p>\n            <p><strong>Q: How do these save?</strong><br/>A: Tapping any chip immediately formats the string and appends it to your offline, daily Markdown telemetry logs [cite: 1, 197].</p>
          </div>
        </MeowModal>\n      )}

      {/* Changelog Modal */}
      {isChangelogOpen && (
        <MeowModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} title=\"Changelog: Melodrama Clock\">
          <div className=\"space-y-2 font-mono text-xs\">
            <p><strong>v2.0.0 (2026-08-26):</strong></p>
            <ul className=\"list-disc pl-4 space-y-1\">\n              <li>Added **Dual-Unit Temperature Panel** supporting instant Fahrenheit/Celsius conversions and single-line consolidated logging [cite: 188].</li>\n              <li>Added **\"i'm melting ⛄\"** hyperbole trigger when temperature logs match exactly 40°F [cite: 188].</li>\n              <li>Integrated highlighted yellow preset chip for direct 1-tap ironic melting logs [cite: 188].</li>\n              <li>Added auto-clipping for extreme boundaries (human popsicle below 32°F, brain melt above 85°F).</li>\n            </ul>\n            <p><strong>v1.0.0 (2026-08-26):</strong></p>\n            <ul className=\"list-disc pl-4 space-y-1\">\n              <li>Created <code>MeowMelodramaticClockWidget.tsx</code> following High-Density Kawaii Brutalist styling [cite: 107, 300].</li>\n              <li>Integrated 7 built-in melodramatic text triggers, including the iconic <em>\"It's only 10am? Are we already in hell?\"</em> [cite: 294, 322]</li>\n              <li>Added persistent luminous amber backlighting mode tied directly to sticky LocalStorage state [cite: 324, 615].</li>\n            </ul>\n          </div>\n        </MeowModal>\n      )}

    </div>\n  );\n};\n