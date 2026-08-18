import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { TcgBreakFeedEntry, BreakStreamPlatform } from '../plugins/tcgBreakFeedPlugin';
import {
  SAMPLE_BREAK_FEEDS,
  attachBreakFeedToBook,
  extractBreakFeedFromBook
} from '../plugins/tcgBreakFeedPlugin';
import {
  X,
  Tv,
  Radio,
  ExternalLink,
  Play,
  Link,
  Flame,
  Plus,
  Check
} from 'lucide-react';

interface TcgBreakFeedModalProps {
  isOpen: boolean;
  books: Book[];
  onClose: () => void;
  onUpdateBook: (updatedBook: Book) => void;
}

export const TcgBreakFeedModal: React.FC<TcgBreakFeedModalProps> = ({
  isOpen,
  books,
  onClose,
  onUpdateBook
}) => {
  const [breakFeeds, setBreakFeeds] = useState<TcgBreakFeedEntry[]>(() => {
    // Gather any feeds from existing books + sample feeds
    const fromBooks: TcgBreakFeedEntry[] = [];
    books.forEach(b => {
      const feed = extractBreakFeedFromBook(b);
      if (feed) fromBooks.push(feed);
    });
    return [...fromBooks, ...SAMPLE_BREAK_FEEDS];
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'link_card'>('feed');

  // Link Form State
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [streamerName, setStreamerName] = useState('@PokeRipVault');
  const [platform, setPlatform] = useState<BreakStreamPlatform>('twitch');
  const [streamUrl, setStreamUrl] = useState('https://twitch.tv/pokeripvault');
  const [clipTimestampUrl, setClipTimestampUrl] = useState('https://twitch.tv/videos/123456789?t=01h24m15s');
  const [breakType, setBreakType] = useState<TcgBreakFeedEntry['breakType']>('Vintage Box Break');
  const [boxSerial, setBoxSerial] = useState('WOTC-1999-BOX-042');
  const [notes, setNotes] = useState('Clean 60/40 centering pulled live on stream.');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = books.find(b => b.id === selectedBookId);
    if (!targetBook) return;

    const newFeed: TcgBreakFeedEntry = {
      id: `break-${Date.now()}`,
      cardTitle: targetBook.title,
      streamerName,
      platform,
      streamUrl,
      clipTimestampUrl,
      pullTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      breakType,
      boxSerial,
      isLiveNow: true,
      notes
    };

    const updatedBook = attachBreakFeedToBook(targetBook, newFeed);
    onUpdateBook(updatedBook);
    setBreakFeeds([newFeed, ...breakFeeds]);

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setActiveTab('feed');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>TCG Box Break Feeds & Live Stream Linker</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-1" />
                  LIVE STREAM CHANNELS
                </span>
              </h3>
              <p className="text-xs text-slate-400">Whatnot &bull; Twitch &bull; YouTube &bull; TikTok Live &bull; Timestamp Pull Clips &bull; Box Serial Provenance</p>
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
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'feed'
                ? 'border-rose-500 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Active Break Stream Feeds ({breakFeeds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('link_card')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'link_card'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Attach Stream to TCG Card Sidecar</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {activeTab === 'feed' && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              
              {/* Highlight Info Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-amber-950/50 border border-rose-500/40 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-300 font-bold">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Live Pack Openings & Box Break Feeds</span>
                  </div>
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Video Pull Proof (.md Sidecar Attached)
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  Track live pack openings on Whatnot, Twitch, YouTube, and TikTok. Each pulled card links directly to the exact video timestamp clip where it was ripped from the pack for permanent provenance!
                </p>
              </div>

              {/* Streams Feed Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {breakFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-1.5 mb-1">
                            {feed.isLiveNow ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-1" />
                                LIVE STREAM
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                                VOD CLIP
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 text-[10px] uppercase">
                              {feed.platform}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-100 text-sm">{feed.cardTitle}</h4>
                          <span className="text-xs text-rose-400 font-bold block">{feed.streamerName}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Break Type:</span>
                          <strong className="text-amber-300">{feed.breakType}</strong>
                        </div>
                        {feed.boxSerial && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Box Serial:</span>
                            <code className="text-emerald-300">{feed.boxSerial}</code>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pull Time:</span>
                          <span className="text-slate-300">{feed.pullTimestamp}</span>
                        </div>
                      </div>

                      {feed.notes && (
                        <p className="text-slate-400 text-[11px] font-sans italic">{feed.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-900">
                      {feed.clipTimestampUrl ? (
                        <a
                          href={feed.clipTimestampUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Pull Clip</span>
                        </a>
                      ) : (
                        <a
                          href={feed.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <span>Live Stream</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'link_card' && (
            <form onSubmit={handleLinkSubmit} className="p-5 rounded-3xl bg-slate-950 border border-amber-500/40 space-y-4 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Link className="w-4 h-4 text-amber-400" />
                  <span>Attach Live Break Stream & Pull Clip to TCG Card</span>
                </h4>
                <span className="text-[10px] text-slate-500">Auto-Generates Sidecar YAML</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">Select Vault TCG Card:</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-bold"
                  required
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.author})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Streamer Handle:</label>
                  <input
                    type="text"
                    value={streamerName}
                    onChange={(e) => setStreamerName(e.target.value)}
                    placeholder="e.g. @GrailBreaksLive"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Streaming Platform:</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as BreakStreamPlatform)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-bold"
                  >
                    <option value="twitch">Twitch</option>
                    <option value="whatnot">Whatnot</option>
                    <option value="youtube">YouTube Live</option>
                    <option value="tiktok">TikTok Live</option>
                    <option value="kick">Kick</option>
                    <option value="loupe">Loupe</option>
                    <option value="custom">Custom HLS/RTMP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Live Stream URL:</label>
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://twitch.tv/channel"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Pull Video Clip URL (with Timestamp):</label>
                  <input
                    type="url"
                    value={clipTimestampUrl}
                    onChange={(e) => setClipTimestampUrl(e.target.value)}
                    placeholder="https://twitch.tv/videos/123?t=01h20m"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Break Type:</label>
                  <select
                    value={breakType}
                    onChange={(e) => setBreakType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  >
                    <option value="Vintage Box Break">Vintage Box Break</option>
                    <option value="Case Break">Case Break (Master Case)</option>
                    <option value="Personal Pack">Personal Pack Opening</option>
                    <option value="Team Random">Team / Tier Randomizer</option>
                    <option value="Bounty Hunt">Bounty Hunt Pull</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Box / Case Serial Number:</label>
                  <input
                    type="text"
                    value={boxSerial}
                    onChange={(e) => setBoxSerial(e.target.value)}
                    placeholder="e.g. WOTC-BOX-88129"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Provenance & Pull Notes:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pack #12 pulled live on stream. Flawless surface."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              {successMsg && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>✓ Break stream feed successfully attached to card sidecar!</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all flex items-center space-x-1.5 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Attach Stream Feed to Sidecar</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            TCG Break Feeds &bull; Video Clip Provenance Proof
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
