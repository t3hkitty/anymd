import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { GiftRecord, GiftResponseRating } from '../plugins/giftTrackerPlugin';
import { getSavedGiftRecords, saveGiftRecords, convertGiftsToVaultBooks } from '../plugins/giftTrackerPlugin';
import { X, Gift, Sparkles, Check, Heart, Smile, Meh, Frown, Plus } from 'lucide-react';

interface GiftTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoGenerateVaultItems: (newBooks: Book[]) => void;
}

export const GiftTrackerModal: React.FC<GiftTrackerModalProps> = ({
  isOpen,
  onClose,
  onAutoGenerateVaultItems,
}) => {
  const [gifts, setGifts] = useState<GiftRecord[]>(getSavedGiftRecords);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('All');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  // New Gift Form State
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRelationship] = useState('Spouse');
  const [newGiftTitle, setNewGiftTitle] = useState('');
  const [newOccasion, setNewOccasion] = useState('Birthday 2026');
  const [newPriceUsd, setNewPriceUsd] = useState(50);
  const [newRating, setNewRating] = useState<GiftResponseRating>('loved_it');
  const [newReactionNotes, setNewReactionNotes] = useState('');
  const [newIdeaInput, setNewIdeaInput] = useState('');
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([
    'Custom Hand-Painted Acrylic Desk Stand',
    'Special Edition Hardcover Collector Artbook'
  ]);

  if (!isOpen) return null;

  const recipientsList = ['All', ...Array.from(new Set(gifts.map(g => g.recipientName)))];
  const filteredGifts = selectedRecipient === 'All' ? gifts : gifts.filter(g => g.recipientName === selectedRecipient);

  const handleAddIdea = () => {
    if (!newIdeaInput.trim()) return;
    setSuggestedIdeas([...suggestedIdeas, newIdeaInput.trim()]);
    setNewIdeaInput('');
  };

  const handleSaveNewGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientName.trim() || !newGiftTitle.trim()) return;

    const newGift: GiftRecord = {
      id: `gift-${Date.now()}`,
      recipientName: newRecipientName,
      recipientRelationship: newRelationship,
      giftTitle: newGiftTitle,
      occasion: newOccasion,
      priceUsd: Number(newPriceUsd),
      datePurchased: new Date().toISOString().split('T')[0],
      responseRating: newRating,
      reactionNotes: newReactionNotes || 'No reaction notes recorded.',
      suggestedFollowUpGifts: suggestedIdeas
    };

    const updated = [...gifts, newGift];
    setGifts(updated);
    saveGiftRecords(updated);

    // Reset
    setNewGiftTitle('');
    setNewReactionNotes('');
    setIsAddingNew(false);
  };

  const handleGenerateSidecars = () => {
    const books = convertGiftsToVaultBooks(filteredGifts);
    onAutoGenerateVaultItems(books);
    setGeneratedSuccess(true);

    setTimeout(() => {
      setGeneratedSuccess(false);
      onClose();
    }, 1500);
  };

  const renderRatingBadge = (rating: GiftResponseRating) => {
    switch (rating) {
      case 'loved_it':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-bold flex items-center space-x-1">
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
            <span>Loved It! (Home Run)</span>
          </span>
        );
      case 'enjoyed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center space-x-1">
            <Smile className="w-3 h-3 text-emerald-400" />
            <span>Enjoyed It</span>
          </span>
        );
      case 'neutral':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40 text-[10px] font-bold flex items-center space-x-1">
            <Meh className="w-3 h-3 text-slate-400" />
            <span>Neutral / Duplicate</span>
          </span>
        );
      case 'hated_it':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold flex items-center space-x-1">
            <Frown className="w-3 h-3 text-red-400" />
            <span>Hated It / Regifted</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-pink-500 text-slate-950 font-bold shadow-lg shadow-pink-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Gift Tracker, Recipient Profiles & Response Gauge</h3>
              <p className="text-xs text-slate-400">Track Bought Gifts &bull; Response Gauge (Loved It vs Hated It) &bull; Follow-Up AI Gift Ideas</p>
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Top Bar: Recipient Selector & Add Gift Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {recipientsList.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRecipient(r)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border shrink-0 ${
                    r === selectedRecipient
                      ? 'bg-pink-600 text-white border-pink-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Purchased Gift</span>
            </button>
          </div>

          {/* New Gift Registration Form */}
          {isAddingNew && (
            <form onSubmit={handleSaveNewGift} className="p-5 rounded-3xl bg-slate-950 border border-pink-500/60 space-y-4 font-mono text-xs animate-fadeIn">
              <h4 className="font-bold text-pink-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Gift className="w-4 h-4 text-pink-400" />
                <span>Log New Gift & Gauge Response</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                  placeholder="Recipient (e.g. Wife, Mom, Brother)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-pink-300 font-bold"
                  required
                />

                <input
                  type="text"
                  value={newGiftTitle}
                  onChange={(e) => setNewGiftTitle(e.target.value)}
                  placeholder="Gift Title (e.g. Piplup Plushie & Dawn Scarf)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  required
                />

                <input
                  type="text"
                  value={newOccasion}
                  onChange={(e) => setNewOccasion(e.target.value)}
                  placeholder="Occasion (e.g. Birthday 2026, Christmas)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Price ($ USD):</label>
                  <input
                    type="number"
                    value={newPriceUsd}
                    onChange={(e) => setNewPriceUsd(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Response Rating Gauge:</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value as GiftResponseRating)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-pink-300 font-bold"
                  >
                    <option value="loved_it">💖 Loved It! (Hit Home Run)</option>
                    <option value="enjoyed">✨ Enjoyed It</option>
                    <option value="neutral">😐 Neutral / Duplicate</option>
                    <option value="hated_it">💔 Hated It / Regifted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Reaction Story & Notes:</label>
                <textarea
                  value={newReactionNotes}
                  onChange={(e) => setNewReactionNotes(e.target.value)}
                  placeholder="Describe their reaction... (e.g. 'She squealed with joy and put it on her desk immediately!')"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs"
                />
              </div>

              {/* Follow up Gift Recommendations */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] text-slate-400 block font-bold">Suggested Follow-Up Gift Ideas:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newIdeaInput}
                    onChange={(e) => setNewIdeaInput(e.target.value)}
                    placeholder="Add follow-up idea based on this hit gift..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddIdea}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                  >
                    + Add Idea
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestedIdeas.map((idea, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-pink-200 text-[11px]">
                      💡 {idea}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold shadow-md"
                >
                  Save Gift Log
                </button>
              </div>
            </form>
          )}

          {/* Past Gifts Cards List */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Gift className="w-4 h-4 text-pink-400" />
              <span>Purchased Gift History ({filteredGifts.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGifts.map(gift => (
                <div key={gift.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-100 text-sm block">{gift.giftTitle}</span>
                        <span className="text-[11px] text-pink-300 font-bold">To: {gift.recipientName} ({gift.recipientRelationship})</span>
                      </div>
                      {renderRatingBadge(gift.responseRating)}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Occasion: <strong className="text-slate-200">{gift.occasion}</strong></span>
                      <span>Price: <strong className="text-emerald-300">${gift.priceUsd} USD</strong></span>
                    </div>

                    <blockquote className="p-2.5 rounded-xl bg-slate-900/80 border-l-2 border-pink-500 text-[11px] text-slate-300 italic">
                      "{gift.reactionNotes}"
                    </blockquote>
                  </div>

                  {gift.suggestedFollowUpGifts.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 space-y-1">
                      <span className="text-[10px] text-pink-400 font-bold block">💡 Follow-Up Gift Recommendations:</span>
                      <ul className="space-y-1 text-[10px] text-slate-300">
                        {gift.suggestedFollowUpGifts.map((idea, idx) => (
                          <li key={idx} className="flex items-center space-x-1">
                            <span className="text-pink-400">&bull;</span>
                            <span>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Meow Gift Tracker & Response Gauge
          </span>
          <button
            onClick={handleGenerateSidecars}
            className={`px-5 py-2 rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all ${
              generatedSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-pink-600 hover:bg-pink-500 text-white'
            }`}
          >
            {generatedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Gift Sidecars Generated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>⚡ Auto-Generate Gift Sidecars</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
