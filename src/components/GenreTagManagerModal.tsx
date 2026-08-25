import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { X, Tag, Filter, Check, Flame, Plus, FolderPlus, Layers } from 'lucide-react';

interface MediaCategoryHub {
  id: string;
  name: string;
  icon: string;
  description: string;
  badgeBg: string;
  tags: string[];
}

export const BUILT_IN_MEDIA_HUB_PRESETS: MediaCategoryHub[] = [
  {
    id: 'litrpg-danmei',
    name: 'LitRPG & Danmei Ebooks 📚',
    icon: '📚',
    description: 'System B-Points, Quest Notifications, Danmei Romance (SVSSS/MXTX) & Xianxia Cultivation.',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    tags: ['litrpg', 'bl', 'danmei', 'scum-villain', 'xianxia', 'mxtx', 'harem-comedy', 'dense-mc']
  },
  {
    id: 'tcg-grails',
    name: 'TCG Cards & High Valuation Grails 🃏',
    icon: '🃏',
    description: 'PSA 10 Gem Mint, 1st Edition Base Set, BGS Black Lotus & Shadowless Holographics.',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    tags: ['psa-10', 'first-edition', 'holographic', 'charizard', 'black-lotus', 'bgs-9.5', 'shadowless', 'tcg-grail']
  },
  {
    id: 'pop-relics',
    name: 'Pop Figures & Physical Relics 🏛️',
    icon: '🏛️',
    description: 'Vaulted Funko Pops, Screen-Used Props, Loki Multiverse Green Notes & Statues.',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    tags: ['funko-pop', 'vaulted', 'screen-used-relic', 'loki-multiverse', 'limited-edition', 'statue-replica']
  },
  {
    id: 'wardrobe-fashion',
    name: 'Wardrobe, Closets & Hangers 👗',
    icon: '👗',
    description: 'Haute Couture, Silk Gowns, Cashmere Trenchcoats, Gothic Accessories & Dress Hangers.',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    tags: ['haute-couture', 'silk-gown', 'cashmere-coat', 'gothic-lolita', 'vintage-accessories', 'closet-hanger']
  },
  {
    id: 'music-vinyl',
    name: 'Music & Audiophile Vinyl 🎶',
    icon: '🎶',
    description: 'First Pressings, Picture Discs, Synthwave OSTs & Signed Album Art.',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    tags: ['first-pressing', 'audiophile', 'picture-disc', 'synthwave', 'soundtrack', 'vinyl-record']
  },
  {
    id: 'retro-games',
    name: 'Retro Video Games & Sealed CIB 🎮',
    icon: '🎮',
    description: 'Sealed CIB SNES/PS1 Cartridges, Wata Graded Relics & Limited Run Collector Editions.',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    tags: ['sealed-cib', 'retrogaming', 'limited-run', 'snes-grail', 'wata-9.8', 'playstation-collector']
  }
];

interface GenreTagManagerModalProps {
  isOpen: boolean;
  books: Book[];
  activeBook?: Book;
  onClose: () => void;
  onFilterByTag: (tag: string | null) => void;
  onUpdateBookTags?: (bookId: string, newTags: string[]) => void;
  onUpdateMarkdownTags?: (newMarkdown: string) => void;
}

