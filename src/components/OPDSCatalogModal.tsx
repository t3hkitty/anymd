import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { generateOPDSAtomXml } from '../plugins/opdsServerPlugin';
import { X, Radio, Copy, Check, Download } from 'lucide-react';

interface OPDSCatalogModalProps {
  isOpen: boolean;
  books: Book[];
  relLinkRoot: string;
  onClose: () => void;
}

export const OPDSCatalogModal: React.FC<OPDSCatalogModalProps> = ({
  isOpen,
  books,
  relLinkRoot,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const atomXml = generateOPDSAtomXml(books, relLinkRoot);
  const feedUrl = `${window.location.origin}/opds/catalog.xml`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([atomXml], { type: 'application/atom+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'catalog.opds.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">OPDS Catalog Server Feed</h3>
              <p className="text-xs text-slate-400">Open Publication Distribution System &bull; Mobile E-Reader Network Feed</p>
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Feed URL Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Live OPDS Server Endpoint Feed URL
              </span>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md">
                Moon+ Reader & KOReader Compatible
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>Copy Feed URL</span>
              </button>
            </div>
          </div>

          {/* Connection Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <h5 className="font-bold text-amber-400">🌙 Moon+ Reader Setup (Android):</h5>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Net Library &rarr; Add OPDS Catalog &rarr; Paste <code className="text-indigo-300">{feedUrl}</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <h5 className="font-bold text-sky-400">⚡ KOReader Setup (Android/Kindle):</h5>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                OPDS Catalog &rarr; Add Catalog &rarr; URL: <code className="text-indigo-300">{feedUrl}</code>
              </p>
            </div>
          </div>

          {/* OPDS Atom XML Feed Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Generated OPDS Atom XML ({books.length} entries)
              </span>
              <button
                onClick={handleDownloadXml}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download catalog.xml</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs max-h-52 overflow-y-auto whitespace-pre-wrap select-all">
              {atomXml}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
          >
            Close OPDS Feed
          </button>
        </div>

      </div>
    </div>
  );
};
