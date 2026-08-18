import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { scrapeNovelUpdatesMetadata } from '../plugins/novelUpdatesPlugin';
import { X, Search, Sparkles, ExternalLink, Star, Check, Globe } from 'lucide-react';

interface NovelUpdatesModalProps {
  isOpen: boolean;
  book: Book;
  onClose: () => void;
  onUpdateBookSidecar: (bookId: string, updatedSidecarMd: string) => void;
}

export const NovelUpdatesModal: React.FC<NovelUpdatesModalProps> = ({
  isOpen,
  book,
  onClose,
  onUpdateBookSidecar,
}) => {
  const [searchTitle, setSearchTitle] = useState(book.title);
  const [scrapedData, setScrapedData] = useState(scrapeNovelUpdatesMetadata(book.title));
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleScrape = () => {
    const data = scrapeNovelUpdatesMetadata(searchTitle);
    setScrapedData(data);
  };

  const handleApplyToSidecar = () => {
    let md = book.sidecarMarkdown;

    // Inject associated names, rating, dual completion states, and tags into sidecar
    if (!md.includes('novel_updates:')) {
      const nuBlock = `novel_updates:\n  rating: ${scrapedData.rating}\n  publisher: "${scrapedData.originalPublisher}"\n  coo_status: "${scrapedData.statusInCOO}"\n  translation_status: "${scrapedData.translationStatus}"\n  webnovel_state: "${scrapedData.webnovelState}"\n  url: "${scrapedData.novelUpdatesUrl}"\n`;
      md = md.replace(/---\n/, `---\n${nuBlock}`);
    }

    const tagsLine = `tags: [${scrapedData.tags.map(t => `"${t}"`).join(', ')}]`;
    if (md.includes('tags:')) {
      md = md.replace(/tags:\s*\[.*?\]/, tagsLine);
    } else {
      md += `\n${tagsLine}\n`;
    }

    if (!md.includes('#novel-updates')) {
      md += `\n- **[NovelUpdates Metadata]** *Rating: ${scrapedData.rating}/5.0 &bull; COO: ${scrapedData.statusInCOO} &bull; Translation: ${scrapedData.translationStatus}*\n`;
    }

    onUpdateBookSidecar(book.id, md);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">NovelUpdates Webnovel Scraper & Sourcing</h3>
              <p className="text-xs text-slate-400">Scrape Webnovel Tags, Native Titles, Publishers & Chapter Feeds from NovelUpdates.com</p>
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
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search webnovel on NovelUpdates..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleScrape}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shrink-0 flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scrape NovelUpdates</span>
            </button>
          </div>

          {/* Scraped Metadata Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-100">{scrapedData.title}</h4>
                <p className="text-[11px] text-slate-400">Author: {scrapedData.author} &bull; Origin: {scrapedData.type} Webnovel</p>
              </div>

              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{scrapedData.rating} / 5.0</span>
              </div>
            </div>

            {/* Associated Names */}
            {scrapedData.associatedNames.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Native / Associated Titles:</span>
                <p className="text-amber-300 text-xs">{scrapedData.associatedNames.join(' • ')}</p>
              </div>
            )}

            {/* Webnovel Completion Dual States: Completed in COO vs Translated Completely */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  🏆 Country of Origin (COO) Status:
                </span>
                <span className="text-amber-200 font-bold block">{scrapedData.statusInCOO}</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  ✅ Translation Status:
                </span>
                <span className="text-emerald-200 font-bold block">{scrapedData.translationStatus}</span>
              </div>
            </div>

            {/* Publishers & COO Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Original COO Publisher:</span>
                <span className="text-slate-200 font-bold">{scrapedData.originalPublisher}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Licensed English Publisher:</span>
                <span className="text-indigo-300 font-bold">{scrapedData.englishPublisher || 'Unlicensed / Fan Translation'}</span>
              </div>
            </div>

            {/* Genre & Tag Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Scraped Webnovel Tags:</span>
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                {scrapedData.tags.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Canonical Direct Links */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <a
                href={scrapedData.novelUpdatesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-sky-300 hover:underline flex items-center space-x-1"
              >
                <span>View on NovelUpdates.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {scrapedData.officialTranslationUrl && (
                <a
                  href={scrapedData.officialTranslationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center space-x-1"
                >
                  <span>Official Publisher</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">NovelUpdates Scraper v3.8</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyToSidecar}
              disabled={applied}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
            >
              {applied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Applied to Sidecar!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Inject NovelUpdates Metadata to .md</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