export const GenreTagManagerModal: React.FC<GenreTagManagerModalProps> = ({
  isOpen,
  books,
  activeBook,
  onClose,
  onFilterByTag,
  onUpdateMarkdownTags,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryTags, setCustomCategoryTags] = useState('');
  const [customCategoryIcon, setCustomCategoryIcon] = useState('📦');
  const [customCategories, setCustomCategories] = useState<MediaCategoryHub[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  if (!isOpen) return null;

  const allCategories = [...customCategories, ...BUILT_IN_MEDIA_HUB_PRESETS];

  // Aggregate all unique tags across vault books
  const allVaultTags = Array.from(
    new Set(
      books.flatMap(b => {
        const matches = b.sidecarMarkdown.match(/tags:\s*\[(.*?)\]/);
        if (matches && matches[1]) {
          return matches[1].split(',').map(t => t.trim().replace(/["']/g, '').toLowerCase());
        }
        return ['meow', 'webdav'];
      })
    )
  );

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag);
    onFilterByTag(tag);
  };

  const handleAddTagToActiveBook = (tagToInject: string) => {
    if (!activeBook || !onUpdateMarkdownTags) return;

    let md = activeBook.sidecarMarkdown;
    const cleanTag = tagToInject.replace(/^#/, '').trim().toLowerCase();

    if (md.includes('tags:')) {
      const match = md.match(/tags:\s*\[(.*?)\]/);
      if (match) {
        const existingTags = match[1].split(',').map(t => t.trim().replace(/["']/g, ''));
        if (!existingTags.includes(cleanTag)) {
          const newTagArr = [...existingTags, cleanTag];
          const newTagsLine = `tags: [${newTagArr.map(t => `"${t}"`).join(', ')}]`;
          md = md.replace(/tags:\s*\[.*?\]/, newTagsLine);
        }
      }
    } else {
      const tagsLine = `tags: ["${cleanTag}"]\n`;
      md = md.replace(/---\n/, `---\n${tagsLine}`);
    }

    onUpdateMarkdownTags(md);
  };

  const handleCreateCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCategoryName.trim() || !customCategoryTags.trim()) return;

    const parsedTags = customCategoryTags.split(',').map(t => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean);

    const newCat: MediaCategoryHub = {
      id: `custom-cat-${Date.now()}`,
      name: `${customCategoryName} ${customCategoryIcon}`,
      icon: customCategoryIcon || '📦',
      description: `Custom user-defined category hub containing #${parsedTags.join(', #')}`,
      badgeBg: 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-sky-500/20 border-amber-500/50',
      tags: parsedTags
    };

    setCustomCategories(prev => [newCat, ...prev]);
    setCustomCategoryName('');
    setCustomCategoryTags('');
    setIsCreatingCategory(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Universal Media Category & Custom Tag Manager</h3>
              <p className="text-xs text-slate-400">Custom Tag Presets for Ebooks, TCG Cards, Funko Pops, Wardrobe, Music & Retro Games</p>
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
          
          {/* Custom Category Toolbar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200 uppercase tracking-wider">Custom Category & Tag Creator:</span>
            </div>

            <button
              onClick={() => setIsCreatingCategory(!isCreatingCategory)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 font-bold flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Custom Category Hub</span>
            </button>
          </div>

          {/* Form to Create Custom Category */}
          {isCreatingCategory && (
            <form onSubmit={handleCreateCustomCategory} className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/60 space-y-3 font-mono animate-fadeIn">
              <h4 className="font-bold text-xs text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>Create New Custom Category & Tag Chips</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={customCategoryIcon}
                  onChange={(e) => setCustomCategoryIcon(e.target.value)}
                  placeholder="Icon (e.g. 🪙, 🎨, 🏎️)"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-sm"
                />
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Category Name (e.g. Rare Coins & Relics)"
                  className="sm:col-span-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customCategoryTags}
                  onChange={(e) => setCustomCategoryTags(e.target.value)}
                  placeholder="Comma-separated tags (e.g. proof-70, silver-bullion, mintage-1000)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shrink-0"
                >
                  Save Category
                </button>
              </div>
            </form>
          )}

          {/* Highlighted Multi-Media Categories Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Multi-Media Category Hubs & Custom Presets</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allCategories.map((g) => (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border transition-all ${g.badgeBg} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-100 flex items-center space-x-1.5">
                      <span>{g.name}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{g.description}</p>
                  
                  <div className="flex items-center space-x-1 flex-wrap gap-y-1.5 pt-1">
                    {g.tags.map((t, idx) => (
                      <div key={idx} className="flex items-center space-x-1">
                        <button
                          onClick={() => handleSelectTag(t)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                            selectedTag === t
                              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-800'
                          }`}
                        >
                          #{t}
                        </button>
                        {activeBook && onUpdateMarkdownTags && (
                          <button
                            onClick={() => handleAddTagToActiveBook(t)}
                            className="p-0.5 rounded bg-slate-900 hover:bg-purple-600 text-slate-400 hover:text-white text-[9px] transition-colors"
                            title={`Add #${t} to active item sidecar (${activeBook.title})`}
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Unique Active Vault Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <span>Active Vault Item Tags ({allVaultTags.length})</span>
              </h4>

              {selectedTag && (
                <button
                  onClick={() => handleSelectTag(null)}
                  className="text-xs text-rose-400 hover:underline font-mono"
                >
                  Clear Active Tag Filter
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5">
              {allVaultTags.map((t, idx) => (
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
            {selectedTag ? `Filtered by #${selectedTag}` : 'Showing all media categories'}
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
