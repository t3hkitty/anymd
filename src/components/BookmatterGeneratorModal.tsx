import React, { useState, useEffect, useRef } from 'react';
import type { Book } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';
import type { FrontMatterConfig, BackMatterConfig } from '../plugins/bookmatterPlugin';
import {
  generateSovereignFrontMatter,
  generateSovereignBackMatter,
  synthesizeBookmatterFromWebDAVItem
} from '../plugins/bookmatterPlugin';
import {
  fetchWebDAVDirectoryItems,
  parseTextDirectoryListing,
  type WebDAVFileItem
} from '../plugins/webdavIndexerPlugin';
import { RemoteCloudBrowserModal } from './RemoteCloudBrowserModal';
import {
  X,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Folder,
  RefreshCw,
  Layers,
  FileText,
  Cloud,
  Upload
} from 'lucide-react';

interface BookmatterGeneratorModalProps {
  isOpen: boolean;
  books: Book[];
  activeBook: Book | null;
  accounts: CloudAccount[];
  onClose: () => void;
  onUpdateBookSidecar: (bookId: string, updatedSidecar: string) => void;
  onImportNewBooks?: (newBooks: Book[]) => void;
}

export const BookmatterGeneratorModal: React.FC<BookmatterGeneratorModalProps> = ({
  isOpen,
  books,
  activeBook,
  accounts,
  onClose,
  onUpdateBookSidecar,
  onImportNewBooks
}) => {
  const [activeTab, setActiveTab] = useState<'frontmatter' | 'backmatter' | 'webdav_batch' | 'preview'>('frontmatter');
  const [selectedBookId, setSelectedBookId] = useState<string>(activeBook?.id || (books[0]?.id || ''));

  // Front Matter State
  const [frontConfig, setFrontConfig] = useState<FrontMatterConfig>({
    title: activeBook?.title || 'Chronicles of the Sovereign Mind',
    author: activeBook?.author || 'Sovereign Author',
    translator: '',
    originalLanguage: 'English',
    publisher: 'Sovereign Digital Press',
    isbn: '978-0-999999-00-1',
    dedication: 'To the digital archivists and seekers of sovereign liberty.',
    epigraph: 'Knowledge exists only when it is free from surveillance.',
    epigraphAuthor: 'Ancient Library Maxim',
    license: 'Sovereign Private Custody / CC0',
    contentRating: 'General Audience',
    characters: [
      { name: 'Lin Dong', role: 'Protagonist', faction: 'Nine Heavens Sect', notes: 'Master of the Great Desolate Talisman.' },
      { name: 'Xiao Yan', role: 'Ally', faction: 'Falling Star Pavilion', notes: 'Alchemist and wielder of Heavenly Flames.' }
    ],
    pronunciationGuide: [
      { term: 'Xianxia', pinyinOrPhonetic: '/shyen-shyah/', meaning: 'Immortal Heroes fantasy genre' },
      { term: 'Danmei', pinyinOrPhonetic: '/dahn-may/', meaning: 'Chinese romantic webnovel genre' }
    ]
  });

  // Back Matter State
  const [backConfig, setBackConfig] = useState<BackMatterConfig>({
    authorNotes: 'Written in sovereign isolation. Synchronized directly to local device sidecar.',
    glossary: [
      { term: 'Sovereign Vault', category: 'Architecture', definition: 'Zero-telemetry local-first client storage.' },
      { term: 'Resonance CFI', category: 'Reader', definition: 'Canonical Fragment Identifier anchored paragraph markers.' }
    ],
    readingResonanceSummary: true,
    provenanceStamp: {
      vaultId: activeBook?.id || 'sovereign-vault-001',
      tradeValueUsd: activeBook?.tradeValueUsd || 19.99,
      physicalLocation: 'Shelf 3, Main Study',
      sha256Checksum: '8f4e2b9c71a93e8201bfa8294e09f7a8192847c920194857b291039485729104'
    },
    colophon: 'Typeset and structured using Library Companion MD Sovereign Bookmatter Studio.'
  });

  // WebDAV / Directory Batch Ingest State
  const [serverUrl, setServerUrl] = useState<string>(accounts[0]?.serverUrl || 'https://uploads.filejump.com/dav/');
  const [dirPath, setDirPath] = useState<string>('/ebooks');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [discoveredFiles, setDiscoveredFiles] = useState<WebDAVFileItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const localDirInputRef = useRef<HTMLInputElement | null>(null);

  // Copy Feedback
  const [copied, setCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  useEffect(() => {
    if (activeBook) {
      setSelectedBookId(activeBook.id);
      setFrontConfig(prev => ({
        ...prev,
        title: activeBook.title,
        author: activeBook.author,
        provenanceStamp: {
          vaultId: activeBook.id,
          tradeValueUsd: activeBook.tradeValueUsd || 18.50,
          physicalLocation: 'Master Bookcase, Row A',
          sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        }
      }));
    }
  }, [activeBook]);

  if (!isOpen) return null;

  const currentBook = books.find(b => b.id === selectedBookId) || activeBook;

  const generatedFrontMatter = generateSovereignFrontMatter(frontConfig);
  const generatedBackMatter = generateSovereignBackMatter(backConfig, currentBook || undefined);
  const fullGeneratedMarkdown = `${generatedFrontMatter}\n\n# Chapter Body Content\n\n*The text of the volume follows here.*\n\n${generatedBackMatter}`;

  const handleApplyToActiveSidecar = () => {
    if (!currentBook) return;
    let existing = currentBook.sidecarMarkdown || '';
    
    // Cleanly attach or prepend
    const updatedSidecar = `${generatedFrontMatter}\n\n${existing}\n\n${generatedBackMatter}`;
    onUpdateBookSidecar(currentBook.id, updatedSidecar);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2500);
  };

  const handleCopyMarkdown = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add Row Helpers
  const handleAddCharacter = () => {
    setFrontConfig(prev => ({
      ...prev,
      characters: [...(prev.characters || []), { name: 'New Character', role: 'Supporting', faction: 'Alliance', notes: 'Brief bio' }]
    }));
  };

  const handleRemoveCharacter = (idx: number) => {
    setFrontConfig(prev => ({
      ...prev,
      characters: (prev.characters || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddPronunciation = () => {
    setFrontConfig(prev => ({
      ...prev,
      pronunciationGuide: [...(prev.pronunciationGuide || []), { term: 'Term', pinyinOrPhonetic: '/phonetic/', meaning: 'Meaning' }]
    }));
  };

  const handleRemovePronunciation = (idx: number) => {
    setFrontConfig(prev => ({
      ...prev,
      pronunciationGuide: (prev.pronunciationGuide || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddGlossary = () => {
    setBackConfig(prev => ({
      ...prev,
      glossary: [...(prev.glossary || []), { term: 'New Lore Term', category: 'Magic / Tech', definition: 'Description of the concept.' }]
    }));
  };

  const handleRemoveGlossary = (idx: number) => {
    setBackConfig(prev => ({
      ...prev,
      glossary: (prev.glossary || []).filter((_, i) => i !== idx)
    }));
  };

  // WebDAV / Local Sync Scanning
  const handleScanWebDAV = async () => {
    setIsScanning(true);
    setScanNotice(null);
    const selectedAcc = accounts.find(a => a.id === selectedAccountId);
    const res = await fetchWebDAVDirectoryItems(serverUrl, dirPath, selectedAcc);
    setIsScanning(false);

    if (res.error || res.items.length === 0) {
      setScanNotice(res.error || 'No remote XML items found. You can pick a local folder below.');
      const fallback = parseTextDirectoryListing('Sovereign_Novel_1.epub\nCultivation_Chronicles.epub');
      setDiscoveredFiles(fallback);
    } else {
      setDiscoveredFiles(res.items);
    }
  };

  const handleLocalFolderPicked = (fileNames: string[]) => {
    const items = parseTextDirectoryListing(fileNames.join('\n'));
    setDiscoveredFiles(items);
  };

  const handleImportWebDAVBatch = () => {
    if (discoveredFiles.length === 0) return;
    const newBooks = discoveredFiles.map(item =>
      synthesizeBookmatterFromWebDAVItem(serverUrl, dirPath, item)
    );
    if (onImportNewBooks) {
      onImportNewBooks(newBooks);
    }
    onClose();
  };

  const activeAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Sovereign Bookmatter &amp; Directory Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  FRONT &amp; BACK MATTER
                </span>
              </h3>
              <p className="text-xs text-slate-400">Synthesize Title Pages, Character Tables, Glossaries, Provenance Stamps &amp; WebDAV Ingest</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {books.length > 0 && (
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400">Active Book:</span>
                <select
                  value={selectedBookId}
                  onChange={(e) => {
                    setSelectedBookId(e.target.value);
                    const b = books.find(item => item.id === e.target.value);
                    if (b) {
                      setFrontConfig(prev => ({ ...prev, title: b.title, author: b.author }));
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs"
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
            )}
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
            onClick={() => setActiveTab('frontmatter')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'frontmatter'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📜 Front Matter Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('backmatter')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'backmatter'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>📑 Back Matter &amp; Appendix</span>
          </button>

          <button
            onClick={() => setActiveTab('webdav_batch')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'webdav_batch'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>☁️ WebDAV &amp; Directory Batch Ingest</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'preview'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>💾 Live Preview &amp; Exporter</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-5">

          {/* TAB 1: FRONT MATTER STUDIO */}
          {activeTab === 'frontmatter' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Book Title:</label>
                  <input
                    type="text"
                    value={frontConfig.title}
                    onChange={(e) => setFrontConfig({ ...frontConfig, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Author:</label>
                  <input
                    type="text"
                    value={frontConfig.author}
                    onChange={(e) => setFrontConfig({ ...frontConfig, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Translator / Adapter:</label>
                  <input
                    type="text"
                    value={frontConfig.translator || ''}
                    onChange={(e) => setFrontConfig({ ...frontConfig, translator: e.target.value })}
                    placeholder="e.g. Sovereign Translation Guild"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Dedication (Frontispiece):</label>
                  <textarea
                    value={frontConfig.dedication || ''}
                    onChange={(e) => setFrontConfig({ ...frontConfig, dedication: e.target.value })}
                    rows={2}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 resize-none font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Epigraph Quote &amp; Attribution:</label>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={frontConfig.epigraph || ''}
                      onChange={(e) => setFrontConfig({ ...frontConfig, epigraph: e.target.value })}
                      placeholder="Quote..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-sans"
                    />
                    <input
                      type="text"
                      value={frontConfig.epigraphAuthor || ''}
                      onChange={(e) => setFrontConfig({ ...frontConfig, epigraphAuthor: e.target.value })}
                      placeholder="Author / Attribution"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300"
                    />
                  </div>
                </div>
              </div>

              {/* Dramatis Personae (Character Guide) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <span>👥 Dramatis Personae (Character &amp; Faction Guide)</span>
                  </span>
                  <button
                    onClick={handleAddCharacter}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Character</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(frontConfig.characters || []).map((char, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => {
                          const updated = [...(frontConfig.characters || [])];
                          updated[idx].name = e.target.value;
                          setFrontConfig({ ...frontConfig, characters: updated });
                        }}
                        placeholder="Character Name"
                        className="w-1/4 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-100 font-bold"
                      />
                      <input
                        type="text"
                        value={char.role}
                        onChange={(e) => {
                          const updated = [...(frontConfig.characters || [])];
                          updated[idx].role = e.target.value;
                          setFrontConfig({ ...frontConfig, characters: updated });
                        }}
                        placeholder="Role / Archetype"
                        className="w-1/4 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                      />
                      <input
                        type="text"
                        value={char.notes}
                        onChange={(e) => {
                          const updated = [...(frontConfig.characters || [])];
                          updated[idx].notes = e.target.value;
                          setFrontConfig({ ...frontConfig, characters: updated });
                        }}
                        placeholder="Short lore / abilities note"
                        className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 font-sans"
                      />
                      <button
                        onClick={() => handleRemoveCharacter(idx)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-950"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pronunciation & Pinyin Key */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 flex items-center space-x-1.5">
                    <span>🗣️ Pronunciation &amp; Pinyin Guide</span>
                  </span>
                  <button
                    onClick={handleAddPronunciation}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Pronunciation Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(frontConfig.pronunciationGuide || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        value={item.term}
                        onChange={(e) => {
                          const updated = [...(frontConfig.pronunciationGuide || [])];
                          updated[idx].term = e.target.value;
                          setFrontConfig({ ...frontConfig, pronunciationGuide: updated });
                        }}
                        placeholder="Term / Name"
                        className="w-1/4 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-100 font-bold"
                      />
                      <input
                        type="text"
                        value={item.pinyinOrPhonetic}
                        onChange={(e) => {
                          const updated = [...(frontConfig.pronunciationGuide || [])];
                          updated[idx].pinyinOrPhonetic = e.target.value;
                          setFrontConfig({ ...frontConfig, pronunciationGuide: updated });
                        }}
                        placeholder="/phonetic or pinyin/"
                        className="w-1/4 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-sky-300"
                      />
                      <input
                        type="text"
                        value={item.meaning}
                        onChange={(e) => {
                          const updated = [...(frontConfig.pronunciationGuide || [])];
                          updated[idx].meaning = e.target.value;
                          setFrontConfig({ ...frontConfig, pronunciationGuide: updated });
                        }}
                        placeholder="Definition / Cultural context"
                        className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 font-sans"
                      />
                      <button
                        onClick={() => handleRemovePronunciation(idx)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-950"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACK MATTER & APPENDIX STUDIO */}
          {activeTab === 'backmatter' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Author &amp; Translator Afterword / Notes:</label>
                <textarea
                  value={backConfig.authorNotes || ''}
                  onChange={(e) => setBackConfig({ ...backConfig, authorNotes: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 resize-none font-sans text-xs"
                />
              </div>

              {/* Lore Lexicon & Worldbuilding Glossary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                    <span>📖 Lore Lexicon &amp; Worldbuilding Glossary</span>
                  </span>
                  <button
                    onClick={handleAddGlossary}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Glossary Term</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(backConfig.glossary || []).map((g, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        value={g.term}
                        onChange={(e) => {
                          const updated = [...(backConfig.glossary || [])];
                          updated[idx].term = e.target.value;
                          setBackConfig({ ...backConfig, glossary: updated });
                        }}
                        placeholder="Lore Concept"
                        className="w-1/4 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-100 font-bold"
                      />
                      <input
                        type="text"
                        value={g.category}
                        onChange={(e) => {
                          const updated = [...(backConfig.glossary || [])];
                          updated[idx].category = e.target.value;
                          setBackConfig({ ...backConfig, glossary: updated });
                        }}
                        placeholder="Category"
                        className="w-1/4 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300"
                      />
                      <input
                        type="text"
                        value={g.definition}
                        onChange={(e) => {
                          const updated = [...(backConfig.glossary || [])];
                          updated[idx].definition = e.target.value;
                          setBackConfig({ ...backConfig, glossary: updated });
                        }}
                        placeholder="Lore definition and rules"
                        className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 font-sans"
                      />
                      <button
                        onClick={() => handleRemoveGlossary(idx)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-950"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provenance & Trade Stamp */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-emerald-300 block">🏛️ Sovereign Vault Provenance &amp; Trade Certificate</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Fair Trade Value ($ USD):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={backConfig.provenanceStamp?.tradeValueUsd || 19.99}
                      onChange={(e) => setBackConfig({
                        ...backConfig,
                        provenanceStamp: {
                          ...backConfig.provenanceStamp,
                          vaultId: backConfig.provenanceStamp?.vaultId || 'vault-1',
                          tradeValueUsd: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Physical Shelf / Vault Location:</label>
                    <input
                      type="text"
                      value={backConfig.provenanceStamp?.physicalLocation || ''}
                      onChange={(e) => setBackConfig({
                        ...backConfig,
                        provenanceStamp: {
                          ...backConfig.provenanceStamp,
                          vaultId: backConfig.provenanceStamp?.vaultId || 'vault-1',
                          tradeValueUsd: backConfig.provenanceStamp?.tradeValueUsd || 19.99,
                          physicalLocation: e.target.value
                        }
                      })}
                      placeholder="e.g. Master Library, Shelf B-2"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">SHA-256 Vault Hash:</label>
                    <input
                      type="text"
                      value={backConfig.provenanceStamp?.sha256Checksum || ''}
                      onChange={(e) => setBackConfig({
                        ...backConfig,
                        provenanceStamp: {
                          ...backConfig.provenanceStamp,
                          vaultId: backConfig.provenanceStamp?.vaultId || 'vault-1',
                          tradeValueUsd: backConfig.provenanceStamp?.tradeValueUsd || 19.99,
                          sha256Checksum: e.target.value
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEBDAV & DIRECTORY BATCH INGEST */}
          {activeTab === 'webdav_batch' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-2">
                <span className="font-bold text-sky-300 flex items-center space-x-1.5">
                  <Cloud className="w-4 h-4 text-sky-400" />
                  <span>Automated WebDAV / Local Directory Bookmatter Synthesis:</span>
                </span>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  Scan any WebDAV cloud server (Filejump, Koofr, Nextcloud) or pick a local synced directory. Every discovered ebook will be automatically synthesized into a complete sovereign book record with generated Front Matter, Back Matter, and Sidecar metadata!
                </p>
              </div>

              {/* Endpoint & Folder Selection Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Select Cloud Account:</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => {
                      setSelectedAccountId(e.target.value);
                      const acc = accounts.find(a => a.id === e.target.value);
                      if (acc) setServerUrl(acc.serverUrl);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.presetId})</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">WebDAV Server &amp; Folder Path:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                    />
                    <input
                      type="text"
                      value={dirPath}
                      onChange={(e) => setDirPath(e.target.value)}
                      className="w-32 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold"
                    />
                    <button
                      onClick={() => setIsBrowserOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                      title="Open Remote Folder Browser"
                    >
                      <Folder className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scan Buttons & Local Folder Fallback */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleScanWebDAV}
                    disabled={isScanning}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning WebDAV...' : '📡 Scan WebDAV Server'}</span>
                  </button>

                  <input
                    type="file"
                    ref={localDirInputRef}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleLocalFolderPicked(Array.from(files).map(f => f.name));
                      }
                    }}
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                  />

                  <button
                    onClick={() => localDirInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>📁 Pick Local Synced Directory</span>
                  </button>
                </div>

                {discoveredFiles.length > 0 && (
                  <button
                    onClick={handleImportWebDAVBatch}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Batch Synthesize Bookmatter ({discoveredFiles.length} Books)</span>
                  </button>
                )}
              </div>

              {scanNotice && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  {scanNotice}
                </div>
              )}

              {/* Discovered Files Table */}
              {discoveredFiles.length > 0 && (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">File</th>
                        <th className="p-3">Synthesized Book Title</th>
                        <th className="p-3 text-right">Size</th>
                        <th className="p-3 text-right">Modified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {discoveredFiles.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="p-3 text-slate-400 font-mono flex items-center space-x-2">
                            <span>📄</span>
                            <span>{f.filename}</span>
                          </td>
                          <td className="p-3 font-bold text-amber-300">
                            {f.filename.replace(/\.(epub|pdf|mobi|azw3|md|txt)$/i, '').replace(/[-_]/g, ' ')}
                          </td>
                          <td className="p-3 text-right text-slate-400">
                            {(f.size / 1024 / 1024).toFixed(2)} MB
                          </td>
                          <td className="p-3 text-right text-slate-500">{f.lastModified}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIVE PREVIEW & EXPORTER */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleApplyToActiveSidecar}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Append to Active Book Sidecar</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile(`${frontConfig.title.replace(/\s+/g, '_')}_frontmatter.md`, generatedFrontMatter)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>_frontmatter.md</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile(`${frontConfig.title.replace(/\s+/g, '_')}_backmatter.md`, generatedBackMatter)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>_backmatter.md</span>
                  </button>
                </div>

                <button
                  onClick={() => handleCopyMarkdown(fullGeneratedMarkdown)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Full Markdown!' : 'Copy Full Markdown'}</span>
                </button>
              </div>

              {appliedNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>✓ Successfully updated sidecar markdown for "{currentBook?.title}"!</span>
                </div>
              )}

              {/* Rendered Code Preview Container */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-[380px]">
                {fullGeneratedMarkdown}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Zero Telemetry &bull; Client-Side Sovereign Bookmatter Generation
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close Studio
          </button>
        </div>

      </div>

      {/* Nested Remote Cloud Browser Modal */}
      {activeAccount && (
        <RemoteCloudBrowserModal
          isOpen={isBrowserOpen}
          account={activeAccount}
          initialPath={dirPath || '/'}
          onClose={() => setIsBrowserOpen(false)}
          onSelectFolder={(selectedPath) => setDirPath(selectedPath)}
          onLocalFolderPicked={handleLocalFolderPicked}
        />
      )}

    </div>
  );
};
