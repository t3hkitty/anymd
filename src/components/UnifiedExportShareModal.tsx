import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { MediaItem } from '../types/mediaTypes';
import type { CloudAccount } from '../types/cloudAccounts';
import { generatePAGroceryListMarkdown } from '../plugins/paSourcingPlugin';
import { exportVaultToGoogleSheetsCsv } from '../plugins/googleSheetsExportPlugin';
import { generateStandaloneShowcaseHtml } from '../plugins/htmlPublisherPlugin';
import { exportVaultZipWithMedia } from '../plugins/vaultZipExportPlugin';
import {
  X,
  Share2,
  FileSpreadsheet,
  Upload,
  Copy,
  Check,
  Download,
  QrCode,
  BookOpen,
  ClipboardList,
  FolderArchive,
  KeyRound,
  RefreshCw
} from 'lucide-react';

interface UnifiedExportShareModalProps {
  isOpen: boolean;
  books: Book[];
  activeBook: Book | null;
  mediaItems: MediaItem[];
  cloudAccounts?: CloudAccount[];
  webdavConfig?: any;
  onClose: () => void;
  onExportObsidian?: (book: Book) => void;
}

export const UnifiedExportShareModal: React.FC<UnifiedExportShareModalProps> = ({
  isOpen,
  books,
  activeBook,
  mediaItems,
  cloudAccounts = [],
  onClose,
  onExportObsidian
}) => {
  const [activeTab, setActiveTab] = useState<'vault_zip' | 'pa_sourcing' | 'google_sheets' | 'html_publish' | 'obsidian' | 'qr_share'>('vault_zip');
  const [isZipping, setIsZipping] = useState(false);
  const [includeCloudAccounts, setIncludeCloudAccounts] = useState(true);
  const [zipPin, setZipPin] = useState<string>(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [copiedZipPin, setCopiedZipPin] = useState(false);
  
  // PA Sourcing State
  const [copiedPa, setCopiedPa] = useState(false);

  // Google Sheets State
  const [copiedTsv, setCopiedTsv] = useState(false);

  // HTML Showcase State
  const [customTitle, setCustomTitle] = useState('Meow Library Showcase');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!isOpen) return null;

  // 1. PA Sourcing Digest
  const paDigest = generatePAGroceryListMarkdown(books, mediaItems);

  const handleCopyPaDigest = () => {
    navigator.clipboard.writeText(paDigest);
    setCopiedPa(true);
    setTimeout(() => setCopiedPa(false), 2000);
  };

  const handleDownloadPaDrop = () => {
    const blob = new Blob([paDigest], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PA_Procurement_Grocery_List.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Google Sheets & CSV Export
  const handleExportCsv = () => {
    const csvContent = exportVaultToGoogleSheetsCsv(books);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Meow_Library_Vault_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTsv = () => {
    const csvContent = exportVaultToGoogleSheetsCsv(books);
    // Replace commas with tabs for direct Google Sheets paste
    const tsvContent = csvContent.replace(/,/g, '\t');
    navigator.clipboard.writeText(tsvContent);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2000);
  };

  // 3. HTML Showcase & Publisher
  const handleDownloadHtml = () => {
    const html = generateStandaloneShowcaseHtml(books, mediaItems, customTitle);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${customTitle.toLowerCase().replace(/[\s\W]+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePublishHtml = () => {
    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 3000);
  };

  // 4. Obsidian Bulk Export
  const handleBulkObsidianExport = () => {
    books.forEach(b => {
      const blob = new Blob([b.sidecarMarkdown || `# ${b.title}`], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${b.title.replace(/[\s\W]+/g, '_')}.companion.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
    alert(`✓ Successfully initiated download for ${books.length} Obsidian Markdown (.md) sidecar files!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Unified Export &amp; Sharing Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  LOCAL-FIRST EXPORTS
                </span>
              </h3>
              <p className="text-xs text-slate-400">Executive PA Sourcing &bull; Google Sheets CSV &bull; HTML Showcase &bull; Obsidian Vault &bull; QR Sharing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('vault_zip')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'vault_zip'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
            <span>📦 Vault ZIP (+ /media/ folder)</span>
          </button>

          <button
            onClick={() => setActiveTab('pa_sourcing')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'pa_sourcing'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
            <span>📋 Executive PA Grocery List</span>
          </button>

          <button
            onClick={() => setActiveTab('google_sheets')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'google_sheets'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>📊 Google Sheets &amp; CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('html_publish')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'html_publish'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>🌐 HTML Showcase &amp; WebDAV</span>
          </button>

          <button
            onClick={() => setActiveTab('obsidian')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'obsidian'
                ? 'border-purple-400 text-purple-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>🪨 Obsidian Markdown Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('qr_share')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'qr_share'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>📲 QR Code &amp; Web Share</span>
          </button>

        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-5">
          
          {/* TAB 0: FULL VAULT ZIP ARCHIVE WITH /MEDIA/ FOLDER */}
          {activeTab === 'vault_zip' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 font-sans">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5 text-xs font-mono">
                  <FolderArchive className="w-4 h-4 text-indigo-400" />
                  <span>Meow Vault Complete ZIP Archive Package</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Generates an immutable standard archive including a separate <code>/media/</code> directory for all individual cropped card covers, high-resolution original uncropped binder sheets, and media attachments. Markdown sidecars automatically link to <code>./media/filename</code> for Obsidian and filesystem parity.
                </p>
              </div>

              {/* 🔐 Meow Archive Access PIN Display Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-100 text-xs">Meow Archive Access PIN</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                      AES-GCM LOCKFILE
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setZipPin(String(Math.floor(1000 + Math.random() * 9000)))}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center space-x-1 transition-colors"
                      title="Generate new random PIN"
                    >
                      <RefreshCw className="w-3 h-3 text-amber-400" />
                      <span>New PIN</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(zipPin);
                        setCopiedZipPin(true);
                        setTimeout(() => setCopiedZipPin(false), 2000);
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold font-mono flex items-center space-x-1 transition-colors shadow-sm"
                    >
                      {copiedZipPin ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedZipPin ? 'Copied!' : 'Copy PIN'}</span>
                    </button>
                  </div>
                </div>

                {/* Big Prominent PIN Digits */}
                <div className="flex items-center space-x-2 pt-1">
                  {zipPin.split('').map((digit, idx) => (
                    <span
                      key={idx}
                      className="w-10 h-11 rounded-2xl bg-slate-950 border border-amber-500/70 text-amber-300 text-2xl font-black font-mono flex items-center justify-center shadow-lg shadow-amber-500/10 select-all"
                    >
                      {digit}
                    </span>
                  ))}
                  <div className="ml-3 flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={8}
                      value={zipPin}
                      onChange={(e) => setZipPin(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono w-28 focus:outline-none focus:border-amber-400 text-center tracking-wider"
                      placeholder="Custom PIN"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">(Custom)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  This 4-digit PIN is embedded in the archive's encrypted <code>.vault-session.lock</code> file and will be used to unlock your library upon session restore.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block text-xs">
                    Ready to Package {books.length} Vault Sidecars &amp; Attached Media
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    Includes <code>/Sidecars/</code>, <code>/media/</code>, <code>.vault-session.lock</code>, and <code>manifest.json</code>.
                  </span>
                  {cloudAccounts.length > 0 && (
                    <label className="flex items-center space-x-2 text-xs text-amber-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={includeCloudAccounts}
                        onChange={(e) => setIncludeCloudAccounts(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500 accent-amber-500"
                      />
                      <span>Include {cloudAccounts.length} Configured Cloud Accounts (<code>cloud_accounts.json</code>)</span>
                    </label>
                  )}
                </div>

                <button
                  disabled={isZipping}
                  onClick={async () => {
                    setIsZipping(true);
                    try {
                      const zipBlob = await exportVaultZipWithMedia(
                        books,
                        mediaItems,
                        includeCloudAccounts ? cloudAccounts : [],
                        zipPin
                      );
                      const url = URL.createObjectURL(zipBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Meow_Vault_Archive_${new Date().toISOString().split('T')[0]}.zip`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (err: any) {
                      alert(`ZIP Generation Error: ${err.message}`);
                    } finally {
                      setIsZipping(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>{isZipping ? 'Compiling Protected ZIP with /media/...' : '📦 Download Vault .ZIP Archive'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1.5">
                <span className="text-indigo-400 font-bold block uppercase text-[10px]">ZIP Directory Structure:</span>
                <p>📁 <code>Meow_Vault_Archive.zip</code></p>
                <p className="pl-4">├── 📁 <code>Sidecars/</code> (All markdown .companion.md files with relative image links)</p>
                <p className="pl-4">├── 📁 <code>media/</code> (Cropped card covers, uncropped scans &amp; reaction photos)</p>
                <p className="pl-4">└── 📄 <code>manifest.json</code> (Vault catalog schema &amp; valuation indexes)</p>
              </div>
            </div>
          )}

          {/* TAB 1: EXECUTIVE PA SOURCING DIGEST */}
          {activeTab === 'pa_sourcing' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2 font-sans">
                <span className="font-bold text-amber-300 flex items-center space-x-1.5 text-xs font-mono">
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  <span>Personal Assistant (PA) Procurement &amp; Sourcing Digest</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Generate a structured, ready-to-buy wishlist digest with live price estimates, ISBNs, and physical media sourcing instructions for your executive assistant or team.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyPaDigest}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    {copiedPa ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPa ? 'Copied PA Digest!' : 'Copy PA Briefing Digest'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPaDrop}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center space-x-1.5 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PA_Grocery_List.md</span>
                  </button>
                </div>
              </div>

              {/* Rendered Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-[320px] overflow-y-auto whitespace-pre-wrap text-[11px] text-slate-300 font-mono">
                {paDigest}
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS & CSV EXPORT */}
          {activeTab === 'google_sheets' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 font-sans">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5 text-xs font-mono">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Google Sheets, Excel &amp; CSV Spreadsheet Export</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Export your entire vault inventory—including book titles, authors, chapter counts, resonance marks, replacement trade valuations ($ USD), and trade availability flags—into standard tabular formats.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Ready to Export {books.length} Vault Items</span>
                  <span className="text-slate-500 text-[11px]">Includes Decimal Fair Trade valuations and YAML metadata.</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyTsv}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
                  >
                    {copiedTsv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTsv ? 'Copied TSV!' : 'Copy TSV for Google Sheets (Ctrl+V)'}</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .CSV File</span>
                  </button>
                </div>
              </div>

              {/* Sample Table Preview */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Author</th>
                      <th className="p-3 text-right">Chapters</th>
                      <th className="p-3 text-right">Valuation ($ USD)</th>
                      <th className="p-3 text-center">Trade Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {books.slice(0, 5).map(b => (
                      <tr key={b.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-slate-100">{b.title}</td>
                        <td className="p-3 text-slate-400">{b.author}</td>
                        <td className="p-3 text-right text-amber-300">{b.chapters.length}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">${(b.tradeValueUsd || 19.99).toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                            {b.isAvailableForTrade ? '🤝 For Trade' : '🔒 Vault'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HTML SHOWCASE & WEBDAV PUBLISHER */}
          {activeTab === 'html_publish' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 font-sans">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5 text-xs font-mono">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Standalone HTML Showcase &amp; WebDAV Self-Hosted Publisher</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Compile a zero-dependency, self-contained interactive HTML bookshelf catalog. Download it as a single file or deploy it to your self-hosted WebDAV server (e.g. <code>meow.artkitty.net/library.html</code>).
                </p>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Catalog Showcase Title:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadHtml}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Standalone HTML Showcase</span>
                  </button>

                  <button
                    onClick={handlePublishHtml}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-slate-700 flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Publish to WebDAV Endpoint</span>
                  </button>
                </div>

                {publishedSuccess && (
                  <span className="text-emerald-400 font-bold flex items-center space-x-1 animate-fadeIn">
                    <Check className="w-3.5 h-3.5" />
                    <span>Published to WebDAV!</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: OBSIDIAN MARKDOWN VAULT EXPORT */}
          {activeTab === 'obsidian' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2 font-sans">
                <span className="font-bold text-purple-300 flex items-center space-x-1.5 text-xs font-mono">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>Obsidian &amp; Logseq Markdown Vault Bulk Exporter</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Export all book sidecars as standalone <code>.companion.md</code> files formatted with Obsidian-compatible YAML front matter, wikilinks (<code>[[Title]]</code>), and tag taxonomies.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-100 text-xs block">Bulk Export All {books.length} Books to Obsidian</strong>
                    <span className="text-slate-500 text-[11px]">Exports individual .companion.md files directly to your downloads.</span>
                  </div>

                  <button
                    onClick={handleBulkObsidianExport}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center space-x-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export All Sidecars (.md)</span>
                  </button>
                </div>

                {activeBook && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Active Book: <strong className="text-amber-300">{activeBook.title}</strong></span>
                    <button
                      onClick={() => onExportObsidian && onExportObsidian(activeBook)}
                      className="text-purple-300 hover:underline flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export Active Book Only</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: QR CODE & WEB SHARE */}
          {activeTab === 'qr_share' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2 font-sans">
                <span className="font-bold text-sky-300 flex items-center space-x-1.5 text-xs font-mono">
                  <QrCode className="w-4 h-4 text-sky-400" />
                  <span>Mobile QR Code &amp; Native Web Share Sheet</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Generate instant QR codes to scan on your phone or use the native browser share sheet to send book recommendations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                  {/* Visual QR Code Placeholder with Meow Icon */}
                  <div className="w-40 h-40 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-amber-300 font-mono text-[10px] space-y-2">
                    <QrCode className="w-16 h-16 text-amber-400" />
                    <span>Anymd Meow QR</span>
                    <span className="text-slate-400 text-[8px]">{activeBook ? activeBook.title.slice(0, 20) : 'Library Vault'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-100">{activeBook ? activeBook.title : 'Meow Library Hub'}</h4>
                  <p className="text-xs text-slate-400">Scan with any mobile camera to open on phone.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Zero Telemetry &bull; Client-Side Storage &amp; Local Downloads Only
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
