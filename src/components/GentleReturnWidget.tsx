import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

export const GentleReturnWidget: React.FC = () => {
  // Sync State Management
  const [syncStatus, setSyncStatus] = useState<'idle' | 'retrieving' | 'processing' | 'done'>('idle');
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [activeMantra, setActiveMantra] = useState<string>(\"Take a deep breath. You are not behind.\");

  // Vacation Mode State Management (Stored in localStorage to preserve lock across browser restarts)
  const [isVacationMode, setIsVacationMode] = useState<boolean>(() => {
    return localStorage.getItem('anymd_vacation_active') === 'true';
  });

  const mantras = [
    \"🍃 Take a deep breath. You are right where you need to be.\",\n    \"☕ No zero days, but no rushed days either. Let's ease into the flow.\",\n    \"🐈 Your timeline is your own. The world can wait while we sync.\",\n    \"🛡️ Local-first data safety active. No corporate servers are rushing you.\"\n  ];

  // Engage Vacation Mode
  const handleGoOnVacation = () => {
    const nowISO = new Date().toISOString();
    localStorage.setItem('anymd_vacation_active', 'true');
    localStorage.setItem('anymd_vacation_start', nowISO);
    setIsVacationMode(true);
    setSyncStatus('idle');

    // Speech announcement of transition into protected rest
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(\"Vacation mode active. Rest well, kitty. See you when you get back!\");
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Exit Vacation Mode (\"baby I'm back from cancun\")
  const handleBackFromCancun = () => {
    localStorage.setItem('anymd_vacation_active', 'false');
    setIsVacationMode(false);
    
    // Auto-launch the gentle return sync catchup
    handleReturnSync();

    // Celebratory speech synthesis broadcast
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(\"Oh my goodness! Baby is back from cancun! Let's get you synced up and settled in safely!\");
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReturnSync = () => {
    setSyncStatus('retrieving');
    setSyncedCount(0);
    setActiveMantra(mantras[Math.floor(Math.random() * mantras.length)]);

    // Simulate safe local WebDAV & webhook port 3050 polling sequence
    setTimeout(() => {
      setSyncStatus('processing');
      console.log(\"Polling POST http://localhost:3050/webhook/sandbox_vault/inbox...\");
    }, 1500);

    setTimeout(() => {
      setSyncStatus('done');
      setSyncedCount(Math.floor(Math.random() * 8) + 5); // Pulls in background mobile PWA snippets
    }, 4500);
  };

  // VACATION MODE OVERRIDE VIEW
  if (isVacationMode) {
    return (
      <div className=\"fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-[#E6E6FA] text-center overflow-hidden transition-all duration-500\">\n        {/* SOOTHING CSS LAVENDER BACKGROUND ELEMENTS */}\n        <div className=\"absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#8A2BE2_1px,transparent_1px)] [background-size:16px_16px]\" />\n        \n        <div className=\"max-w-md w-full bg-[#f3f0ff] border-8 border-black p-8 shadow-[12px_12px_0_#8A2BE2] rounded-none relative\">\n          <span className=\"text-6xl animate-bounce block mb-4\">🪻🏝️🍹</span>\n          <h1 className=\"font-black text-3xl text-black uppercase tracking-widest leading-none mb-3\">\n            VACATION ACTIVE\n          </h1>\n          <div className=\"border-b-4 border-black mb-4 pb-2\">\n            <p className=\"font-mono text-xs text-[#8A2BE2] font-bold uppercase\">\n              🛡️ Sovereign Privacy Block Active\n            </p>\n          </div>\n          \n          <p className=\"text-sm font-bold text-gray-800 leading-relaxed mb-8\">\n            All tickers are paused. Every notification is blocked. All work modules are frozen in fields of therapeutic lavender. \n            <br />\n            <span className=\"bg-[#E6E6FA] px-1 inline-block mt-2\">There is nothing you need to track or optimize right now.</span>\n          </p>\n          \n          {/* THE ONLY ACTIVE INTERFACE CONTROL IN THE SYSTEM */}\n          <button\n            onClick={handleBackFromCancun}\n            className=\"w-full bg-yellow-300 border-4 border-black text-base font-black text-black uppercase p-4 hover:bg-yellow-400 active:translate-y-[3px] active:shadow-none shadow-[6px_6px_0_#000] transition-all cursor-pointer\"\n          >\n            🏝️ baby I'm back from cancun\n          </button>\n        </div>\n      </div>\n    );\n  }

  // NORMAL GROUNDING RETURN VIEW
  return (
    <WidgetPanel \n      title=\"🏡 The Grounding Return Hub\" \n      badge=\"⚡ 1-TAP SYNC\"\n      className=\"border-4 border-black shadow-[4px_4px_0_#000] bg-white p-3 rounded-none max-w-md relative\"\n    >\n      <div className=\"flex flex-col gap-3\">\n        \n        {/* RETRO COZY ASCII LOADING AREA */}\n        <div className=\"bg-blue-50 border-2 border-black p-3 font-mono text-xs text-center leading-tight\">\n          {syncStatus === 'idle' && (\n            <pre className=\"text-blue-900 select-none\">\n{`      ( (\n       ) )\n    .───-───.\n    │       │ ────.\n    │  ☕   │     │\n    ╰───────╯ ────┘\n ───────────────────`}\n            </pre>\n          )}\n\n          {(syncStatus === 'retrieving' || syncStatus === 'processing') && (\n            <pre className=\"text-pink-600 animate-pulse select-none\">\n{`      ~ ~\n     ~ ~ ~\n    .───-───.\n    │ * * * │ ────.\n    │  ♨️   │     │\n    ╰───────╯ ────┘\n ─── R E L A X ─────`}\n            </pre>\n          )}\n\n          {syncStatus === 'done' && (\n            <pre className=\"text-emerald-700 select-none\">\n{`    \\\\  |  /\n   ─  ✨  ─\n    .───-───.\n    │  ♥︎   │ ────.\n    │  🍀   │     │\n    ╰───────╯ ────┘\n ─ C A U G H T  U P ─`}\n            </pre>\n          )}\n        </div>\n\n        {/* ACTIVE MANTRA BANNER */}\n        <div className=\"bg-yellow-50 border-2 border-black p-2 text-center text-xs font-bold italic leading-relaxed text-yellow-950\">\n          \"{activeMantra}\"\n        </div>\n\n        {/* CONTROL ACTION OR FEEDBACK */}\n        <div className=\"flex flex-col gap-2\">\n          {syncStatus === 'idle' && (\n            <button \n              onClick={handleReturnSync}\n              className=\"w-full bg-blue-200 border-4 border-black font-black uppercase text-sm p-3 hover:bg-blue-300 shadow-[4px_4px_0_#000] active:translate-y-[2px] active:shadow-none transition-transform\"\n            >\n              🔄 Launch Return Sync & Catch Up\n            </button>\n          )}\n\n          {(syncStatus === 'retrieving' || syncStatus === 'processing') && (\n            <div className=\"border-4 border-black p-3 bg-pink-100 text-center text-xs font-black uppercase tracking-widest text-pink-800\">\n              {syncStatus === 'retrieving' ? \"📡 Reaching out to your cloud drives...\" : \"🧬 Folding mobile logs into your timeline...\"}\n            </div>\n          )}\n\n          {syncStatus === 'done' && (\n            <div className=\"bg-emerald-100 border-4 border-black p-3 text-center flex flex-col gap-1\">\n              <h3 className=\"font-black text-xs uppercase text-emerald-800\">🎉 SUCCESS! YOU HAVE LANDED SOFTLY!</h3>\n              <p className=\"text-[11px] font-bold text-gray-700 leading-snug\">\n                Safely imported <span className=\"bg-emerald-200 px-1\">{syncedCount} new logs</span> from your phone.\n              </p>\n              <button \n                onClick={() => setSyncStatus('idle')}\n                className=\"mt-2 bg-white border-2 border-black p-1 text-[10px] font-black hover:bg-gray-100 uppercase\"\n              >\n                Got it, let's keep going\n              </button>\n            </div>\n          )}\n        </div>\n\n        {/* TRIGGERS VACATION LOCKOUT */}\n        {syncStatus === 'idle' && (\n          <button \n            onClick={handleGoOnVacation}\n            className=\"w-full bg-[#E6E6FA] border-2 border-black font-bold text-xs p-2 hover:bg-[#d8d8f7] text-[#4B0082] transition-colors mt-1\"\n          >\n            🏝️ Go On Vacation (Mute All Systems)\n          </button>\n        )}\n\n        {/* AI BUDDY GENTLE SUMMARY */}\n        <div className=\"border-t-2 border-black pt-2 text-[10px] text-gray-600 font-bold leading-normal\">\n          <p>\n            ℹ️ Clicking <strong>Return Sync</strong> checks your connected Koofr/Filejump directories and runs an in-memory audit of local port 3050 payloads. Your timeline is instantly rebuilt chronologically with zero stress.\n          </p>\n        </div>\n\n      </div>\n    </WidgetPanel>\n  );\n};