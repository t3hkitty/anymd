import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { BookcaseIcon } from './BookcaseIcon';
import { BookOpen, Radio, FileText, Search, Sparkles, Trash2, PlusCircle } from 'lucide-react';

interface LibraryGridPluginViewProps {
  books: Book[];
  activeBookId: string;
  relLinkRoot: string;
  onSelectBook: (bookId: string) => void;
  onOpenView: (view: 'reader' | 'stream' | 'sidecar' | 'split') => void;
  onExportObsidian: (book: Book) => void;
  onRemoveExampleData: () => void;
  onAddExampleData: () => void;
}

export const LibraryGridPluginView: React.FC<LibraryGridPluginViewProps> = ({
  books,
  activeBookId,
  relLinkRoot,
  onSelectBook,
  onOpenView,
  onRemoveExampleData,
  onAddExampleData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = books.filter(b => {
    return b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           b.author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const hasSampleBooks = books.some(b => b.id.startsWith('book-'));

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-1">
      
      {/* Grand Library Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-900 via-amber-950 to-slate-950 border border-amber-500/50 shadow-lg shadow-amber-500/20">
            <BookcaseIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
              <span>Sovereign Grand Library Bookshelf</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono">
                YAML Sidecar Processor
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {books.length} Books in Vault &bull; YAML Frontmatter Recognized &bull; Sidecars (.md/dcmd)
            </p>
          </div>
        </div>

        {/* Action Controls & Search Input Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {hasSampleBooks ? (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to remove all pre-loaded sample books? Your imported books will remain untouched.')) {
                  onRemoveExampleData();
                }
              }}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0"
              title="Remove all pre-loaded sample books"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Example Data</span>
            </button>
          ) : (
            <button
              onClick={onAddExampleData}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0"
              title="Restore pre-loaded sample books"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Restore Example Books</span>
            </button>
          )}

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, authors..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Empty Vault State */}
      {filteredBooks.length === 0 && (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
          <p className="text-sm text-slate-400 font-mono">No books currently in your vault.</p>
          <button
            onClick={onAddExampleData}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Restore Example Books</span>
          </button>
        </div>
      )}

      {/* Library Grid Bookshelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book) => {
          const isActive = book.id === activeBookId;
          const totalParas = book.chapters.reduce((acc, c) => acc + c.paragraphs.length, 0);

          // Simulated YAML Frontmatter recognized by LC-MD
          const yamlMetadata = {
            rel_link_root: relLinkRoot,
            sovereign_format: 'dcmd/sidecar',
            resonance_count: book.resonanceStream.length,
            tags: ['sovereign', 'webdav', 'companion', 'md']
          };

          return (
            <div
              key={book.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between group ${
                isActive
                  ? 'bg-slate-900 border-amber-500/80 shadow-xl shadow-amber-500/10'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                {/* Book Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-14 rounded-xl shadow-md flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ backgroundColor: book.coverColor || '#0284c7' }}
                    >
                      📖
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-400">{book.author}</p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {/* Chapter & Stream Stats */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Chapters:</span>
                    <span className="text-amber-300 font-bold">{book.chapters.length} ({totalParas} paras)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Resonance Notes:</span>
                    <span className="text-sky-300 font-bold">{book.resonanceStream.length} captures</span>
                  </div>
                </div>

                {/* LC-MD Recognized YAML Frontmatter Box */}
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-indigo-400 font-bold text-[10px] uppercase">
                    <span>LC-MD YAML Frontmatter</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <p className="text-slate-400 truncate">
                    <span className="text-slate-500">rel_root:</span> <code className="text-amber-300">{yamlMetadata.rel_link_root}</code>
                  </p>
                  <div className="flex items-center space-x-1 flex-wrap gap-y-1 pt-1">
                    {yamlMetadata.tags.map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[9px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectBook(book.id);
                    onOpenView('split');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Book</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      onSelectBook(book.id);
                      onOpenView('stream');
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs"
                    title="View Resonance Stream"
                  >
                    <Radio className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectBook(book.id);
                      onOpenView('sidecar');
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs"
                    title="Edit Markdown Sidecar"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
