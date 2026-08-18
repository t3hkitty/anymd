import React, { useState } from 'react';
import {
  generateNovelUpdatesBookmarklet,
  generateGoodreadsBookmarklet,
  generateYouTubeVodBookmarklet,
  getAppTargetEndpoint
} from '../plugins/bookmarkletGeneratorPlugin';
import type { Book } from '../types/resonance';
import {
  X,
  Bookmark,
  Copy,
  Check,
  Globe,
  BookOpen,
  MousePointer,
  Sparkles,
  FileDown,
  Tv
} from 'lucide-react';

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualImport?: (importedBook: Book) => void;
}

export const BookmarkletModal: React.FC<BookmarkletModalProps> = ({
  isOpen,
  onClose,
  onManualImport
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarklets' | 'manual_paste'>('bookmarklets');
  const [copiedNu, setCopiedNu] = useState(false);
  const [copiedGr, setCopiedGr] = useState(false);
  const [copiedVod, setCopiedVod] = useState(false);

  // Manual Paste State
  const [pasteData, setPasteData] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualTags, setManualTags] = useState('webnovel, translated, danmei, litrpg');
  const [manualRating, setManualRating] = useState('4.8');
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const nuResult = generateNovelUpdatesBookmarklet();
  const grResult = generateGoodreadsBookmarklet();
  const vodResult = generateYouTubeVodBookmarklet();
  const targetHost = getAppTargetEndpoint();

  const handleCopyNu = () => {
    navigator.clipboard.writeText(nuResult.bookmarkletJs);
    setCopiedNu(true);
    setTimeout(() => setCopiedNu(false), 2000);
  };

  const handleCopyGr = () => {
    navigator.clipboard.writeText(grResult.bookmarkletJs);
    setCopiedGr(true);
    setTimeout(() => setCopiedGr(false), 2000);
  };

  const handleCopyVod = () => {
    navigator.clipboard.writeText(vodResult.bookmarkletJs);
    setCopiedVod(true);
    setTimeout(() => setCopiedVod(false), 2000);
  };

  const handleProcessManualPaste = () => {
    let parsedTitle = manualTitle;
    let parsedAuthor = manualAuthor || 'Webnovel Author';
    let parsedTags = manualTags.split(',').map(t => t.trim()).filter(Boolean);
    let parsedRating = manualRating || '4.5';

    // Check if user pasted JSON from the bookmarklet's "Copy JSON" button
    if (pasteData.trim().startsWith('{')) {
      try {
        const obj = JSON.parse(pasteData.trim());
        if (obj.title) parsedTitle = obj.title;
        if (obj.author) parsedAuthor = obj.author;
        if (Array.isArray(obj.tags)) parsedTags = obj.tags;
        if (obj.rating) parsedRating = obj.rating;
      } catch (err) {
        // Not valid JSON, continue with manual inputs
      }
    } else if (pasteData.includes('http')) {
      // User pasted URL or title string
      const lines = pasteData.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0 && !parsedTitle) {
        parsedTitle = lines[0].replace(/https?:\/\/[^/]+\//, '').replace(/[-_]/g, ' ');
      }
    }

    if (!parsedTitle) {
      alert('Please provide a novel title or paste bookmarklet JSON data.');
      return;
    }

    const newBook: Book = {
      id: `imported-${Date.now()}`,
      title: parsedTitle,
      author: parsedAuthor,
      coverColor: '#6366f1',
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      isWebPresenceOnly: true,
      tradeValueUsd: 18.50,
      isAvailableForTrade: true,
      sidecarMarkdown: `---
title: "${parsedTitle}"
author: "${parsedAuthor}"
rating: "${parsedRating}"
tags: [${parsedTags.map(t => `"${t}"`).join(', ')}]
format: "dcmd/webnovel"
sovereign_storage: "local"
---

# ${parsedTitle}

- **Author:** ${parsedAuthor}
- **Rating:** ★ ${parsedRating} / 5.0
- **Tags:** ${parsedTags.map(t => `#${t}`).join(' ')}
- **Imported via:** Bookmarklet & Manual Paste Intake

### 📖 Synopsis & Webnovel Notes
Imported web presence entry. Local markdown sidecar initialized.
`,
      resonanceStream: [],
      chapters: [
        {
          title: 'Chapter 1: Webnovel Overview',
          cfiBase: 'epubcfi(/6/2[ch1]!)',
          paragraphs: [
            `Imported entry for ${parsedTitle} by ${parsedAuthor}.`,
            `Tags: ${parsedTags.join(', ')}`,
            `Rating: ★ ${parsedRating}`
          ]
        }
      ]
    };

    if (onManualImport) {
      onManualImport(newBook);
    }
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>1-Click Browser Bookmarklet & Webnovel Intake</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  POPUP &amp; CSP SAFE
                </span>
              </h3>
              <p className="text-xs text-slate-400">NovelUpdates.com &bull; Goodreads.com &bull; Auto-Popup Overlay &bull; Target: {targetHost}</p>
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
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('bookmarklets')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'bookmarklets'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>1-Click Bookmarklet Tools</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_paste')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'manual_paste'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>📋 Manual Paste / JSON Intake</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-mono text-xs">
          
          {activeTab === 'bookmarklets' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Instructions Box */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <span className="font-bold text-amber-300 flex items-center space-x-1.5 text-xs">
                  <MousePointer className="w-4 h-4 text-amber-400" />
                  <span>How to Install &amp; Use:</span>
                </span>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  1. Drag the golden button below directly to your browser's <strong>Bookmarks Bar</strong> (<kbd className="px-1 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">Ctrl + Shift + B</kbd>).<br />
                  2. Open any <strong>NovelUpdates.com</strong> or <strong>Goodreads.com</strong> book or reading list page.<br />
                  3. Click your bookmarklet. An on-screen floating panel will pop up with <strong>"🚀 Open in LC-MD"</strong> and <strong>"📋 Copy JSON"</strong> buttons!
                </p>
              </div>

              {/* 1. NovelUpdates.com Bookmarklet Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-indigo-300 flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>NovelUpdates.com 1-Click Grabber</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                      Extracts Chinese/Korean/Japanese webnovel titles, tags (Danmei, LitRPG, Cultivation), author, rating &amp; synopsis.
                    </p>
                  </div>

                  {/* Drag button */}
                  <a
                    href={nuResult.bookmarkletJs}
                    onClick={(e) => {
                      // Do not navigate inside app if clicked directly
                      e.preventDefault();
                      alert("👆 Drag this button up to your browser's Bookmarks Bar, or click 'Copy JS Code' below to paste as a bookmark URL!");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-grab active:cursor-grabbing flex items-center space-x-1.5 transition-all shrink-0 select-none"
                    title="Drag this button to your browser Bookmarks Bar!"
                  >
                    <span>🌐 Grab NovelUpdates</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Target Site: novelupdates.com/series/*</span>
                  <button
                    onClick={handleCopyNu}
                    className="text-xs text-sky-300 hover:underline flex items-center space-x-1"
                  >
                    {copiedNu ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNu ? 'Copied JavaScript Code!' : 'Copy JS Bookmarklet Code'}</span>
                  </button>
                </div>
              </div>

              {/* 2. Goodreads.com Bookmarklet Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-yellow-500/40 space-y-3 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-yellow-300 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-yellow-400" />
                      <span>Goodreads Book &amp; Reading List Grabber</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                      Works on both individual book pages and full Goodreads Reading Lists &amp; custom shelves!
                    </p>
                  </div>

                  {/* Drag button */}
                  <a
                    href={grResult.bookmarkletJs}
                    onClick={(e) => {
                      e.preventDefault();
                      alert("👆 Drag this button up to your browser's Bookmarks Bar, or click 'Copy JS Code' below to paste as a bookmark URL!");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-yellow-500/20 cursor-grab active:cursor-grabbing flex items-center space-x-1.5 transition-all shrink-0 select-none"
                    title="Drag this button to your browser Bookmarks Bar!"
                  >
                    <span>📖 Grab Goodreads</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Target Site: goodreads.com/book/* &amp; /list/*</span>
                  <button
                    onClick={handleCopyGr}
                    className="text-xs text-sky-300 hover:underline flex items-center space-x-1"
                  >
                    {copiedGr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGr ? 'Copied JavaScript Code!' : 'Copy JS Bookmarklet Code'}</span>
                  </button>
                </div>
              </div>

              {/* 3. YouTube & Twitch VOD Bookmarklet Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-red-500/40 space-y-3 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-red-300 flex items-center space-x-2">
                      <Tv className="w-4 h-4 text-red-400" />
                      <span>YouTube &amp; Twitch VOD Grabber</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                      Click while viewing any YouTube video, Twitch broadcast, or Kick livestream to capture duration, stream creator, and timestamp chapters!
                    </p>
                  </div>

                  {/* Drag button */}
                  <a
                    href={vodResult.bookmarkletJs}
                    onClick={(e) => {
                      e.preventDefault();
                      alert("👆 Drag this button up to your browser's Bookmarks Bar, or click 'Copy JS Code' below to paste as a bookmark URL!");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs shadow-lg shadow-red-500/20 cursor-grab active:cursor-grabbing flex items-center space-x-1.5 transition-all shrink-0 select-none"
                    title="Drag this button to your browser Bookmarks Bar!"
                  >
                    <span>🎬 Grab VOD Stream</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Target Site: youtube.com/watch &amp; twitch.tv/videos/*</span>
                  <button
                    onClick={handleCopyVod}
                    className="text-xs text-sky-300 hover:underline flex items-center space-x-1"
                  >
                    {copiedVod ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVod ? 'Copied JavaScript Code!' : 'Copy JS Bookmarklet Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manual_paste' && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-300 font-bold block">
                  Paste JSON from Bookmarklet Popup OR Enter Details Manually:
                </span>
                <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder="Paste JSON copied from the bookmarklet popup, or paste a series URL / raw text here..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Title:</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Scum Villain's Self-Saving System"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Author:</label>
                  <input
                    type="text"
                    value={manualAuthor}
                    onChange={(e) => setManualAuthor(e.target.value)}
                    placeholder="e.g. Mo Xiang Tong Xiu"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tags (Comma Separated):</label>
                  <input
                    type="text"
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rating (Out of 5.0):</label>
                  <input
                    type="text"
                    value={manualRating}
                    onChange={(e) => setManualRating(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold"
                  />
                </div>
              </div>

              {importSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>✓ Successfully added webnovel to your sovereign library vault!</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleProcessManualPaste}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Add to Sovereign Library</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Zero Telemetry &bull; Inbound URL &amp; Floating Popup Intake
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
