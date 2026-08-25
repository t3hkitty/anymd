import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  FolderOpen,
  Cloud,
  Key,
  Mail,
  Shield,
  Layers,
  Tag,
  Bookmark,
  Globe,
  Sparkles,
  ChevronDown,
  FileText,
  Boxes,
  Database,
  Smartphone,
  Server,
  Share2,
  Camera,
  Import,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface HeaderNavDropdownsProps {
  onOpenUnifiedImport: () => void;
  onOpenCardScanner: () => void;
  onOpenHomeInsuranceScanner: () => void;
  onOpenVodImporter: () => void;
  onOpenNovelUpdates: () => void;
  onOpenAnnasArchive: () => void;
  onOpenPASourcing: () => void;
  onOpenBookmarklets: () => void;
  onOpenCalibreImport: () => void;
  onUploadEpubClick: () => void;
  onOpenSuggestedLinks?: () => void;

  onOpenVaultRestore: () => void;
  onOpenExportShare: () => void;
  onOpenGenreTagManager: () => void;
  onOpenMediaTypeManager: () => void;
  onOpenBulkEdit: () => void;
  onOpenOPDSCatalog: () => void;
  onOpenPwaInstall: () => void;
  onOpenBookshelf?: () => void;

  onOpenCloudAccounts: () => void;
  onOpenWebDAVIndexer: () => void;
  onOpenLocalSshAuth: () => void;
  onOpenMeowSmtp: () => void;
  onOpenOpenSso: () => void;
  onOpenStackcpDeploy: () => void;
  onOpenGoogleAuthDeploy: () => void;
  onOpenRsyncSync: () => void;
  onOpenGeminiSpark?: () => void;

  onOpenRunningLitany: () => void;
  onOpenArtistAiStudio: () => void;
  onOpenStoryMakerBible: () => void;
  onOpenSpatialRoutine: () => void;
  onOpenPersonaCollector: () => void;
  onOpenHtmlPublish: () => void;
  onOpenCommunityHub: () => void;

  // Real actionable notification counts (Alerts ONLY when action needed)
  pendingDriveMatchesCount?: number;
  totalBooksCount?: number;
  cloudAccountsCount?: number;
  cloudAuthErrorsCount?: number;
  litanyPulsesCount?: number;
}

