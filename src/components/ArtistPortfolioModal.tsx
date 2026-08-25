import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { ArtworkPortfolioItem } from '../plugins/artistPortfolioPlugin';
import { INITIAL_ARTIST_PORTFOLIOS, convertArtworkToVaultBook } from '../plugins/artistPortfolioPlugin';
import type { CommunityComment } from '../plugins/communityCommentsPlugin';
import { getSavedCommunityComments, saveCommunityComments } from '../plugins/communityCommentsPlugin';
import { generateLocalArtMetadata } from '../plugins/localAiMetadataPlugin';
import { X, Palette, MessageSquare, Plus, Sparkles, Check, ThumbsUp, Send, Image as ImageIcon, Cpu } from 'lucide-react';

interface ArtistPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportArtworkToVault: (artworkBook: Book) => void;
}

export const ArtistPortfolioModal: React.FC<ArtistPortfolioModalProps> = ({
  isOpen,
  onClose,
  onImportArtworkToVault,
}) => {
  const [artworks, setArtworks] = useState<ArtworkPortfolioItem[]>(INITIAL_ARTIST_PORTFOLIOS);
  const [comments, setComments] = useState<CommunityComment[]>(getSavedCommunityComments);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkPortfolioItem>(INITIAL_ARTIST_PORTFOLIOS[0]);
  
  const [isAddingArtwork, setIsAddingArtwork] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMedium, setNewMedium] = useState<'Digital Painting' | 'Oil on Canvas' | 'Watercolor' | 'Character Sheet' | '3D Render' | 'Merch Print'>('Digital Painting');
  const [newDimensions, setNewDimensions] = useState('3840 x 2160 (4K Canvas)');
  const [newPrice, setNewPrice] = useState(250);
  const [newImgUrl, setNewImgUrl] = useState('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800');
  const [newDesc, setNewDesc] = useState('');

  const [newCommentText, setNewCommentText] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<string>('🎨 Masterpiece');
  const [importedSuccessId, setImportedSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const artworkComments = comments.filter(c => c.targetId === selectedArtwork.id);

  const handleUpvoteArtwork = (id: string) => {
    setArtworks(prev => prev.map(a => a.id === id ? { ...a, upvotesCount: a.upvotesCount + 1 } : a));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC: CommunityComment = {
      id: `cmt-${Date.now()}`,
      targetId: selectedArtwork.id,
      authorName: 'You (Meow User)',
      authorHandle: '@you',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      badge: selectedBadge,
      content: newCommentText,
      timestamp: 'Just now',
      upvotesCount: 1
    };

    const updated = [newC, ...comments];
    setComments(updated);
    saveCommunityComments(updated);
    
    // Update artwork comment count
    setArtworks(prev => prev.map(a => a.id === selectedArtwork.id ? { ...a, commentsCount: a.commentsCount + 1 } : a));
    setNewCommentText('');
  };

  const handleCreateArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newArt: ArtworkPortfolioItem = {
      id: `art-${Date.now()}`,
      title: newTitle,
      artistName: 'ArtKitty & Lorik Studios',
      artistHandle: '@artkitty',
      medium: newMedium,
      dimensions: newDimensions,
      yearCreated: 2026,
      priceUsd: newPrice,
      isCommissionOpen: true,
      highResImageUrl: newImgUrl,
      description: newDesc,
      tags: ['artkitty-original', newMedium.toLowerCase().replace(/[^a-z]/g, '')],
      upvotesCount: 1,
      commentsCount: 0
    };

    setArtworks([newArt, ...artworks]);
    setSelectedArtwork(newArt);
    setNewTitle('');
    setNewDesc('');
    setIsAddingArtwork(false);
  };

  const handleImportToVault = (art: ArtworkPortfolioItem) => {
    const book = convertArtworkToVaultBook(art);
    onImportArtworkToVault(book);
    setImportedSuccessId(art.id);
    setTimeout(() => setImportedSuccessId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Artist Portfolio & Creator Profiles</h3>
              <p className="text-xs text-slate-400">Showcase Original Artworks &bull; Community Comments & Critiques &bull; Sidecar Vault Import</p>
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
          
          {/* Creator Profile Header Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
            <div className="flex items-center space-x-4">
              <img
                src="https://images.unsplash.com/photo-[REDACTED_PHONE]-94ddf0286df2?w=150"
                alt="ArtKitty Artist Profile"
                className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-base text-slate-100">ArtKitty & Lorik Studios</h4>
                  <span className="text-amber-400 font-bold">@artkitty</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans">
                  Digital Illustrator & Danmei / Sinnoh Fan Artist &bull; Commissions Open: <strong className="text-emerald-400">🟢 Custom 4K Canvases & Character Sheets</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddingArtwork(!isAddingArtwork)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Artwork to Portfolio</span>
            </button>
          </div>

          {/* Add Artwork Form */}
          {isAddingArtwork && (
            <form onSubmit={handleCreateArtwork} className="p-5 rounded-3xl bg-slate-950 border border-amber-500/60 space-y-3 font-mono text-xs animate-fadeIn">
              <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Add New Artwork Listing to Artist Portfolio</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Artwork Title (e.g. Piplup Bubble Beam Canvas)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  required
                />

                <select
                  value={newMedium}
                  onChange={(e) => setNewMedium(e.target.value as any)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                >
                  <option value="Digital Painting">Digital Painting</option>
                  <option value="Oil on Canvas">Oil on Canvas</option>
                  <option value="Watercolor">Watercolor</option>
                  <option value="Character Sheet">Character Sheet</option>
                  <option value="3D Render">3D Render</option>
                  <option value="Merch Print">Merch Print</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newDimensions}
                  onChange={(e) => setNewDimensions(e.target.value)}
                  placeholder="Dimensions (e.g. 3840 x 2160 4K)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />

                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  placeholder="Price USD"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold"
                />

                <input
                  type="url"
                  value={newImgUrl}
                  onChange={(e) => setNewImgUrl(e.target.value)}
                  placeholder="Image URL"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  required
                />
              </div>

              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Artwork description, inspiration notes & technique details..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 resize-none"
                required
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const aiResult = generateLocalArtMetadata({
                      title: newTitle || 'Meow Digital Masterpiece',
                      medium: newMedium,
                      subjectKeywords: 'vibrant, fantasy, aesthetic, fine-art',
                      disclosureType: '100_percent_human'
                    });
                    setNewDesc(aiResult.description);
                    if (!newTitle) setNewTitle(aiResult.title);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/50 text-pink-300 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Cpu className="w-3.5 h-3.5 text-pink-400" />
                  <span>⚡ Local AI Auto-Fill Tags &amp; Description</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  Publish Artwork Listing
                </button>
              </div>
            </form>
          )}

          {/* Portfolio Layout: Selected Artwork Viewer & Community Comments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: Selected Artwork View */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 group">
                  <img
                    src={selectedArtwork.highResImageUrl}
                    alt={selectedArtwork.title}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/50 text-amber-300 font-mono text-xs font-bold">
                    ${selectedArtwork.priceUsd ? selectedArtwork.priceUsd.toLocaleString() : 'N/A'} USD
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg text-slate-100">{selectedArtwork.title}</h3>
                    <button
                      onClick={() => handleUpvoteArtwork(selectedArtwork.id)}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center space-x-1 transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{selectedArtwork.upvotesCount}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {selectedArtwork.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
                    <span>Medium: <strong className="text-slate-200">{selectedArtwork.medium}</strong></span>
                    <span>Dimensions: <strong className="text-slate-200">{selectedArtwork.dimensions}</strong></span>
                  </div>

                  {/* Redbubble, INPRNT & Etsy Storefront Links */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800 flex-wrap gap-2">
                    {selectedArtwork.redbubbleUrl && (
                      <a
                        href={selectedArtwork.redbubbleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-xs font-bold flex items-center space-x-1 transition-all"
                      >
                        <span>🛍️ Redbubble Merch</span>
                      </a>
                    )}
                    {selectedArtwork.inprntUrl && (
                      <a
                        href={selectedArtwork.inprntUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center space-x-1 transition-all"
                      >
                        <span>🖼️ INPRNT Gallery</span>
                      </a>
                    )}
                    {selectedArtwork.etsyUrl && (
                      <a
                        href={selectedArtwork.etsyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center space-x-1 transition-all"
                      >
                        <span>📦 Etsy Shop</span>
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleImportToVault(selectedArtwork)}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md ${
                    importedSuccessId === selectedArtwork.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {importedSuccessId === selectedArtwork.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Artwork Sidecar Imported to Vault!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ Import Artwork Sidecar to Vault</span>
                    </>
                  )}
                </button>
              </div>

              {/* Artwork Selection Cards */}
              <div className="grid grid-cols-2 gap-3">
                {artworks.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArtwork(art)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                      selectedArtwork.id === art.id
                        ? 'bg-slate-900 border-amber-500 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={art.highResImageUrl} alt={art.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="overflow-hidden font-mono text-xs">
                      <span className="font-bold text-slate-100 block truncate">{art.title}</span>
                      <span className="text-[11px] text-amber-400 block">${art.priceUsd} USD</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Columns: Community Comments & Critiques */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col h-full shadow-xl font-mono text-xs">
                <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Community Comments ({artworkComments.length})</span>
                </h4>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
                    {['🎨 Masterpiece', '✨ Inspiring', '🔥 Insta-Buy', '💖 Favorite'].map(bdg => (
                      <button
                        key={bdg}
                        type="button"
                        onClick={() => setSelectedBadge(bdg)}
                        className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 border ${
                          selectedBadge === bdg
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {bdg}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Leave critique, feedback, or resonance note..."
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-sans resize-none"
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>

                {/* Comment Feed Stream */}
                <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
                  {artworkComments.map((cmt) => (
                    <div key={cmt.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={cmt.authorAvatar} alt={cmt.authorName} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold text-slate-200">{cmt.authorName}</span>
                        </div>
                        {cmt.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            {cmt.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed p-2 rounded-xl bg-slate-950 border border-slate-800">
                        {cmt.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Artist Portfolio & Community Critique Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
