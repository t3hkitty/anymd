import React, { useState } from 'react';
import { X, Bot, Sparkles, Copy, Check, ExternalLink, Code2, Cpu } from 'lucide-react';

interface AntigravitySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AntigravitySetupModal: React.FC<AntigravitySetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);

  if (!isOpen) return null;

  const markdownContent = `# 🚀 Replicating the Sovereign Antigravity LC-MD Setup

This codebase was pair-programmed with **Google Antigravity AI** to build a **100% sovereign, local-first, multi-media library companion and e-reader system**.

## 🛠️ Key Architecture
- **Frontend Core**: React 18 + Vite + TypeScript + Tailwind CSS
- **Themes**: Midnight, Sepia, Nord, Dracula, E-Ink, Piplup & Dawn Sapphire & Ice Pearl
- **Sidecar Format**: Standardized .companion.md with YAML frontmatter
- **Cloud Sync**: WebDAV, Rsync, Google OAuth 2.0 Family Accounts
- **Deployment**: StackCP (meow.artkitty.net) & Midphase Hosting
`;

  const handleCopyMd = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Antigravity Setup & Replication Guide</h3>
              <p className="text-xs text-slate-400">Crafted with Google Antigravity AI &bull; Pair Programming Architecture & Sovereign Blueprints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          
          {/* Antigravity Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950 border border-indigo-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-indigo-200 text-sm">Google Antigravity AI Pair Programming</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Fully modular React + Vite architecture with 25+ sovereign plugins, WebDAV/Rsync, Google Auth, Piplup & Dawn themes & StackCP deployers.
              </p>
            </div>

            <a
              href="https://github.com/t3hkitty/library-companion-md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 shrink-0 shadow-md transition-all"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Setup Checklist */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>How to Mimic / Replicate This Antigravity Setup</span>
            </h4>

            <div className="space-y-2 text-slate-300">
              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-400 w-5">1.</span>
                <div>
                  <strong className="text-slate-100 block">Clone the GitHub Repository:</strong>
                  <code className="text-emerald-400 text-[11px] bg-slate-950 px-2 py-0.5 rounded">git clone https://github.com/t3hkitty/library-companion-md.git</code>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-400 w-5">2.</span>
                <div>
                  <strong className="text-slate-100 block">Install & Run Locally:</strong>
                  <code className="text-emerald-400 text-[11px] bg-slate-950 px-2 py-0.5 rounded">npm install && npm run dev</code>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-400 w-5">3.</span>
                <div>
                  <strong className="text-slate-100 block">Deploy to StackCP or Midphase:</strong>
                  <span className="text-slate-400">Use in-app <strong className="text-amber-300">🐱 StackCP Deploy</strong> or <strong className="text-sky-300">☁️ Midphase & Google Auth</strong> buttons!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>ANTIGRAVITY_SETUP.md Blueprint</span>
              </h4>

              <button
                onClick={handleCopyMd}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-all border border-slate-700"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? 'Copied Blueprint!' : 'Copy Blueprint'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <pre className="text-[11px] text-indigo-300 leading-relaxed font-mono whitespace-pre-wrap">{markdownContent}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Built with Google Antigravity AI Pair Programmer
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
