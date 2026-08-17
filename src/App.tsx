import { useState, useEffect, useCallback, useRef } from 'react';
import { SAMPLE_BOOKS } from './data/sampleBooks';
import type { Book, ReadingPosition, ResonanceEntry } from './types/resonance';
import type { PluginState, PluginId, MicroTweetEntry } from './types/plugins';
import type { ReaderEngineId } from './types/readerPlugins';
import type { ImportedBookItem } from './types/importer';
import type { CloudAccount } from './types/cloudAccounts';

// Components
import { ReaderView } from './components/ReaderView';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { ResonanceStreamView } from './components/ResonanceStreamView';
import { SidecarEditor } from './components/SidecarEditor';
import { LibraryGridPluginView } from './components/LibraryGridPluginView';
import { PluginManagerModal } from './components/PluginManagerModal';
import { SelectiveMetadataModal } from './components/SelectiveMetadataModal';
import { MicroTweetFeedModal } from './components/MicroTweetFeedModal';
import { WebDAVIndexerModal } from './components/WebDAVIndexerModal';
import { CalibreImportModal } from './components/CalibreImportModal';
import { CoderMarkdownEditorModal } from './components/CoderMarkdownEditorModal';
import { BulkEditModal } from './components/BulkEditModal';
import { OPDSCatalogModal } from './components/OPDSCatalogModal';
import { ShareActionModal } from './components/ShareActionModal';
import { AcquisitionProviderModal } from './components/AcquisitionProviderModal';
import { ReadingListImporterModal } from './components/ReadingListImporterModal';
import { PostImportVerificationModal } from './components/PostImportVerificationModal';
import { WebDAVAccountManagerModal } from './components/WebDAVAccountManagerModal';
import { RsyncSyncModal } from './components/RsyncSyncModal';
import { OnboardingModal } from './components/OnboardingModal';
import { GenreTagManagerModal } from './components/GenreTagManagerModal';
import { BookcaseIcon } from './components/BookcaseIcon';

// Plugins & Utilities
import { parseEpubFile } from './plugins/epubReaderPlugin';
import { convertToObsidianVaultFormat } from './plugins/obsidianNotionSyncPlugin';
import { appendMicroTweetToSidecar } from './plugins/liveMicroTweetPlugin';
import { REGISTERED_READER_ENGINES } from './plugins/customReaderEnginePlugin';
import { loadSavedCloudAccounts, saveCloudAccounts } from './plugins/cloudAccountManager';
import { loadSavedPluginState, savePluginState } from './plugins/themeEnginePlugin';

// Icons
import {
  BookOpen, Radio, FileText, Sparkles, Layers, Puzzle, Upload,
  Cloud, Copy, Code2, Import, ShoppingBag, Lock, RefreshCw, Grid, GraduationCap, Tag
} from 'lucide-react';

const LOCAL_BOOKS_KEY = 'lc_md_books_v3';
const HAS_SEEN_ONBOARDING_KEY = 'lc_md_has_seen_onboarding_v3';

function loadSavedBooks(): Book[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load books from localStorage:', err);
  }
  return SAMPLE_BOOKS;
}

function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(books));
  } catch (err) {
    console.warn('Failed to save books to localStorage:', err);
  }
}

