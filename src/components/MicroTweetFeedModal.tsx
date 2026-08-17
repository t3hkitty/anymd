import React, { useState } from 'react';
import type { MicroTweetEntry } from '../types/plugins';
import { X, Send, Hash, Radio } from 'lucide-react';

interface MicroTweetFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostTweet: (entry: MicroTweetEntry) => void;
}

export const MicroTweetFeedModal: React.FC<MicroTweetFeedModalProps> = ({
  isOpen,
  onClose,
  onPostTweet,
}) => {
  const [tweetText, setTweetText] = useState('');
  const [hashtags, setHashtags] = useState('scifi, sovereignReading, LC_MD');

  const sampleTweets: MicroTweetEntry[] = [
    {
      id: 'tw-1',
      text: 'Mindblown by the worldbuilding in Chapter 3! Sovereign reading hits different.',
      content: 'Mindblown by the worldbuilding in Chapter 3! Sovereign reading hits different.',
      timestamp: '10:42 AM',
      formattedDate: '10:42 AM',
      cfi: 'epubcfi(/6/12!/4/2/18/1:42)',
      chapterTitle: 'Chapter 3: The Algorithm',
      hashtags: ['scifi', 'sovereign'],
      tags: ['scifi', 'sovereign'],
      progressPercent: 42
    },
    {
      id: 'tw-2',
      text: 'The companion sidecar structure is ridiculously clean. Zero parenthesis IDs!',
      content: 'The companion sidecar structure is ridiculously clean. Zero parenthesis IDs!',
      timestamp: 'Yesterday',
      formattedDate: 'Yesterday',
      cfi: 'epubcfi(/6/8!/4/2/6/1:12)',
      chapterTitle: 'Chapter 2: Sidecar Philosophy',
      hashtags: ['obsidian', 'koreader'],
      tags: ['obsidian', 'koreader'],
      progressPercent: 28
    }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetText.trim()) return;

    const tagsArr = hashtags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const entry: MicroTweetEntry = {
      id: `tweet-${Date.now()}`,
      text: tweetText,
      content: tweetText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      formattedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cfi: 'epubcfi(/6/14!/4/2/12/1:0)',
      chapterTitle: 'Active Chapter',
      hashtags: tagsArr,
      tags: tagsArr,
      progressPercent: 50
    };

    onPostTweet(entry);
    setTweetText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Live Micro-Tweet Reaction Stream</h3>
              <p className="text-xs text-slate-400">Post Sovereign Reaction Tweets & Auto-Sync to Markdown</p>
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
        <div className="p-6 space-y-4">
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Your Micro-Tweet Reaction
              </label>
              <textarea
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="What emotional gut-punch or narrative twist just hit you?"
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500 resize-none font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Hash className="w-3 h-3 text-sky-400" />
                <span>Sovereign #Hashtags (Comma Separated)</span>
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Micro-Tweet to Sidecar</span>
              </button>
            </div>
          </form>

          {/* Sample Micro-Tweet Feed */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Recent Reaction Feed
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sampleTweets.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-sky-400 font-bold">[{t.formattedDate}]</span>
                    <span className="text-slate-500 font-mono">{t.cfi}</span>
                  </div>
                  <p className="text-slate-200">{t.text}</p>
                  <p className="text-amber-400 font-mono text-[10px]">
                    {t.hashtags.map(h => `#${h}`).join(' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
