import React, { useState } from 'react';
import { X, Globe, Copy, Check, ExternalLink, Sparkles, Code2, Terminal, Layers } from 'lucide-react';

interface MeowPortalGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeowPortalGeneratorModal: React.FC<MeowPortalGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSimulatingDeploy, setIsSimulatingDeploy] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  if (!isOpen) return null;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>meow.artkitty.net — Sovereign Black Box & Discovery Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">
    <h1 class="text-3xl font-extrabold text-amber-300">meow.artkitty.net — Sovereign Black Box Ecosystem</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <a href="./lcmd/" class="p-6 rounded-2xl bg-slate-900 border border-amber-500/50 hover:border-amber-400 block">
        <span class="text-2xl block mb-2">⚡</span>
        <h2 class="font-bold text-lg text-slate-100">Sovereign Black Box (myblackbox)</h2>
        <p class="text-xs text-slate-400 mt-1">Running Litany Activity Stream, 2m+ Inactivity Watchdog, and AuDHD Morning Manager.</p>
      </a>
      <a href="./lcmd/" class="p-6 rounded-2xl bg-slate-900 border border-purple-500/50 hover:border-purple-400 block">
        <span class="text-2xl block mb-2">🎭</span>
        <h2 class="font-bold text-lg text-slate-100">AI Story Tool & Author Bible</h2>
        <p class="text-xs text-slate-400 mt-1">Inspo Ledger (YYYYMMDD-HHMM), Character Slugs ([MC], [ML]), and 3-Fork CYA Lore Bridge.</p>
      </a>
      <a href="./lcmd/" class="p-6 rounded-2xl bg-slate-900 border border-blue-500/50 hover:border-blue-400 block">
        <span class="text-2xl block mb-2">🚪</span>
        <h2 class="font-bold text-lg text-slate-100">Spatial Routines & Grand Library</h2>
        <p class="text-xs text-slate-400 mt-1">Dual-channel TTS/visual daily protocols, No Bad Days deconstructor, and 3D Sovereign Bookshelf.</p>
      </a>
    </div>
  </div>
</body>
</html>`;

  const scriptContent = `#!/bin/bash
# StackCP FTP Root Index Deployment Script for meow.artkitty.net
HOST="ftp.us.stackcp.com"
USER="kitty@artkitty.net"
PASS='YOUR_STACKCP_FTP_PASSWORD_HERE'

echo "Deploying root index.html to /public_html/meow/..."
lftp -u "$USER","$PASS" -p 21 "$HOST" << 'FTP_CMDS'
mkdir -p /public_html/meow/
put meow_root_index.html -o /public_html/meow/index.html
bye
FTP_CMDS
echo "Deployment complete! https://meow.artkitty.net"
`;

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleSimulateDeploy = () => {
    setIsSimulatingDeploy(true);
    setDeploySuccess(false);

    setTimeout(() => {
      setIsSimulatingDeploy(false);
      setDeploySuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">meow.artkitty.net Root Index Portal Generator</h3>
              <p className="text-xs text-slate-400">Generate & Deploy Root Landing Page with Live Project Links (/lcmd/)</p>
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
          
          {/* Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/60 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-1">
              <span className="font-extrabold text-amber-300 text-sm block">Root Domain Hub (https://meow.artkitty.net)</span>
              <p className="text-slate-300 text-[11px]">
                Links all your subfolder live projects (<code className="text-emerald-400">/lcmd/</code>, etc.) on a sleek portal landing page!
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleSimulateDeploy}
                className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 shadow-md transition-all ${
                  deploySuccess
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isSimulatingDeploy ? (
                  <span>Deploying Root...</span>
                ) : deploySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Deployed Portal!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Deploy Root Portal</span>
                  </>
                )}
              </button>

              <a
                href="https://meow.artkitty.net"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold flex items-center space-x-1 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Hub</span>
              </a>
            </div>
          </div>

          {/* Project Subfolder Links List */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Configured Live Projects on meow.artkitty.net</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📚</span>
                <div>
                  <h5 className="font-bold text-slate-100">Library Companion MD (LC-MD)</h5>
                  <span className="text-sky-400 text-[11px]">Subfolder: https://meow.artkitty.net/lcmd/</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                ACTIVE DEMO
              </span>
            </div>
          </div>

          {/* Root HTML Code Preview */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Root Index HTML (meow_root_index.html)</span>
              </h4>

              <button
                onClick={handleCopyHtml}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-all border border-slate-700"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtml ? 'Copied HTML!' : 'Copy HTML'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto">
              <pre className="text-[11px] text-emerald-400 leading-relaxed font-mono whitespace-pre">{htmlContent}</pre>
            </div>
          </div>

          {/* Root Script Code Preview */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Root Deploy Script (deploy_meow_root.sh)</span>
              </h4>

              <button
                onClick={handleCopyScript}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-all border border-slate-700"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Script!' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <pre className="text-[11px] text-amber-300 leading-relaxed font-mono whitespace-pre-wrap">{scriptContent}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Root Portal Hub Generator for meow.artkitty.net
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
