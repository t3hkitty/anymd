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
import { VaultWebhookGeneratorWidget } from './components/VaultWebhookGeneratorWidget';
import { PluginManagerModal } from './components/PluginManagerModal';
import { SelectiveMetadataModal } from './components/SelectiveMetadataModal';
import { MicroTweetFeedModal } from './components/MicroTweetFeedModal';
import { BookmatterGeneratorModal } from './components/BookmatterGeneratorModal';
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
import { MediaTypeManagerModal } from './components/MediaTypeManagerModal';
import { CollectionValueStartleWidget } from './components/CollectionValueStartleWidget';
import { HtmlPublishModal } from './components/HtmlPublishModal';
import { PASourcingModal } from './components/PASourcingModal';
import { NovelUpdatesModal } from './components/NovelUpdatesModal';
import { BookmarkletModal } from './components/BookmarkletModal';
import { PrimaryNewsFeedModal } from './components/PrimaryNewsFeedModal';
import { AnnasArchiveImporterModal } from './components/AnnasArchiveImporterModal';
import { GoogleAuthDeployModal } from './components/GoogleAuthDeployModal';
import { GoogleAuthSslModal } from './components/GoogleAuthSslModal';
import { FamilySocialModal } from './components/FamilySocialModal';
import { GoogleSheetsExportModal } from './components/GoogleSheetsExportModal';
import { CardScannerModal } from './components/CardScannerModal';
import { HomeInsuranceScannerModal } from './components/HomeInsuranceScannerModal';
import { PcRigBuildModal } from './components/PcRigBuildModal';
import { GiftTrackerModal } from './components/GiftTrackerModal';
import { SovereignPrivacyShieldModal } from './components/SovereignPrivacyShieldModal';
import { BlackBoxModal } from './components/BlackBoxModal';
import { MyBlackBoxView } from './components/MyBlackBoxView';
import { CommunityHubView } from './components/CommunityHubView';
import { StackcpDeployModal } from './components/StackcpDeployModal';
import { AntigravitySetupModal } from './components/AntigravitySetupModal';
import { MeowPortalGeneratorModal } from './components/MeowPortalGeneratorModal';
import { ArtistPortfolioModal } from './components/ArtistPortfolioModal';
import { MonetizationSettingsModal } from './components/MonetizationSettingsModal';
import { LocalSshAuthModal } from './components/LocalSshAuthModal';
import { LocalSslAuthModal } from './components/LocalSslAuthModal';
import { ProfileManagementModal } from './components/ProfileManagementModal';
import { SovereignSmtpAuthModal } from './components/SovereignSmtpAuthModal';
import { OpenSsoModal } from './components/OpenSsoModal';
import { TradeCalculatorModal } from './components/TradeCalculatorModal';
import { LegalTermsModal } from './components/LegalTermsModal';
import { TcgBreakFeedModal } from './components/TcgBreakFeedModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { BookSidecarInspectorModal } from './components/BookSidecarInspectorModal';
import { UnifiedExportShareModal } from './components/UnifiedExportShareModal';
import { UnifiedImportStudioModal } from './components/UnifiedImportStudioModal';
import { SuggestedDriveLinksModal } from './components/SuggestedDriveLinksModal';
import { CronSchedulerModal } from './components/CronSchedulerModal';
import { SpotifyMusicModal } from './components/SpotifyMusicModal';
import { ArtistAiStudioModal } from './components/ArtistAiStudioModal';
import { SpatialRoutineDirectorModal } from './components/SpatialRoutineDirectorModal';
import { StoryMakerAuthorBibleModal } from './components/StoryMakerAuthorBibleModal';
import { RunningLitanyWatchdogModal } from './components/RunningLitanyWatchdogModal';
import { PersonaCollectorHubModal } from './components/PersonaCollectorHubModal';
import { VaultBackupRestoreModal } from './components/VaultBackupRestoreModal';
import { VodImporterModal } from './components/VodImporterModal';
import { GeminiSparkPluginModal } from './components/GeminiSparkPluginModal';
import {
  loadSavedSuggestedLinks,
  saveSuggestedLinks,
  performBackgroundIdleDriveScan,
  applyApprovedLinkToBook,
  type SuggestedDriveLinkMatch
} from './plugins/backgroundDriveIdleScannerPlugin';
import { parseInboundShareTarget, convertSharePayloadToBook } from './plugins/pwaPlugin';
import { getActiveProfile, type UserProfile } from './plugins/profileManagementPlugin';
import { SAMPLE_MEDIA_ITEMS } from './data/sampleMediaItems';
import { BookcaseIcon } from './components/BookcaseIcon';
import { HeaderNavDropdowns } from './components/HeaderNavDropdowns';

// Plugins & Utilities
import { parseEpubFile } from './plugins/epubReaderPlugin';
import { convertToObsidianVaultFormat } from './plugins/obsidianNotionSyncPlugin';
import { appendMicroTweetToSidecar } from './plugins/liveMicroTweetPlugin';
import { REGISTERED_READER_ENGINES } from './plugins/customReaderEnginePlugin';
import { loadSavedCloudAccounts, saveCloudAccounts } from './plugins/cloudAccountManager';
import { loadSavedPluginState, savePluginState } from './plugins/themeEnginePlugin';
import { needsMetadataEnrichment, enrichBookMetadata } from './plugins/backgroundMetadataSyncPlugin';
import { getSampleBooksWithPrice, getDefaultSidecarPrice } from './plugins/sidecarPricingPlugin';
import {
  getSavedVaultMode,
  saveVaultMode,
  loadBooksForVault,
  saveBooksForVault,
  resetSandboxVault,
  type VaultMode
} from './plugins/sandboxVaultPlugin';
import { buildBlackBoxDailyJournalBook, loadRunningLitany } from './plugins/runningLitanyWatchdogPlugin';

// Icons
import {
  BookOpen, Radio, FileText, Sparkles, Layers, Grid, Lock, Share2, Import
} from 'lucide-react';

const HAS_SEEN_ONBOARDING_KEY = 'lc_md_has_seen_onboarding_v3';

