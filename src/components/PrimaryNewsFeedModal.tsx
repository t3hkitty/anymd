import React, { useState } from 'react';
import type { CuratedCollection } from '../types/mediaTypes';
import type { PrimaryNewsItem } from '../plugins/primaryNewsFeedPlugin';
import { getPrimaryNewsForCollection } from '../plugins/primaryNewsFeedPlugin';
import { X, Newspaper, ExternalLink, ShieldCheck, Sparkles, Plus, Globe, Tag } from 'lucide-react';

interface PrimaryNewsFeedModalProps {
  isOpen: boolean;
  activeCollectionId: string;
  collections: CuratedCollection[];
  onClose: () => void;
}

export const PrimaryNewsFeedModal: React.FC<PrimaryNewsFeedModalProps> = ({
  isOpen,
  activeCollectionId,
  collections,
  onClose,
}) => {
  const [selectedColId, setSelectedColId] = useState<string>(activeCollectionId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customNewsList, setCustomNewsList] = useState<PrimaryNewsItem[]>([]);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');

  if (!isOpen) return null;

  const currentCollection = collections.find(c => c.id === selectedColId);
  const colName = currentCollection ? currentCollection.name : 'All Collections';

  const defaultNews = selectedColId === 'all'
    ? collections.flatMap(c => getPrimaryNewsForCollection(c.id, c.name))
    : getPrimaryNewsForCollection(selectedColId, colName);

  const rawNews = [...customNewsList.filter(n => selectedColId === 'all' || n.collectionId === selectedColId), ...defaultNews];

  const allNews = selectedCategory === 'all'
    ? rawNews
    : rawNews.filter(n => n.category === selectedCategory);

  const handleAddCustomNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSourceUrl) return;

    const item: PrimaryNewsItem = {
      id: `news-user-${Date.now()}`,
      collectionId: selectedColId === 'all' ? 'pop-collection' : selectedColId,
      title: newTitle,
      sourceName: newSourceName || 'Official Primary Source',
      sourceUrl: newSourceUrl,
      isPrimarySource: true,
      publishedDate: new Date().toISOString().split('T')[0],
      summary: `User-verified primary source feed item from ${newSourceName || 'official publisher/author site'}.`,
      category: 'Official Release',
      badge: '🏛️ User-Verified Primary Source'
    };

    setCustomNewsList(prev => [item, ...prev]);
    setNewTitle('');
    setNewSourceUrl('');
    setNewSourceName('');
    setIsAddingSource(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Collection Primary Source News Feed</h3>
              <p className="text-xs text-slate-400">Direct News & Releases Sourced Exclusively from Verified Primary IP Owners, Grading Authorities & Publishers</p>
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
          
          {/* Collection Switcher & Add Source Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-slate-400 font-bold shrink-0">Collection:</span>
              <select
                value={selectedColId}
                onChange={(e) => setSelectedColId(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:outline-none"
              >
                <option value="all">🌟 All Collections ({collections.length})</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAddingSource(!isAddingSource)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-300 font-bold flex items-center space-x-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Primary Source RSS / URL</span>
            </button>
          </div>

          {/* Primary Source Category Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 font-mono text-xs">
            {[
              { id: 'all', label: '🌐 All Primary Feeds' },
              { id: 'NYT Bestsellers', label: '📈 NYT Bestsellers' },
              { id: 'Kindle Top 100', label: '🔥 Kindle Top 100' },
              { id: 'eBay Sold Market', label: '🏷️ eBay Sold Market' },
              { id: 'Official Release', label: '🏛️ Publisher Releases' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl transition-all shrink-0 border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-900 border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Form to Add Custom Primary RSS / URL */}
          {isAddingSource && (
            <form onSubmit={handleAddCustomNews} className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/60 space-y-3 font-mono animate-fadeIn">
              <h4 className="font-bold text-xs text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Register Custom Primary Source Feed</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Headline / Release Title (e.g. MXTX Book 4 Hardcover Release)"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  required
                />
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="Primary Source Name (e.g. Seven Seas Entertainment)"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="Primary URL (https://publisher.com/press-release)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-sky-300"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shrink-0"
                >
                  Save Primary Source
                </button>
              </div>
            </form>
          )}

          {/* Primary News Items List */}
          <div className="space-y-4">
            {allNews.map((news) => (
              <div
                key={news.id}
                className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800 hover:border-indigo-500/60 transition-all space-y-3 group shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{news.badge}</span>
                      </span>
                      {news.priceOrRankInfo && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                          {news.priceOrRankInfo}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-400">
                        {news.publishedDate}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                      {news.title}
                    </h4>
                  </div>

                  <a
                    href={news.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all shrink-0"
                    title={`Open verified primary source on ${news.sourceName}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {news.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Source: <strong className="text-slate-200">{news.sourceName}</strong></span>
                  </span>
                  <a
                    href={news.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline flex items-center space-x-1 font-bold"
                  >
                    <span>Read Primary Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Showing {allNews.length} verified primary source bulletins</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