export const HeaderNavDropdowns: React.FC<HeaderNavDropdownsProps> = (props) => {
  const [openMenu, setOpenMenu] = useState<'ingest' | 'vault' | 'cloud' | 'studio' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pendingMatches = props.pendingDriveMatchesCount || 0;
  const totalBooks = props.totalBooksCount || 0;
  const cloudCount = props.cloudAccountsCount || 0;
  const authErrors = props.cloudAuthErrorsCount || 0;
  const pulsesCount = props.litanyPulsesCount || 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleMenu = (menu: 'ingest' | 'vault' | 'cloud' | 'studio') => {
    setOpenMenu(prev => prev === menu ? null : menu);
  };

  const runAction = (fn?: () => void) => {
    if (!fn) return;
    setOpenMenu(null);
    fn();
  };

  return (
    <div ref={containerRef} className="flex items-center space-x-2 font-sans text-xs flex-wrap gap-y-1">
      
      {/* 1. 📥 IMPORT & INGEST DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('ingest')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm relative ${
            openMenu === 'ingest'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80 hover:border-amber-500/40'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Import &amp; Ingest</span>
          {pendingMatches > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
              {pendingMatches}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'ingest' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'ingest' && (
          <div className="absolute left-0 mt-2 w-76 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => runAction(props.onOpenSuggestedLinks || props.onOpenUnifiedImport)}
              className="w-full px-2.5 py-1.5 text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-800 flex items-center justify-between hover:bg-slate-800 rounded-lg transition-colors group cursor-pointer text-left"
              title="Click to view and approve matching drive files"
            >
              <span>Import &amp; Sourcing Engines</span>
              {pendingMatches > 0 ? (
                <span className="text-amber-400 font-extrabold flex items-center space-x-1 group-hover:underline">
                  <span>💡 {pendingMatches} new match</span>
                  <span>➜</span>
                </span>
              ) : (
                <span className="text-slate-500 text-[9px]">All synced</span>
              )}
            </button>
            
            {/* 💡 Auto-Discovered Real-File Match Suggestions if any */}
            {pendingMatches > 0 && props.onOpenSuggestedLinks && (
              <button
                onClick={() => runAction(props.onOpenSuggestedLinks)}
                className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold transition-all shadow-sm animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div className="flex-1">
                  <div className="text-amber-300 font-extrabold flex items-center justify-between">
                    <span>💡 Auto-Discovered Matches</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">{pendingMatches} PENDING</span>
                  </div>
                  <div className="text-[10px] text-slate-300">Files found in cloud &amp; downloads ready to link</div>
                </div>
              </button>
            )}

            {/* Prominent Unified Import Studio (Image / Photos / Scrapers) */}
            <button
              onClick={() => runAction(props.onOpenUnifiedImport)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left bg-gradient-to-r from-emerald-600/30 to-sky-600/30 hover:from-emerald-600/40 hover:to-sky-600/40 border border-emerald-500/40 text-emerald-200 font-bold transition-all shadow-sm"
            >
              <Import className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-emerald-300 font-extrabold flex items-center space-x-1.5">
                  <span>📥 Universal Import Studio</span>
                  <span className="px-1 py-0.2 rounded bg-emerald-400 text-slate-950 text-[9px] font-black uppercase">HUB</span>
                </div>
                <div className="text-[10px] text-slate-300">Images, TCG, Insurance, Books &amp; Scrapers</div>
              </div>
            </button>

            {/* 📸 Bulk Photo & Image Scanner (Insurance & TCG) */}
            <button
              onClick={() => runAction(props.onOpenHomeInsuranceScanner)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-emerald-300 font-semibold transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-slate-100 font-bold">📸 Photo Asset Scanner</div>
                <div className="text-[10px] text-slate-400">Bulk room photos, items &amp; receipts</div>
              </div>
            </button>

            {/* 🃏 TCG Card Photo Scanner */}
            <button
              onClick={() => runAction(props.onOpenCardScanner)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-amber-300 font-semibold transition-colors"
            >
              <span>🃏</span>
              <div>
                <div className="text-slate-100 font-bold">TCG Card &amp; Slab Scanner</div>
                <div className="text-[10px] text-slate-400">PSA/BGS slabs, cards &amp; sets from photos</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenVodImporter)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-red-300 font-semibold transition-colors border-t border-slate-800/80"
            >
              <span>🎬</span>
              <div>
                <div className="text-slate-100 font-bold">VOD &amp; Stream Importer</div>
                <div className="text-[10px] text-slate-400">Twitch, YouTube, Kick &amp; TorBox</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenNovelUpdates)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-indigo-300 font-semibold transition-colors"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-slate-100 font-bold">NovelUpdates Scraper</div>
                <div className="text-[10px] text-slate-400">Asian webnovels, tags &amp; chapters</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenAnnasArchive)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-sky-300 font-semibold transition-colors"
            >
              <span>🏛️</span>
              <div>
                <div className="text-slate-100 font-bold">Anna's Archive &amp; LoC</div>
                <div className="text-[10px] text-slate-400">ISBN-13, MARC21 &amp; torrent mirrors</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenPASourcing)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-amber-300 font-semibold transition-colors"
            >
              <span>📋</span>
              <div>
                <div className="text-slate-100 font-bold">PA Grocery List</div>
                <div className="text-[10px] text-slate-400">Wishlist checklist &amp; direct links</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenBookmarklets)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-purple-300 font-semibold transition-colors"
            >
              <Bookmark className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-slate-100 font-bold">Browser Bookmarklets</div>
                <div className="text-[10px] text-slate-400">Goodreads &amp; NovelUpdates scrapers</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenCalibreImport)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-emerald-300 font-semibold transition-colors"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-slate-100 font-bold">Calibre Library Sync</div>
                <div className="text-[10px] text-slate-400">metadata.db &amp; Calibre collections</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onUploadEpubClick)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-amber-200 font-semibold transition-colors border-t border-slate-800"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-slate-100 font-bold">Upload Local EPUB File</div>
                <div className="text-[10px] text-slate-400">Direct drag-and-drop parse</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 2. 🗃️ VAULT TOOLS DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('vault')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
            openMenu === 'vault'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80 hover:border-amber-500/40'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Vault Tools</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'vault' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'vault' && (
          <div className="absolute left-0 mt-2 w-76 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => runAction(props.onOpenBookshelf)}
              className="w-full px-2.5 py-1.5 text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-800 flex items-center justify-between hover:bg-slate-800 rounded-lg transition-colors group cursor-pointer text-left"
              title="Click to view Grand Bookshelf"
            >
              <span>Vault Tools &amp; Data</span>
              <span className="text-amber-400 font-bold flex items-center space-x-1 group-hover:underline">
                <span>{totalBooks} volumes</span>
                <span>➜</span>
              </span>
            </button>

            {/* Prominent Export & Share Studio inside Menu */}
            <button
              onClick={() => runAction(props.onOpenExportShare)}
              className="flex items-center space-x-2.5 px-2.5 py-2.5 rounded-xl text-left bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-amber-200 font-bold transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-amber-300 font-extrabold flex items-center space-x-1.5">
                  <span>📤 Universal Export &amp; Share</span>
                  <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">HUB</span>
                </div>
                <div className="text-[10px] text-slate-300">Obsidian zip, Sheets CSV, PA list &amp; QR</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenMediaTypeManager)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-amber-300 font-semibold transition-colors"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <div className="flex-1">
                <div className="text-slate-100 font-bold flex items-center justify-between">
                  <span>Physical Media &amp; Locations</span>
                  <span className="text-[10px] text-amber-400 font-mono">{totalBooks} items</span>
                </div>
                <div className="text-[10px] text-slate-400">Books, Vinyls, Paintings &amp; Rooms</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenGenreTagManager)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-purple-300 font-semibold transition-colors"
            >
              <Tag className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-slate-100 font-bold">Category &amp; Tag Manager</div>
                <div className="text-[10px] text-slate-400">TCG, LitRPG, Fashion &amp; Tropes</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenBulkEdit)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-indigo-300 font-semibold transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-slate-100 font-bold">Bulk Metadata Editor</div>
                <div className="text-[10px] text-slate-400">Batch retag, pricing &amp; authors</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenVaultRestore)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-emerald-300 font-semibold transition-colors"
            >
              <span>📦</span>
              <div>
                <div className="text-slate-100 font-bold">Vault Backup &amp; Restore</div>
                <div className="text-[10px] text-slate-400">ZIP archive import &amp; session lock</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenOPDSCatalog)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-sky-300 font-semibold transition-colors"
            >
              <Server className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-slate-100 font-bold">OPDS Catalog Feed</div>
                <div className="text-[10px] text-slate-400">Universal e-reader XML/Atom feed</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenPwaInstall)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-emerald-400 font-semibold transition-colors border-t border-slate-800"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-slate-100 font-bold">Install PWA App Shortcut</div>
                <div className="text-[10px] text-slate-400">Enable mobile share target sheet</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 3. ☁️ CLOUD & AUTH DROPDOWN (Alert ONLY if auth fails on idle scan!) */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('cloud')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
            openMenu === 'cloud'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : authErrors > 0
              ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-rose-200'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80 hover:border-amber-500/40'
          }`}
          title={authErrors > 0 ? `${authErrors} cloud account(s) failing auth check` : `All ${cloudCount} cloud accounts authed`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud &amp; Auth</span>
          {authErrors > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse flex items-center space-x-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>{authErrors}</span>
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'cloud' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'cloud' && (
          <div className="absolute left-0 mt-2 w-76 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => runAction(props.onOpenCloudAccounts)}
              className="w-full px-2.5 py-1.5 text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-800 flex items-center justify-between hover:bg-slate-800 rounded-lg transition-colors group cursor-pointer text-left"
              title="Click to open Cloud Account Manager"
            >
              <span>Cloud &amp; Auth Config</span>
              {authErrors > 0 ? (
                <span className="text-rose-400 font-bold flex items-center space-x-1 group-hover:underline">
                  <span>⚠️ {authErrors} Auth Error</span>
                  <span>➜</span>
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center space-x-1 group-hover:underline">
                  <span>All {cloudCount} Authed ✓</span>
                  <span>➜</span>
                </span>
              )}
            </button>

            <button
              onClick={() => runAction(props.onOpenCloudAccounts)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-sky-300 font-semibold transition-colors"
            >
              <Cloud className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-slate-100 font-bold">Cloud Storage Accounts</div>
                <div className="text-[10px] text-slate-400">Filejump, Nextcloud, Koofr &amp; Drive</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenWebDAVIndexer)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-indigo-300 font-semibold transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-slate-100 font-bold">WebDAV &amp; TorBox Cloud</div>
                <div className="text-[10px] text-slate-400">Remote file browser &amp; proxy</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenLocalSshAuth)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-emerald-300 font-semibold transition-colors"
            >
              <Key className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-slate-100 font-bold">Local SSH &amp; Zero-Cloud</div>
                <div className="text-[10px] text-slate-400">Ed25519 keys &amp; local accounts</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenMeowSmtp)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-amber-300 font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-slate-100 font-bold">Meow SMTP Auth</div>
                <div className="text-[10px] text-slate-400">Self-hosted mail.artkitty.net</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenOpenSso)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-purple-300 font-semibold transition-colors"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-slate-100 font-bold">OpenSSO &amp; Passkeys</div>
                <div className="text-[10px] text-slate-400">WebAuthn biometric TouchID &amp; GitHub</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenStackcpDeploy)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-amber-400 font-semibold transition-colors border-t border-slate-800"
            >
              <span>🐱</span>
              <div>
                <div className="text-slate-100 font-bold">meow.artkitty.net Deploy</div>
                <div className="text-[10px] text-slate-400">StackCP production FTP portal</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenGeminiSpark)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-amber-300 font-semibold transition-colors border-t border-slate-800"
            >
              <Zap className="w-4 h-4 text-amber-455" />
              <div>
                <div className="text-slate-100 font-bold">Gemini Spark MCP Bridge</div>
                <div className="text-[10px] text-slate-400">Proactive background agent sync</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 4. 🎨 CREATIVE STUDIO DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('studio')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
            openMenu === 'studio'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80 hover:border-amber-500/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creative Studio</span>
          {pulsesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 font-bold text-[10px] border border-rose-500/30">
              ⚡ {pulsesCount}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'studio' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'studio' && (
          <div className="absolute right-0 mt-2 w-76 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn max-h-[85vh] overflow-y-auto">
            
            {/* Clickable Header that directly opens the Running Litany & Pulses */}
            <button
              onClick={() => runAction(props.onOpenRunningLitany)}
              className="w-full px-2.5 py-1.5 text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-800 flex items-center justify-between hover:bg-slate-800 rounded-lg transition-colors group cursor-pointer text-left"
              title="Click to open Running Litany pulse stream & watchdog"
            >
              <span>Creative Engines</span>
              <span className="text-rose-400 font-extrabold flex items-center space-x-1 group-hover:underline">
                <span>⚡ {pulsesCount} Today's Pulses</span>
                <span>➜</span>
              </span>
            </button>

            {/* ⚡ Dedicated Running Litany & WYD Pulses Action */}
            <button
              onClick={() => runAction(props.onOpenRunningLitany)}
              className="flex items-center space-x-2.5 px-2.5 py-2.5 rounded-xl text-left bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-amber-200 font-bold transition-all shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="flex-1">
                <div className="text-amber-300 font-extrabold flex items-center justify-between">
                  <span>⚡ Running Litany Stream</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">{pulsesCount} PULSES</span>
                </div>
                <div className="text-[10px] text-slate-300">Live WYD microlog, watchdog &amp; traffic pulse</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenArtistAiStudio)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-pink-300 font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <div>
                <div className="text-slate-100 font-bold">Local Creator AI Studio</div>
                <div className="text-[10px] text-slate-400">Redbubble, Etsy &amp; Royal Road tropes</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenStoryMakerBible)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-purple-300 font-semibold transition-colors"
            >
              <span>🎭</span>
              <div>
                <div className="text-slate-100 font-bold">Author Bible &amp; Story Maker</div>
                <div className="text-[10px] text-slate-400">Character role slugs &amp; inspo ledger</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenSpatialRoutine)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-blue-300 font-semibold transition-colors"
            >
              <span>🚪</span>
              <div>
                <div className="text-slate-100 font-bold">Spatial Routines &amp; TTS</div>
                <div className="text-[10px] text-slate-400">Morning wake, leaving house &amp; bedtime</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenPersonaCollector)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-rose-300 font-semibold transition-colors"
            >
              <span>💖</span>
              <div>
                <div className="text-slate-100 font-bold">Persona &amp; Plushie Cubbies</div>
                <div className="text-[10px] text-slate-400">Calm mode, Piplup radar &amp; sanctuary</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenHtmlPublish)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-indigo-300 font-semibold transition-colors"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-slate-100 font-bold">Publish HTML Showcase</div>
                <div className="text-[10px] text-slate-400">Self-hosted static web showcase</div>
              </div>
            </button>

            <button
              onClick={() => runAction(props.onOpenCommunityHub)}
              className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-emerald-400 font-semibold transition-colors border-t border-slate-800"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-slate-100 font-bold">Community Marketplace</div>
                <div className="text-[10px] text-slate-400">Sidecar templates &amp; shared prompts</div>
              </div>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
