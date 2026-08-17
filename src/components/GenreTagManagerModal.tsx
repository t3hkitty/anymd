import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { X, Tag, Filter, Check, Flame, Sparkles } from 'lucide-react';

interface GenreTagManagerModalProps {
  isOpen: boolean;
  books: Book[];
  onClose: () => void;
  onFilterByTag: (tag: string | null) => void;
  onUpdateBookTags: (bookId: string, newTags: string[]) => void;
}

export const FEATURED_GENRES = [
  {
    id: 'cross-genre-svsss',
    name: 'LitRPG + BL Cross-Genre Fusion ⚡',
    description: 'Featured: The Scum Villain\'s Self-Saving System (SVSSS) by MXTX — System B-Points & Quest Mechanics meets Danmei!',
    badgeBg: 'bg-gradient-to-r from-purple-500/20 via-sky-500/20 to-purple-500/20 border-amber-500/50',
    tags: ['litrpg', 'bl', 'danmei', 'scum-villain', 'system-transmigration', 'mxtx', 'cross-genre']
  },
  {
    id: 'litrpg',
    name: 'LitRPG & GameLit ⚔️',
    description: 'Game mechanics, stat blocks, level-ups, crafting, and dungeon cores.',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    tags: ['litrpg', 'crafting', 'dungeon-core', 'fairquest', 'princessdonut']
  },
  {
    id: 'bl-danmei',
    name: 'BL (Boys\' Love) & Danmei 🌸',
    description: 'Male/Male romance, cultivation romance, and character bonds.',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    tags: ['bl', 'danmei', 'scum-villain', 'mxtx', 'qingqiu']
  },
  {
    id: 'xianxia',
    name: 'Xianxia & Cultivation 🧘',
    description: 'Immortal cultivation, qi channels, sects, and spiritual artifacts.',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    tags: ['xianxia', 'cultivation', 'qingqiu']
  }
];

export const GenreTagManagerModal: React.FC<GenreTagManagerModalProps> = ({
  isOpen,
  books,
  onClose,
  onFilterByTag,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (!isOpen) return null;

  // Aggregate all unique tags from books
  const allBookTags = Array.from(
    new Set(
      books.flatMap(b => {
        const matches = b.sidecarMarkdown.match(/tags:\s*\[(.*?)\]/);
        if (matches && matches[1]) {
          return matches[1].split(',').map(t => t.trim().toLowerCase());
        }
        return ['sovereign', 'webdav'];
      })
    )
  );

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag);
    onFilterByTag(tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Genre & Tag Manager</h3>
              <p className="text-xs text-slate-400">Highlighted: LitRPG &bull; BL (Danmei) &bull; SVSSS Cross-Genre Fusion &bull; Xianxia</p>
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* SVSSS Cross-Genre Highlight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-sky-950 border border-amber-500/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 font-mono flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ULTIMATE CROSS-GENRE HYBRID FEATURED:</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono">
                LitRPG + BL Fusion
              </span>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">
              The Scum Villain's Self-Saving System (SVSSS) by MXTX
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Combines <strong>LitRPG System Mechanics</strong> (B-Points, OOC penalties, quest notifications) with <strong>BL (Boys' Love / Danmei)</strong> romance and transmigration comedy!
            </p>
          </div>

          {/* Highlighted Core Genres Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Highlighted Genre Hubs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURED_GENRES.map((g) => (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border transition-all ${g.badgeBg} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-100">{g.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{g.description}</p>
                  
                  <div className="flex items-center space-x-1 flex-wrap gap-y-1 pt-1">
                    {g.tags.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectTag(t)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                          selectedTag === t
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-800'
                        }`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Unique Tags in Library */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <span>All Active Vault Tags ({allBookTags.length})</span>
              </h4>

              {selectedTag && (
                <button
                  onClick={() => handleSelectTag(null)}
                  className="text-xs text-rose-400 hover:underline font-mono"
                >
                  Clear Tag Filter
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5">
              {allBookTags.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTag(t === selectedTag ? null : t)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all flex items-center space-x-1 ${
                    selectedTag === t
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>#{t}</span>
                  {selectedTag === t && <Check className="w-3 h-3 text-slate-950" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {selectedTag ? `Filtered by #${selectedTag}` : 'Showing all genres'}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
