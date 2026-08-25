import React, { useState } from 'react';
import type { ResonanceEntry } from '../types/resonance';
import { EMOTIONAL_PRESETS } from '../data/emotionalPresets';
import { Radio, ExternalLink, Sparkles, Filter, Trash2, Flame, Clock, Bookmark, Share2 } from 'lucide-react';

interface ResonanceStreamViewProps {
  entries: ResonanceEntry[];
  onDeepLinkJump: (entry: ResonanceEntry) => void;
  onDeleteEntry?: (id: string) => void;
  onOpenQuickCapture: () => void;
  onOpenShareModal?: (entry: ResonanceEntry) => void;
}

export const ResonanceStreamView: React.FC<ResonanceStreamViewProps> = ({
  entries,
  onDeepLinkJump,
  onDeleteEntry,
  onOpenQuickCapture,
  onOpenShareModal,
}) => {
  const [filterTier, setFilterTier] = useState<string>('all');
  const [activeReactions, setActiveReactions] = useState<Record<string, string[]>>({});
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);

  const toggleReactionOnEntry = (entryId: string, emoji: string) => {
    setActiveReactions(prev => {
      const current = prev[entryId] || [];
      const updated = current.includes(emoji)
        ? current.filter(e => e !== emoji)
        : [...current, emoji];
      return { ...prev, [entryId]: updated };
    });
  };

  const filteredEntries = entries.filter(e => {
    if (filterTier === 'all') return true;
    return e.presetTier === filterTier;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Stream Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>Reader Resonance Stream</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {entries.length} reactions
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Section 3.8 &bull; Meow Companion Stream</p>
          </div>
        </div>

        <button
          onClick={onOpenQuickCapture}
          className="flex items-center space-x-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Preset Category Filter Chips */}
      <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-slate-500 flex items-center space-x-1 shrink-0 font-mono text-[11px]">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </span>

        <button
          onClick={() => setFilterTier('all')}
          className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium shrink-0 ${
            filterTier === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({entries.length})
        </button>

        {EMOTIONAL_PRESETS.map((p) => {
          const count = entries.filter(e => e.presetTier === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setFilterTier(p.id)}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium flex items-center space-x-1 shrink-0 border ${
                filterTier === p.id
                  ? 'bg-slate-800 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{p.emoji}</span>
              <span>{p.title}</span>
              <span className="opacity-60 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Stream Timeline Entry List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Radio className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-xs text-slate-500">No emotional collisions recorded for this filter tier.</p>
            <button
              onClick={onOpenQuickCapture}
              className="text-xs text-amber-400 underline hover:text-amber-300 font-semibold"
            >
              Log your first reaction now
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const presetObj = EMOTIONAL_PRESETS.find(p => p.id === entry.presetTier);
            const badgeColor = presetObj?.color || '#f59e0b';

            return (
              <div
                key={entry.id}
                className="group relative p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-md hover:shadow-amber-500/10 space-y-3"
              >
                {/* Entry Header Pill */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* Section 3.8.B3 Canonical Timestamp Format */}
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>[{entry.formattedDate} | {entry.progressPercent}%]</span>
                      </span>

                      {/* Category Badge */}
                      <span
                        className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-lg border flex items-center space-x-1"
                        style={{
                          backgroundColor: `${badgeColor}15`,
                          borderColor: `${badgeColor}40`,
                          color: badgeColor
                        }}
                      >
                        {presetObj?.emoji && <span>{presetObj.emoji}</span>}
                        <span>[Category: {entry.category}]</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-1 pt-0.5">
                      <Bookmark className="w-3 h-3 text-indigo-400" />
                      <span>{entry.chapterTitle}</span>
                    </p>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {onOpenShareModal && (
                      <button
                        onClick={() => onOpenShareModal(entry)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
                        title="Pluggable Share & Intents"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    )}

                    {/* Deep Link Jump Button */}
                    <button
                      onClick={() => onDeepLinkJump(entry)}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-semibold text-xs transition-all flex items-center space-x-1 shadow-sm"
                      title="One-Tap Re-Encounter Deep-Link (Jump to text location)"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Re-Encounter</span>
                    </button>
                  </div>
                </div>

                {/* Raw Italicized Visceral Reaction Text */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-sm font-sans font-medium text-slate-200 tracking-wide italic leading-snug">
                  "{entry.rawText}"
                </div>

                {/* Attached Reaction Image or GIF (Discord Style) */}
                {entry.reactionImageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-indigo-500/40 bg-slate-950/80 shadow-md max-w-sm">
                    <img
                      src={entry.reactionImageUrl}
                      alt={entry.reactionGifCaption || 'Reaction GIF'}
                      className="w-full max-h-48 object-cover rounded-t-2xl"
                    />
                    {entry.reactionGifCaption && (
                      <div className="px-3 py-1.5 bg-slate-950 text-[10px] font-mono text-indigo-300 flex items-center justify-between">
                        <span>{entry.reactionGifCaption}</span>
                        <span className="text-[9px] text-slate-500">GIF Reaction</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Discord-Style Emoji Reaction Bursts & Interactive Reactor */}
                {(() => {
                  const combinedEmojis = Array.from(
                    new Set([
                      ...(entry.emojiReactions || []),
                      ...(activeReactions[entry.id] || [])
                    ])
                  );

                  return (
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      {combinedEmojis.map((emoji) => {
                        const isUserReacted = (activeReactions[entry.id] || []).includes(emoji);
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleReactionOnEntry(entry.id, emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs font-mono flex items-center space-x-1 transition-all transform hover:scale-110 active:scale-95 ${
                              isUserReacted
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-sm'
                                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                            }`}
                            title={`Toggle ${emoji} reaction`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{isUserReacted ? 2 : 1}</span>
                          </button>
                        );
                      })}

                      {/* Add Emoji Reaction Picker Quick Trigger */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveReactionPickerId(activeReactionPickerId === entry.id ? null : entry.id)}
                          className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-xs font-mono flex items-center space-x-0.5 transition-all"
                          title="Add emoji reaction"
                        >
                          <span>+</span>
                          <span>😀</span>
                        </button>

                        {activeReactionPickerId === entry.id && (
                          <div className="absolute left-0 bottom-full mb-1.5 p-2 rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl z-30 flex items-center space-x-1 animate-fadeIn">
                            {['🔥', '💀', '😭', '🤣', '🍿', '🤯', '💯', '👑', '💖', '⚡'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  toggleReactionOnEntry(entry.id, emoji);
                                  setActiveReactionPickerId(null);
                                }}
                                className="p-1 rounded-lg text-sm hover:scale-125 transition-transform hover:bg-slate-900"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Paragraph Snippet & Intensity Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  <span className="truncate max-w-[260px] opacity-75" title={entry.paragraphSnippet}>
                    Context: "{entry.paragraphSnippet}"
                  </span>

                  <div className="flex items-center space-x-2">
                    {entry.intensityScore && (
                      <span className="flex items-center space-x-0.5 text-amber-400">
                        {Array.from({ length: entry.intensityScore }).map((_, i) => (
                          <Flame key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </span>
                    )}

                    {onDeleteEntry && (
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                        title="Delete micro-log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