export function App() {
  const [books, setBooks] = useState<Book[]>(loadSavedBooks);
  const [activeBookId, setActiveBookId] = useState<string>(() => books[0]?.id || SAMPLE_BOOKS[0].id);
  const [activeView, setActiveView] = useState<'library' | 'split' | 'reader' | 'stream' | 'sidecar'>('split');
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);

  // Onboarding Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
  });

  // Cloud Accounts State loaded directly from persistent localStorage!
  const [cloudAccounts, setCloudAccounts] = useState<CloudAccount[]>(loadSavedCloudAccounts);

  const handleUpdateCloudAccounts = (updatedAccounts: CloudAccount[]) => {
    setCloudAccounts(updatedAccounts);
    saveCloudAccounts(updatedAccounts);
  };

  const handleUpdateBooks = (newBooks: Book[] | ((prev: Book[]) => Book[])) => {
    setBooks(prev => {
      const next = typeof newBooks === 'function' ? newBooks(prev) : newBooks;
      saveBooks(next);
      return next;
    });
  };

  const handleRemoveExampleData = () => {
    handleUpdateBooks(prev => {
      const filtered = prev.filter(b => !b.id.startsWith('book-'));
      if (filtered.length > 0) {
        setActiveBookId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleAddExampleData = () => {
    handleUpdateBooks(prev => {
      const existingIds = new Set(prev.map(b => b.id));
      const newSamples = SAMPLE_BOOKS.filter(s => !existingIds.has(s.id));
      const combined = [...newSamples, ...prev];
      if (combined.length > 0) {
        setActiveBookId(combined[0].id);
      }
      return combined;
    });
  };

  // Active reading state
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
  const [activeTargetCfi, setActiveTargetCfi] = useState<string | null>(null);
  
  // Pluggable E-Reader Engine Selection
  const [activeReaderEngine, setActiveReaderEngine] = useState<ReaderEngineId>('sovereign-canvas');

  // Customization & Reader Theme
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<number>(16);

  // Plugin System State loaded directly from persistent localStorage!
  const [pluginState, setPluginState] = useState<PluginState>(loadSavedPluginState);

  const updatePluginState = (updater: (prev: PluginState) => PluginState) => {
    setPluginState(prev => {
      const next = updater(prev);
      savePluginState(next);
      return next;
    });
  };

  // Modal Open States
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isPluginManagerOpen, setIsPluginManagerOpen] = useState(false);
  const [isSelectiveMetadataOpen, setIsSelectiveMetadataOpen] = useState(false);
  const [isMicroTweetOpen, setIsMicroTweetOpen] = useState(false);
  const [isWebDAVIndexerOpen, setIsWebDAVIndexerOpen] = useState(false);
  const [isCalibreImportOpen, setIsCalibreImportOpen] = useState(false);
  const [isCoderEditorOpen, setIsCoderEditorOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isOPDSCatalogOpen, setIsOPDSCatalogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAcquisitionModalOpen, setIsAcquisitionModalOpen] = useState(false);
  const [isReadingListImporterOpen, setIsReadingListImporterOpen] = useState(false);
  const [isPostImportVerificationOpen, setIsPostImportVerificationOpen] = useState(false);
  const [isCloudAccountsOpen, setIsCloudAccountsOpen] = useState(false);
  const [isRsyncModalOpen, setIsRsyncModalOpen] = useState(false);
  const [isGenreTagManagerOpen, setIsGenreTagManagerOpen] = useState(false);

  const [importedItemsForVerification, setImportedItemsForVerification] = useState<ImportedBookItem[]>([]);
  const [shareTargetEntry, setShareTargetEntry] = useState<ResonanceEntry | null>(null);
  const [quickCapturePos, setQuickCapturePos] = useState<ReadingPosition | null>(null);

  // Hidden File Input Ref for EPUB Intake
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeBook = books.find(b => b.id === activeBookId) || books[0] || SAMPLE_BOOKS[0];
  const currentChapter = activeBook?.chapters[currentChapterIndex] || activeBook?.chapters[0] || SAMPLE_BOOKS[0].chapters[0];

  // Calculate live progress percentage
  const totalBookParagraphs = activeBook?.chapters?.reduce((acc, ch) => acc + ch.paragraphs.length, 0) || 1;
  let priorParagraphs = 0;
  for (let i = 0; i < currentChapterIndex; i++) {
    if (activeBook?.chapters[i]) {
      priorParagraphs += activeBook.chapters[i].paragraphs.length;
    }
  }
  const currentTotalIndex = priorParagraphs + currentParagraphIndex;
  const liveProgressPercent = Math.min(100, Math.max(1, Number(((currentTotalIndex + 1) / totalBookParagraphs * 100).toFixed(1))));

  const currentCfi = `${currentChapter?.cfiBase || 'epubcfi(/6/4!'}/4/2/${(currentParagraphIndex + 1) * 2}/1:${(currentParagraphIndex * 17) + 12})`;

  const getCurrentReadingPosition = useCallback((): ReadingPosition => {
    return {
      cfi: currentCfi,
      progressPercent: liveProgressPercent,
      chapterIndex: currentChapterIndex,
      chapterTitle: currentChapter?.title || 'Chapter 1',
      paragraphIndex: currentParagraphIndex,
      paragraphSnippet: currentChapter?.paragraphs[currentParagraphIndex] || ''
    };
  }, [currentCfi, liveProgressPercent, currentChapterIndex, currentChapter, currentParagraphIndex]);

  const handleOpenQuickCapture = (overridePos?: ReadingPosition) => {
    if (pluginState.localAccessMode === 'read-only') {
      alert('Local Storage is set to Read-Only mode. Mutations are disabled.');
      return;
    }
    setQuickCapturePos(overridePos || getCurrentReadingPosition());
    setIsQuickCaptureOpen(true);
  };

  // Keyboard shortcut listener (Alt+R or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'r') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        handleOpenQuickCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getCurrentReadingPosition, pluginState.localAccessMode]);

  // Section 3.8.B3 Atomic Sidecar Commit Logic
  const handleCommitResonance = (entry: ResonanceEntry) => {
    const markdownCommitLine = `- **[${entry.formattedDate} | ${entry.progressPercent}%] [Category: ${entry.category}]** *${entry.rawText}*\n`;

    handleUpdateBooks(prevBooks => {
      return prevBooks.map(b => {
        if (b.id !== activeBookId) return b;

        const updatedStream = [entry, ...b.resonanceStream];
        let updatedMarkdown = b.sidecarMarkdown;

        if (!updatedMarkdown.includes('## Reader Resonance Stream')) {
          updatedMarkdown += '\n\n## Reader Resonance Stream\n';
        }
        updatedMarkdown += markdownCommitLine;

        return {
          ...b,
          resonanceStream: updatedStream,
          sidecarMarkdown: updatedMarkdown
        };
      });
    });
  };

  // Micro-Tweet Plugin Post Handler
  const handlePostMicroTweet = (entry: MicroTweetEntry) => {
    handleUpdateBooks(prevBooks => {
      return prevBooks.map(b => {
        if (b.id !== activeBookId) return b;

        const updatedMarkdown = appendMicroTweetToSidecar(b.sidecarMarkdown, entry);
        return {
          ...b,
          sidecarMarkdown: updatedMarkdown
        };
      });
    });
  };

  // Handle EPUB File Upload via EPUB Engine Plugin
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.epub')) {
      const parsedBook = await parseEpubFile(file, pluginState.relLinkRoot);
      handleUpdateBooks(prev => [parsedBook, ...prev]);
      setActiveBookId(parsedBook.id);
      setCurrentChapterIndex(0);
      setCurrentParagraphIndex(0);
    }
  };

  // Section 3.8.B4 One-Tap Re-Encounter Deep-Link
  const handleDeepLinkJump = (entry: ResonanceEntry) => {
    const targetChapterIdx = activeBook?.chapters?.findIndex(c => c.title === entry.chapterTitle) ?? 0;
    const chapterIdx = targetChapterIdx >= 0 ? targetChapterIdx : 0;
    
    setCurrentChapterIndex(chapterIdx);
    setCurrentParagraphIndex(entry.paragraphIndex);
    setActiveTargetCfi(entry.cfi);

    if (activeView === 'sidecar' || activeView === 'library') {
      setActiveView('split');
    }

    setTimeout(() => {
      setActiveTargetCfi(null);
    }, 3000);
  };

  const handleDeleteEntry = (entryId: string) => {
    handleUpdateBooks(prevBooks => {
      return prevBooks.map(b => {
        if (b.id !== activeBookId) return b;
        return {
          ...b,
          resonanceStream: b.resonanceStream.filter(e => e.id !== entryId)
        };
      });
    });
  };

  // Toggle Plugin with localStorage persistence
  const handleTogglePlugin = (id: PluginId) => {
    updatePluginState(prev => ({
      ...prev,
      enabledPlugins: {
        ...prev.enabledPlugins,
        [id]: !prev.enabledPlugins[id]
      }
    }));
  };

  // Export to Obsidian
  const handleExportObsidian = (targetBook?: Book) => {
    const b = targetBook || activeBook;
    if (!b) return;
    const obsidianMd = convertToObsidianVaultFormat(b, pluginState.relLinkRoot);
    navigator.clipboard.writeText(obsidianMd);
    alert(`Obsidian Vault Sidecar for "${b.title}" copied to clipboard!`);
  };

  const handleSelectCraftingOfChess = () => {
    localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
    const chessBook = books.find(b => b.id === 'book-crafting-of-chess') || books[0] || SAMPLE_BOOKS[0];
    setActiveBookId(chessBook.id);
    setCurrentChapterIndex(0);
    setCurrentParagraphIndex(1);
    setActiveView('split');
  };

  const displayedBooks = activeFilterTag
    ? books.filter(b => b.sidecarMarkdown.toLowerCase().includes(activeFilterTag.toLowerCase()))
    : books;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Application Navigation Bar */}
      <header className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between shadow-md flex-wrap gap-y-2">
        <div className="flex items-center space-x-4">
          
          {/* Ornate Grand Bookcase Logo & Title */}
          <div
            onClick={() => setActiveView('library')}
            className="flex items-center space-x-3 cursor-pointer group"
            title="Click to view Sovereign Grand Library Bookshelf"
          >
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-900 via-amber-950 to-slate-950 border border-amber-500/40 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <BookcaseIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
                  Library Companion MD
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center space-x-1">
                  {pluginState.localAccessMode === 'read-only' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                  <span>v3.8 Sovereign</span>
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono font-medium">Beauty & The Beast Grand Bookcase Library</p>
            </div>
          </div>

          {/* Book Selector Dropdown */}
          <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <label className="text-xs text-slate-400 font-mono">Active Book:</label>
            <select
              value={activeBookId}
              onChange={(e) => {
                setActiveBookId(e.target.value);
                setCurrentChapterIndex(0);
                setCurrentParagraphIndex(0);
              }}
              className="bg-slate-950 border border-slate-700 text-xs text-amber-300 font-medium px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-500 max-w-[220px] truncate"
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.author})
                </option>
              ))}
            </select>
          </div>

          {/* Pluggable E-Reader Engine Selector */}
          <div className="hidden xl:flex items-center space-x-1.5 pl-3 border-l border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Reader Plugin:</span>
            <select
              value={activeReaderEngine}
              onChange={(e) => setActiveReaderEngine(e.target.value as ReaderEngineId)}
              className="bg-slate-950 border border-slate-700 text-[11px] text-amber-300 font-mono px-2.5 py-1 rounded-xl focus:outline-none focus:border-amber-500"
            >
              {REGISTERED_READER_ENGINES.map(engine => (
                <option key={engine.id} value={engine.id}>
                  {engine.icon} {engine.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Plugin Action Toolbar */}
        <div className="flex items-center space-x-2 flex-wrap">
          
          {/* Genre & Tag Manager Button */}
          <button
            onClick={() => setIsGenreTagManagerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-sm transition-all"
            title="Genre & Tag Manager (LitRPG & BL / Danmei Scum Villain Highlighted)"
          >
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>Genres & Tags</span>
          </button>

          {/* Onboarding Tour Button */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
            title="Start Onboarding Tour (Featuring 'The Crafting of Chess' by Kit Falbo)"
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Tour</span>
          </button>

          {/* Plugin Manager Button */}
          <button
            onClick={() => setIsPluginManagerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold shadow-sm transition-all"
            title="Open Plugin Manager"
          >
            <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Plugins</span>
          </button>

          {/* Cloud Accounts Manager Button */}
          <button
            onClick={() => setIsCloudAccountsOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-xs font-semibold transition-all"
            title="Cloud Storage Account Manager (Filejump, TorBox API Key, Koofr, Nextcloud, pCloud, Google Drive, Dropbox)"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Cloud Accounts</span>
          </button>

          {/* WebDAV Cloud Indexer Button */}
          {pluginState.enabledPlugins['webdav-indexer'] && (
            <button
              onClick={() => setIsWebDAVIndexerOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-xs font-semibold transition-all"
              title="WebDAV Directory Indexer (Filejump, TorBox, Koofr)"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">WebDAV Indexer</span>
            </button>
          )}

          {/* Rsync Sync Button */}
          <button
            onClick={() => setIsRsyncModalOpen(true)}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-semibold font-mono transition-all"
            title="Rsync Compatibility & Script Generator for Import/Export Settings"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {/* Pluggable Reading List Importer Button */}
          <button
            onClick={() => setIsReadingListImporterOpen(true)}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 text-xs font-semibold transition-all"
            title="Import Reading List (Goodreads CSV, Markdown, OPDS, HTML)"
          >
            <Import className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {/* Acquisition Deep-Links Button */}
          <button
            onClick={() => setIsAcquisitionModalOpen(true)}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold transition-all"
            title="Content Acquisition & Deep-Link Sourcing (Kindle, Libby, Gutenberg)"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Coder Markdown Direct Editor Button */}
          <button
            onClick={() => setIsCoderEditorOpen(true)}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 text-xs font-semibold font-mono transition-all"
            title="Direct Markdown Code Editor for Coders"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {/* Bulk Edits Processor Button */}
          <button
            onClick={() => setIsBulkEditOpen(true)}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-semibold transition-all"
            title="Bulk Pre- & Post-Edits Processor"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* OPDS Catalog Server Button */}
          <button
            onClick={() => setIsOPDSCatalogOpen(true)}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all"
            title="OPDS Catalog Server Feed"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          </button>

          {/* Selective Metadata Scraper Button */}
          {pluginState.enabledPlugins['selective-metadata'] && (
            <button
              onClick={() => setIsSelectiveMetadataOpen(true)}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold transition-all"
              title="Single-Entry Selective Metadata Editor"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {/* Micro-Tweet Button */}
          {pluginState.enabledPlugins['micro-tweets'] && (
            <button
              onClick={() => setIsMicroTweetOpen(true)}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-semibold transition-all"
              title="Post Live Micro-Tweet Reaction"
            >
              <span>🐥</span>
            </button>
          )}

          {/* Calibre Import Button */}
          {pluginState.enabledPlugins['calibre-db'] && (
            <button
              onClick={() => setIsCalibreImportOpen(true)}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-semibold transition-all"
              title="Import Calibre Library JSON"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {/* EPUB Intake Button */}
          {pluginState.enabledPlugins['epub-engine'] && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-semibold transition-all"
                title="Upload EPUB File"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".epub"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}

          {/* Obsidian Export Button */}
          {pluginState.enabledPlugins['obsidian-notion-sync'] && (
            <button
              onClick={() => handleExportObsidian()}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all"
              title="Copy Obsidian Vault Markdown Sidecar"
            >
              <Copy className="w-3.5 h-3.5 text-purple-400" />
            </button>
          )}

          {/* View Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
            {pluginState.enabledPlugins['library-view'] && (
              <button
                onClick={() => setActiveView('library')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                  activeView === 'library' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-300 hover:text-amber-200'
                }`}
                title="Bookshelf Library Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Library</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('split')}
              className={`p-1.5 rounded-lg transition-all ${
                activeView === 'split' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveView('reader')}
              className={`p-1.5 rounded-lg transition-all ${
                activeView === 'reader' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Reader Canvas"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveView('stream')}
              className={`p-1.5 rounded-lg transition-all ${
                activeView === 'stream' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Resonance Stream"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => setActiveView('sidecar')}
              className={`p-1.5 rounded-lg transition-all ${
                activeView === 'sidecar' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sidecar .md"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expressive Reaction Quick Trigger */}
          <button
            onClick={() => handleOpenQuickCapture()}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Reaction</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 p-6 overflow-hidden max-w-[1600px] w-full mx-auto">
        {activeView === 'library' && (
          <div className="h-[calc(100vh-120px)] max-w-6xl mx-auto">
            <LibraryGridPluginView
              books={displayedBooks}
              activeBookId={activeBookId}
              relLinkRoot={pluginState.relLinkRoot}
              onSelectBook={(id) => setActiveBookId(id)}
              onOpenView={(view) => setActiveView(view)}
              onExportObsidian={handleExportObsidian}
              onRemoveExampleData={handleRemoveExampleData}
              onAddExampleData={handleAddExampleData}
            />
          </div>
        )}

        {activeView === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            
            {/* Left 7 Columns: Sovereign Reader Canvas */}
            <div className="lg:col-span-7 h-full">
              <ReaderView
                book={activeBook}
                currentChapterIndex={currentChapterIndex}
                currentParagraphIndex={currentParagraphIndex}
                activeTargetCfi={activeTargetCfi}
                readerTheme={readerTheme}
                fontSize={fontSize}
                onChapterChange={(idx) => {
                  setCurrentChapterIndex(idx);
                  setCurrentParagraphIndex(0);
                }}
                onParagraphSelect={(idx) => setCurrentParagraphIndex(idx)}
                onOpenQuickCapture={handleOpenQuickCapture}
                onThemeChange={setReaderTheme}
                onFontSizeChange={(delta) => setFontSize(prev => Math.min(24, Math.max(12, prev + delta)))}
              />
            </div>

            {/* Right 5 Columns: Resonance Stream Timeline & Sidecar Preview */}
            <div className="lg:col-span-5 flex flex-col gap-6 h-full">
              <div className="flex-1 h-1/2">
                <ResonanceStreamView
                  entries={activeBook?.resonanceStream || []}
                  onDeepLinkJump={handleDeepLinkJump}
                  onDeleteEntry={handleDeleteEntry}
                  onOpenQuickCapture={() => handleOpenQuickCapture()}
                  onOpenShareModal={(entry) => {
                    setShareTargetEntry(entry);
                    setIsShareModalOpen(true);
                  }}
                />
              </div>
              <div className="h-1/2">
                <SidecarEditor
                  markdownContent={activeBook?.sidecarMarkdown || ''}
                  bookTitle={activeBook?.title || 'Sidecar Editor'}
                  onUpdateMarkdown={(newMd) => {
                    handleUpdateBooks(prev => prev.map(b => b.id === activeBookId ? { ...b, sidecarMarkdown: newMd } : b));
                  }}
                />
              </div>
            </div>

          </div>
        )}

        {activeView === 'reader' && (
          <div className="h-[calc(100vh-120px)] max-w-4xl mx-auto">
            <ReaderView
              book={activeBook}
              currentChapterIndex={currentChapterIndex}
              currentParagraphIndex={currentParagraphIndex}
              activeTargetCfi={activeTargetCfi}
              readerTheme={readerTheme}
              fontSize={fontSize}
              onChapterChange={(idx) => {
                setCurrentChapterIndex(idx);
                setCurrentParagraphIndex(0);
              }}
              onParagraphSelect={(idx) => setCurrentParagraphIndex(idx)}
              onOpenQuickCapture={handleOpenQuickCapture}
              onThemeChange={setReaderTheme}
              onFontSizeChange={(delta) => setFontSize(prev => Math.min(24, Math.max(12, prev + delta)))}
            />
          </div>
        )}

        {activeView === 'stream' && (
          <div className="h-[calc(100vh-120px)] max-w-4xl mx-auto">
            <ResonanceStreamView
              entries={activeBook?.resonanceStream || []}
              onDeepLinkJump={handleDeepLinkJump}
              onDeleteEntry={handleDeleteEntry}
              onOpenQuickCapture={() => handleOpenQuickCapture()}
              onOpenShareModal={(entry) => {
                setShareTargetEntry(entry);
                setIsShareModalOpen(true);
              }}
            />
          </div>
        )}

        {activeView === 'sidecar' && (
          <div className="h-[calc(100vh-120px)] max-w-4xl mx-auto">
            <SidecarEditor
              markdownContent={activeBook?.sidecarMarkdown || ''}
              bookTitle={activeBook?.title || 'Sidecar Editor'}
              onUpdateMarkdown={(newMd) => {
                handleUpdateBooks(prev => prev.map(b => b.id === activeBookId ? { ...b, sidecarMarkdown: newMd } : b));
              }}
            />
          </div>
        )}
      </main>

      {/* Genre & Tag Manager Modal */}
      <GenreTagManagerModal
        isOpen={isGenreTagManagerOpen}
        books={books}
        onClose={() => setIsGenreTagManagerOpen(false)}
        onFilterByTag={(tag) => {
          setActiveFilterTag(tag);
          if (tag) setActiveView('library');
        }}
        onUpdateBookTags={(bookId, newTags) => {
          handleUpdateBooks(prev => prev.map(b => {
            if (b.id !== bookId) return b;
            const updatedSidecar = b.sidecarMarkdown.replace(/tags:\s*\[.*?\]/, `tags: [${newTags.join(', ')}]`);
            return { ...b, sidecarMarkdown: updatedSidecar };
          }));
        }}
      />

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectCraftingOfChess={handleSelectCraftingOfChess}
      />

      {/* Floating Quick Capture Overlay Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        position={quickCapturePos || getCurrentReadingPosition()}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCommitResonance={handleCommitResonance}
      />

      {/* Plugin Manager Modal */}
      <PluginManagerModal
        isOpen={isPluginManagerOpen}
        pluginState={pluginState}
        onClose={() => setIsPluginManagerOpen(false)}
        onTogglePlugin={handleTogglePlugin}
        onUpdateRelLinkRoot={(newRoot) => updatePluginState(prev => ({ ...prev, relLinkRoot: newRoot }))}
        onUpdateLocalAccessMode={(mode) => updatePluginState(prev => ({ ...prev, localAccessMode: mode }))}
        onUpdateConfigStorageLocation={(loc) => updatePluginState(prev => ({ ...prev, configStorageLocation: loc }))}
      />

      {/* Single Entry Selective Metadata Modal */}
      <SelectiveMetadataModal
        isOpen={isSelectiveMetadataOpen}
        currentBook={activeBook}
        onClose={() => setIsSelectiveMetadataOpen(false)}
        onApplyMetadata={(updated) => {
          handleUpdateBooks(prev => prev.map(b => b.id === activeBookId ? { ...b, ...updated } : b));
        }}
      />

      {/* Live Micro-Tweet Feed Modal */}
      <MicroTweetFeedModal
        isOpen={isMicroTweetOpen}
        onClose={() => setIsMicroTweetOpen(false)}
        onPostTweet={handlePostMicroTweet}
      />

      {/* WebDAV Indexer Modal */}
      <WebDAVIndexerModal
        isOpen={isWebDAVIndexerOpen}
        relLinkRoot={pluginState.relLinkRoot}
        accounts={cloudAccounts}
        onClose={() => setIsWebDAVIndexerOpen(false)}
        onImportWebDAVBooks={(webdavBooks) => {
          if (webdavBooks && webdavBooks.length > 0) {
            handleUpdateBooks(prev => [...webdavBooks, ...prev]);
            setActiveBookId(webdavBooks[0].id);
            setCurrentChapterIndex(0);
            setCurrentParagraphIndex(0);
            setActiveView('library');
          }
        }}
      />

      {/* Calibre DB Importer Modal */}
      <CalibreImportModal
        isOpen={isCalibreImportOpen}
        relLinkRoot={pluginState.relLinkRoot}
        onClose={() => setIsCalibreImportOpen(false)}
        onImportCalibreBooks={(calibreBooks) => {
          handleUpdateBooks(prev => [...calibreBooks, ...prev]);
        }}
      />

      {/* Direct Markdown Coder Editor Modal */}
      <CoderMarkdownEditorModal
        isOpen={isCoderEditorOpen}
        markdownContent={activeBook?.sidecarMarkdown || ''}
        bookTitle={activeBook?.title || 'Markdown Editor'}
        onClose={() => setIsCoderEditorOpen(false)}
        onSaveMarkdown={(newMd) => {
          handleUpdateBooks(prev => prev.map(b => b.id === activeBookId ? { ...b, sidecarMarkdown: newMd } : b));
        }}
      />

      {/* Bulk Pre- & Post-Edits Processor Modal */}
      <BulkEditModal
        isOpen={isBulkEditOpen}
        books={books}
        relLinkRoot={pluginState.relLinkRoot}
        onClose={() => setIsBulkEditOpen(false)}
        onApplyBulkEdits={(updatedBooks) => handleUpdateBooks(updatedBooks)}
      />

      {/* OPDS Catalog Server Feed Modal */}
      <OPDSCatalogModal
        isOpen={isOPDSCatalogOpen}
        books={books}
        relLinkRoot={pluginState.relLinkRoot}
        onClose={() => setIsOPDSCatalogOpen(false)}
      />

      {/* Pluggable Share Action Modal */}
      <ShareActionModal
        isOpen={isShareModalOpen}
        entry={shareTargetEntry}
        bookTitle={activeBook?.title || 'Resonance Entry'}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Acquisition Provider Deep-Links Modal */}
      <AcquisitionProviderModal
        isOpen={isAcquisitionModalOpen}
        book={activeBook}
        onClose={() => setIsAcquisitionModalOpen(false)}
        onUpdateBookSidecar={(bookId, newSidecar) => {
          handleUpdateBooks(prev => prev.map(b => b.id === bookId ? { ...b, sidecarMarkdown: newSidecar } : b));
        }}
      />

      {/* Reading List Importer Modal */}
      <ReadingListImporterModal
        isOpen={isReadingListImporterOpen}
        onClose={() => setIsReadingListImporterOpen(false)}
        onProceedToVerification={(importedItems) => {
          setImportedItemsForVerification(importedItems);
          setIsPostImportVerificationOpen(true);
        }}
      />

      {/* Post-Import Verification Table Modal */}
      <PostImportVerificationModal
        isOpen={isPostImportVerificationOpen}
        importedItems={importedItemsForVerification}
        relLinkRoot={pluginState.relLinkRoot}
        onClose={() => setIsPostImportVerificationOpen(false)}
        onConfirmVerification={(verifiedBooks) => {
          handleUpdateBooks(prev => [...verifiedBooks, ...prev]);
          setActiveView('library');
        }}
      />

      {/* Cloud Storage Account Manager Modal */}
      <WebDAVAccountManagerModal
        isOpen={isCloudAccountsOpen}
        accounts={cloudAccounts}
        onClose={() => setIsCloudAccountsOpen(false)}
        onUpdateAccounts={handleUpdateCloudAccounts}
        onSetRelLinkRoot={(newRoot) => updatePluginState(prev => ({ ...prev, relLinkRoot: newRoot }))}
      />

      {/* Rsync Compatibility & Script Generator Modal */}
      <RsyncSyncModal
        isOpen={isRsyncModalOpen}
        onClose={() => setIsRsyncModalOpen(false)}
      />

    </div>
  );
}

export default App;