export function App() {
  const [vaultMode, setVaultMode] = useState<VaultMode>(getSavedVaultMode);
  const [books, setBooks] = useState<Book[]>(() => {
    const loaded = loadBooksForVault(getSavedVaultMode());
    const todayJournal = buildBlackBoxDailyJournalBook(loadRunningLitany());
    const hasJournal = loaded.some(b => b.id === todayJournal.id);
    return hasJournal ? loaded : [todayJournal, ...loaded];
  });
  const [activeBookId, setActiveBookId] = useState<string>(() => books[0]?.id || SAMPLE_BOOKS[0].id);
  const [activeView, setActiveView] = useState<'library' | 'split' | 'reader' | 'stream' | 'sidecar' | 'community' | 'blackbox'>('split');
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);

  // Switch between Sandbox Demo Vault and Personal Private Vault
  const handleSwitchVaultMode = (newMode: VaultMode) => {
    saveBooksForVault(vaultMode, books);
    saveVaultMode(newMode);
    setVaultMode(newMode);
    const loaded = loadBooksForVault(newMode);
    setBooks(loaded);
    if (loaded.length > 0) {
      setActiveBookId(loaded[0].id);
    }
  };

  // Reset Sandbox Vault back to defaults
  const handleResetSandboxVault = () => {
    const reset = resetSandboxVault();
    setBooks(reset);
    if (reset.length > 0) {
      setActiveBookId(reset[0].id);
    }
    alert('✓ Sandbox Demo Vault reset back to default examples (Green Day album, LitRPG books, memes & TCG)!');
  };

  // Onboarding Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
  });

  // Cloud Accounts State loaded directly from persistent localStorage!
  const [cloudAccounts, setCloudAccounts] = useState<CloudAccount[]>(loadSavedCloudAccounts);

  // ⚡ Idle Background Auto-Metadata Synthesizer & Worker
  const [isIdle, setIsIdle] = useState(false);
  const [idleSyncNotice, setIdleSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    let idleTimer: any = null;

    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimer) clearTimeout(idleTimer);
      // Become idle after 5 seconds of inactivity
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetIdleTimer));
    resetIdleTimer();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
    };
  }, []);

  // Background auto-enrichment task when idle
  useEffect(() => {
    if (!isIdle || books.length === 0) return;

    const targetBook = books.find(b => needsMetadataEnrichment(b));
    if (!targetBook) return;

    const workerTimer = setTimeout(() => {
      const enriched = enrichBookMetadata(targetBook);
      setBooks(prev => {
        const updated = prev.map(b => b.id === enriched.id ? enriched : b);
        saveBooksForVault(vaultMode, updated);
        return updated;
      });
      setIdleSyncNotice(`⚡ Idle Auto-Worker: Enriched metadata & tags for "${targetBook.title}"`);
      setTimeout(() => setIdleSyncNotice(null), 4000);
    }, 2000);

    return () => clearTimeout(workerTimer);
  }, [isIdle, books]);

  const handleUpdateCloudAccounts = (updatedAccounts: CloudAccount[]) => {
    setCloudAccounts(updatedAccounts);
    saveCloudAccounts(updatedAccounts);
  };

  const handleUpdateBooks = (newBooks: Book[] | ((prev: Book[]) => Book[])) => {
    setBooks(prev => {
      const next = typeof newBooks === 'function' ? newBooks(prev) : newBooks;
      saveBooksForVault(vaultMode, next);
      return next;
    });
  };

  const handlePurgeAllBooks = () => {
    handleUpdateBooks([]);
    setActiveBookId('');
  };

  const handleRemoveExampleData = () => {
    handleUpdateBooks(prev => {
      const filtered = prev.filter(b => !b.id.startsWith('book-'));
      if (filtered.length > 0) {
        setActiveBookId(filtered[0].id);
      } else {
        setActiveBookId('');
      }
      return filtered;
    });
  };

  const handleAddExampleData = () => {
    const currentPrice = getDefaultSidecarPrice();
    const dynamicSamples = getSampleBooksWithPrice(currentPrice);
    handleUpdateBooks(prev => {
      const existingIds = new Set(prev.map(b => b.id));
      const newSamples = dynamicSamples.filter(s => !existingIds.has(s.id));
      const combined = [...newSamples, ...prev];
      if (combined.length > 0) {
        setActiveBookId(combined[0].id);
      }
      return combined;
    });
  };

  const handleDeleteSelectedBooks = (idsToDelete: string[]) => {
    handleUpdateBooks(prev => {
      const remaining = prev.filter(b => !idsToDelete.includes(b.id));
      if (remaining.length > 0) {
        setActiveBookId(remaining[0].id);
      } else {
        setActiveBookId('');
      }
      return remaining;
    });
  };

  // Active reading state
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
  const [activeTargetCfi, setActiveTargetCfi] = useState<string | null>(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(false);
  
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
  const [isMediaTypeManagerOpen, setIsMediaTypeManagerOpen] = useState(false);
  const [isHtmlPublishOpen, setIsHtmlPublishOpen] = useState(false);
  const [isPASourcingOpen, setIsPASourcingOpen] = useState(false);
  const [isNovelUpdatesOpen, setIsNovelUpdatesOpen] = useState(false);
  const [isBookmarkletModalOpen, setIsBookmarkletModalOpen] = useState(false);
  const [isPrimaryNewsOpen, setIsPrimaryNewsOpen] = useState(false);
  const [newsCollectionId, setNewsCollectionId] = useState('all');
  const [isAnnasArchiveOpen, setIsAnnasArchiveOpen] = useState(false);
  const [isGoogleAuthDeployOpen, setIsGoogleAuthDeployOpen] = useState(false);
  const [isFamilySocialOpen, setIsFamilySocialOpen] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string>('midnight');
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isCardScannerOpen, setIsCardScannerOpen] = useState(false);
  const [isStackcpDeployOpen, setIsStackcpDeployOpen] = useState(false);
  const [isAntigravitySetupOpen, setIsAntigravitySetupOpen] = useState(false);
  const [isMeowPortalOpen, setIsMeowPortalOpen] = useState(false);
  const [isArtistPortfolioOpen, setIsArtistPortfolioOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [isLocalSshAuthOpen, setIsLocalSshAuthOpen] = useState(false);
  const [isLocalSslAuthOpen, setIsLocalSslAuthOpen] = useState(false);
  const [isGoogleAuthSslOpen, setIsGoogleAuthSslOpen] = useState(false);
  const [isHomeInsuranceOpen, setIsHomeInsuranceOpen] = useState(false);
  const [isPcRigBuildOpen, setIsPcRigBuildOpen] = useState(false);
  const [isGiftTrackerOpen, setIsGiftTrackerOpen] = useState(false);
  const [isSovereignPrivacyOpen, setIsSovereignPrivacyOpen] = useState(false);
  const [isBlackBoxOpen, setIsBlackBoxOpen] = useState(false);
  const [activeUserProfile, setActiveUserProfile] = useState<UserProfile>(getActiveProfile);
  const [isProfileManagementOpen, setIsProfileManagementOpen] = useState(false);
  const [isSovereignSmtpOpen, setIsSovereignSmtpOpen] = useState(false);
  const [isOpenSsoOpen, setIsOpenSsoOpen] = useState(false);
  const [isTradeCalculatorOpen, setIsTradeCalculatorOpen] = useState(false);
  const [isLegalTermsOpen, setIsLegalTermsOpen] = useState(false);
  const [isTcgBreakFeedOpen, setIsTcgBreakFeedOpen] = useState(false);
  const [isPwaInstallOpen, setIsPwaInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isBookInspectorOpen, setIsBookInspectorOpen] = useState(false);
  const [inspectingBook, setInspectingBook] = useState<Book | null>(null);
  const [isUnifiedExportOpen, setIsUnifiedExportOpen] = useState(false);
  const [isUnifiedImportOpen, setIsUnifiedImportOpen] = useState(false);
  const [suggestedDriveLinks, setSuggestedDriveLinks] = useState<SuggestedDriveLinkMatch[]>(loadSavedSuggestedLinks);
  const [isSuggestedLinksOpen, setIsSuggestedLinksOpen] = useState(false);
  const [isCronSchedulerOpen, setIsCronSchedulerOpen] = useState(false);
  const [isSpotifyMusicOpen, setIsSpotifyMusicOpen] = useState(false);
  const [isArtistAiStudioOpen, setIsArtistAiStudioOpen] = useState(false);
  const [isSpatialRoutineOpen, setIsSpatialRoutineOpen] = useState(false);
  const [isStoryMakerBibleOpen, setIsStoryMakerBibleOpen] = useState(false);
  const [isRunningLitanyOpen, setIsRunningLitanyOpen] = useState(false);
  const [isPersonaCollectorOpen, setIsPersonaCollectorOpen] = useState(false);
  const [isVaultRestoreOpen, setIsVaultRestoreOpen] = useState(false);
  const [isVodImporterOpen, setIsVodImporterOpen] = useState(false);
  const [isGeminiSparkOpen, setIsGeminiSparkOpen] = useState(false);

  const [importedItemsForVerification, setImportedItemsForVerification] = useState<ImportedBookItem[]>([]);
  const [shareTargetEntry, setShareTargetEntry] = useState<ResonanceEntry | null>(null);
  const [quickCapturePos, setQuickCapturePos] = useState<ReadingPosition | null>(null);

  // Background Idle Scanner for Attached Cloud & Local Drives
  useEffect(() => {
    const handleIdleScan = () => {
      performBackgroundIdleDriveScan(books, cloudAccounts).then(results => {
        setSuggestedDriveLinks(results);
      });
    };

    if ('requestIdleCallback' in window) {
      // @ts-ignore
      const idleId = window.requestIdleCallback(handleIdleScan, { timeout: 8000 });
      return () => {
        // @ts-ignore
        if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      };
    } else {
      const timer = setTimeout(handleIdleScan, 4000);
      return () => clearTimeout(timer);
    }
  }, [books, cloudAccounts]);

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

  // Inbound Bookmarklet URL Parameter Listener (?import_novel=... & ?import_goodreads=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const importNovel = urlParams.get('import_novel');
    const importGoodreads = urlParams.get('import_goodreads');

    if (importNovel) {
      const author = urlParams.get('author') || 'Asian Webnovel Author';
      const tagsStr = urlParams.get('tags') || 'Webnovel, Translated';
      const rating = urlParams.get('rating') || '4.5';
      const sourceUrl = urlParams.get('source') || '';
      const tagsArr = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      const newBook: Book = {
        id: `nu-${Date.now()}`,
        title: importNovel,
        author: author,
        coverColor: '#6366f1',
        totalChapters: 1,
        currentChapterIndex: 0,
        currentParagraphIndex: 0,
        isWebPresenceOnly: true,
        tradeValueUsd: 19.50,
        isAvailableForTrade: true,
        sidecarMarkdown: `---
title: "${importNovel}"
author: "${author}"
rating: "${rating}"
tags: [${tagsArr.map(t => `"${t}"`).join(', ')}]
source_url: "${sourceUrl}"
format: "dcmd/webnovel"
---

# ${importNovel}

- **Author:** ${author}
- **Rating:** ★ ${rating} / 5.0
- **Tags:** ${tagsArr.map(t => `#${t}`).join(' ')}
- **Source:** [NovelUpdates Series Page](${sourceUrl})

### 📖 Webnovel Summary & Resonance
Imported directly from NovelUpdates.com 1-Click Bookmarklet!
`,
        resonanceStream: [],
        chapters: [
          {
            title: 'Chapter 1: Series Overview',
            cfiBase: 'epubcfi(/6/2[ch1]!)',
            paragraphs: [
              `Imported novel: ${importNovel} by ${author}.`,
              `Tags: ${tagsArr.join(', ')}`,
              `Rating: ★ ${rating}`
            ]
          }
        ]
      };

      handleUpdateBooks(prev => [newBook, ...prev]);
      setActiveBookId(newBook.id);
      setActiveView('library');

      // Clean up URL query parameters without reloading
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (importGoodreads) {
      try {
        const titles: string[] = JSON.parse(importGoodreads);
        const author = urlParams.get('author') || 'Goodreads Author';
        const rating = urlParams.get('rating') || '4.2';
        const sourceUrl = urlParams.get('source') || '';

        const newBooks: Book[] = titles.map((t, idx) => ({
          id: `gr-${Date.now()}-${idx}`,
          title: t,
          author: author,
          coverColor: '#eab308',
          totalChapters: 1,
          currentChapterIndex: 0,
          currentParagraphIndex: 0,
          isWebPresenceOnly: true,
          tradeValueUsd: 15.00,
          isAvailableForTrade: true,
          sidecarMarkdown: `---
title: "${t}"
author: "${author}"
rating: "${rating}"
source_url: "${sourceUrl}"
format: "dcmd/goodreads"
---

# ${t}

- **Author:** ${author}
- **Rating:** ★ ${rating}
- **Source:** [Goodreads Page](${sourceUrl})
`,
          resonanceStream: [],
          chapters: [
            {
              title: 'Chapter 1: Goodreads Details',
              cfiBase: 'epubcfi(/6/2[ch1]!)',
              paragraphs: [`Imported Goodreads title: ${t} by ${author}.`]
            }
          ]
        }));

        if (newBooks.length > 0) {
          handleUpdateBooks(prev => [...newBooks, ...prev]);
          setActiveBookId(newBooks[0].id);
          setActiveView('library');
        }

        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (err) {
        console.error('Failed to parse Goodreads bookmarklet param:', err);
      }
    } else if (urlParams.get('import_vod')) {
      const vodTitle = urlParams.get('import_vod') || 'Stream VOD';
      const creator = urlParams.get('creator') || 'Video Creator';
      const duration = urlParams.get('duration') || 'N/A';
      const thumb = urlParams.get('thumb') || '';
      const sourceUrl = urlParams.get('source') || '';

      const newVodBook: Book = {
        id: `vod-${Date.now()}`,
        title: vodTitle,
        author: creator,
        coverColor: '#ef4444',
        coverImageUrl: thumb || undefined,
        externalReaderUri: sourceUrl,
        totalChapters: 1,
        currentChapterIndex: 0,
        currentParagraphIndex: 0,
        sidecarMarkdown: `---
title: "${vodTitle}"
creator: "${creator}"
media_type: "vod"
stream_url: "${sourceUrl}"
duration: "${duration}"
date_cataloged: "${new Date().toISOString()}"
---

# 🎬 ${vodTitle}

- **Creator:** ${creator}
- **Duration:** ${duration}
- **Stream URL:** [Watch Stream](${sourceUrl})
`,
        resonanceStream: [
          {
            id: `res-vod-${Date.now()}`,
            timestamp: new Date().toISOString(),
            formattedDate: new Date().toISOString().split('T')[0],
            progressPercent: 0,
            category: 'VOD & Stream Archive',
            rawText: `Stream Archive: ${vodTitle}`,
            cfi: 'cfi:vod:0',
            chapterTitle: 'Overview',
            paragraphIndex: 0,
            paragraphSnippet: `Captured via Bookmarklet from ${sourceUrl}`,
            intensityScore: 5,
            reactionImageUrl: thumb || undefined,
            reactionGifCaption: vodTitle,
            emojiReactions: ['🎬', '🔥']
          }
        ],
        chapters: [
          {
            title: 'Stream Overview',
            cfiBase: 'cfi:vod:0',
            paragraphs: [`Stream URL: ${sourceUrl}`, `Duration: ${duration}`]
          }
        ]
      };

      handleUpdateBooks(prev => [newVodBook, ...prev]);
      setActiveBookId(newVodBook.id);
      setActiveView('library');

      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // PWA Install Prompt Listener & Inbound Web Share Target Parser
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Inbound Web Share Target payload processing (?share_title=... & ?share_text=... & ?share_url=...)
    const sharePayload = parseInboundShareTarget();
    if (sharePayload) {
      const newBook = convertSharePayloadToBook(sharePayload);
      handleUpdateBooks(prev => [newBook, ...prev]);
      setActiveBookId(newBook.id);
      setActiveView('library');

      // Clean up URL query parameters without reloading
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

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
      
      {/* Master Top Navigation Bar: Sovereign Library <-> User Account Profile <-> MyBlackBox */}
      <div className="w-full bg-slate-950 border-b border-slate-800/90 px-6 py-2.5 flex items-center justify-between shadow-xl sticky top-0 z-50 flex-wrap gap-2 backdrop-blur-md">
        
        {/* Left: 📚 Sovereign Library Tab */}
        <button
          onClick={() => setActiveView('library')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-extrabold text-xs transition-all shadow-sm ${
            activeView !== 'blackbox'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 ring-2 ring-amber-400/40'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30'
          }`}
          title="Switch to Sovereign Grand Library & Bookshelf"
        >
          <BookcaseIcon className="w-4 h-4" />
          <span>📚 Sovereign Library</span>
        </button>

        {/* Center: 👤 Account & Profile Manager Button */}
        <button
          onClick={() => setIsProfileManagementOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-400/50 text-amber-200 text-xs font-extrabold shadow-sm transition-all group"
          title="Account Management, Cloud Auth & Switch Profile (Invite Code: meow)"
        >
          <span className="text-sm group-hover:scale-110 transition-transform">{activeUserProfile.avatarEmoji || '👤'}</span>
          <span className="tracking-tight">@{activeUserProfile.username}</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">Account</span>
        </button>

        {/* Right: ⬛ MyBlackBox & WYD Timers Tab */}
        <button
          onClick={() => setActiveView('blackbox')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-extrabold text-xs transition-all shadow-sm ${
            activeView === 'blackbox'
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-400/50 font-black'
              : 'bg-zinc-950 hover:bg-zinc-900 border border-emerald-500/50 text-emerald-400 shadow-emerald-500/10 hover:border-emerald-400 hover:text-emerald-300'
          }`}
          title="Open Sovereign Black Box Dashboard, Litany Pulse & WYD Timers"
        >
          <span className="font-mono text-sm">⬛</span>
          <span>MyBlackBox &amp; WYD</span>
          {loadRunningLitany().length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black shadow-sm">
              {loadRunningLitany().length}
            </span>
          )}
        </button>
      </div>

      {/* Top Application Toolbar (Visible across all views with collapse toggle) */}
      {isHeaderCollapsed ? (
        <div className="px-4 py-1 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-amber-300">🐾 Sovereign Library</span>
            <button onClick={() => setActiveView('library')} className={`px-2 py-0.5 rounded ${activeView === 'library' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}>📚 Library</button>
            <button onClick={() => setActiveView('blackbox')} className={`px-2 py-0.5 rounded ${activeView === 'blackbox' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>⬛ myBlackbox</button>
            <button onClick={() => setActiveView('reader')} className={`px-2 py-0.5 rounded ${activeView === 'reader' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}>📖 Reader</button>
          </div>
          <button
            onClick={() => setIsHeaderCollapsed(false)}
            className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] transition-colors flex items-center space-x-1"
            title="Expand Full Header Toolbar"
          >
            <span>▼ Expand Header Toolbar</span>
          </button>
        </div>
      ) : (
        <header className="px-6 py-2 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-[49px] z-40 flex items-center justify-between shadow-md flex-wrap gap-y-2">
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

          {/* Book / Treasure / Item Selector Dropdown */}
          <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <label className="text-xs text-slate-400 font-mono" title="Current Active Treasure, Collectible, Book, Album, or Good">Current Treasure / Item / Good:</label>
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

        {/* Clean Categorized Dropdown Action Toolbar */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          
          {/* Prominent Collection Valuation Startle Widget */}
          <CollectionValueStartleWidget />

          {/* Organized Dropdown Hubs: Ingest | Vault Tools | Cloud & Auth | Creative Studio */}
          <HeaderNavDropdowns
            onOpenUnifiedImport={() => setIsUnifiedImportOpen(true)}
            onOpenCardScanner={() => setIsCardScannerOpen(true)}
            onOpenHomeInsuranceScanner={() => setIsHomeInsuranceOpen(true)}
            onOpenVodImporter={() => setIsVodImporterOpen(true)}
            onOpenNovelUpdates={() => setIsNovelUpdatesOpen(true)}
            onOpenAnnasArchive={() => setIsAnnasArchiveOpen(true)}
            onOpenPASourcing={() => setIsPASourcingOpen(true)}
            onOpenBookmarklets={() => setIsBookmarkletModalOpen(true)}
            onOpenCalibreImport={() => setIsCalibreImportOpen(true)}
            onUploadEpubClick={() => fileInputRef.current?.click()}
            onOpenSuggestedLinks={() => setIsSuggestedLinksOpen(true)}

            onOpenVaultRestore={() => setIsVaultRestoreOpen(true)}
            onOpenExportShare={() => setIsUnifiedExportOpen(true)}
            onOpenGenreTagManager={() => setIsGenreTagManagerOpen(true)}
            onOpenMediaTypeManager={() => setIsMediaTypeManagerOpen(true)}
            onOpenBulkEdit={() => setIsBulkEditOpen(true)}
            onOpenOPDSCatalog={() => setIsOPDSCatalogOpen(true)}
            onOpenPwaInstall={() => setIsPwaInstallOpen(true)}
            onOpenBookshelf={() => setActiveView('library')}

            onOpenCloudAccounts={() => setIsCloudAccountsOpen(true)}
            onOpenWebDAVIndexer={() => setIsWebDAVIndexerOpen(true)}
            onOpenLocalSshAuth={() => setIsLocalSshAuthOpen(true)}
            onOpenSovereignSmtp={() => setIsSovereignSmtpOpen(true)}
            onOpenOpenSso={() => setIsOpenSsoOpen(true)}
            onOpenStackcpDeploy={() => setIsStackcpDeployOpen(true)}
            onOpenGoogleAuthDeploy={() => setIsGoogleAuthDeployOpen(true)}
            onOpenRsyncSync={() => setIsRsyncModalOpen(true)}
            onOpenGeminiSpark={() => setIsGeminiSparkOpen(true)}

            onOpenRunningLitany={() => setIsRunningLitanyOpen(true)}
            onOpenArtistAiStudio={() => setIsArtistAiStudioOpen(true)}
            onOpenStoryMakerBible={() => setIsStoryMakerBibleOpen(true)}
            onOpenSpatialRoutine={() => setIsSpatialRoutineOpen(true)}
            onOpenPersonaCollector={() => setIsPersonaCollectorOpen(true)}
            onOpenHtmlPublish={() => setIsHtmlPublishOpen(true)}
            onOpenCommunityHub={() => setActiveView('community')}

            pendingDriveMatchesCount={suggestedDriveLinks.filter(s => s.status === 'pending').length}
            totalBooksCount={books.length}
            cloudAccountsCount={loadSavedCloudAccounts().length}
            cloudAuthErrorsCount={cloudAccounts.filter(a => (a as any).status === 'error' || (a as any).status === 'disconnected').length}
            litanyPulsesCount={loadRunningLitany().length}
          />

          {/* Dedicated Prominent Import & Intake Studio Button */}
          <button
            onClick={() => setIsUnifiedImportOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            title="Universal Import & Intake Studio: Photo Asset Scanner, TCG Cards, Anna's Archive LoC, Reading Lists, Webnovels & Folder Sync"
          >
            <Import className="w-3.5 h-3.5" />
            <span>Import Studio</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-emerald-200 font-mono text-[10px]">PHOTO</span>
          </button>

          {/* Dedicated Prominent Export & Share Studio Button */}
          <button
            onClick={() => setIsUnifiedExportOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            title="Universal Export & Share Studio (Obsidian Vault, Google Sheets CSV, PA Grocery List, HTML Showcase, QR Share)"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-200" />
            <span>Export &amp; Share</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-amber-200 font-mono text-[10px]">ZIP</span>
          </button>

          {/* Dedicated Layout & Microlog Panel Customizer Button */}
          <button
            onClick={() => window.location.href = './lcmd/'}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            title="Open myBlackbox Microlog Dashboard with 23 Customizable Panels & Layout Customizer"
          >
            <Layers className="w-3.5 h-3.5 text-sky-200" />
            <span>🧹 Layout &amp; Panels</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-sky-200 font-mono text-[10px]">LCMD</span>
          </button>

          {/* Hidden EPUB File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* View Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
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
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Reaction</span>
          </button>

          {/* Collapse Header Toggle Button */}
          <button
            onClick={() => setIsHeaderCollapsed(true)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold text-[11px] border border-slate-700 transition-colors flex items-center space-x-1"
            title="Collapse Top Header for Full Screen View"
          >
            <span>▲ Collapse</span>
          </button>
        </div>
      </header>
      )}

      {/* Main Content Workspace Layout */}
      <main className="flex-1 p-6 overflow-hidden max-w-[1600px] w-full mx-auto">
        {activeView === 'library' && (
          <div className="h-[calc(100vh-120px)] max-w-6xl mx-auto">
            <LibraryGridPluginView
              books={displayedBooks}
              activeBookId={activeBookId}
              relLinkRoot={pluginState.relLinkRoot}
              vaultMode={vaultMode}
              activeFilterTag={activeFilterTag}
              onClearFilterTag={() => setActiveFilterTag(null)}
              onSelectBook={(id) => setActiveBookId(id)}
              onOpenView={(view) => setActiveView(view)}
              onExportObsidian={handleExportObsidian}
              onRemoveExampleData={handleRemoveExampleData}
              onAddExampleData={handleAddExampleData}
              onPurgeAllBooks={handlePurgeAllBooks}
              onOpenBulkEdits={() => setIsBulkEditOpen(true)}
              onDeleteSelectedBooks={handleDeleteSelectedBooks}
              onSwitchVaultMode={handleSwitchVaultMode}
              onResetSandboxVault={handleResetSandboxVault}
              onOpenPrimaryNews={(colId) => {
                setNewsCollectionId(colId);
                setIsPrimaryNewsOpen(true);
              }}
              onToggleTradeAvailability={(updated) => {
                handleUpdateBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
              }}
              onOpenInspector={(b) => {
                setInspectingBook(b);
                setIsBookInspectorOpen(true);
              }}
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
                onOpenAcquisitionModal={() => setIsAcquisitionModalOpen(true)}
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
              onOpenAcquisitionModal={() => setIsAcquisitionModalOpen(true)}
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

        {activeView === 'community' && (
          <div className="h-[calc(100vh-120px)] max-w-6xl mx-auto">
            <CommunityHubView
              books={books}
              activeBook={activeBook}
              onImportSidecarTemplate={(templateMd, templateTitle) => {
                const newBook: Book = {
                  id: `book-tpl-${Date.now()}`,
                  title: `${templateTitle} (Community Template)`,
                  author: 'Community Marketplace',
                  coverColor: '#6366f1',
                  totalChapters: 1,
                  currentChapterIndex: 0,
                  currentParagraphIndex: 0,
                  sidecarMarkdown: templateMd,
                  resonanceStream: [],
                  chapters: [
                    {
                      title: 'Community Sidecar Overview',
                      cfiBase: 'epubcfi(/6/2[ch1]!)',
                      paragraphs: ['Imported template from LC-MD Sovereign Community Hub.']
                    }
                  ]
                };
                handleUpdateBooks(prev => [newBook, ...prev]);
                setActiveBookId(newBook.id);
                setActiveView('sidecar');
              }}
            />
          </div>
        )}

        {/* Sovereign MyBlackBox Full Dashboard View */}
        {activeView === 'blackbox' && (
          <div className="w-full min-h-[calc(100vh-140px)]">
            <MyBlackBoxView
              onBackToLibrary={() => setActiveView('library')}
              onOpenJournalInReader={(journalBookId) => {
                const journalBook = buildBlackBoxDailyJournalBook(loadRunningLitany());
                const targetId = journalBookId || journalBook.id;
                handleUpdateBooks(prev => {
                  const exists = prev.some(b => b.id === targetId);
                  return exists ? prev.map(b => b.id === targetId ? journalBook : b) : [journalBook, ...prev];
                });
                setActiveBookId(targetId);
                setActiveView('split');
              }}
              onSyncPulsesToBookshelf={(pulses) => {
                const journalBook = buildBlackBoxDailyJournalBook(pulses);
                handleUpdateBooks(prev => {
                  const exists = prev.some(b => b.id === journalBook.id);
                  return exists ? prev.map(b => b.id === journalBook.id ? journalBook : b) : [journalBook, ...prev];
                });
              }}
            />
          </div>
        )}
      </main>

      {/* Sovereign Open Source Copyright, Terms of Service & Host Your Own Footer */}
      <footer className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/90 text-center font-mono text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-amber-400">🐾</span>
          <span>© 2026 Sovereign Black Box & Library Companion MD • Open Source (MIT License)</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <button
            onClick={() => setIsLegalTermsOpen(true)}
            className="text-slate-400 hover:text-indigo-300 underline underline-offset-2 transition-colors font-bold"
          >
            📜 Terms & Privacy (US/EU/UK/CA/AU)
          </button>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">100% Self-Hostable</span>
          <span className="text-slate-600">•</span>
          <a
            href="https://github.com/t3hkitty/library-companion-md"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-amber-300 font-bold transition-all flex items-center space-x-1.5"
          >
            <span>🚀 Host Your Own on GitHub</span>
            <span>&rarr;</span>
          </a>
        </div>
      </footer>

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

      {/* Onboarding Tour & Interactive Personalization Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectCraftingOfChess={handleSelectCraftingOfChess}
        onApplyPersonalizedPlugins={(enabled, mode) => {
          updatePluginState(prev => ({ ...prev, enabledPlugins: enabled, localAccessMode: mode }));
        }}
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

      {/* Live Micro-Tweet Reaction & Review Synthesizer Modal */}
      <MicroTweetFeedModal
        isOpen={isMicroTweetOpen}
        onClose={() => setIsMicroTweetOpen(false)}
        onPostTweet={handlePostMicroTweet}
        onSaveReviewToSidecar={(reviewMd) => {
          if (activeBook) {
            const updatedMd = activeBook.sidecarMarkdown + '\n\n' + reviewMd;
            handleUpdateBooks(prev => prev.map(b => b.id === activeBookId ? { ...b, sidecarMarkdown: updatedMd } : b));
          }
        }}
      />

      {/* Sovereign Bookmatter & Directory Studio Modal */}
      <BookmatterGeneratorModal
        isOpen={isWebDAVIndexerOpen}
        books={books}
        activeBook={activeBook}
        accounts={cloudAccounts}
        onClose={() => setIsWebDAVIndexerOpen(false)}
        onUpdateBookSidecar={(bookId, updatedSidecar) => {
          handleUpdateBooks(prev => prev.map(b => b.id === bookId ? { ...b, sidecarMarkdown: updatedSidecar } : b));
        }}
        onImportNewBooks={(newBooks) => {
          if (newBooks && newBooks.length > 0) {
            handleUpdateBooks(prev => [...newBooks, ...prev]);
            setActiveBookId(newBooks[0].id);
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

      {/* Universal Physical Media & Location Manager Modal */}
      <MediaTypeManagerModal
        isOpen={isMediaTypeManagerOpen}
        onClose={() => setIsMediaTypeManagerOpen(false)}
      />

      {/* HTML Showcase & Self-Hosted WebDAV Publisher Modal */}
      <HtmlPublishModal
        isOpen={isHtmlPublishOpen}
        books={books}
        mediaItems={SAMPLE_MEDIA_ITEMS}
        webdavConfig={pluginState.webdavConfig}
        onClose={() => setIsHtmlPublishOpen(false)}
      />

      {/* Executive PA Sourcing Grocery List Modal */}
      <PASourcingModal
        isOpen={isPASourcingOpen}
        books={books}
        mediaItems={SAMPLE_MEDIA_ITEMS}
        webdavConfig={pluginState.webdavConfig}
        onClose={() => setIsPASourcingOpen(false)}
      />

      {/* NovelUpdates Webnovel Scraper & Sourcing Modal */}
      <NovelUpdatesModal
        isOpen={isNovelUpdatesOpen}
        book={activeBook}
        onClose={() => setIsNovelUpdatesOpen(false)}
        onUpdateBookSidecar={(bookId, newMd) => {
          handleUpdateBooks(prev => prev.map(b => b.id === bookId ? { ...b, sidecarMarkdown: newMd } : b));
        }}
      />

      {/* 1-Click Browser Bookmarklet Generator Modal */}
      <BookmarkletModal
        isOpen={isBookmarkletModalOpen}
        onClose={() => setIsBookmarkletModalOpen(false)}
        onManualImport={(newBook) => {
          handleUpdateBooks(prev => [newBook, ...prev]);
          setActiveBookId(newBook.id);
          setActiveView('library');
        }}
      />

      {/* Collection Primary Source News Feed Modal */}
      <PrimaryNewsFeedModal
        isOpen={isPrimaryNewsOpen}
        activeCollectionId={newsCollectionId}
        collections={[
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
        ]}
        onClose={() => setIsPrimaryNewsOpen(false)}
      />

      {/* Anna's Archive & Library of Congress ISBN Resolver Modal */}
      <AnnasArchiveImporterModal
        isOpen={isAnnasArchiveOpen}
        activeBook={activeBook}
        onClose={() => setIsAnnasArchiveOpen(false)}
        onInjectIsbnMetadata={(updatedMd) => {
          handleUpdateBooks(prev => prev.map(b => b.id === activeBook.id ? { ...b, sidecarMarkdown: updatedMd } : b));
        }}
      />

      {/* Universal Media Category & Custom Tag Manager Modal */}
      <GenreTagManagerModal
        isOpen={isGenreTagManagerOpen}
        books={books}
        activeBook={activeBook}
        onClose={() => setIsGenreTagManagerOpen(false)}
        onFilterByTag={(tag) => {
          setActiveFilterTag(tag);
          if (tag) setActiveView('library');
        }}
        onUpdateMarkdownTags={(newMd) => {
          handleUpdateBooks(prev => prev.map(b => b.id === activeBook.id ? { ...b, sidecarMarkdown: newMd } : b));
        }}
      />

      {/* Midphase Hosting Server & Google Auth Setup Modal */}
      <GoogleAuthDeployModal
        isOpen={isGoogleAuthDeployOpen}
        onClose={() => setIsGoogleAuthDeployOpen(false)}
      />

      {/* StackCP FTP Auto-Deployment Modal (meow.artkitty.net) */}
      <StackcpDeployModal
        isOpen={isStackcpDeployOpen}
        onClose={() => setIsStackcpDeployOpen(false)}
      />

      {/* Antigravity Setup & Replication Guide Modal */}
      <AntigravitySetupModal
        isOpen={isAntigravitySetupOpen}
        onClose={() => setIsAntigravitySetupOpen(false)}
      />

      {/* Gemini Spark & MCP Bridge Modal */}
      <GeminiSparkPluginModal
        isOpen={isGeminiSparkOpen}
        onClose={() => setIsGeminiSparkOpen(false)}
      />

      {/* Root meow.artkitty.net Index Portal Generator Modal */}
      <MeowPortalGeneratorModal
        isOpen={isMeowPortalOpen}
        onClose={() => setIsMeowPortalOpen(false)}
      />

      {/* Artist Portfolio & Creator Profiles Modal */}
      <ArtistPortfolioModal
        isOpen={isArtistPortfolioOpen}
        onClose={() => setIsArtistPortfolioOpen(false)}
        onImportArtworkToVault={(artworkBook) => {
          handleUpdateBooks(prev => [artworkBook, ...prev]);
          setActiveBookId(artworkBook.id);
          setActiveView('sidecar');
        }}
      />

      {/* Curation Monetization & Storefront Settings Modal */}
      <MonetizationSettingsModal
        isOpen={isMonetizationOpen}
        onClose={() => setIsMonetizationOpen(false)}
      />

      {/* Local SSH Authentication & Zero-Cloud Accounts Modal */}
      <LocalSshAuthModal
        isOpen={isLocalSshAuthOpen}
        onClose={() => setIsLocalSshAuthOpen(false)}
      />

      {/* Local SSL Client Certificate & mTLS Authentication Modal */}
      <LocalSslAuthModal
        isOpen={isLocalSslAuthOpen}
        onClose={() => setIsLocalSslAuthOpen(false)}
      />

      {/* Profile Management & Registration (Invite Code 'meow') Modal */}
      <ProfileManagementModal
        isOpen={isProfileManagementOpen}
        onClose={() => setIsProfileManagementOpen(false)}
        onProfileChanged={(updated) => setActiveUserProfile(updated)}
      />

      {/* Sovereign SMTP Email Verification & Zero-Cloud Accounts Modal */}
      <SovereignSmtpAuthModal
        isOpen={isSovereignSmtpOpen}
        onClose={() => setIsSovereignSmtpOpen(false)}
        onVerifiedUser={(updated) => setActiveUserProfile(updated)}
      />

      {/* OpenSSO, WebAuthn Passkeys & GitHub SSO Modal */}
      <OpenSsoModal
        isOpen={isOpenSsoOpen}
        onClose={() => setIsOpenSsoOpen(false)}
        onAuthenticated={(updated) => setActiveUserProfile(updated)}
      />

      {/* Sovereign Privacy Shield & Zero-Telemetry Audit Modal */}
      <SovereignPrivacyShieldModal
        isOpen={isSovereignPrivacyOpen}
        onClose={() => setIsSovereignPrivacyOpen(false)}
      />

      {/* Sovereign Black Box Architecture Manifest Modal */}
      <BlackBoxModal
        isOpen={isBlackBoxOpen}
        onClose={() => setIsBlackBoxOpen(false)}
        onAutoGenerateVaultItems={(newBooks) => {
          handleUpdateBooks(prev => [...newBooks, ...prev]);
          if (newBooks.length > 0) {
            setActiveBookId(newBooks[0].id);
            setActiveView('library');
          }
        }}
      />

      {/* Google Auth OAuth 2.0 & HTTPS SSL Engine Modal */}
      <GoogleAuthSslModal
        isOpen={isGoogleAuthSslOpen}
        onClose={() => setIsGoogleAuthSslOpen(false)}
      />

      {/* Home Insurance Asset Inventory & Bulk Photo Scanner Modal */}
      <HomeInsuranceScannerModal
        isOpen={isHomeInsuranceOpen}
        onClose={() => setIsHomeInsuranceOpen(false)}
        onAutoGenerateVaultItems={(newBooks) => {
          handleUpdateBooks(prev => [...newBooks, ...prev]);
          if (newBooks.length > 0) {
            setActiveBookId(newBooks[0].id);
            setActiveView('library');
          }
        }}
      />

      {/* PC Rig Builds & Newegg List Vault Importer Modal */}
      <PcRigBuildModal
        isOpen={isPcRigBuildOpen}
        onClose={() => setIsPcRigBuildOpen(false)}
        onAutoGenerateVaultItems={(newBooks) => {
          handleUpdateBooks(prev => [...newBooks, ...prev]);
          if (newBooks.length > 0) {
            setActiveBookId(newBooks[0].id);
            setActiveView('library');
          }
        }}
      />

      {/* Gift Tracker, Recipient Profile & Response Gauge Modal */}
      <GiftTrackerModal
        isOpen={isGiftTrackerOpen}
        onClose={() => setIsGiftTrackerOpen(false)}
        onAutoGenerateVaultItems={(newBooks) => {
          handleUpdateBooks(prev => [...newBooks, ...prev]);
          if (newBooks.length > 0) {
            setActiveBookId(newBooks[0].id);
            setActiveView('library');
          }
        }}
      />

      {/* Fair Trade Value Calculator & Asset Comparator Modal */}
      <TradeCalculatorModal
        isOpen={isTradeCalculatorOpen}
        books={books}
        onClose={() => setIsTradeCalculatorOpen(false)}
        onUpdateBookTradeValue={(updatedBook) => {
          handleUpdateBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
        }}
      />

      {/* Standard International Legal Terms, ToS & Privacy Modal */}
      <LegalTermsModal
        isOpen={isLegalTermsOpen}
        onClose={() => setIsLegalTermsOpen(false)}
      />

      {/* TCG Box Break Feeds & Live Stream Linker Modal */}
      <TcgBreakFeedModal
        isOpen={isTcgBreakFeedOpen}
        books={books}
        onClose={() => setIsTcgBreakFeedOpen(false)}
        onUpdateBook={(updatedBook) => {
          handleUpdateBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
        }}
      />

      {/* PWA App Install & Mobile Share Target Guide Modal */}
      <PwaInstallModal
        isOpen={isPwaInstallOpen}
        deferredPrompt={deferredPrompt}
        onClose={() => setIsPwaInstallOpen(false)}
        onInstallSuccess={() => setDeferredPrompt(null)}
      />

      {/* Book & Sidecar Preview / More Info Inspector Modal */}
      <BookSidecarInspectorModal
        isOpen={isBookInspectorOpen}
        book={inspectingBook || activeBook}
        accounts={cloudAccounts}
        onClose={() => setIsBookInspectorOpen(false)}
        onOpenReader={(id) => {
          setActiveBookId(id);
          setActiveView('split');
        }}
        onOpenSidecarEditor={(id) => {
          setActiveBookId(id);
          setActiveView('sidecar');
        }}
        onUpdateBookSidecar={(bookId, updatedSidecar) => {
          handleUpdateBooks(prev => prev.map(b => b.id === bookId ? { ...b, sidecarMarkdown: updatedSidecar } : b));
        }}
        onToggleTrade={(updatedBook) => {
          handleUpdateBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
        }}
      />

      {/* Universal Import & Ingest Studio Modal */}
      <UnifiedImportStudioModal
        isOpen={isUnifiedImportOpen}
        relLinkRoot={pluginState.relLinkRoot}
        accounts={cloudAccounts}
        onClose={() => setIsUnifiedImportOpen(false)}
        onImportBooks={(newBooks, bundleFilterTag) => {
          handleUpdateBooks(prev => [...newBooks, ...prev]);
          if (newBooks.length > 0) {
            setActiveBookId(newBooks[0].id);
            setActiveView('library');
            if (bundleFilterTag) {
              setActiveFilterTag(bundleFilterTag);
            }
          }
        }}
        onProceedToVerification={(importedItems) => {
          setImportedItemsForVerification(importedItems);
        }}
        onRestoreCloudAccounts={handleUpdateCloudAccounts}
      />

      {/* Unified Export & Sharing Studio Modal */}
      <UnifiedExportShareModal
        isOpen={isUnifiedExportOpen}
        books={books}
        activeBook={activeBook}
        mediaItems={SAMPLE_MEDIA_ITEMS}
        cloudAccounts={cloudAccounts}
        webdavConfig={pluginState.webdavConfig}
        onClose={() => setIsUnifiedExportOpen(false)}
        onExportObsidian={handleExportObsidian}
      />

      {/* Auto-Discovered Real-File Suggestions Modal */}
      <SuggestedDriveLinksModal
        isOpen={isSuggestedLinksOpen}
        suggestions={suggestedDriveLinks}
        books={books}
        onClose={() => setIsSuggestedLinksOpen(false)}
        onApproveLink={(suggestion) => {
          const targetBook = books.find(b => b.id === suggestion.bookId);
          if (targetBook) {
            const updatedSidecar = applyApprovedLinkToBook(targetBook, suggestion);
            handleUpdateBooks(prev => prev.map(b => b.id === targetBook.id ? { ...b, sidecarMarkdown: updatedSidecar } : b));
          }
          const updatedSuggestions = suggestedDriveLinks.map(s => s.id === suggestion.id ? { ...s, status: 'linked' as const } : s);
          setSuggestedDriveLinks(updatedSuggestions);
          saveSuggestedLinks(updatedSuggestions);
        }}
        onApproveAll={() => {
          let currentBooks = [...books];
          const pending = suggestedDriveLinks.filter(s => s.status === 'pending');
          pending.forEach(sug => {
            const targetBook = currentBooks.find(b => b.id === sug.bookId);
            if (targetBook) {
              const updatedSidecar = applyApprovedLinkToBook(targetBook, sug);
              currentBooks = currentBooks.map(b => b.id === targetBook.id ? { ...b, sidecarMarkdown: updatedSidecar } : b);
            }
          });
          handleUpdateBooks(() => currentBooks);
          const updatedSuggestions = suggestedDriveLinks.map(s => ({ ...s, status: 'linked' as const }));
          setSuggestedDriveLinks(updatedSuggestions);
          saveSuggestedLinks(updatedSuggestions);
          alert(`✓ Linked all ${pending.length} auto-discovered real files to their sidecars!`);
        }}
        onDismiss={(sugId) => {
          const updatedSuggestions = suggestedDriveLinks.map(s => s.id === sugId ? { ...s, status: 'dismissed' as const } : s);
          setSuggestedDriveLinks(updatedSuggestions);
          saveSuggestedLinks(updatedSuggestions);
        }}
        onDismissAll={() => {
          const updatedSuggestions = suggestedDriveLinks.map(s => ({ ...s, status: 'dismissed' as const }));
          setSuggestedDriveLinks(updatedSuggestions);
          saveSuggestedLinks(updatedSuggestions);
          alert('✕ Dismissed all pending file suggestions.');
        }}
        onOpenCloudSettings={() => setIsCloudAccountsOpen(true)}
      />

      {/* VPS Cron & Automation Scheduler Modal */}
      <CronSchedulerModal
        isOpen={isCronSchedulerOpen}
        onClose={() => setIsCronSchedulerOpen(false)}
      />

      {/* Spotify & Vinyl Black Box Music Linking Modal */}
      <SpotifyMusicModal
        isOpen={isSpotifyMusicOpen}
        onClose={() => setIsSpotifyMusicOpen(false)}
        onLinkAlbum={(newBook) => {
          handleUpdateBooks(prev => [newBook, ...prev]);
          setActiveBookId(newBook.id);
          setActiveView('sidecar');
        }}
      />

      {/* Family Social Friending, Following & Piplup Theme Modal */}
      <FamilySocialModal
        isOpen={isFamilySocialOpen}
        activeThemeId={activeThemeId}
        onClose={() => setIsFamilySocialOpen(false)}
        onSwitchTheme={(themeId) => setActiveThemeId(themeId)}
      />

      {/* Export to Google Sheets Modal */}
      <GoogleSheetsExportModal
        isOpen={isGoogleSheetsOpen}
        books={books}
        onClose={() => setIsGoogleSheetsOpen(false)}
      />

      {/* Binder Sheet Card Scanner & Entry Auto-Generator Modal */}
      <CardScannerModal
        isOpen={isCardScannerOpen}
        onClose={() => setIsCardScannerOpen(false)}
        onAutoGenerateVaultItems={(newScannedBooks) => {
          handleUpdateBooks(prev => [...newScannedBooks, ...prev]);
          if (newScannedBooks.length > 0) {
            setActiveBookId(newScannedBooks[0].id);
            setActiveView('library');
          }
        }}
      />

      {/* Local AI Creator & Story Metadata Studio Modal */}
      <ArtistAiStudioModal
        isOpen={isArtistAiStudioOpen}
        onClose={() => setIsArtistAiStudioOpen(false)}
        onAutoGenerateVaultItem={(newBook) => {
          handleUpdateBooks(prev => [newBook, ...prev]);
          setActiveBookId(newBook.id);
          setActiveView('sidecar');
        }}
      />

      {/* 9. Spatial-Chained Routine Registry & TTS Director Modal */}
      <SpatialRoutineDirectorModal
        isOpen={isSpatialRoutineOpen}
        onClose={() => setIsSpatialRoutineOpen(false)}
      />

      {/* 10. Story Maker & Author Bible Modal */}
      <StoryMakerAuthorBibleModal
        isOpen={isStoryMakerBibleOpen}
        onClose={() => setIsStoryMakerBibleOpen(false)}
      />

      {/* 11. Running Litany & Inactivity Watchdog Modal */}
      <RunningLitanyWatchdogModal
        isOpen={isRunningLitanyOpen}
        onClose={() => setIsRunningLitanyOpen(false)}
      />

      {/* 12. Persona, Feed Engine & Collector Hub Modal */}
      <PersonaCollectorHubModal
        isOpen={isPersonaCollectorOpen}
        onClose={() => setIsPersonaCollectorOpen(false)}
      />

      {/* 13. Vault Backup Import & PIN Session Restore Modal */}
      <VaultBackupRestoreModal
        isOpen={isVaultRestoreOpen}
        onClose={() => setIsVaultRestoreOpen(false)}
        activeBookId={activeBookId}
        allBooks={books}
        cloudAccounts={cloudAccounts}
        onRestoreCloudAccounts={(restored) => {
          setCloudAccounts(restored);
          localStorage.setItem('lc_md_cloud_accounts', JSON.stringify(restored));
        }}
        onRestoreBooks={(newBooks, overwrite) => {
          if (overwrite) {
            handleUpdateBooks(() => newBooks);
          } else {
            handleUpdateBooks(prev => {
              const existingIds = new Set(prev.map(b => b.id));
              const deduplicated = newBooks.filter(b => !existingIds.has(b.id));
              return [...deduplicated, ...prev];
            });
          }
          if (newBooks.length > 0) {
            setActiveBookId(newBooks[0].id);
            setActiveView('library');
          }
        }}
      />

      {/* 14. VOD & Video Stream Importer Modal */}
      <VodImporterModal
        isOpen={isVodImporterOpen}
        onClose={() => setIsVodImporterOpen(false)}
        cloudAccounts={cloudAccounts}
        onImportVod={(book) => {
          handleUpdateBooks(prev => [book, ...prev]);
          setActiveBookId(book.id);
          setActiveView('library');
        }}
      />

      {/* ⚡ Idle Background Auto-Worker Toast Notice */}
      {idleSyncNotice && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/80 text-amber-300 text-xs font-mono font-bold shadow-2xl flex items-center space-x-2 animate-slideDown backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{idleSyncNotice}</span>
        </div>
      )}

    </div>
  );
}

export default App;
