import React, { useState } from 'react';
import { parseCalibreJsonImport } from '../plugins/calibreDbPlugin';
import { X, BookOpen, Upload } from 'lucide-react';

interface CalibreImportModalProps {
  isOpen: boolean;
  relLinkRoot: string;
  onClose: () => void;
  onImportCalibreBooks: (books: any[]) => void;
}

export const CalibreImportModal: React.FC<CalibreImportModalProps> = ({
  isOpen,
  relLinkRoot,
  onClose,
  onImportCalibreBooks,
}) => {
  const [jsonText, setJsonText] = useState(`[
  {
    "title": "The Quantum Fall (1042)",
    "authors": ["Kaelen Vance"],
    "tags": ["SciFi", "Calibre"],
    "isbn": "978-1234567890",
    "comments": "Imported from Calibre DB export. Numbers in parentheses stripped for meow mobile path portability."
  }
]`);

  if (!isOpen) return null;

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    const books = parseCalibreJsonImport(jsonText, relLinkRoot);
    if (books.length > 0) {
      onImportCalibreBooks(books);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Calibre DB Importer & Sanitizer</h3>
              <p className="text-xs text-slate-400">Import Calibre Library Metadata & Strip Parentheses Numbers</p>
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
        <form onSubmit={handleImport} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Paste Calibre JSON / metadata.db Export
              </label>
              <span className="text-[11px] text-emerald-400 font-mono">Clean Meow Paths Active</span>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={6}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono space-y-1">
            <div className="flex items-center justify-between text-amber-400">
              <span className="font-bold">Meow Mobile Path Conversion Rule:</span>
              <span className="text-[10px]">rel_link_root: {relLinkRoot}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Calibre folder: <code className="text-rose-400">Title (1042)/Book (1042).epub</code> &rrarr; Anymd clean meow path: <code className="text-emerald-400">Library/Author/Title.companion.md</code>
            </p>
          </div>

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
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Import & Create Companion Sidecars</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
