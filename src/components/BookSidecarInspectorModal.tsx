import React, { useState, useEffect } from 'react';
import type { Book } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';
import type { DriveFileMatch } from '../plugins/attachedDriveSearchPlugin';
import {
  searchAttachedDrivesForBook,
  linkRealFileToBookSidecar
} from '../plugins/attachedDriveSearchPlugin';
import { isBookAvailableForTrade, toggleBookTradeAvailability } from '../plugins/tradeValuePlugin';
import {
  X,
  BookOpen,
  FileText,
  Search,
  Link,
  Check,
  Copy,
  Download,
  HardDrive,
  Cloud,
  Radio,
  Scale,
  Handshake,
  RefreshCw
} from 'lucide-react';

interface BookSidecarInspectorModalProps {
  isOpen: boolean;
  book: Book | null;
  accounts: CloudAccount[];
  onClose: () => void;
  onOpenReader: (bookId: string) => void;
  onOpenSidecarEditor: (bookId: string) => void;
  onUpdateBookSidecar: (bookId: string, updatedSidecar: string) => void;
  onToggleTrade?: (updatedBook: Book) => void;
}

export const BookSidecarInspectorModal: React.FC<BookSidecarInspectorModalProps> = ({
  isOpen,
  book,
  accounts,
  onClose,
  onOpenReader,
  onOpenSidecarEditor,
  onUpdateBookSidecar,
  onToggleTrade
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'drive_search' | 'resonance'>('preview');
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<DriveFileMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkedSuccess, setLinkedSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && book) {
      setSearchQuery(book.title);
      handleSearchDrives(book.title);
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  const handleSearchDrives = async (customQuery?: string) => {
    setSearching(true);
    const targetBook = customQuery ? { ...book, title: customQuery } : book;
    const results = await searchAttachedDrivesForBook(targetBook, accounts);
    setMatches(results);
    setSearching(false);
  };

  const handleLinkFile = (match: DriveFileMatch) => {
    const updatedSidecar = linkRealFileToBookSidecar(book, match);
    onUpdateBookSidecar(book.id, updatedSidecar);
    setLinkedSuccess(`Linked "${match.filename}" to sidecar!`);
    setTimeout(() => setLinkedSuccess(null), 3000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(book.sidecarMarkdown || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSidecar = () => {
    const blob = new Blob([book.sidecarMarkdown || ''], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title.replace(/[\s\W]+/g, '_')}.companion.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalParas = book.chapters.reduce((acc, c) => acc + c.paragraphs.length, 0);
  const valuation = book.tradeValueUsd || 19.99;
  const isTrade = isBookAvailableForTrade(book);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-12 rounded-xl shadow-md flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: book.coverColor || '#0284c7' }}
            >
              📖
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight tracking-tight text-slate-100 line-clamp-1 flex items-center space-x-2">
                <span>{book.title}</span>
                {book.isWebPresenceOnly && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold">
                    🌐 WEB PRESENCE
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                By {book.author} &bull; {book.chapters.length} Chapters ({totalParas} paras) &bull; ${valuation.toFixed(2)} USD
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenReader(book.id);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Book</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/50 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'preview'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>👁️ Sidecar Markdown &amp; Info</span>
          </button>

          <button
            onClick={() => setActiveTab('drive_search')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'drive_search'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            <span>🔍 Attached Drive / Cloud Matcher ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resonance')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'resonance'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>🔮 Resonance Stream ({book.resonanceStream.length})</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4">
          
          {/* TAB 1: PREVIEW & INFO */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Metadata Badges Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                    📚 {book.chapters.length} Chapters
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-300 font-bold">
                    🔮 {book.resonanceStream.length} Captures
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center space-x-1">
                    <Scale className="w-3 h-3" />
                    <span>${valuation.toFixed(2)} USD</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {onToggleTrade && (
                    <button
                      onClick={() => {
                        const updated = toggleBookTradeAvailability(book);
                        onToggleTrade(updated);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        isTrade
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Handshake className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isTrade ? '🤝 Available for Trade' : '🔒 Vault Keeper'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onClose();
                      onOpenSidecarEditor(book.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-bold flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Edit Sidecar</span>
                  </button>
                </div>
              </div>

              {/* Sidecar Markdown Viewer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-300">📄 .companion.md Sidecar Content:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyMarkdown}
                      className="text-sky-300 hover:underline flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                    </button>
                    <span>&bull;</span>
                    <button
                      onClick={handleDownloadSidecar}
                      className="text-amber-300 hover:underline flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>

                <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-mono max-h-[360px] overflow-y-auto leading-relaxed pt-2">
                  {book.sidecarMarkdown || '# No sidecar markdown found.'}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 2: ATTACHED DRIVE & CLOUD MATCHER */}
          {activeTab === 'drive_search' && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-2">
                <span className="font-bold text-sky-300 flex items-center space-x-1.5">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  <span>Search Attached Cloud Storage &amp; Drives for Real Ebook Files:</span>
                </span>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  Scan all your configured cloud accounts (Filejump, Nextcloud, Koofr, Google Drive, Dropbox, local synced directory) to match and link real <code>.epub</code>, <code>.pdf</code>, or <code>.mobi</code> files directly to this sidecar record!
                </p>
              </div>

              {/* Live Search Box */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search drives by book title or keywords..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleSearchDrives(searchQuery)}
                  disabled={searching}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${searching ? 'animate-spin' : ''}`} />
                  <span>Search Drives</span>
                </button>
              </div>

              {linkedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>✓ {linkedSuccess}</span>
                </div>
              )}

              {/* Search Results Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Drive / Provider</th>
                      <th className="p-3">Matching Filename</th>
                      <th className="p-3 text-center">Format</th>
                      <th className="p-3 text-right">Size</th>
                      <th className="p-3 text-center">Confidence</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {matches.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 text-slate-300 font-bold flex items-center space-x-1.5">
                          <Cloud className="w-3.5 h-3.5 text-sky-400" />
                          <span>{m.accountName}</span>
                        </td>
                        <td className="p-3 text-amber-300 font-mono">
                          {m.filename}
                          <span className="block text-[10px] text-slate-500">{m.filePath}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                            {m.format}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-400">
                          {(m.sizeBytes / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            {m.matchScore}% Match
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleLinkFile(m)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1 mx-auto transition-all"
                            title="Inject linked file metadata into sidecar"
                          >
                            <Link className="w-3 h-3" />
                            <span>Link to Sidecar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {matches.length === 0 && !searching && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500">
                          No matching files found across configured cloud accounts for "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: RESONANCE STREAM */}
          {activeTab === 'resonance' && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
                <span className="font-bold text-indigo-300 block mb-1">🔮 Reader Resonance Stream:</span>
                <p className="text-slate-400 text-[11px] font-sans">
                  {book.resonanceStream.length} micro-reactions and emotional marks captured across chapters.
                </p>
              </div>

              {book.resonanceStream.length > 0 ? (
                <div className="space-y-2">
                  {book.resonanceStream.map((res, i) => (
                    <div key={res.id || i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="text-amber-300 font-bold">[{res.formattedDate} | {res.progressPercent}%]</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">{res.category}</span>
                      </div>
                      <p className="text-slate-200 font-sans text-xs">{res.rawText}</p>
                      {res.paragraphSnippet && (
                        <p className="text-[10px] text-slate-500 italic border-l-2 border-slate-800 pl-2">"{res.paragraphSnippet}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No resonance entries captured yet for this volume.</p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Sovereign Sidecar Inspection &bull; Zero Telemetry
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
