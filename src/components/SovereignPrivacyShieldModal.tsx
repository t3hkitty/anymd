import React, { useState } from 'react';
import { SOVEREIGN_PRIVACY_AUDIT, generateAntiScraperHtaccess } from '../plugins/sovereignPrivacyPlugin';
import { X, ShieldCheck, Lock, Terminal, Copy, Check, EyeOff } from 'lucide-react';

interface SovereignPrivacyShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SovereignPrivacyShieldModal: React.FC<SovereignPrivacyShieldModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);

  if (!isOpen) return null;

  const htaccessContent = generateAntiScraperHtaccess();

  const handleCopyHtaccess = () => {
    navigator.clipboard.writeText(htaccessContent);
    setCopiedHtaccess(true);
    setTimeout(() => setCopiedHtaccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Sovereign Data Vault & Zero-Telemetry Privacy Shield</h3>
              <p className="text-xs text-slate-400">100% Self-Hostable &bull; Zero Ad-Tech Telemetry &bull; Private Markdown Storage Only</p>
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Zero Telemetry Certificate Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/60 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-emerald-200 text-base">Zero-Telemetry Audit Certificate</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                🟢 100% PRIVATE & SOVEREIGN
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              "{SOVEREIGN_PRIVACY_AUDIT.sovereignPledge}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] border-t border-emerald-500/20">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Active Trackers:</span>
                <strong className="text-emerald-400 text-sm">0 (Zero)</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Cloud Lock-In:</span>
                <strong className="text-emerald-400 text-sm">NONE</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Ad-Tech Pixels:</span>
                <strong className="text-emerald-400 text-sm">BLOCKED</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Storage Mode:</span>
                <strong className="text-emerald-400 text-xs truncate block">Local Hardware</strong>
              </div>
            </div>
          </div>

          {/* Privacy Protections Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <EyeOff className="w-4 h-4" />
                <h4 className="font-bold text-slate-100 text-xs uppercase">No Ad-Tech Harvesting</h4>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Corporate discovery platforms monetize your interests by selling read logs & wishlists to advertisers. LC-MD keeps 100% of your data on your local hardware.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Lock className="w-4 h-4" />
                <h4 className="font-bold text-slate-100 text-xs uppercase">Self-Hostable Sovereignty</h4>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Deploy to your own StackCP, Midphase, Linux Server, or Raspberry Pi. Sync via WebDAV, SSH, or local file system.
              </p>
            </div>
          </div>

          {/* Anti-Scraper .htaccess Rules */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Apache Anti-Scraper & Telemetry Blocker (.htaccess)</span>
              </h4>

              <button
                onClick={handleCopyHtaccess}
                className="px-3.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
              >
                {copiedHtaccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtaccess ? 'Copied Rules!' : 'Copy Rules'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto">
              <pre className="text-[10px] text-emerald-300 leading-relaxed font-mono whitespace-pre-wrap">{htaccessContent}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Sovereign Privacy Shield & Zero-Telemetry Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
