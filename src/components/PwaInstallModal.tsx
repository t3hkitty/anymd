import React, { useState, useEffect } from 'react';
import { isRunningStandalone } from '../plugins/pwaPlugin';
import {
  X,
  Smartphone,
  Share2,
  Download,
  CheckCircle2,
  Sparkles,
  Compass,
  Laptop
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess
}) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'share_guide'>('install');
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    setIsStandalone(isRunningStandalone());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        onInstallSuccess();
        setTimeout(() => {
          setInstallSuccess(false);
          onClose();
        }, 2000);
      }
    } else {
      alert("To install on iOS Safari: Tap the Share button at the bottom of Safari, then select 'Add to Home Screen' (+).\n\nOn Desktop Chrome/Edge: Click the Install icon in the browser address bar!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>PWA App Install &amp; Mobile Share Target</span>
                {isStandalone && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    STANDALONE APP
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Install as native app &bull; Share books directly from mobile browser sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40 font-mono text-xs">
          <button
            onClick={() => setActiveTab('install')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'install'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>📲 Install App Shortcut</span>
          </button>

          <button
            onClick={() => setActiveTab('share_guide')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'share_guide'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>📤 Mobile Share Target Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans text-xs">
          
          {activeTab === 'install' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Highlight Hero Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/40 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-sky-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Run LC-MD as a Standalone Sovereign App</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    OFFLINE CAPABLE
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  Installing the Progressive Web App gives you an icon on your home screen or desktop taskbar, full-screen reading without browser address bars, and enables your phone's native <strong>Share Sheet Target</strong>!
                </p>

                <div className="pt-2 flex justify-start">
                  <button
                    onClick={handleInstallClick}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/25 flex items-center space-x-2 transition-all"
                  >
                    {installSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>✓ App Installed Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Install Library Companion MD PWA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step-by-Step Instructions per Device */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                
                {/* iOS Safari Guide */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                    <Compass className="w-4 h-4" />
                    <span>🍎 iPhone / iPad (iOS Safari):</span>
                  </div>
                  <ol className="space-y-1 text-[11px] text-slate-300 list-decimal list-inside font-sans">
                    <li>Open this page in <strong>Safari</strong>.</li>
                    <li>Tap the <strong>Share button</strong> (square with arrow ⎙).</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen" (+)</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top right.</li>
                  </ol>
                </div>

                {/* Android / Desktop Chrome Guide */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                    <Laptop className="w-4 h-4" />
                    <span>🤖 Android / Desktop Chrome:</span>
                  </div>
                  <ol className="space-y-1 text-[11px] text-slate-300 list-decimal list-inside font-sans">
                    <li>Tap the golden <strong>Install</strong> button above.</li>
                    <li>Or tap Chrome menu (⋮) &rarr; <strong>"Install app"</strong>.</li>
                    <li>Confirm installation to create desktop/phone app icon.</li>
                  </ol>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'share_guide' && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5 text-xs">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>How Mobile Web Share Target Works:</span>
                </span>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  When bookmarklets are difficult to run on mobile, you can use your phone's native <strong>Share</strong> sheet to import webnovels and books in seconds!
                </p>
              </div>

              {/* 3 Step Visual Progression */}
              <div className="space-y-3 font-sans">
                
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs block font-bold">Browse Any Book or Webnovel Page</strong>
                    <span className="text-slate-400 text-[11px]">Open Goodreads, NovelUpdates, RoyalRoad, or Amazon in your phone's browser.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs block font-bold">Tap the Browser "Share" Button</strong>
                    <span className="text-slate-400 text-[11px]">Tap the native Share icon in Safari or Chrome to open the system share sheet.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs block font-bold">Select "Library Companion MD"</strong>
                    <span className="text-slate-400 text-[11px]">The PWA automatically creates the sidecar and imports the title into your vault!</span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            PWA Manifest &amp; Web Share Target Configured
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
