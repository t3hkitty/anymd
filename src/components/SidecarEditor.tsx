import React, { useState } from 'react';
import { FileText, Copy, Download, Check, RefreshCw, Sparkles, Tag, User, BookMarked, MessageSquare, Code } from 'lucide-react';

interface SidecarEditorProps {
  markdownContent: string;
  bookTitle: string;
  onUpdateMarkdown: (newContent: string) => void;
}

export const SidecarEditor: React.FC<SidecarEditorProps> = ({
  markdownContent,
  bookTitle,
  onUpdateMarkdown,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'fancy' | 'raw'>('fancy');
  const [editedText, setEditedText] = useState(markdownContent);

  // Parse YAML Frontmatter & Tags
  const authorMatch = markdownContent.match(/author:\s*"(.*?)"/) || markdownContent.match(/author:\s*(.*)/);
  const author = authorMatch ? authorMatch[1].replace(/"/g, '') : 'Unknown Author';

  const tagsMatch = markdownContent.match(/tags:\s*\[(.*?)\]/);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().toLowerCase()) : ['meow', 'companion', 'md'];

  const genreMatch = markdownContent.match(/genre:\s*"(.*?)"/) || markdownContent.match(/genre:\s*(.*)/);
  const genre = genreMatch ? genreMatch[1].replace(/"/g, '') : 'Meow Speculative Fiction';

  const asinMatch = markdownContent.match(/asin:\s*"(.*?)"/);
  const asin = asinMatch ? asinMatch[1] : null;

  // Infer Serials / Series metadata based on author/title
  let serials = 'Standalone Companion Vol. 1';
  if (bookTitle.toLowerCase().includes('chess') || author.toLowerCase().includes('falbo')) {
    serials = 'Fair Quest VR Crafting Series #1';
  } else if (bookTitle.toLowerCase().includes('scum') || author.toLowerCase().includes('mxtx')) {
    serials = 'Cang Qiong Mountain Sect Transmigration Series #1';
  } else if (bookTitle.toLowerCase().includes('carl') || author.toLowerCase().includes('dinniman')) {
    serials = 'World Dungeon Crawl Championship Series #1';
  } else if (bookTitle.toLowerCase().includes('station') || author.toLowerCase().includes('brooks')) {
    serials = 'Station Core Dungeon Engineering Series #1';
  }

  // Parse Recent Tweets appended to sidecar markdown
  const tweetRegex = /### 🐥 Micro-Tweet\s*-\s*\*\*(.*?)\*\*\s*\n>\s*"(.*?)"/g;
  const tweets: { date: string; text: string }[] = [];
  let match;
  while ((match = tweetRegex.exec(markdownContent)) !== null) {
    tweets.push({ date: match[1], text: match[2] });
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${bookTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.companion.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onUpdateMarkdown(editedText);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Sidecar Header Toolbar */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>Companion .md Sidecar File</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                Atomic Markdown
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Section 3.8.B3 &bull; Portable YAML & Resonance Sync</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('fancy')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                activeTab === 'fancy' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Fancy View</span>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                activeTab === 'raw' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3 text-sky-400" />
              <span>Raw Code</span>
            </button>
          </div>

          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => {
                setEditedText(markdownContent);
                setIsEditing(true);
                setActiveTab('raw');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
            >
              Edit Raw
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center space-x-1"
            title="Download .md File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.md</span>
          </button>
        </div>
      </div>

      {/* Editor & Fancy Inspector Workspace */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-950 space-y-6">
        
        {activeTab === 'fancy' && (
          <div className="space-y-6">
            
            {/* Fancy Hero Metadata Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-purple-950/70 border border-indigo-500/40 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
                    <span>{bookTitle}</span>
                  </h2>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs font-mono text-slate-300">
                    <span className="flex items-center space-x-1.5 text-amber-300">
                      <User className="w-3.5 h-3.5" />
                      <span>{author}</span>
                    </span>
                    
                    <span className="flex items-center space-x-1.5 text-purple-300">
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>{serials}</span>
                    </span>

                    {asin && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                        ASIN: {asin}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-sky-300">
                  Genre: {genre}
                </div>
              </div>

              {/* Tag Badges */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-1.5 flex-wrap gap-y-1">
                <Tag className="w-3.5 h-3.5 text-purple-400 mr-1" />
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/40 text-xs font-mono font-medium shadow-sm"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Live Micro-Tweets Feed Section */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Recent Live Micro-Tweets ({tweets.length})</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Appended to Sidecar .md</span>
              </div>

              {tweets.length > 0 ? (
                <div className="space-y-2">
                  {tweets.map((tw, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-sky-300 font-bold">@reader_resonance</span>
                        <span>{tw.date}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium italic">"{tw.text}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center text-xs text-slate-400 font-mono">
                  No micro-tweets recorded yet. Use the 🐥 Micro-Tweet button in the navigation bar to post one!
                </div>
              )}
            </div>

            {/* Raw Sidecar Markdown Code Render */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Companion Sidecar Markdown Document
              </h4>
              <pre className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                {markdownContent}
              </pre>
            </div>

          </div>
        )}

        {activeTab === 'raw' && (
          <div className="h-full space-y-2">
            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full min-h-[350px] h-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <pre className="w-full min-h-[350px] h-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all">
                {markdownContent}
              </pre>
            )}
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="px-6 py-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center space-x-1.5 text-emerald-400">
          <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Real-time Atomic Sync Active</span>
        </span>
        <span>Sidecar Header: ## Reader Resonance Stream</span>
      </div>

    </div>
  );
};
