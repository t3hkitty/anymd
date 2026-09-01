import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { CommunitySidecarTemplate, CommunityForumThread } from '../plugins/communityHubPlugin';
import { getSavedCommunityTemplates, saveCommunityTemplates, COMMUNITY_FORUM_THREADS } from '../plugins/communityHubPlugin';
import { Globe, Download, ThumbsUp, MessageSquare, Plus, Sparkles, Pin, Check, Search } from 'lucide-react';

interface CommunityHubViewProps {
  books: Book[];
  activeBook?: Book;
  onImportSidecarTemplate: (templateMarkdown: string, title: string) => void;
}

export const CommunityHubView: React.FC<CommunityHubViewProps> = ({
  activeBook,
  onImportSidecarTemplate,
}) => {
  const [templates, setTemplates] = useState<CommunitySidecarTemplate[]>(getSavedCommunityTemplates);
  const [threads, setThreads] = useState<CommunityForumThread[]>(COMMUNITY_FORUM_THREADS);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'forums' | 'leaderboard' | 'prefilled-vaults'>('marketplace');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isPublishingTemplate, setIsPublishingTemplate] = useState(false);
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplCategory, setNewTplCategory] = useState<'Danmei & Webnovels' | 'TCG Grails' | 'LitRPG' | 'Pop Relics' | 'Wardrobe'>('Danmei & Webnovels');
  const [newTplDescription, setNewTplDescription] = useState('');
  
  const [isPostingThread, setIsPostingThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('📚 LitRPG & Webnovel Guild');
  const [newThreadSnippet, setNewThreadSnippet] = useState('');

  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [repliesMap, setRepliesMap] = useState<Record<string, { author: string; text: string; timestamp: string }[]>>({});
  const [replyInputText, setReplyInputText] = useState('');

  const [importedSuccessId, setImportedSuccessId] = useState<string | null>(null);

  const filteredTemplates = templates.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleUpvoteTemplate = (id: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, upvotesCount: t.upvotesCount + 1 } : t);
    setTemplates(updated);
    saveCommunityTemplates(updated);
  };

  const handleUpvoteThread = (id: string) => {
    setThreads(prev => prev.map(th => th.id === id ? { ...th, upvotesCount: th.upvotesCount + 1 } : th));
  };

  const handlePublishActiveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim() || !newTplDescription.trim()) return;

    const newTpl: CommunitySidecarTemplate = {
      id: `tpl-user-${Date.now()}`,
      title: newTplTitle,
      category: newTplCategory,
      authorName: 'You (Meow User)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      downloadsCount: 1,
      upvotesCount: 1,
      description: newTplDescription,
      tags: ['community', 'user-published', newTplCategory.toLowerCase().replace(/[^a-z]/g, '')],
      markdownPreview: activeBook ? activeBook.sidecarMarkdown : `# ${newTplTitle}\n`
    };

    const updated = [newTpl, ...templates];
    setTemplates(updated);
    saveCommunityTemplates(updated);
    setNewTplTitle('');
    setNewTplDescription('');
    setIsPublishingTemplate(false);
  };

  const handlePostThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadSnippet.trim()) return;

    const newTh: CommunityForumThread = {
      id: `thread-${Date.now()}`,
      title: newThreadTitle,
      category: newThreadCategory,
      authorName: 'You (Meow User)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      repliesCount: 0,
      upvotesCount: 1,
      timestamp: 'Just now',
      snippet: newThreadSnippet
    };

    setThreads([newTh, ...threads]);
    setNewThreadTitle('');
    setNewThreadSnippet('');
    setIsPostingThread(false);
  };

  const handleImportToVault = (tpl: CommunitySidecarTemplate) => {
    onImportSidecarTemplate(tpl.markdownPreview, tpl.title);
    setImportedSuccessId(tpl.id);
    setTimeout(() => setImportedSuccessId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto overflow-y-auto pr-1">
      
      {/* Community Hero Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-4 z-10">
          <div className="p-3.5 rounded-3xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-600/30 shrink-0">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-xl text-slate-100 tracking-tight">Meow Community Hub & Marketplace</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                ONLINE COMMUNITY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Exchange `.companion.md` sidecar templates, join LitRPG & Danmei reading clubs, discuss TCG card valuations, and connect across self-hosted nodes.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs z-10 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-amber-400 font-bold block text-sm">4,250+</span>
            <span className="text-[10px] text-slate-400 uppercase">Sidecar Downloads</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-sky-400 font-bold block text-sm">158</span>
            <span className="text-[10px] text-slate-400 uppercase">Forum Threads</span>
          </div>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 Sidecar Vault Marketplace ({templates.length})
          </button>

          <button
            onClick={() => setActiveTab('forums')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'forums'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            💬 Community Forums & Clubs ({threads.length})
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 Leaderboards
          </button>

          <button
            onClick={() => setActiveTab('prefilled-vaults')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'prefilled-vaults'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏛️ Prefilled Public Vaults
          </button>
        </div>

        {activeTab === 'marketplace' && (
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sidecars..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setIsPublishingTemplate(!isPublishingTemplate)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md flex items-center space-x-1 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Publish Sidecar</span>
            </button>
          </div>
        )}

        {activeTab === 'forums' && (
          <button
            onClick={() => setIsPostingThread(!isPostingThread)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md flex items-center space-x-1 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Thread</span>
          </button>
        )}
      </div>

      {/* Form: Publish Sidecar Template to Community */}
      {isPublishingTemplate && activeTab === 'marketplace' && (
        <form onSubmit={handlePublishActiveBook} className="p-5 rounded-3xl bg-indigo-950/60 border border-indigo-500/60 space-y-4 font-mono text-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-500/40 pb-2">
            <h4 className="font-bold text-sm text-indigo-200 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Publish Sidecar Template to Community Marketplace</span>
            </h4>
            <span className="text-slate-400">Targeting: {activeBook?.title || 'Active Book Sidecar'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTplTitle}
              onChange={(e) => setNewTplTitle(e.target.value)}
              placeholder="Template Name (e.g. MXTX Danmei Sidecar Schema)"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              required
            />

            <select
              value={newTplCategory}
              onChange={(e) => setNewTplCategory(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold"
            >
              <option value="Danmei & Webnovels">Danmei & Webnovels</option>
              <option value="TCG Grails">TCG Grails</option>
              <option value="LitRPG">LitRPG</option>
              <option value="Pop Relics">Pop Relics</option>
              <option value="Wardrobe">Wardrobe</option>
            </select>
          </div>

          <textarea
            value={newTplDescription}
            onChange={(e) => setNewTplDescription(e.target.value)}
            placeholder="Detailed description of what YAML fields & sidecar notes this template provides..."
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 resize-none"
            required
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Will publish sidecar contents of "{activeBook?.title || 'Selected Item'}"</span>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
            >
              Publish to Marketplace
            </button>
          </div>
        </form>
      )}

      {/* Form: Post New Forum Thread */}
      {isPostingThread && activeTab === 'forums' && (
        <form onSubmit={handlePostThread} className="p-5 rounded-3xl bg-indigo-950/60 border border-indigo-500/60 space-y-4 font-mono text-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-500/40 pb-2">
            <h4 className="font-bold text-sm text-indigo-200 uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Post New Community Discussion Thread</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              placeholder="Thread Title (e.g. Favorite Webnovel Translators & Sidecars?)"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              required
            />

            <select
              value={newThreadCategory}
              onChange={(e) => setNewThreadCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-300 font-bold"
            >
              <option value="📚 LitRPG & Webnovel Guild">📚 LitRPG & Webnovel Guild</option>
              <option value="🌸 Danmei & Asian Webnovel Lounge">🌸 Danmei & Asian Webnovel Lounge</option>
              <option value="🃏 TCG Grails Exchange">🃏 TCG Grails Exchange</option>
              <option value="☁️ Self-Hosting & Midphase">☁️ Self-Hosting & Midphase</option>
            </select>
          </div>

          <textarea
            value={newThreadSnippet}
            onChange={(e) => setNewThreadSnippet(e.target.value)}
            placeholder="Share your thoughts, questions, or sidecar recommendations..."
            rows={3}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 resize-none"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
            >
              Post Community Thread
            </button>
          </div>
        </form>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
            {['all', 'Danmei & Webnovels', 'TCG Grails', 'LitRPG', 'Pop Relics', 'Wardrobe'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {cat === 'all' ? '✨ All Categories' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={tpl.authorAvatar}
                        alt={tpl.authorName}
                        className="w-10 h-10 rounded-full border border-indigo-400 object-cover"
                      />
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                          {tpl.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">By {tpl.authorName}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold shrink-0">
                      {tpl.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {tpl.description}
                  </p>

                  <div className="flex items-center space-x-1 flex-wrap gap-1 font-mono text-[10px]">
                    {tpl.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[10px] overflow-hidden">
                    <pre className="text-emerald-400 max-h-20 overflow-y-auto whitespace-pre-wrap">{tpl.markdownPreview}</pre>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <button
                      onClick={() => handleUpvoteTemplate(tpl.id)}
                      className="flex items-center space-x-1 hover:text-amber-400 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{tpl.upvotesCount}</span>
                    </button>

                    <span className="flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>{tpl.downloadsCount} downloads</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleImportToVault(tpl)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition-all ${
                      importedSuccessId === tpl.id
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                    }`}
                  >
                    {importedSuccessId === tpl.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Imported to Vault!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Import Template</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forum Threads Tab */}
      {activeTab === 'forums' && (
        <div className="space-y-4">
          {threads.map((th) => {
            const isExpanded = expandedThreadId === th.id;
            const currentReplies = repliesMap[th.id] || [
              { author: 'DanmeiScholar', text: 'This is super helpful! Saved it directly to my Zettel vault.', timestamp: '2 hours ago' },
              { author: 'MeowArchivist', text: 'Confirmed working on Port 3050 local webhook gateway.', timestamp: '1 hour ago' }
            ];

            return (
              <div
                key={th.id}
                className={`p-5 rounded-3xl border transition-all space-y-3 shadow-xl ${
                  th.pinned
                    ? 'bg-slate-900 border-amber-500/60 shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {th.pinned && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center space-x-1">
                          <Pin className="w-3 h-3 text-amber-400" />
                          <span>PINNED ANNOUNCEMENT</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold">
                        {th.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{th.timestamp}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-100 hover:text-amber-300 transition-colors">
                      {th.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
                    <button
                      onClick={() => handleUpvoteThread(th.id)}
                      className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-400 flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{th.upvotesCount}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  {th.snippet}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center space-x-2">
                    <img src={th.authorAvatar} alt={th.authorName} className="w-5 h-5 rounded-full object-cover" />
                    <span>Posted by <strong className="text-slate-200">{th.authorName}</strong></span>
                  </span>

                  <button
                    onClick={() => setExpandedThreadId(isExpanded ? null : th.id)}
                    className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-bold transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{th.repliesCount + currentReplies.length - 2} replies {isExpanded ? '▲ Hide' : '▼ View'}</span>
                  </button>
                </div>

                {/* Expanded Thread Replies & Reply Form */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 font-mono text-xs animate-fadeIn">
                    <h4 className="font-bold text-slate-200 text-xs">💬 Community Discussion Replies ({currentReplies.length})</h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentReplies.map((rep, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-sky-300">@{rep.author}</span>
                            <span className="text-slate-500">{rep.timestamp}</span>
                          </div>
                          <p className="text-slate-300 text-xs font-sans">{rep.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={replyInputText}
                        onChange={(e) => setReplyInputText(e.target.value)}
                        placeholder="Write a reply to this thread..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        onClick={() => {
                          if (!replyInputText.trim()) return;
                          const newRep = { author: 'You (Local Neko)', text: replyInputText.trim(), timestamp: 'Just now' };
                          setRepliesMap(prev => ({
                            ...prev,
                            [th.id]: [...(prev[th.id] || currentReplies), newRep]
                          }));
                          setReplyInputText('');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Community Top Sidecar Contributors & Readers</span>
          </h3>

          <div className="space-y-3">
            {[
              { rank: 1, name: 'DanmeiScholar', title: 'Top Sidecar Architect', points: '14,250 pts', badge: '🥇 Meow Master' },
              { rank: 2, name: 'DungeonMasterCarl', title: 'LitRPG Guild Champion', points: '11,890 pts', badge: '🥈 Guild Master' },
              { rank: 3, name: 'TCG_Collector99', title: 'PSA 10 Grail Authenticator', points: '9,450 pts', badge: '🥉 Grail Curator' }
            ].map(user => (
              <div key={user.rank} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-base text-amber-400 w-6">#{user.rank}</span>
                  <div>
                    <span className="font-bold text-slate-100 block">{user.name}</span>
                    <span className="text-[11px] text-slate-400">{user.title}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-indigo-300 block">{user.points}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{user.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prefilled Public Vaults Tab */}
      {activeTab === 'prefilled-vaults' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 font-mono text-xs shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wider flex items-center space-x-2">
                <span>🏛️</span>
                <span>Prefilled Public Vaults (Community Registry)</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Download or directly import pre-seeded vault templates directly into your local Markdown workspace.
              </p>
            </div>
            <a
              href="https://github.com/t3hkitty/anymd-public-vaults"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold transition-all"
            >
              Open Repo ➔
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'lcmd-sandbox-core',
                name: 'LCMD Sandbox Core Vault',
                description: 'Pre-populated sandbox files featuring early prototype templates, zettels, and custom configurations.',
                fileCount: 24,
                size: '154 KB',
                sampleNotes: [
                  { title: 'LCMD Sandbox Manifest.md', content: '---\ntitle: LCMD Sandbox Manifest\ntags: [lcmd, sandbox]\n---\n# LCMD Core Vault\nPre-seeded prototype notes.' },
                  { title: 'Zettel Architecture Guide.md', content: '---\ntitle: Zettel Guide\ntags: [zettel, guide]\n---\n# Zettelkasten Architecture\nAtomic markdown notes.' }
                ]
              },
              {
                id: 'danmei-mxtx-companion',
                name: 'Danmei & MXTX Companion Vault',
                description: 'Complete companion Markdown files for Mo Xiang Tong Xiu webnovels, rating metrics, and sidecar cards.',
                fileCount: 42,
                size: '280 KB',
                sampleNotes: [
                  { title: 'MXTX Danmei Overview.md', content: '---\ntitle: MXTX Danmei Companion\ntags: [danmei, mxtx]\n---\n# Grandmaster & Heaven Official Lore\nCharacters, sects, and chapter logs.' }
                ]
              },
              {
                id: 'tcg-grail-valuation',
                name: 'TCG Grail & Card Valuation Vault',
                description: 'Pre-seeded catalog featuring popular Pokémon, MtG, and Yu-Gi-Oh cards, grading metrics, and transaction ledgers.',
                fileCount: 18,
                size: '98 KB',
                sampleNotes: [
                  { title: 'TCG Grail Valuation Index.md', content: '---\ntitle: TCG Grail Index\ntags: [tcg, grail]\n---\n# Card Valuation Ledger\nPSA 10 and BGS 9.5 grail logs.' }
                ]
              },
              {
                id: 'audhd-life-companion',
                name: 'AuDHD Life Companion Tracker Vault',
                description: 'Fully customized templates for daily pacing, executive dysfunction tracking, and grounding exercises.',
                fileCount: 31,
                size: '185 KB',
                sampleNotes: [
                  { title: 'AuDHD Pacing Template.md', content: '---\ntitle: AuDHD Daily Pacing\ntags: [audhd, pacing]\n---\n# Daily Executive Energy Tracker\nPacing metrics and grounding prompts.' }
                ]
              }
            ].map(vault => (
              <div key={vault.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-100 text-sm">{vault.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
                      {vault.size}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-sans leading-relaxed">
                    {vault.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500">{vault.fileCount} pre-seeded notes</span>
                  <button
                    onClick={() => {
                      vault.sampleNotes.forEach(sn => {
                        const cleanName = sn.title.replace(/[^a-zA-Z0-9_\-.]/g, '_');
                        localStorage.setItem(`anymd_file_anymd-main_${cleanName}`, sn.content);
                      });
                      alert(`⚡ Direct Import Success! Pre-seeded "${vault.name}" notes imported cleanly into active vault.`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>⚡ Direct Import into Vault</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
