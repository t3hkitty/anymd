import React, { useState, useEffect } from 'react';
import type { Book } from '../types/resonance';
import { BookcaseIcon } from './BookcaseIcon';
import type { CuratedCollection } from '../types/mediaTypes';
import { extractTradeValueFromBook, isBookAvailableForTrade, toggleBookTradeAvailability } from '../plugins/tradeValuePlugin';
import { extractBreakFeedFromBook } from '../plugins/tcgBreakFeedPlugin';
import { getDefaultSidecarPrice, setDefaultSidecarPrice } from '../plugins/sidecarPricingPlugin';
import { calculateStorageUsage, mountSovereignLocalFolder, type StorageQuotaStatus } from '../plugins/storageQuotaPlugin';
import { Radio, FileText, Search, Sparkles, Trash2, PlusCircle, LayoutGrid, List, ChevronLeft, ChevronRight, Bookmark, Shirt, ArrowUpDown, Crown, Coins, Filter, FolderPlus, Tag, X, Check, Newspaper, Scale, Handshake, Lock, Tv, HardDrive, ExternalLink, Edit3, Eye } from 'lucide-react';

interface LibraryGridPluginViewProps {
  books: Book[];
  activeBookId: string;
  relLinkRoot: string;
  vaultMode?: 'personal' | 'sandbox';
  onSelectBook: (bookId: string) => void;
  onOpenView: (view: 'reader' | 'stream' | 'sidecar' | 'split') => void;
  onExportObsidian: (book: Book) => void;
  onRemoveExampleData: () => void;
  onAddExampleData: () => void;
  onPurgeAllBooks?: () => void;
  onOpenBulkEdits?: () => void;
  onDeleteSelectedBooks?: (bookIds: string[]) => void;
  onOpenPrimaryNews?: (collectionId: string) => void;
  onToggleTradeAvailability?: (book: Book) => void;
  onOpenInspector?: (book: Book) => void;
  onSwitchVaultMode?: (mode: 'personal' | 'sandbox') => void;
  onResetSandboxVault?: () => void;
  activeFilterTag?: string | null;
  onClearFilterTag?: () => void;
}

export type ViewLayoutMode = 'grid' | 'list' | 'carousel' | 'spines' | 'hangers';
export type ValuationSortMode = 'default' | 'most-expensive' | 'least-expensive';

