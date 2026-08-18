import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { AnnasArchiveIsbnRecord } from '../plugins/annasArchiveIsbnPlugin';
import { searchAnnasArchiveIsbnDb } from '../plugins/annasArchiveIsbnPlugin';
import { X, Search, Database, ShieldCheck, Sparkles, Check } from 'lucide-react';

interface AnnasArchiveImporterModalProps {
  isOpen: boolean;
  activeBook: Book;
  onClose: () => void;
  onInjectIsbnMetadata: (updatedSidecarMd: string) => void;
}

export const AnnasArchiveImporterModal: React.FC<AnnasArchiveImporterModalProps> = ({
  isOpen,
  activeBook,
  onClose,
  onInjectIsbnMetadata,
}) => {
  const [query, setQuery] = useState(activeBook ? activeBook.title : '');
  const [results, setResults] = useState<AnnasArchiveIsbnRecord[]>(searchAnnasArchiveIsbnDb(query));
  const [appliedRecord, setAppliedRecord] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(searchAnnasArchiveIsbnDb(query));
  };

  const handleApplyRecord = (rec: AnnasArchiveIsbnRecord) => {
    let md = activeBook.sidecarMarkdown;

    const isbnBlock = `isbn:\n  isbn13: "${rec.isbn13}"\n  isbn10: "${rec.isbn10 || ''}"\n  loc_classification: "${rec.locClassification || ''}"\n  publisher: "${rec.publisher || ''}"\n  publish_year: ${rec.publishYear || ''}\n  source_db: "${rec.sourceDataset}"\n`;

    if (!md.includes('isbn:')) {
      md = md.replace(/---\n/, `---\n${isbnBlock}`);
    }

    if (!md.includes('#annas-archive-loc')) {
      md += `\n- **[Library of Congress & Anna's Archive Metadata]** *ISBN-13: ${rec.isbn13} &bull; LoC Class: ${rec.locClassification || 'N/A'} &bull; Source: ${rec.sourceDataset}*\n`;
    }

    onInjectIsbnMetadata(md);
    setAppliedRecord(rec.isbn13);
    setTimeout(() => {
      setAppliedRecord(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Anna's Archive & Library of Congress ISBN Resolver</h3>
              <p className="text-xs text-slate-400">Resolve ISBN-13, LoC MARC21 Call Numbers & OCLC WorldCat Records for Portable Sidecars</p>
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
          
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>OPEN DATASET MIRRORS</span>
              </span>
              <span className="text-slate-400">Anna's Archive &bull; LoC MARC21 &bull; Open Library</span>
            </div>
            <p className="text-slate-300">
              Anna's Archive indexes open torrent databases containing millions of bibliographic records from the <strong>Library of Congress (LoC)</strong>, <strong>OCLC WorldCat</strong>, and <strong>Open Library</strong>.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter ISBN-13, ISBN-10, Book Title, or Author..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
            >
              Search Open Datasets
            </button>
          </form>

          {/* Results List */}
          <div className="space-y-3">
            {results.map((rec) => (
              <div
                key={rec.isbn13}
                className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/60 transition-all space-y-3 group shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold">
                        {rec.sourceDataset}
                      </span>
                      <span className="text-[11px] font-mono text-amber-300 font-bold">
                        ISBN-13: {rec.isbn13}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-400">Author: {rec.author} &bull; Publisher: {rec.publisher || 'N/A'} ({rec.publishYear})</p>
                  </div>

                  <button
                    onClick={() => handleApplyRecord(rec)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0 ${
                      appliedRecord === rec.isbn13
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {appliedRecord === rec.isbn13 ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Injected to Sidecar!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Inject Metadata</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">LoC Call Number:</span>
                    <span className="text-emerald-300 font-bold">{rec.locClassification || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ISBN-10:</span>
                    <span className="text-sky-300 font-bold">{rec.isbn10 || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Open Library ID:</span>
                    <span className="text-amber-300 font-bold">{rec.openLibraryId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Target Sidecar: <strong>{activeBook ? activeBook.title : 'None'}</strong></span>
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
