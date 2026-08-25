import React, { useState } from 'react';
import type { MicroTweetEntry } from '../types/plugins';
import { getActiveProfile } from '../plugins/profileManagementPlugin';
import {
  X,
  Send,
  Hash,
  Radio,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  FileEdit,
  MessageSquareHeart,
  EyeOff
} from 'lucide-react';

interface MicroTweetFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostTweet: (entry: MicroTweetEntry) => void;
  onSaveReviewToSidecar?: (reviewMarkdown: string) => void;
}

export const MicroTweetFeedModal: React.FC<MicroTweetFeedModalProps> = ({
  isOpen,
  onClose,
  onPostTweet,
  onSaveReviewToSidecar
}) => {
  const [tweetText, setTweetText] = useState('');
  const [hashtags, setHashtags] = useState('reviewDraft, hotTake, meowVault');
  const [reactionRating, setReactionRating] = useState<number>(5);
  const [reviewMode, setReviewMode] = useState<'casual_take' | 'spoiler_rant' | 'formal_review'>('casual_take');
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [copiedReview, setCopiedReview] = useState(false);

  const activeProfile = getActiveProfile();

  const [feedItems, setFeedItems] = useState<MicroTweetEntry[]>([
    {
      id: 'tw-1',
      text: 'Mindblown by the worldbuilding in Chapter 3! The magic system economy is genuinely brilliant.',
      content: 'Mindblown by the worldbuilding in Chapter 3! The magic system economy is genuinely brilliant.',
      timestamp: '10:42 AM',
      formattedDate: '10:42 AM',
      cfi: 'epubcfi(/6/12!/4/2/18/1:42)',
      chapterTitle: 'Chapter 3: The Algorithm',
      hashtags: ['worldbuilding', 'magicEconomy', '5Stars'],
      tags: ['worldbuilding', 'magicEconomy', '5Stars'],
      progressPercent: 42
    },
    {
      id: 'tw-2',
      text: 'The character banter between the two leads is immaculate. Best dialogue of the year so far.',
      content: 'The character banter between the two leads is immaculate. Best dialogue of the year so far.',
      timestamp: 'Yesterday',
      formattedDate: 'Yesterday',
      cfi: 'epubcfi(/6/8!/4/2/6/1:12)',
      chapterTitle: 'Chapter 2: Dialogue Sparks',
      hashtags: ['banter', 'characters', 'mustRead'],
      tags: ['banter', 'characters', 'mustRead'],
      progressPercent: 28
    }
  ]);

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
      chapterTitle: 'Live Reaction Stream',
      hashtags: tagsArr,
      tags: tagsArr,
      progressPercent: 65
    };

    setFeedItems([entry, ...feedItems]);
    onPostTweet(entry);
    setTweetText('');
  };

  const handleSynthesizeReview = () => {
    const combinedNotes = feedItems.map(item => `> "${item.text}"\n> *(Captured at ${item.chapterTitle || 'Reading Progress'})*`).join('\n\n');
    const allTags = Array.from(new Set(feedItems.flatMap(i => i.hashtags))).map(t => `#${t}`).join(' ');

    const markdownReview = `## 📖 Meow Synthesis Review
**Reviewer:** @${activeProfile.username} (${activeProfile.displayName}) ${activeProfile.avatarEmoji || '🐱'}  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Overall Rating:** ${'★'.repeat(reactionRating)}${'☆'.repeat(5 - reactionRating)} (${reactionRating}/5)  
**Tone/Mode:** ${reviewMode === 'casual_take' ? 'Casual Hot-Take' : reviewMode === 'spoiler_rant' ? 'Spoiler In-Depth Analysis' : 'Formal Curated Review'}  

### 💭 Live Reaction Stream Highlights
${combinedNotes}

### 🏷️ Curated Tags & Verdict
${allTags}

---
*Generated via Anymd Meow Micro-Reaction Stream • Kept 100% Private to Local Vault.*`;

    setGeneratedReview(markdownReview);
  };

  const handleCopyReview = () => {
    if (!generatedReview) return;
    navigator.clipboard.writeText(generatedReview);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 2000);
  };

  const handleCommitToSidecar = () => {
    if (!generatedReview) return;
    if (onSaveReviewToSidecar) {
      onSaveReviewToSidecar(generatedReview);
      alert('✓ Review successfully appended to book .companion.md sidecar!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Live Micro-Reaction Stream & Review Generator</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
                  NOVELTY &bull; NO FORMAL SOCIAL MEDIA
                </span>
              </h3>
              <p className="text-xs text-slate-400">Casual live reactions for profiles & instant markdown review synthesis &bull; Zero external cloud</p>
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
          
          {/* Purpose & Boundary Clarification Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-950/50 via-slate-900 to-indigo-950/50 border border-sky-500/40 space-y-2 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-300 font-bold">
                <EyeOff className="w-4 h-4 text-sky-400" />
                <span>Purpose: Safe Private Sandbox & Review Synthesizer</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Off-Platform</span>
              </span>
            </div>
            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              This feed is a <strong>playful novelty space</strong> for your profile. It exists solely to let you capture raw in-the-moment thoughts and easily compile them into structured book reviews, <strong>keeping your unfiltered reactions off formal public social media platforms</strong>.
            </p>
          </div>

          {/* New Micro-Reaction Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">{activeProfile.avatarEmoji || '🐱'}</span>
                <span className="font-bold text-sky-300">@{activeProfile.username}:</span>
              </div>

              <div className="flex items-center space-x-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReactionRating(star)}
                    className="text-sm hover:scale-125 transition-transform"
                  >
                    {star <= reactionRating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="Drop a quick gut reaction, spicy take, or favorite quote from this chapter..."
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500 resize-none font-sans"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-1 flex-1">
                <Hash className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="tags, comma, separated"
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-sky-300"
                />
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <select
                  value={reviewMode}
                  onChange={(e) => setReviewMode(e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                >
                  <option value="casual_take">Casual Take</option>
                  <option value="spoiler_rant">Spoiler Rant</option>
                  <option value="formal_review">Formal Review</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>Post Take</span>
                </button>
              </div>
            </div>
          </form>

          {/* Review Synthesis Engine Action Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Review Synthesizer:</span>
              <span className="text-slate-400 font-normal text-[11px]">Compile {feedItems.length} reactions into formatted .md review</span>
            </div>

            <button
              type="button"
              onClick={handleSynthesizeReview}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all shrink-0"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Generate Markdown Review (.md)</span>
            </button>
          </div>

          {/* Generated Review Preview Box */}
          {generatedReview && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Synthesized Review Ready:</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyReview}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1"
                  >
                    {copiedReview ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedReview ? 'Copied!' : 'Copy .md'}</span>
                  </button>

                  {onSaveReviewToSidecar && (
                    <button
                      onClick={handleCommitToSidecar}
                      className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1"
                    >
                      <span>Append to Sidecar</span>
                    </button>
                  )}
                </div>
              </div>

              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-200 leading-relaxed whitespace-pre-wrap font-mono">
                {generatedReview}
              </pre>
            </div>
          )}

          {/* Recent Micro-Reactions Feed */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1">
              <MessageSquareHeart className="w-3.5 h-3.5 text-pink-400" />
              <span>Vault Micro-Reactions ({feedItems.length})</span>
            </span>

            <div className="space-y-2 max-h-52 overflow-y-auto font-mono text-xs">
              {feedItems.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <span>{activeProfile.avatarEmoji || '🐱'}</span>
                      <span className="font-bold text-sky-400">@{activeProfile.username}</span>
                      <span className="text-slate-500">&bull; {t.formattedDate}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{t.cfi}</span>
                  </div>

                  <p className="text-slate-200 font-sans text-xs">{t.text}</p>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-amber-400">
                      {t.hashtags.map(h => `#${h}`).join(' ')}
                    </span>
                    <span className="text-slate-500">{t.chapterTitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Active Profile: <strong className="text-sky-300">@{activeProfile.username}</strong> &bull; Local-First
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
