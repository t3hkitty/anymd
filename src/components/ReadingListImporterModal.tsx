import React, { useState } from 'react';
import type { ImportedBookItem, ImportSourceType } from '../types/importer';
import { parseReadingListContent } from '../plugins/readingListImporterPlugin';
import { X, Import, Upload, Sparkles } from 'lucide-react';

interface ReadingListImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToVerification: (items: ImportedBookItem[]) => void;
}

export const ReadingListImporterModal: React.FC<ReadingListImporterModalProps> = ({
  isOpen,
  onClose,
  onProceedToVerification,
}) => {
  const [sourceType, setSourceType] = useState<ImportSourceType>('auto');
  const [isWebPresenceOnly, setIsWebPresenceOnly] = useState(false);
  const [inputText, setInputText] = useState(`Book Id,Title,Author,My Rating,Date Read,Shelves
1042,"The Hyperion Resonance","Kaelen Vance",5,2026/08/17,"scifi, favorites"
2048,"The Alchemy of Midnight Coffee","Seraphina Vance",4,2026/08/16,"drama"
3096,"Dune Sovereign Edition","Frank Herbert",5,2026/08/15,"classics"`);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setInputText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const items = parseReadingListContent(inputText, sourceType);
    if (items.length > 0) {
      const enriched = items.map(i => ({ ...i, isWebPresenceOnly }));
      onProceedToVerification(enriched);
      onClose();
    } else {
      alert('No valid book entries could be parsed from the provided input.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20">
              <Import className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Pluggable Reading List Importer</h3>
              <p className="text-xs text-slate-400">Goodreads CSV &bull; StoryGraph &bull; LibraryThing &bull; Markdown &bull; OPDS &bull; HTML</p>
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
        <form onSubmit={handleParse} className="p-6 space-y-4 flex-1 overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Format Source Reader
            </label>

            <label className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer flex items-center space-x-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload List File (.csv / .md / .json)</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as ImportSourceType)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="auto">✨ Auto-Detect Source Format</option>
            <option value="goodreads-csv">📊 Goodreads / StoryGraph / LibraryThing CSV</option>
            <option value="markdown-list">📝 Plain Text / Markdown List (- [x] Title by Author)</option>
            <option value="json-opds">🌐 OPDS / JSON Reading List Feed</option>
            <option value="html-list">🌐 HTML Web Page Reading List</option>
          </select>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Paste Reading List Text Content
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder="Paste CSV rows, Markdown lists (- [ ] Title by Author), or JSON feeds..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Web Presence Only Option Toggle */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 flex items-center space-x-2">
            <input
              type="checkbox"
              id="webPresenceOnlyToggle"
              checked={isWebPresenceOnly}
              onChange={(e) => setIsWebPresenceOnly(e.target.checked)}
              className="rounded bg-slate-950 border-indigo-500 text-indigo-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="webPresenceOnlyToggle" className="text-xs text-indigo-200 font-mono font-bold cursor-pointer">
              🌐 Mark all imported items as Web Presence Only (Online Webnovel / Digital-Only Dreamlist)
            </label>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Parse & Proceed to Verification Table</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