export const LibraryGridPluginView: React.FC<LibraryGridPluginViewProps> = ({
  books,
  activeBookId,
  relLinkRoot,
  vaultMode = 'sandbox',
  activeFilterTag,
  onClearFilterTag,
  onSelectBook,
  onOpenView,
  onRemoveExampleData,
  onAddExampleData,
  onPurgeAllBooks,
  onOpenBulkEdits,
  onDeleteSelectedBooks,
  onOpenPrimaryNews,
  onToggleTradeAvailability,
  onOpenInspector,
  onSwitchVaultMode,
  onResetSandboxVault,
}) => {
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<ViewLayoutMode>('grid');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const handleViewItem = (book: Book) => {
    onSelectBook(book.id);
    onOpenView('split');
    if (book.externalReaderUri) {
      try {
        navigator.clipboard.writeText(book.externalReaderUri);
        setToastNotice(`📖 Opening Sovereign Reader. Local file path copied: ${book.externalReaderUri}`);
        setTimeout(() => setToastNotice(null), 4000);
      } catch {
        // ignore
      }
    }
  };
  const [valuationSort, setValuationSort] = useState<ValuationSortMode>('default');
  const [tradeFilter, setTradeFilter] = useState<'all' | 'trade-only' | 'vault-only'>('all');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [storageStatus, setStorageStatus] = useState<StorageQuotaStatus | null>(null);
  const [mountedFolderName, setMountedFolderName] = useState<string | null>(null);
  const [isDismissStorageBanner, setIsDismissStorageBanner] = useState(false);

  // Check storage usage and quota
  useEffect(() => {
    calculateStorageUsage(books).then(setStorageStatus);
  }, [books]);

  // Media Type Filter & Curated Collections State
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [activeCollectionId, setActiveCollectionId] = useState<string>('all');
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionIcon, setNewCollectionIcon] = useState('🏛️');

  const [curatedCollections, setCuratedCollections] = useState<CuratedCollection[]>([
    {
      id: 'blackbox-journals',
      name: '📓 MyBlackBox Daily Journals',
      icon: '📓',
      description: 'Daily WYD focus intervals, running litany pulses, and captain logs',
      itemIds: ['journal-2026-08-18', 'journal-today']
    },
    {
      id: 'pop-collection',
      name: 'Pop Collection & Collectibles',
      icon: '🏛️',
      description: 'Funko Pops, figures, Loki green notes, and physical relics',
      itemIds: ['book-loki-pop', 'book-statue-1']
    },
    {
      id: 'tcg-grails',
      name: 'High Valuation TCG Grails',
      icon: '🃏',
      description: 'PSA 10 Charizard & BGS 9.5 Black Lotus',
      itemIds: ['book-charizard', 'book-black-lotus']
    },
    {
      id: 'litrpg-danmei',
      name: 'LitRPG & Danmei Classics',
      icon: '📚',
      description: 'The Crafting of Chess & Scum Villain (SVSSS)',
      itemIds: ['book-crafting-chess', 'book-svsss']
    }
  ]);

  // Default Sidecar Price State
  const [defaultSidecarPrice, setDefaultPriceState] = useState<number>(getDefaultSidecarPrice);
  const [isPriceMenuOpen, setIsPriceMenuOpen] = useState(false);

  const handleUpdatePrice = (newPrice: number) => {
    setDefaultSidecarPrice(newPrice);
    setDefaultPriceState(newPrice);
    setIsPriceMenuOpen(false);
  };

  // Estimated Valuation & Trade Value Helper with dynamic default digital file price support
  const getItemValuation = (book: Book): number => {
    const tradeVal = extractTradeValueFromBook(book);
    if (tradeVal > 0) return tradeVal;

    if (book.title.includes('Charizard')) return 2450.00;
    if (book.title.includes('Black Lotus')) return 3800.00;
    if (book.title.includes('Amazing Spider-Man')) return 3850.00;
    if (book.title.includes('The Dress')) return defaultSidecarPrice;
    return defaultSidecarPrice;
  };

  const getItemIcon = (b: Book): string => {
    if (b.title.includes('Journal') || b.title.includes('BlackBox') || b.id.startsWith('journal-')) return '📓';
    if (b.title.includes('The Dress') || b.id.includes('dress')) return '👗';
    if (b.title.includes('Doge') || b.id.includes('doge')) return '🐕';
    if (b.title.includes('Spider-Man') || b.title.includes('Batman') || b.title.includes('X-Men') || b.title.includes('Comic') || b.sidecarMarkdown.includes('comic-book')) return '🦸‍♂️';
    if (b.title.includes('Charizard') || b.title.includes('Black Lotus') || b.title.includes('Umbreon') || b.title.includes('Rayquaza') || b.sidecarMarkdown.includes('tcg-card')) return '🃏';
    if (b.title.includes('Loki') || b.title.includes('Statue') || b.title.includes('Figure') || b.title.includes('Pop')) return '🏛️';
    if (b.title.includes('Shirt') || b.title.includes('Hoodie') || b.title.includes('Jacket')) return '👕';
    return '📖';
  };

  const filteredBooks = books.filter(b => {
    // Negative / Excluded Tag Filter
    if (excludedTags.length > 0) {
      const bText = `${b.title} ${b.author} ${b.sidecarMarkdown}`.toLowerCase();
      const hasExcluded = excludedTags.some(tag => bText.includes(tag.toLowerCase()));
      if (hasExcluded) return false;
    }

    // Negative search syntax (-term)
    if (searchQuery.includes('-')) {
      const terms = searchQuery.split(/\s+/);
      for (const term of terms) {
        if (term.startsWith('-') && term.length > 1) {
          const negTerm = term.slice(1).toLowerCase();
          const bText = `${b.title} ${b.author} ${b.sidecarMarkdown}`.toLowerCase();
          if (bText.includes(negTerm)) return false;
        }
      }
    }

    const cleanQuery = searchQuery.replace(/-\S+/g, '').trim().toLowerCase();
    if (cleanQuery) {
      const matchesSearch = b.title.toLowerCase().includes(cleanQuery) ||
                            b.author.toLowerCase().includes(cleanQuery);
      if (!matchesSearch) return false;
    }

    // Media Type Filter
    if (selectedTypeFilter !== 'all') {
      const titleLower = b.title.toLowerCase();
      const sidecarLower = (b.sidecarMarkdown || '').toLowerCase();
      
      if (selectedTypeFilter === 'journal') {
        const isJournal = titleLower.includes('journal') || titleLower.includes('blackbox') || b.id.startsWith('journal-') || sidecarLower.includes('media_type: "journal"');
        if (!isJournal) return false;
      } else if (selectedTypeFilter === 'plushie') {
        const isPlushie = titleLower.includes('plushie') || titleLower.includes('plush') || titleLower.includes('pop') || titleLower.includes('loki') || titleLower.includes('statue') || titleLower.includes('figure') || titleLower.includes('toy') || sidecarLower.includes('plushie');
        if (!isPlushie) return false;
      } else if (selectedTypeFilter === 'tcg') {
        const isTcg = titleLower.includes('charizard') || titleLower.includes('lotus') || titleLower.includes('tcg') || titleLower.includes('card') || sidecarLower.includes('tcg');
        if (!isTcg) return false;
      } else if (selectedTypeFilter === 'collectibles') {
        const isCollectible = titleLower.includes('loki') || titleLower.includes('pop') || titleLower.includes('statue') || titleLower.includes('relic') || titleLower.includes('plushie');
        if (!isCollectible) return false;
      } else if (selectedTypeFilter === 'wardrobe') {
        const isWardrobe = titleLower.includes('coat') || titleLower.includes('hanger') || titleLower.includes('shirt') || titleLower.includes('dress');
        if (!isWardrobe) return false;
      }
    }

    // Curated Collection Filter
    if (activeCollectionId !== 'all') {
      const collection = curatedCollections.find(c => c.id === activeCollectionId);
      if (collection) {
        const isMatch = collection.itemIds.some(id => b.id.includes(id) || b.title.toLowerCase().includes(id.replace('book-', '')));
        if (!isMatch) return false;
      }
    }

    // Trade Availability Filter
    if (tradeFilter === 'trade-only' && !isBookAvailableForTrade(b)) return false;
    if (tradeFilter === 'vault-only' && isBookAvailableForTrade(b)) return false;

    return true;
  }).sort((a, b) => {
    if (valuationSort === 'most-expensive') {
      return getItemValuation(b) - getItemValuation(a);
    }
    if (valuationSort === 'least-expensive') {
      return getItemValuation(a) - getItemValuation(b);
    }
    return 0;
  });

  const handleNextCarousel = () => {
    if (filteredBooks.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % filteredBooks.length);
  };

  const handlePrevCarousel = () => {
    if (filteredBooks.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + filteredBooks.length) % filteredBooks.length);
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const newColl: CuratedCollection = {
      id: `coll_${Date.now()}`,
      name: newCollectionName,
      icon: newCollectionIcon || '🌟',
      description: 'Custom curated mixed media collection',
      itemIds: [books[0]?.id || 'book-1']
    };
    setCuratedCollections(prev => [...prev, newColl]);
    setActiveCollectionId(newColl.id);
    setNewCollectionName('');
    setIsCreateCollectionOpen(false);
  };

  const carouselActiveBook = filteredBooks[carouselIndex] || filteredBooks[0];

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
      
      {/* Toast Notification for Local Resource Copied & Viewer Launch */}
      {toastNotice && (
        <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-400 text-indigo-200 text-xs font-mono shadow-xl flex items-center justify-between animate-fadeIn sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">{toastNotice}</span>
          </div>
          <button onClick={() => setToastNotice(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Zettelkasten Bundle Filter Banner */}
      {activeFilterTag && (
        <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/50 flex items-center justify-between text-xs font-mono shadow-md animate-fadeIn">
          <span className="text-indigo-200 font-bold flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Import Bundle: <code className="text-amber-300 font-extrabold">{activeFilterTag}</code> ({filteredBooks.length} items)</span>
          </span>
          {onClearFilterTag && (
            <button
              onClick={onClearFilterTag}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center space-x-1 transition-all"
            >
              <X className="w-3 h-3 text-rose-400" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      )}

      {/* 🧪 VAULT MODE SWITCHER & SANDBOX PLAYGROUND BANNER */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSwitchVaultMode && onSwitchVaultMode('sandbox')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                vaultMode === 'sandbox'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Sandbox Demo Vault (Playground for testing bulk edits, deletes & non-sensitive examples)"
            >
              <span>🧪</span>
              <span>Sandbox Demo Vault</span>
            </button>

            <button
              onClick={() => onSwitchVaultMode && onSwitchVaultMode('personal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                vaultMode === 'personal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to My Private Sovereign Vault"
            >
              <span>🔒</span>
              <span>My Sovereign Vault</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden lg:inline">
            {vaultMode === 'sandbox' 
              ? '✨ Non-sensitive playground: test bulk edits, deletions & exports freely.' 
              : '🔒 Personal private collection saved locally on your device.'}
          </span>
        </div>

        {vaultMode === 'sandbox' && onResetSandboxVault && (
          <button
            onClick={onResetSandboxVault}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0"
            title="Reset Sandbox Vault back to default examples (Green Day album, LitRPG books, memes, TCG)"
          >
            <span>🔄</span>
            <span>Reset Demo Vault</span>
          </button>
        )}
      </div>

      {/* Grand Library Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-900 via-amber-950 to-slate-950 border border-amber-500/50 shadow-lg shadow-amber-500/20">
            <BookcaseIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
              <span>{vaultMode === 'sandbox' ? '🧪 Sandbox Demo Vault' : '🔒 Sovereign Grand Library'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono">
                {vaultMode === 'sandbox' ? 'NON-SENSITIVE DEMO' : 'PRIVATE VAULT'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {filteredBooks.length} / {books.length} Items &bull; Curated Mixed Collections Supported
            </p>
          </div>
        </div>

        {/* View Layout Switcher & Action Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto flex-wrap gap-y-2">
          
          {/* Most / Least Expensive Sort Buttons */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center space-x-1 text-xs font-mono">
            <button
              onClick={() => setValuationSort(prev => prev === 'most-expensive' ? 'default' : 'most-expensive')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                valuationSort === 'most-expensive' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sort Vault by Most Expensive Items First"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Most $</span>
            </button>

            <button
              onClick={() => setValuationSort(prev => prev === 'least-expensive' ? 'default' : 'least-expensive')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                valuationSort === 'least-expensive' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sort Vault by Least Expensive Items First"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Least $</span>
            </button>
          </div>

          {/* Layout Mode Switcher Pills */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center space-x-1 text-xs font-mono">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                layoutMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grand Bookcase Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => setLayoutMode('list')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                layoutMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tabular List View Plugin"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>

            <button
              onClick={() => setLayoutMode('carousel')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                layoutMode === 'carousel' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="3D Interactive Cover Showcase Carousel Plugin"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>3D</span>
            </button>

            <button
              onClick={() => setLayoutMode('spines')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                layoutMode === 'spines' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Realistic Physical Bookshelf & Spines View Plugin"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-300" />
              <span>Spines</span>
            </button>

            <button
              onClick={() => setLayoutMode('hangers')}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                layoutMode === 'hangers' ? 'bg-purple-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Wardrobe Closet & Dress Hangers View Plugin (Hang Books on Clothes Hangers!)"
            >
              <Shirt className="w-3.5 h-3.5 text-purple-300" />
              <span>Hangers</span>
            </button>
          </div>

          {/* ⚡ Bulk Edits Processor Button directly on Library Page */}
          <button
            onClick={() => {
              if (onOpenBulkEdits) onOpenBulkEdits();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all shrink-0"
            title="Batch update tags, YAML frontmatter, and sidecar markdown across all books"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bulk Edits & Batch Tags</span>
          </button>

          {/* 🏷️ Default Sidecar Price Config Pill */}
          <div className="relative">
            <button
              onClick={() => setIsPriceMenuOpen(!isPriceMenuOpen)}
              className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0 shadow-sm"
              title="Configure Default New Sidecar / Digital File Price (e.g. 1¢ vs 5¢)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Default: ${(defaultSidecarPrice).toFixed(2)}</span>
            </button>

            {isPriceMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 p-3 rounded-2xl bg-slate-900 border border-amber-500/60 shadow-2xl z-50 space-y-2 font-mono text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-amber-300 font-bold border-b border-slate-800 pb-1.5">
                  <span>Default Sidecar Price</span>
                  <span>${(defaultSidecarPrice).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-tight">
                  Sample items and new digital files adopt this price.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[
                    { label: '1¢ (Default)', val: 0.01 },
                    { label: '5¢ ($0.05)', val: 0.05 },
                    { label: '10¢ ($0.10)', val: 0.10 },
                    { label: '25¢ ($0.25)', val: 0.25 },
                    { label: '$1.00', val: 1.00 },
                    { label: '$5.00', val: 5.00 }
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => handleUpdatePrice(p.val)}
                      className={`px-2 py-1.5 rounded-lg text-center font-bold transition-all ${
                        defaultSidecarPrice === p.val
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🔥 Purge All Items / Vault Reset Button */}
          <button
            onClick={() => {
              if (confirm(`⚠️ PURGE ALL LIBRARY ITEMS: Are you sure you want to completely wipe all ${books.length} items from your vault? This action cannot be undone.`)) {
                if (onPurgeAllBooks) {
                  onPurgeAllBooks();
                } else {
                  onRemoveExampleData();
                }
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-300 font-bold text-xs flex items-center space-x-1 transition-all shrink-0"
            title="Purge all items from your library vault"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Purge All</span>
          </button>

          {/* + Add / Restore Samples Button */}
          <button
            onClick={onAddExampleData}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center space-x-1 transition-all shrink-0"
            title={`Restore pre-loaded sample books with your active default price ($${(defaultSidecarPrice).toFixed(2)})`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Samples (@ ${(defaultSidecarPrice).toFixed(2)})</span>
          </button>

          <div className="relative w-full md:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Media Type Filter & Named Curated Collections Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        {/* Media Type Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Type:</span>
          </span>

          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono shrink-0 ${
              selectedTypeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Types
          </button>

          <button
            onClick={() => setSelectedTypeFilter('books')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono shrink-0 ${
              selectedTypeFilter === 'books'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            📚 Books
          </button>

          <button
            onClick={() => setSelectedTypeFilter('journal')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono shrink-0 ${
              selectedTypeFilter === 'journal'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-emerald-300 hover:bg-slate-800'
            }`}
            title="Filter to myBlackbox Daily Journals, Captain Logs & Litany Pulses"
          >
            📓 Journal Vault (myBlackbox)
          </button>

          <button
            onClick={() => setSelectedTypeFilter('plushie')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono shrink-0 ${
              selectedTypeFilter === 'plushie'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'bg-slate-900 text-rose-300 hover:bg-slate-800'
            }`}
            title="Filter to Plushie Vault, plushies, figures & collectibles"
          >
            🧸 Plushie Vault
          </button>

          <button
            onClick={() => setSelectedTypeFilter('tcg')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono shrink-0 ${
              selectedTypeFilter === 'tcg'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            🃏 TCG Cards
          </button>

          <button
            onClick={() => setSelectedTypeFilter('collectibles')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono shrink-0 ${
              selectedTypeFilter === 'collectibles'
                ? 'bg-purple-500 text-white font-bold shadow-sm'
                : 'bg-slate-900 text-purple-300 hover:bg-slate-800'
            }`}
            title="Filter to Pop Collection, figures, and collectibles"
          >
            🏛️ Pop Collection
          </button>

          <button
            onClick={() => setSelectedTypeFilter('wardrobe')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono shrink-0 ${
              selectedTypeFilter === 'wardrobe'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            👗 Wardrobe
          </button>

          <span className="text-slate-700 px-1 font-mono">|</span>

          {/* Trade Availability Filter Chips */}
          <button
            onClick={() => setTradeFilter('all')}
            className={`px-2 py-1 rounded-xl transition-all font-mono text-[11px] shrink-0 ${
              tradeFilter === 'all'
                ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Trades
          </button>

          <button
            onClick={() => setTradeFilter('trade-only')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono text-[11px] shrink-0 flex items-center space-x-1 ${
              tradeFilter === 'trade-only'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
            }`}
            title="Filter to items marked actively available for trading"
          >
            <Handshake className="w-3 h-3" />
            <span>🤝 Available for Trade</span>
          </button>

          <button
            onClick={() => setTradeFilter('vault-only')}
            className={`px-2.5 py-1 rounded-xl transition-all font-mono text-[11px] shrink-0 flex items-center space-x-1 ${
              tradeFilter === 'vault-only'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
            title="Filter to keeper assets and vault NFTs"
          >
            <Lock className="w-3 h-3" />
            <span>🔒 Keepers</span>
          </button>
        </div>

        {/* Named Curated Collections Selector & Creator Button */}
        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curated Set:</span>
          </span>

          <select
            value={activeCollectionId}
            onChange={(e) => setActiveCollectionId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">🌐 All Vault Items ({books.length})</option>
            {curatedCollections.map(c => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateCollectionOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center space-x-1 transition-all shrink-0"
            title="Curate a new custom mixed collection (e.g. Pop collection, Loki multiverse set)"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">+ Curate</span>
          </button>

          <button
            onClick={() => {
              if (onOpenPrimaryNews) onOpenPrimaryNews(activeCollectionId);
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center space-x-1 transition-all shrink-0"
            title="View recent news & press releases directly from official primary sources"
          >
            <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Primary News</span>
          </button>
        </div>
      </div>

      {/* Exclude / Negative Tags Filter Bar */}
      <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1 shrink-0">
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>Exclude Tags:</span>
          </span>

          {['harem-comedy', 'bl', 'sample', 'litrpg', 'xianxia'].map((tag) => {
            const isExcluded = excludedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => {
                  setExcludedTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  );
                }}
                className={`px-2.5 py-0.5 rounded-xl transition-all text-[11px] shrink-0 border ${
                  isExcluded
                    ? 'bg-rose-500 text-slate-950 font-bold border-rose-400 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {isExcluded ? `🚫 Exclude #${tag}` : `+#${tag}`}
              </button>
            );
          })}
        </div>

        {excludedTags.length > 0 && (
          <button
            onClick={() => setExcludedTags([])}
            className="text-[11px] text-rose-300 hover:underline shrink-0"
          >
            Clear Excluded ({excludedTags.length})
          </button>
        )}
      </div>

      {/* Create New Curated Mixed Collection Modal Form */}
      {isCreateCollectionOpen && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-xs font-mono space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>Curate New Mixed Collection (e.g. "Pop Collection", "Loki Multiverse Set")</span>
            </span>
            <button
              onClick={() => setIsCreateCollectionOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="e.g. Pop Collection or 90s Nostalgia"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
            <input
              type="text"
              value={newCollectionIcon}
              onChange={(e) => setNewCollectionIcon(e.target.value)}
              placeholder="Icon Emoji (e.g. 🏛️, 🃏, 🎬)"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 focus:outline-none"
            />
            <button
              onClick={handleCreateCollection}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Curated Collection</span>
            </button>
          </div>
        </div>
      )}

      {/* Storage Quota & Local Folder Upgrade Banner */}
      {storageStatus && (storageStatus.isNearingLimit || mountedFolderName) && !isDismissStorageBanner && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-900 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-300 block">
                {mountedFolderName ? `Mounted Sovereign Local Folder: ${mountedFolderName}` : 'Browser Cache Notice: Image Storage Growing'}
              </span>
              <p className="text-slate-400 text-[11px]">
                Vault Cache Usage: <strong className="text-amber-200">{storageStatus.usedFormatted}</strong>. {mountedFolderName ? 'Syncing directly with your local directory.' : 'Upgrade to a local folder or export ZIP to keep unlimited full-resolution master scans.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!mountedFolderName && (
              <button
                onClick={async () => {
                  const result = await mountSovereignLocalFolder();
                  if (result.success && result.folderName) {
                    setMountedFolderName(result.folderName);
                    alert(`✓ Sovereign Local Folder "${result.folderName}" successfully mounted! Raw scans and cropped covers will stream locally without cache limits.`);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>📁 Mount Local Folder</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissStorageBanner(true)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300"
              title="Dismiss Notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Valuation Sort Indicator */}
      {valuationSort !== 'default' && (
        <div className="px-4 py-2 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs font-mono text-amber-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5 font-bold">
            <ArrowUpDown className="w-4 h-4 text-amber-400" />
            <span>SORTED BY {valuationSort === 'most-expensive' ? '👑 MOST EXPENSIVE ITEMS FIRST' : '🪙 LEAST EXPENSIVE ITEMS FIRST'}</span>
          </span>
          <button onClick={() => setValuationSort('default')} className="text-slate-400 hover:text-white underline text-[11px]">Reset Sort</button>
        </div>
      )}

      {/* Empty Vault State */}
      {filteredBooks.length === 0 && (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
          <p className="text-sm text-slate-400 font-mono">No books, media, or collectible treasures currently in your vault.</p>
          <button
            onClick={onAddExampleData}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Restore Sample Books, Memes &amp; Treasures</span>
          </button>
        </div>
      )}

      {/* 1. GRID VIEW LAYOUT */}
      {layoutMode === 'grid' && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const isActive = book.id === activeBookId;
            const totalParas = book.chapters.reduce((acc, c) => acc + c.paragraphs.length, 0);
            const valuation = getItemValuation(book);

            const yamlMetadata = {
              rel_link_root: relLinkRoot,
              sovereign_format: 'dcmd/sidecar',
              resonance_count: book.resonanceStream.length,
              tags: ['sovereign', 'webdav', 'companion', 'md']
            };

            return (
              <div
                key={book.id}
                className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between group relative ${
                  selectedBookIds.includes(book.id)
                    ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-500/10'
                    : isActive
                    ? 'bg-slate-900 border-sky-500/80 shadow-xl shadow-sky-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Checkbox for Bulk Edits / Batch Actions */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBookIds(prev =>
                            prev.includes(book.id) ? prev.filter(id => id !== book.id) : [...prev, book.id]
                          );
                        }}
                        className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                        title={selectedBookIds.includes(book.id) ? "Deselect for Bulk Edit" : "Select for Bulk Edit"}
                      >
                        {selectedBookIds.includes(book.id) ? (
                          <Check className="w-4 h-4 text-amber-400 bg-amber-400/20 rounded border border-amber-400/60" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-700 hover:border-amber-400" />
                        )}
                      </button>

                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-10 h-14 rounded-xl object-cover shadow-md shrink-0 border border-slate-700 bg-slate-950"
                        />
                      ) : (
                        <div
                          className="w-10 h-14 rounded-xl shadow-md flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ backgroundColor: book.coverColor || '#0284c7' }}
                        >
                          {getItemIcon(book)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-400">{book.author}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {book.isWebPresenceOnly && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold" title="Web Presence Only (Online Webnovel / Digital-Only Dreamlist)">
                          🌐 Web Only
                        </span>
                      )}

                      {/* Available for Trade Flag Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleTradeAvailability) {
                            const updated = toggleBookTradeAvailability(book);
                            onToggleTradeAvailability(updated);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center space-x-1 transition-all ${
                          isBookAvailableForTrade(book)
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                        title={isBookAvailableForTrade(book) ? "Click to Mark as Vault Keeper (Not for Trade)" : "Click to Mark as Available for Trade"}
                      >
                        <Handshake className="w-3 h-3 text-emerald-400" />
                        <span>{isBookAvailableForTrade(book) ? '🤝 For Trade' : '🔒 Vault'}</span>
                      </button>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center space-x-1" title="Trade / Replacement Value (USD)">
                        <Scale className="w-3 h-3 text-emerald-400" />
                        <span>${valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </span>

                      {extractBreakFeedFromBook(book) && (
                        <a
                          href={extractBreakFeedFromBook(book)?.clipTimestampUrl || extractBreakFeedFromBook(book)?.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 text-[10px] font-mono font-bold flex items-center space-x-1 transition-all"
                          title="Watch Live Break Stream / Video Pull Clip"
                        >
                          <Tv className="w-3 h-3 text-rose-400" />
                          <span>🔴 Break Clip</span>
                        </a>
                      )}
                    </div>
                  </div>

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

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {/* Edit / Review Button */}
                    <button
                      onClick={() => {
                        onSelectBook(book.id);
                        if (onOpenInspector) onOpenInspector(book);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-1"
                      title="Edit / Review Sidecar Metadata, Frontmatter, Tags & Attached Files"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                      <span>Edit / Review</span>
                    </button>

                    {/* View Button with In-App Reader Launcher & Local Path Copy */}
                    <button
                      onClick={() => handleViewItem(book)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition-all flex items-center space-x-1"
                      title={book.externalReaderUri ? `View in Sovereign Reader & copy local path (${book.externalReaderUri})` : 'View in Sovereign Reader'}
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>View</span>
                      {book.externalReaderUri && <ExternalLink className="w-2.5 h-2.5 text-slate-500" />}
                    </button>
                  </div>

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
      )}

      {/* 2. LIST VIEW PLUGIN LAYOUT */}
      {layoutMode === 'list' && filteredBooks.length > 0 && (
        <div className="space-y-2">
          {filteredBooks.map((book) => {
            const isActive = book.id === activeBookId;
            const valuation = getItemValuation(book);

            return (
              <div
                key={book.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isActive
                    ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-12 h-16 rounded-xl object-cover shadow-md shrink-0 border border-slate-700 bg-slate-950"
                    />
                  ) : (
                    <div
                      className="w-12 h-16 rounded-xl shadow-md flex items-center justify-center text-white font-bold text-xl shrink-0"
                      style={{ backgroundColor: book.coverColor || '#0284c7' }}
                    >
                      {getItemIcon(book)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-extrabold text-sm text-slate-100">{book.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                        ${valuation.toLocaleString()} USD
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{book.author}</p>
                    
                    <div className="flex items-center space-x-2 mt-1 font-mono text-[11px] text-slate-500">
                      <span>Sidecar: <code className="text-amber-300">{book.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md</code></span>
                      <span>&bull; Captures: <code className="text-sky-300">{book.resonanceStream.length}</code></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectBook(book.id);
                      if (onOpenInspector) onOpenInspector(book);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-1"
                    title="Edit / Review Sidecar Metadata, Frontmatter & Attached Files"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Edit / Review</span>
                  </button>

                  <button
                    onClick={() => handleViewItem(book)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs shadow-md transition-all flex items-center space-x-1"
                    title={book.externalReaderUri ? `View in Sovereign Reader & copy local path (${book.externalReaderUri})` : 'View in Sovereign Reader'}
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View</span>
                    {book.externalReaderUri && <ExternalLink className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. 3D CAROUSEL VIEW PLUGIN LAYOUT */}
      {layoutMode === 'carousel' && filteredBooks.length > 0 && carouselActiveBook && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col items-center justify-center">
          
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              3D Interactive Cover Showcase ({carouselIndex + 1} of {filteredBooks.length})
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevCarousel}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextCarousel}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 overflow-hidden py-4 w-full">
            {filteredBooks.map((book, idx) => {
              const isSelected = idx === carouselIndex;
              const valuation = getItemValuation(book);

              return (
                <div
                  key={book.id}
                  onClick={() => setCarouselIndex(idx)}
                  className={`cursor-pointer transition-all duration-300 rounded-3xl p-6 border flex flex-col items-center text-center shadow-2xl ${
                    isSelected
                      ? 'scale-105 bg-slate-900 border-amber-500 shadow-amber-500/20 z-20 w-72'
                      : 'scale-90 opacity-60 bg-slate-950 border-slate-800 hover:opacity-100 z-10 w-56'
                  }`}
                >
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-24 h-36 rounded-2xl object-cover shadow-xl mb-3 border border-slate-700 bg-slate-950"
                    />
                  ) : (
                    <div
                      className="w-24 h-36 rounded-2xl shadow-xl flex items-center justify-center text-white font-bold text-3xl mb-3"
                      style={{ backgroundColor: book.coverColor || '#0284c7' }}
                    >
                      {getItemIcon(book)}
                    </div>
                  )}

                  <h3 className="font-extrabold text-sm text-slate-100 line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{book.author}</p>
                  <span className="mt-2 text-xs font-mono font-bold text-emerald-400">${valuation.toLocaleString()} USD</span>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 4. PHYSICAL BOOKSHELF SPINES VIEW PLUGIN LAYOUT */}
      {layoutMode === 'spines' && filteredBooks.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-900/50 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-3">
            <div className="flex items-center space-x-2 text-amber-300 font-mono font-bold text-xs">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>REALISTIC MAHOGANY BOOKSHELF SPINES VIEW</span>
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono">Hover / Tap spine to pull out book</span>
          </div>

          <div className="relative min-h-[300px] p-6 bg-gradient-to-b from-[#1a0f0a] to-[#2c1810] border-2 border-[#4a2818] rounded-3xl shadow-2xl flex items-end justify-center space-x-2 sm:space-x-3 overflow-x-auto">
            {filteredBooks.map((book) => {
              const isActive = book.id === activeBookId;
              const spineColors = ['#881337', '#1e3a8a', '#064e3b', '#78350f', '#581c87', '#164e63'];
              const spineBg = book.coverColor || spineColors[book.title.length % spineColors.length];

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    onSelectBook(book.id);
                    onOpenView('split');
                  }}
                  className={`group relative cursor-pointer transition-all duration-300 rounded-t-lg shadow-2xl flex flex-col justify-between p-2 transform hover:-translate-y-4 ${
                    isActive ? '-translate-y-6 ring-2 ring-amber-400 shadow-amber-500/40' : ''
                  }`}
                  style={{
                    backgroundColor: spineBg,
                    width: '48px',
                    height: `${220 + (book.title.length % 5) * 12}px`,
                    borderLeft: '2px solid rgba(255,255,255,0.2)',
                    borderRight: '2px solid rgba(0,0,0,0.4)',
                  }}
                  title={`${book.title} by ${book.author}`}
                >
                  <div className="w-full h-1 bg-amber-400/70 shadow-sm mb-1" />

                  <div className="flex-1 flex items-center justify-center">
                    <span
                      className="writing-mode-vertical text-amber-100 font-extrabold text-[11px] tracking-wider uppercase truncate max-h-[160px] drop-shadow-md"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      {book.title}
                    </span>
                  </div>

                  <div className="w-full h-1 bg-amber-400/70 shadow-sm mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. WARDROBE CLOSET & DRESS HANGERS VIEW PLUGIN LAYOUT */}
      {layoutMode === 'hangers' && filteredBooks.length > 0 && (
        <div className="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/40 space-y-6">
          
          {/* Wardrobe Closet Rack Bar */}
          <div className="flex items-center justify-between border-b border-purple-500/40 pb-3">
            <div className="flex items-center space-x-2 text-purple-300 font-mono font-bold text-xs">
              <Shirt className="w-5 h-5 text-purple-400" />
              <span>CEDAR WARDROBE CLOSET & DRESS COAT HANGERS VIEW</span>
            </div>
            <span className="text-[11px] text-purple-400 font-mono">Hanging items on wooden coat hangers</span>
          </div>

          {/* Wooden Hanger Closet Rod Container */}
          <div className="relative min-h-[380px] p-8 bg-gradient-to-b from-[#2e1065]/60 via-slate-950 to-slate-950 border-2 border-purple-500/30 rounded-3xl shadow-2xl overflow-x-auto">
            
            {/* Metallic Closet Hanging Rod */}
            <div className="absolute top-8 left-4 right-4 h-3 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-md border-y border-slate-500 z-10" />

            {/* Hanging Clothes Items Grid */}
            <div className="pt-8 flex items-start justify-center space-x-6 sm:space-x-8 min-w-max">
              {filteredBooks.map((book) => {
                const isActive = book.id === activeBookId;
                const valuation = getItemValuation(book);

                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book.id);
                      onOpenView('split');
                    }}
                    className={`group relative cursor-pointer transition-all duration-300 flex flex-col items-center transform hover:scale-105 ${
                      isActive ? 'scale-105' : ''
                    }`}
                  >
                    {/* Metallic / Wooden Coat Hanger Hook */}
                    <div className="w-8 h-10 border-t-4 border-l-4 border-amber-300/80 rounded-t-full shadow-md -mb-1 transform rotate-12 z-20" />

                    {/* Wooden Hanger Shoulder Bar */}
                    <div className="w-36 h-3 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-full shadow-lg border border-amber-600/80 z-20 -mb-2" />

                    {/* Book Hanging Card */}
                    <div
                      className={`w-40 p-4 rounded-2xl border transition-all shadow-2xl flex flex-col justify-between space-y-2 transform origin-top group-hover:rotate-1 ${
                        isActive
                          ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-400 shadow-amber-500/30'
                          : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/50'
                      }`}
                    >
                      {/* Fabric Size Tag */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                          SIZE: LC-MD
                        </span>
                        <span className="text-emerald-400 font-bold">${valuation.toLocaleString()}</span>
                      </div>

                      {/* Mini Cover Thumbnail */}
                      <div
                        className="w-full h-24 rounded-xl shadow-inner flex items-center justify-center text-white font-bold text-2xl my-1"
                        style={{ backgroundColor: book.coverColor || '#0284c7' }}
                      >
                        📖
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{book.author}</p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          <p className="text-center text-xs text-purple-300/80 font-mono">
            👗 Your books and media items are securely hung on wooden dress hangers inside your sovereign cedar closet!
          </p>
        </div>
      )}

      {/* Floating Batch Actions Bar on Library Page */}
      {selectedBookIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-500/80 shadow-2xl shadow-amber-500/20 px-6 py-3.5 rounded-full flex items-center space-x-4 animate-slideUp backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-mono text-xs font-bold text-amber-300">
              {selectedBookIds.length} ITEMS SELECTED
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={() => {
              if (onOpenBulkEdits) onOpenBulkEdits();
            }}
            className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Bulk Edit Selected</span>
          </button>

          {onDeleteSelectedBooks && (
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedBookIds.length} selected items from your library vault?`)) {
                  onDeleteSelectedBooks(selectedBookIds);
                  setSelectedBookIds([]);
                }
              }}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center space-x-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          )}

          <button
            onClick={() => setSelectedBookIds([])}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Cancel Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
