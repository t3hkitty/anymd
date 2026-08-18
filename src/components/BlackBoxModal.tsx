import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { CURRENT_BLACK_BOX_SPEC, generateBlackBoxManifestMarkdown } from '../plugins/blackBoxPlugin';
import { X, Box, ShieldCheck, Copy, Check, Sparkles, Terminal, ArrowRight, ArrowLeft } from 'lucide-react';

interface BlackBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoGenerateVaultItems: (newBooks: Book[]) => void;
}

export const BlackBoxModal: React.FC<BlackBoxModalProps> = ({
  isOpen,
  onClose,
  onAutoGenerateVaultItems,
}) => {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  if (!isOpen) return null;

  const manifestMd = generateBlackBoxManifestMarkdown(CURRENT_BLACK_BOX_SPEC);

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestMd);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const handleGenerateSidecar = () => {
    const blackBoxBook: Book = {
      id: `blackbox-manifest-${Date.now()}`,
      title: 'Sovereign Black Box Architecture Manifest',
      author: 'Black Box Protocol (meow.artkitty.net)',
      coverColor: '#09090b',
      sidecarMarkdown: manifestMd,
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      resonanceStream: [
        {
          id: `res-bb-${Date.now()}`,
          cfi: 'blackbox-root',
          chapterTitle: 'Black Box Architecture',
          rawText: '100% Isolated Data Vault - Natural Expansion of Black Box Site',
          category: 'Black Box Spec',
          progressPercent: 100,
          paragraphIndex: 0,
          paragraphSnippet: CURRENT_BLACK_BOX_SPEC.sovereignNodeId,
          formattedDate: new Date().toLocaleDateString(),
          timestamp: new Date().toISOString()
        }
      ],
      chapters: [
        {
          title: 'Black Box Manifest Overview',
          cfiBase: 'epubcfi(/6/2[ch1]!)',
          paragraphs: [
            `Node ID: ${CURRENT_BLACK_BOX_SPEC.sovereignNodeId}`,
            `Protocol: ${CURRENT_BLACK_BOX_SPEC.blackBoxVersion}`,
            `Active Vault Modules: ${CURRENT_BLACK_BOX_SPEC.activeVaultModules.length}`
          ]
        }
      ]
    };

    onAutoGenerateVaultItems([blackBoxBook]);
    setGeneratedSuccess(true);

    setTimeout(() => {
      setGeneratedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-zinc-950 text-emerald-400 font-bold border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Sovereign Black Box Architecture & Ecosystem Manifest</h3>
              <p className="text-xs text-slate-400">Natural Expansion of Black Box Site &bull; 100% Opaque Data Storage &bull; Controlled Outbound Egress</p>
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
          
          {/* Black Box Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-zinc-950 via-slate-900 to-emerald-950 border border-emerald-500/60 space-y-2 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-emerald-300 text-base">Black Box Protocol Status: 100% ISOLATED</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                ⬛ BLACK BOX VAULT ACTIVE
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              LC-MD acts as a natural expansion of your Black Box Site. Inputs (EPUBs, room photos, wishlists) enter the Black Box, process locally on your hardware, and outputs (affiliate links, OPDS feeds) are strictly controlled by you.
            </p>
          </div>

          {/* Data Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            
            {/* Inbound */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-sky-400">
                <ArrowRight className="w-4 h-4" />
                <h4 className="font-bold text-slate-100 text-xs uppercase">Inbound Ingest</h4>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                {CURRENT_BLACK_BOX_SPEC.inputStreams.map((item, i) => (
                  <li key={i} className="flex items-center space-x-1">
                    <span className="text-sky-400">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Black Box Core */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/50 space-y-2 shadow-lg">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Box className="w-4 h-4" />
                <h4 className="font-bold text-emerald-300 text-xs uppercase">Black Box Processing</h4>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {CURRENT_BLACK_BOX_SPEC.activeVaultModules.slice(0, 4).map((mod, i) => (
                  <li key={i} className="flex items-center space-x-1 truncate">
                    <span className="text-emerald-400">&bull;</span>
                    <span className="truncate">{mod}</span>
                  </li>
                ))}
                <li className="text-[10px] text-slate-500 italic">+ 4 more sovereign modules</li>
              </ul>
            </div>

            {/* Outbound */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-purple-400">
                <ArrowLeft className="w-4 h-4" />
                <h4 className="font-bold text-slate-100 text-xs uppercase">Controlled Egress</h4>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                {CURRENT_BLACK_BOX_SPEC.outputStreams.map((item, i) => (
                  <li key={i} className="flex items-center space-x-1">
                    <span className="text-purple-400">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Black Box Manifest Markdown View */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Black Box Ecosystem Manifest (.blackbox.md)</span>
              </h4>

              <button
                onClick={handleCopyManifest}
                className="px-3.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
              >
                {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedManifest ? 'Copied Manifest!' : 'Copy Manifest'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-44 overflow-y-auto">
              <pre className="text-[10px] text-emerald-300 leading-relaxed font-mono whitespace-pre-wrap">{manifestMd}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Sovereign Black Box Engine &bull; {CURRENT_BLACK_BOX_SPEC.sovereignNodeId}
          </span>
          <button
            onClick={handleGenerateSidecar}
            className={`px-5 py-2 rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all ${
              generatedSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {generatedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Black Box Manifest Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>⚡ Auto-Generate Black Box Sidecar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
