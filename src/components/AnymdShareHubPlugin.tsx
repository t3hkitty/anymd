import React, { useState, useEffect, useRef } from 'react';
import { useStickySetting } from '../state/harvesterState';

/**
 * Zettelkasten ID: 20260826-1745
 * Project: anymd (AnyMD)
 * Role: Unified Outbound Web Share & KawaiiNeko AI Dispatch Hub Plugin
 * 
 * This plugin integrates a cohesive sharing panel inside AnyMD. It:
 * 1. Invokes the native Web Share API (navigator.share) to send active note text directly to system share sheets (iOS/Android).
 * 2. Implements deep-link dispatch bridges to pipe active notes directly as prompts to Gemini or auto-ingested sources in NotebookLM.
 * 3. Uses Sticky Settings (localStorage) to customize default target channels, pre-pended tags, and clipboard auto-copies.
 * 4. Adheres to High-Density Kawaii Brutalist design principles (0px border-radii, solid 2px borders, desaturated cream background).
 */

interface ActiveNote {
  title: string;
  body: string;
  zettelId: string;
  tags: string[];
}

export const AnymdShareHubPlugin: React.FC<{ activeNote?: ActiveNote; onClose?: () => void }> = ({ activeNote, onClose }) => {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sticky Settings: Explicit localStorage keys with fallback defaults and instant change-listeners
  const [defaultDispatch, setDefaultDispatch] = useStickySetting('anymd_share_default_dispatch', 'system_share');
  const [autoCopyOnShare, setAutoCopyOnShare] = useStickySetting('anymd_share_autocopy', true);
  const [prependZettelHeader, setPrependZettelHeader] = useStickySetting('anymd_share_prepend_header', true);

  const faqRef = useRef<HTMLDivElement>(null);
  const changelogRef = useRef<HTMLDivElement>(null);

  const mockNote: ActiveNote = activeNote || {
    title: "Somatic Brainstorming Session",
    body: "Tasting cold water after a stretch. Breathing feels full. Focus pacing is high.",
    zettelId: "20260826163000",
    tags: ["brainstorm", "somatic", "telemetry"]
  };

  // Esc / Click-Outside Triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFaqOpen(false);
        setIsChangelogOpen(false);
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (faqRef.current && !faqRef.current.contains(e.target as Node)) setIsFaqOpen(false);
      if (changelogRef.current && !changelogRef.current.contains(e.target as Node)) setIsChangelogOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getFormattedPayload = (): string => {
    if (!prependZettelHeader) return mockNote.body;
    
    const yamlHeader = `---
zettel_id: "${mockNote.zettelId}"
title: "${mockNote.title}"
tags:
${mockNote.tags.map(tag => `  - "${tag}"`).join('\n')}
---

`;
    return yamlHeader + mockNote.body;
  };

  // Trigger Outbound Web Share (iOS/Android Native Share Sheet)
  const triggerSystemShare = async () => {
    const shareText = getFormattedPayload();
    
    if (autoCopyOnShare) {
      await navigator.clipboard.writeText(shareText);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: mockNote.title,
          text: shareText
        });
        showToast("✓ Note successfully shared to system drawer!");
      } catch (error) {
        console.warn("Share sheet dismissed or failed:", error);
      }
    } else {
      // Fallback: Copy to clipboard if Web Share API is missing (e.g. desktop Chrome HTTP)
      await navigator.clipboard.writeText(shareText);
      showToast("📋 Web Share unsupported. Note text copied to clipboard!");
    }
  };

  // Dispatch Note directly to Gemini Web UI as an encoded prompt
  const dispatchToGemini = () => {
    const formattedText = getFormattedPayload();
    const promptPrefix = "I am feeding you a brainstorm card from my AnyMD meow vault. Please analyze, categorize, and build on these thoughts:\n\n";
    const fullPrompt = encodeURIComponent(promptPrefix + formattedText);
    const geminiUrl = `https://gemini.google.com/app?prompt=${fullPrompt}`;
    
    if (autoCopyOnShare) {
      navigator.clipboard.writeText(formattedText);
    }
    
    window.open(geminiUrl, '_blank');
    showToast("🚀 Opened Gemini. Prompt staged successfully!");
  };

  // Dispatch Note to NotebookLM
  const dispatchToNotebookLM = () => {
    const formattedText = getFormattedPayload();
    
    // Copy payload into local storage for the companion content script to harvest
    window.localStorage.setItem('anymd_pending_notebooklm_source', JSON.stringify({
      title: mockNote.title,
      body: formattedText
    }));

    if (autoCopyOnShare) {
      navigator.clipboard.writeText(formattedText);
    }

    window.open("https://notebook.google.com/notebook/", '_blank');
    showToast("📓 Opened NotebookLM. Paste source buffer primed!");
  };

  return (
    <div className="p-4 border-2 border-slate-900 bg-[#fffdf5] text-slate-900 font-mono text-xs max-w-xl w-full">
      <div className="flex justify-between items-center mb-4 border-b-2 border-slate-900 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">📤</span>
          <h2 className="text-xs font-bold uppercase tracking-wider">AnyMD KawaiiNeko Share Hub</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsFaqOpen(true)} className="px-2 py-0.5 bg-indigo-200 border border-slate-900 hover:bg-indigo-300 transition-colors">FAQ</button>
          <button onClick={() => setIsChangelogOpen(true)} className="px-2 py-0.5 bg-pink-200 border border-slate-900 hover:bg-pink-300 transition-colors">Logs</button>
          {onClose && (
            <button onClick={onClose} className="px-1.5 py-0.5 bg-rose-200 border border-slate-900 hover:bg-rose-300">✖</button>
          )}
        </div>
      </div>

      {/* Note Preview Section */}
      <div className="border-2 border-slate-900 bg-white p-3 mb-4 shadow-[2px_2px_0_0_#0f172a]">
        <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 border-b border-dashed border-slate-300 pb-1">
          <span>📓 TITLE: {mockNote.title}</span>
          <span>ID: {mockNote.zettelId}</span>
        </div>
        <pre className="text-[11px] leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto font-mono text-slate-700">
          {getFormattedPayload()}
        </pre>
      </div>

      {/* Button Builder & Share Triggers */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button 
          onClick={triggerSystemShare} 
          className="flex flex-col items-center gap-1 p-3 bg-yellow-200 border-2 border-slate-900 hover:bg-yellow-300 active:translate-y-0.5 transition-transform"
        >
          <span className="text-lg">⎙</span>
          <span className="font-bold text-[10px] uppercase">System Share</span>
        </button>

        <button 
          onClick={dispatchToGemini} 
          className="flex flex-col items-center gap-1 p-3 bg-teal-200 border-2 border-slate-900 hover:bg-teal-300 active:translate-y-0.5 transition-transform"
        >
          <span className="text-lg">✨</span>
          <span className="font-bold text-[10px] uppercase">Send to Gemini</span>
        </button>

        <button 
          onClick={dispatchToNotebookLM} 
          className="flex flex-col items-center gap-1 p-3 bg-orange-200 border-2 border-slate-900 hover:bg-orange-300 active:translate-y-0.5 transition-transform"
        >
          <span className="text-lg">📓</span>
          <span className="font-bold text-[10px] uppercase">Send as Source</span>
        </button>
      </div>

      {/* Sticky Settings Customizer */}
      <div className="border-t-2 border-slate-900 pt-3 space-y-3">
        <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-2">Configure Default Behavior</h3>
        
        <div className="flex items-center justify-between p-2 bg-white border border-slate-900">
          <span>Auto-copy payload to clipboard on share</span>
          <input 
            type="checkbox" 
            checked={autoCopyOnShare} 
            onChange={(e) => {
              setAutoCopyOnShare(e.target.checked);
              showToast(`Auto-copy updated: ${e.target.checked}`);
            }} 
            className="w-4 h-4 accent-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-white border border-slate-900">
          <span>Prepend Zettelkasten Frontmatter header</span>
          <input 
            type="checkbox" 
            checked={prependZettelHeader} 
            onChange={(e) => {
              setPrependZettelHeader(e.target.checked);
              showToast(`Zettel header updated: ${e.target.checked}`);
            }} 
            className="w-4 h-4 accent-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-white border border-slate-900">
          <span>Primary Action Button</span>
          <select 
            value={defaultDispatch} 
            onChange={(e) => {
              setDefaultDispatch(e.target.value);
              showToast(`Default share target set to: ${e.target.value}`);
            }}
            className="p-1 border border-slate-900 bg-slate-50 font-mono text-[10px]"
          >
            <option value="system_share">⎙ System Share Sheet</option>
            <option value="gemini">✨ Gemini Web App</option>
            <option value="notebooklm">📓 NotebookLM Source Ingest</option>
          </select>
        </div>
      </div>

      {/* Status Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 p-3 bg-slate-900 text-emerald-300 border-2 border-emerald-400 font-mono text-xs z-50">
          {toastMessage}
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-40 p-4">
          <div ref={faqRef} className="bg-[#fffdf5] border-4 border-slate-900 p-6 max-w-sm w-full shadow-[4px_4px_0_0_#000000]">
            <h3 className="text-xs font-bold mb-4 border-b-2 border-slate-900 pb-2 uppercase tracking-wider">FAQ: KawaiiNeko Share Hub</h3>
            <div className="space-y-3 leading-relaxed text-[11px]">
              <p><strong>Q: What is System Share?</strong><br/>A: It launches your phone or computer's native share drawer (iOS Share Sheet, Android Share Sheet, or Windows Share) so you can directly pipe text to Keep, Notes, or Messages without cloud servers.</p>
              <p><strong>Q: What does "Send to Gemini" do?</strong><br/>A: It compiles your Markdown Zettel card, pre-pends analytical prompts, and deep-links it directly into the Gemini prompt box.</p>
              <p><strong>Q: How does NotebookLM integration work?</strong><br/>A: It places your note body inside browser storage. When you click past, your companion extension/bookmarklet on NotebookLM detects the payload and injects it as a pasted text source instantly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {isChangelogOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-40 p-4">
          <div ref={changelogRef} className="bg-[#fffdf5] border-4 border-slate-900 p-6 max-w-sm w-full shadow-[4px_4px_0_0_#000000]">
            <h3 className="text-xs font-bold mb-4 border-b-2 border-slate-900 pb-2 uppercase tracking-wider">Release Log</h3>
            <ul className="list-disc pl-4 space-y-2 text-[11px] font-mono leading-relaxed">
              <li><strong>v1.0.0:</strong> Implemented Outbound Web Share (navigator.share) fallback mapping.</li>
              <li><strong>v1.0.1:</strong> Added direct dispatch routes for NotebookLM clipboard staging and Gemini deep-link prompt compilation.</li>
              <li><strong>v1.0.2:</strong> Handled Esc/click-outside dismissals and localStorage sticky state saves.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
