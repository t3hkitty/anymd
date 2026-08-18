import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { MediaItem } from '../types/mediaTypes';
import type { WebDAVConfig } from '../types/plugins';
import { buildPASourcingGroceryItems, generatePAGroceryListMarkdown, generatePAGroceryListHtml } from '../plugins/paSourcingPlugin';
import { publishHtmlToWebDAV } from '../plugins/htmlPublisherPlugin';
import { X, ClipboardList, Copy, Check, Download, Upload, ExternalLink } from 'lucide-react';

interface PASourcingModalProps {
  isOpen: boolean;
  books: Book[];
  mediaItems: MediaItem[];
  webdavConfig: WebDAVConfig;
  onClose: () => void;
}

export const PASourcingModal: React.FC<PASourcingModalProps> = ({
  isOpen,
  books,
  mediaItems,
  webdavConfig,
  onClose,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ success: boolean; publicUrl: string; error?: string } | null>(null);

  if (!isOpen) return null;

  const sourcingItems = buildPASourcingGroceryItems(books, mediaItems);
  const mdContent = generatePAGroceryListMarkdown(books, mediaItems);
  const htmlContent = generatePAGroceryListHtml(books, mediaItems);

  const totalMaxBudget = sourcingItems.reduce((acc, i) => acc + (i.targetMaxBudgetUSD || 0), 0);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(mdContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1500);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pa_sourcing_grocery_list.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pa_sourcing_grocery_list.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDropToWebDAV = async () => {
    setIsPublishing(true);
    setPublishStatus(null);
    const res = await publishHtmlToWebDAV(htmlContent, webdavConfig, 'pa_sourcing_grocery_list.html');
    setIsPublishing(false);
    setPublishStatus(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Executive PA Sourcing "Grocery List"</h3>
              <p className="text-xs text-slate-400">Shareable Acquisition Checklist & Sourcing Links for Personal Assistants</p>
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
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          
          {/* Summary Metric Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-amber-300 text-sm">📋 {sourcingItems.length} Target Acquisition Items</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Includes Wishlist collectibles, TCG slabs, and hardcover books.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Total Target Budget</span>
              <span className="text-base font-bold text-emerald-400">$${totalMaxBudget.toLocaleString()} USD</span>
            </div>
          </div>

          {/* PA Action Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all"
            >
              {copiedMd ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMd ? 'Copied Digest!' : 'Copy PA Digest'}</span>
            </button>

            <button
              onClick={handleDownloadMd}
              className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download .html</span>
            </button>

            <button
              onClick={handleDropToWebDAV}
              disabled={isPublishing}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isPublishing ? 'Dropping...' : 'Drop to PA via WebDAV'}</span>
            </button>
          </div>

          {publishStatus && (
            <div className={`p-3 rounded-xl border text-xs font-mono ${
              publishStatus.success ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}>
              {publishStatus.success ? (
                <p className="font-bold">✓ Uploaded to PA WebDAV drop: <a href={publishStatus.publicUrl} target="_blank" rel="noopener noreferrer" className="underline text-amber-300">{publishStatus.publicUrl}</a></p>
              ) : (
                <p>❌ Upload failed: {publishStatus.error}</p>
              )}
            </div>
          )}

          {/* Sourcing Itemized Checklist */}
          <div className="space-y-2 pt-2">
            <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">
              Itemized PA Grocery List ({sourcingItems.length})
            </h5>

            <div className="space-y-2">
              {sourcingItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs">{idx + 1}. [ ] {item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.creatorOrAuthor} &bull; {item.category}</p>
                    </div>
                    {item.targetMaxBudgetUSD && (
                      <span className="text-emerald-400 font-bold text-[11px]">$${item.targetMaxBudgetUSD.toLocaleString()} Max</span>
                    )}
                  </div>

                  {item.notes && <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800">{item.notes}</p>}

                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1">
                    {item.sourcingLinks.map((link, lIdx) => (
                      <a
                        key={lIdx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-sky-300 text-[10px] font-bold transition-colors flex items-center space-x-1"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">Executive PA Sourcing Engine v3.8</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
