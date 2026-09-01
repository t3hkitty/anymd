/**
 * Zettelkasten ID: 20260826-1922
 * Project: @lorik/meow-mud-bext
 * Role: Kawaii Brutalist Extension Popup UI with sticky preferences [cite: 324, 615]
 */

import React, { useState, useEffect } from 'react';

export const MeowMudBextPopup: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('http://127.0.0.1:3050/webhook/device-vault');
  const [defaultFile, setDefaultFile] = useState('inbox.md');
  const [brainstorm, setBrainstorm] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  // Load Sticky settings on startup [cite: 324]
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['anymd_webhook_url', 'anymd_default_file'], (data) => {
        if (data.anymd_webhook_url) setTargetUrl(data.anymd_webhook_url);
        if (data.anymd_default_file) setDefaultFile(data.anymd_default_file);
      });
    }
  }, []);

  const saveSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({
        anymd_webhook_url: targetUrl,
        anymd_default_file: defaultFile
      }, () => {
        showToast('Settings saved instantly!');
      });
    } else {
      localStorage.setItem('anymd_webhook_url', targetUrl);
      localStorage.setItem('anymd_default_file', defaultFile);
      showToast('Cached in LocalStorage (Dev Mode)');
    }
  };

  const handleDispatch = async () => {
    if (!brainstorm.trim()) return;

    try {
      setStatus('Ingesting note...');
      const payload = {
        title: "Brainstorm from Meow-bext",
        file: defaultFile,
        content: brainstorm,
        timestamp: new Date().toISOString()
      };

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBrainstorm('');
        showToast('Bake complete! Check your daily file.');
      } else {
        setStatus(`Failed to write (${res.status})`);
      }
    } catch (e) {
      console.error(e);
      setStatus('Offline error. Is port 3050 running?');
    }
  };

  const showToast = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="w-[360px] p-3 border-4 border-slate-900 bg-[#FFFDF5] text-slate-900 font-mono text-xs select-none shadow-[4px_4px_0_0_#1e1e2e]">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-3">
        <h1 className="text-sm font-black tracking-wider uppercase flex items-center gap-1">
          🐾 Meow MUD Bext v1.0
        </h1>
        <span className="text-[10px] bg-indigo-200 border border-slate-900 px-1 font-bold">OFFLINE MODE</span>
      </div>

      {/* Target Settings */}
      <div className="space-y-2 mb-3 bg-white p-2 border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Local Node Webhook URL</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full p-1.5 border border-slate-900 bg-[#FFFDF5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Target Ingestion File</label>
          <input
            type="text"
            value={defaultFile}
            onChange={(e) => setDefaultFile(e.target.value)}
            className="w-full p-1.5 border border-slate-900 bg-[#FFFDF5] focus:outline-none"
          />
        </div>
        <button
          onClick={saveSettings}
          className="w-full py-1 bg-amber-200 border-2 border-slate-900 font-black hover:bg-amber-300 active:translate-y-0.5"
        >
          💾 Save Settings
        </button>
      </div>

      {/* Quick Brainstorm Box */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-500 uppercase">Write a quick thoughts bubble</label>
        <textarea
          value={brainstorm}
          onChange={(e) => setBrainstorm(e.target.value)}
          placeholder="Spill your somatic thoughts here... They'll sync directly to your local workspace vault!"
          className="w-full p-2 border-2 border-slate-900 min-h-[80px] bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <button
          onClick={handleDispatch}
          disabled={!brainstorm.trim()}
          className={`w-full py-2 border-2 border-slate-900 font-black flex items-center justify-center gap-1 transition-all ${
            brainstorm.trim()
              ? 'bg-emerald-200 hover:bg-emerald-300 active:translate-y-0.5'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          🚀 Bake directly to Vault
        </button>
      </div>

      {/* Global Status Banner */}
      {status && (
        <div className="mt-3 p-1.5 bg-slate-900 text-emerald-300 text-center font-bold border border-slate-900">
          ⚡ {status}
        </div>
      )}
    </div>
  );
};
