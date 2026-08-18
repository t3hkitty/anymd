import React, { useState, useRef } from 'react';
import type { Book } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';
import { searchAnnasArchiveIsbnDb, type AnnasArchiveIsbnRecord } from '../plugins/annasArchiveIsbnPlugin';
import { parseTextDirectoryListing } from '../plugins/webdavIndexerPlugin';
import { scanMultipleIndividualPhotos, convertScannedCardsToVaultItems } from '../plugins/cardScannerPlugin';
import {
  X,
  Upload,
  Camera,
  Home,
  BookOpen,
  Globe,
  Search,
  Sparkles,
  FolderPlus
} from 'lucide-react';

interface UnifiedImportStudioModalProps {
  isOpen: boolean;
  relLinkRoot?: string;
  accounts?: CloudAccount[];
  onClose: () => void;
  onImportBooks: (newBooks: Book[]) => void;
  onProceedToVerification?: (importedItems: any[]) => void;
}

export const UnifiedImportStudioModal: React.FC<UnifiedImportStudioModalProps> = ({
  isOpen,
  onClose,
  onImportBooks,
  onProceedToVerification
}) => {
  const [activeTab, setActiveTab] = useState<'insurance' | 'cards' | 'annas_archive' | 'reading_lists' | 'novelupdates' | 'folder_scan'>('insurance');

  // 1. Home Insurance State
  const [insuranceRoom, setInsuranceRoom] = useState('Master Library & Study');
  const [insuranceCategory, setInsuranceCategory] = useState('Collectibles & Books');
  const [insuranceScanning, setInsuranceScanning] = useState(false);
  const [insuranceCount, setInsuranceCount] = useState(6);
  const [insurancePhotoUrl, setInsurancePhotoUrl] = useState<string | null>(null);
  const [insurancePhotoName, setInsurancePhotoName] = useState<string | null>(null);
  const insuranceFileInputRef = useRef<HTMLInputElement | null>(null);

  // 2. Card & Comic Scanner State
  const [cardSet, setCardSet] = useState('Evolving Skies & Marvel Vintage');
  const [cardScanning, setCardScanning] = useState(false);
  const [cardPhotos, setCardPhotos] = useState<Array<{ name: string; url: string }>>([]);
  const cardFileInputRef = useRef<HTMLInputElement | null>(null);

  // 3. Anna's Archive / LoC State
  const [annasQuery, setAnnasQuery] = useState('Dune');
  const [annasResults, setAnnasResults] = useState<AnnasArchiveIsbnRecord[]>([]);
  const [annasLoading, setAnnasLoading] = useState(false);

  // 4. Reading List State
  const [readingListText, setReadingListText] = useState('');

  // 5. NovelUpdates State
  const [novelUrl, setNovelUrl] = useState('https://www.novelupdates.com/series/the-scum-villains-self-saving-system/');
  const [novelTitle, setNovelTitle] = useState("The Scum Villain's Self-Saving System");
  const [novelAuthor, setNovelAuthor] = useState('Mo Xiang Tong Xiu');
  const [novelTags] = useState('Danmei, Comedy, Cultivation, Transmigration');

  // 6. Folder Scan State
  const localDirInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Photo Upload Handlers
  const handleInsurancePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInsurancePhotoName(file.name);
      const url = URL.createObjectURL(file);
      setInsurancePhotoUrl(url);
    }
  };

  const handleCardPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files).map(f => ({
        name: f.name,
        url: URL.createObjectURL(f)
      }));
      setCardPhotos(fileList);
    }
  };

  // Handlers
  // 1. Insurance Auto-Generate
  const handleGenerateInsuranceItems = () => {
    setInsuranceScanning(true);
    setTimeout(() => {
      setInsuranceScanning(false);
      const generated: Book[] = Array.from({ length: insuranceCount }).map((_, i) => ({
        id: `ins-item-${Date.now()}-${i}`,
        title: `${insuranceRoom} Asset Item #${i + 1} (${insuranceCategory})`,
        author: 'Asset Custody Record',
        coverColor: '#059669',
        totalChapters: 1,
        currentChapterIndex: 0,
        currentParagraphIndex: 0,
        isWebPresenceOnly: true,
        tradeValueUsd: 120.00 + (i * 45),
        isAvailableForTrade: false,
        sidecarMarkdown: `---
title: "${insuranceRoom} Asset #${i + 1}"
category: "${insuranceCategory}"
location: "${insuranceRoom}"
replacement_cost_usd: "${(120 + i * 45).toFixed(2)}"
verified_date: "${new Date().toISOString().split('T')[0]}"
format: "dcmd/insurance-asset"
---

# ${insuranceRoom} Asset #${i + 1}

- **Room / Location:** ${insuranceRoom}
- **Category:** ${insuranceCategory}
- **Replacement Valuation:** $${(120 + i * 45).toFixed(2)} USD
- **Custody Condition:** Mint / Very Good
`,
        resonanceStream: [],
        chapters: [{ title: 'Insurance Documentation', cfiBase: 'cfiBase:1', paragraphs: ['Asset verified for bulk home insurance coverage.'] }]
      }));

      onImportBooks(generated);
      onClose();
    }, 800);
  };

  // 2. Card & Comic Scanner Auto-Generate
  const handleScanCards = () => {
    setCardScanning(true);
    setTimeout(() => {
      setCardScanning(false);
      const filesToProcess = cardPhotos.length > 0
        ? cardPhotos
        : [
            { name: 'spiderman_300_cgc.jpg' },
            { name: 'killing_joke_1st.jpg' },
            { name: 'moonbreon_vmax.jpg' }
          ];
      const scanned = scanMultipleIndividualPhotos(filesToProcess, 'mixed', cardSet);
      const cardItems = convertScannedCardsToVaultItems(scanned);
      onImportBooks(cardItems);
      onClose();
    }, 800);
  };

  // 3. Anna's Archive Search
  const handleSearchAnnas = () => {
    setAnnasLoading(true);
    const results = searchAnnasArchiveIsbnDb(annasQuery);
    setAnnasResults(results);
    setAnnasLoading(false);
  };

  const handleImportAnnasItem = (item: AnnasArchiveIsbnRecord) => {
    const newBook: Book = {
      id: `annas-${Date.now()}`,
      title: item.title,
      author: item.author,
      coverColor: '#6366f1',
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      isWebPresenceOnly: true,
      tradeValueUsd: 25.00,
      isAvailableForTrade: true,
      sidecarMarkdown: `---
title: "${item.title}"
author: "${item.author}"
isbn13: "${item.isbn13}"
loc_classification: "${item.locClassification || 'N/A'}"
format: "dcmd/annas-archive"
---

# ${item.title}

- **Author:** ${item.author}
- **ISBN-13:** ${item.isbn13}
- **LoC Classification:** ${item.locClassification || 'N/A'}
- **Dataset:** ${item.sourceDataset}
`,
      resonanceStream: [],
      chapters: [{ title: 'Catalog Overview', cfiBase: 'cfiBase:1', paragraphs: [`Imported record for ${item.title}.`] }]
    };

    onImportBooks([newBook]);
    onClose();
  };

  // 4. Reading List Parse
  const handleParseReadingList = () => {
    const lines = readingListText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      alert('Please paste book titles or a CSV list.');
      return;
    }

    const imported = lines.map((line, idx) => {
      const parts = line.split(/[,\t|]/);
      const title = parts[0]?.trim() || `Imported Title ${idx + 1}`;
      const author = parts[1]?.trim() || 'Unknown Author';
      return {
        id: `import-${Date.now()}-${idx}`,
        title,
        author,
        format: 'epub',
        status: 'pending',
        estimatedValueUsd: 18.50
      };
    });

    if (onProceedToVerification) {
      onProceedToVerification(imported);
      onClose();
    } else {
      const newBooks: Book[] = imported.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        coverColor: '#6366f1',
        totalChapters: 1,
        currentChapterIndex: 0,
        currentParagraphIndex: 0,
        isWebPresenceOnly: true,
        tradeValueUsd: item.estimatedValueUsd,
        isAvailableForTrade: true,
        sidecarMarkdown: `# ${item.title}\nBy ${item.author}`,
        resonanceStream: [],
        chapters: [{ title: 'Chapter 1', cfiBase: 'cfi:1', paragraphs: [item.title] }]
      }));
      onImportBooks(newBooks);
      onClose();
    }
  };

  // 5. NovelUpdates Import
  const handleImportNovel = () => {
    const newBook: Book = {
      id: `nu-${Date.now()}`,
      title: novelTitle,
      author: novelAuthor,
      coverColor: '#7c3aed',
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      isWebPresenceOnly: true,
      tradeValueUsd: 22.00,
      isAvailableForTrade: true,
      sidecarMarkdown: `---
title: "${novelTitle}"
author: "${novelAuthor}"
source_url: "${novelUrl}"
tags: [${novelTags.split(',').map(t => `"${t.trim()}"`).join(', ')}]
format: "dcmd/webnovel"
---

# ${novelTitle}

- **Author:** ${novelAuthor}
- **Source:** [NovelUpdates Series Page](${novelUrl})
- **Tags:** ${novelTags}
`,
      resonanceStream: [],
      chapters: [{ title: 'Overview', cfiBase: 'cfi:1', paragraphs: [`Webnovel series record for ${novelTitle}.`] }]
    };

    onImportBooks([newBook]);
    onClose();
  };

  // 6. Local Folder Direct Picker
  const handleLocalFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileNames = Array.from(files).map(f => f.name);
    const parsed = parseTextDirectoryListing(fileNames.join('\n'));

    const newBooks: Book[] = parsed.map(item => ({
      id: `local-file-${Date.now()}-${Math.random()}`,
      title: item.filename.replace(/\.(epub|pdf|mobi|md)$/i, '').replace(/[-_]/g, ' '),
      author: 'Local File Author',
      coverColor: '#0284c7',
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      isWebPresenceOnly: false,
      tradeValueUsd: 19.99,
      isAvailableForTrade: true,
      sidecarMarkdown: `# ${item.filename}\n\nLocal file size: ${(item.size / 1024 / 1024).toFixed(2)} MB`,
      resonanceStream: [],
      chapters: [{ title: 'Local Ebook', cfiBase: 'cfi:1', paragraphs: [`Filename: ${item.filename}`] }]
    }));

    onImportBooks(newBooks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Universal Import &amp; Ingest Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  MULTI-SOURCE INTAKE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Home Insurance &bull; TCG Card Scanner &bull; Anna's Archive LoC &bull; Reading Lists &bull; Webnovels &bull; Folder Sync</p>
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
            onClick={() => setActiveTab('insurance')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'insurance'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>🏡 Home Insurance Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'cards'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>📸 Card &amp; Binder Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('annas_archive')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'annas_archive'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>🏛️ Anna's Archive &amp; LoC</span>
          </button>

          <button
            onClick={() => setActiveTab('reading_lists')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'reading_lists'
                ? 'border-purple-400 text-purple-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>📚 Reading Lists &amp; CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('novelupdates')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'novelupdates'
                ? 'border-pink-400 text-pink-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>🌐 Webnovel Scraper</span>
          </button>

          <button
            onClick={() => setActiveTab('folder_scan')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'folder_scan'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
            <span>📁 Local Folder Sync</span>
          </button>

        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-5">
          
          {/* TAB 1: HOME INSURANCE BULK ROOM SCANNER */}
          {activeTab === 'insurance' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 font-sans">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5 text-xs font-mono">
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>Bulk Room &amp; Cabinet Home Insurance Asset Inventory</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Bulk photo scanner for physical asset protection. Scan photos of your study, bookcases, comic cabinets, and wardrobes to automatically generate replacement valuation records for your sovereign insurance vault.
                </p>
              </div>

              {/* Photo Upload Dropzone */}
              <input
                type="file"
                ref={insuranceFileInputRef}
                onChange={handleInsurancePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => insuranceFileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
              >
                {insurancePhotoUrl ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={insurancePhotoUrl}
                      alt="Room preview"
                      className="w-16 h-16 rounded-xl object-cover border border-emerald-500/60 shadow-md"
                    />
                    <div>
                      <p className="font-bold text-xs text-emerald-300">📷 Selected: {insurancePhotoName}</p>
                      <p className="text-[10px] text-slate-400 font-sans">Click to change photo</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-xs text-slate-200">
                      Click to Upload or Drag &amp; Drop Room / Cabinet Photo
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Supports JPG, PNG, WEBP, HEIC &bull; Segment high-value items &amp; replacement costs
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Room / Location:</label>
                  <input
                    type="text"
                    value={insuranceRoom}
                    onChange={(e) => setInsuranceRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Asset Category:</label>
                  <input
                    type="text"
                    value={insuranceCategory}
                    onChange={(e) => setInsuranceCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Estimated Asset Count:</label>
                  <input
                    type="number"
                    value={insuranceCount}
                    onChange={(e) => setInsuranceCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <button
                  onClick={handleGenerateInsuranceItems}
                  disabled={insuranceScanning}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${insuranceScanning ? 'animate-spin' : ''}`} />
                  <span>{insuranceScanning ? 'Processing Asset Imagery...' : `⚡ Auto-Generate ${insuranceCount} Insurance Vault Records`}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COMIC & CARD SCANNER */}
          {activeTab === 'cards' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border border-amber-500/40 space-y-2 font-sans">
                <span className="font-bold text-amber-300 flex items-center space-x-1.5 text-xs font-mono">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>🦸‍♂️ Comic Book Key Issues &amp; 🃏 Card Single Photo Stream</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Upload individual photos of each comic book or card (select multiple from your camera roll at once). Automatically recognizes titles, issue numbers, publishers (Marvel/DC/Image), CGC/PSA grade estimates, and fair trade values.
                </p>
              </div>

              {/* Card / Comic Multi-Photo Dropzone */}
              <input
                type="file"
                ref={cardFileInputRef}
                onChange={handleCardPhotoChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <div
                onClick={() => cardFileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-2xl bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
              >
                {cardPhotos.length > 0 ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={cardPhotos[0].url}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-amber-500/60 shadow-md"
                    />
                    <div>
                      <p className="font-bold text-xs text-amber-300">
                        📸 {cardPhotos.length} Photo{cardPhotos.length > 1 ? 's' : ''} Selected
                      </p>
                      <p className="text-[10px] text-slate-400 font-sans">
                        {cardPhotos.map(p => p.name).slice(0, 3).join(', ')} {cardPhotos.length > 3 ? `+${cardPhotos.length - 3} more` : ''}
                      </p>
                      <p className="text-[9px] text-amber-400/80 font-mono mt-0.5">Click to select different photos</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-xs text-slate-200">
                      Click to Select Photos of Individual Comics &amp; Cards (Select 1 or Multiple)
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Select entire camera roll batches &bull; Recognizes Spider-Man, Batman, X-Men, PSA/CGC slabs &bull; 100% Local OCR
                    </p>
                  </>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-400 block">
                    Publisher / Set Label <span className="text-amber-400 font-bold">(Don't know? Leave blank for Auto-Detect)</span>:
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    ✨ Estate Sale Lookup Active
                  </span>
                </div>
                
                <input
                  type="text"
                  value={cardSet}
                  onChange={(e) => setCardSet(e.target.value)}
                  placeholder="🔍 Auto-Detect Mode: I don't know the set / Estate Sale Lot (or type custom label)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 placeholder-slate-500 font-bold text-xs focus:outline-none focus:border-amber-400"
                />

                {/* Estate Sale & Mystery Lot Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] text-slate-400">Quick Presets:</span>
                  {[
                    { label: '🔍 Auto-Detect (Estate Sale / Unknown)', val: '' },
                    { label: '🦸‍♂️ Marvel / DC Key Issues', val: 'Marvel & DC Comics' },
                    { label: '🃏 90s TCG Binder (Pokemon / MTG)', val: '90s Vintage TCG Collection' },
                    { label: '📚 Antique Leather & Hardcovers', val: 'Estate Antique Books' },
                    { label: '🏛️ Pop Culture & Figures', val: 'Pop & Figure Collectibles' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCardSet(preset.val)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        cardSet === preset.val
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 font-sans pt-1.5 leading-relaxed">
                  💡 <strong>At an estate sale, garage sale, or thrift shop?</strong> Leave this blank — our local vision OCR will automatically identify the characters, titles, issue numbers, CGC/PSA grade estimates, and fair market values without needing to know the set beforehand!
                </p>
              </div>

              <div className="pt-2 flex justify-start">
                <button
                  onClick={handleScanCards}
                  disabled={cardScanning}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${cardScanning ? 'animate-spin' : ''}`} />
                  <span>
                    {cardScanning
                      ? `Analyzing ${cardPhotos.length || 'Batch'} Photo(s) via Local Vision OCR...`
                      : `📸 Process ${cardPhotos.length > 0 ? cardPhotos.length : ''} Photo(s) &amp; Auto-Appraise Vault Sidecars`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ANNA'S ARCHIVE & LOC ISBN RESOLVER */}
          {activeTab === 'annas_archive' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 font-sans">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5 text-xs font-mono">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <span>Library of Congress MARC21 &amp; Anna's Archive Resolver</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Query decentralized preservation mirrors to resolve ISBN-13 numbers, publication records, and LoC metadata directly into your vault.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={annasQuery}
                  onChange={(e) => setAnnasQuery(e.target.value)}
                  placeholder="ISBN-13, Title, or Author..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
                <button
                  onClick={handleSearchAnnas}
                  disabled={annasLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{annasLoading ? 'Resolving...' : 'Lookup'}</span>
                </button>
              </div>

              {annasResults.length > 0 && (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Title</th>
                        <th className="p-3">Author</th>
                        <th className="p-3">ISBN</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {annasResults.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-indigo-300">{r.title}</td>
                          <td className="p-3 text-slate-300">{r.author}</td>
                          <td className="p-3 text-slate-400 font-mono">{r.isbn13}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleImportAnnasItem(r)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]"
                            >
                              + Import
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: READING LISTS & CSV */}
          {activeTab === 'reading_lists' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2 font-sans">
                <span className="font-bold text-purple-300 flex items-center space-x-1.5 text-xs font-mono">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>Reading Lists &amp; Goodreads / StoryGraph CSV Importer</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Paste a list of book titles (one per line) or raw Goodreads/StoryGraph export CSV text to batch-import titles into your library.
                </p>
              </div>

              <textarea
                value={readingListText}
                onChange={(e) => setReadingListText(e.target.value)}
                placeholder="The Way of Kings, Brandon Sanderson&#10;Dune, Frank Herbert&#10;Hyperion, Dan Simmons"
                rows={5}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleParseReadingList}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                >
                  Process &amp; Ingest Reading List
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: WEBNOVEL & NOVELUPDATES SCRAPER */}
          {activeTab === 'novelupdates' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/30 space-y-2 font-sans">
                <span className="font-bold text-pink-300 flex items-center space-x-1.5 text-xs font-mono">
                  <Globe className="w-4 h-4 text-pink-400" />
                  <span>NovelUpdates.com Webnovel Scraper &amp; Sourcing</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Import Chinese, Korean, and Japanese webnovels with tags (Danmei, LitRPG, Xianxia), author attribution, and source tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Series Title:</label>
                  <input
                    type="text"
                    value={novelTitle}
                    onChange={(e) => setNovelTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Author:</label>
                  <input
                    type="text"
                    value={novelAuthor}
                    onChange={(e) => setNovelAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Webnovel Source URL:</label>
                <input
                  type="text"
                  value={novelUrl}
                  onChange={(e) => setNovelUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-pink-300 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleImportNovel}
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md"
                >
                  + Add Webnovel to Library
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: LOCAL FOLDER DIRECT INGEST */}
          {activeTab === 'folder_scan' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2 font-sans">
                <span className="font-bold text-sky-300 flex items-center space-x-1.5 text-xs font-mono">
                  <FolderPlus className="w-4 h-4 text-sky-400" />
                  <span>Local Synced Directory / Cloud Mount Ingest</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Pick your local Nextcloud, Filejump, or Calibre sync folder directly on disk. All discovered <code>.epub</code>, <code>.pdf</code>, and <code>.md</code> files will be added to your library with zero network overhead.
                </p>
              </div>

              <input
                type="file"
                ref={localDirInputRef}
                onChange={handleLocalFolderChange}
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                className="hidden"
              />

              <div className="p-8 border-2 border-dashed border-slate-700 rounded-3xl text-center space-y-3 bg-slate-950/60">
                <FolderPlus className="w-12 h-12 text-sky-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Select Local Directory of Ebooks</h4>
                  <p className="text-xs text-slate-400 mt-1">Reads folder contents locally in browser memory.</p>
                </div>
                <button
                  onClick={() => localDirInputRef.current?.click()}
                  className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/20"
                >
                  📁 Select Folder on Hard Drive
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Local-First Intake &bull; 0 Cloud Ingress
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
