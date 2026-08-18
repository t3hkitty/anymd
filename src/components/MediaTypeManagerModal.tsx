import React, { useState, useEffect } from 'react';
import type { MediaItem, MediaTypeId, TcgStorageType, TcgTradeStatus, ProvenanceRecord, DistributionChannel } from '../types/mediaTypes';
import { MEDIA_TYPE_CATEGORIES, generatePhysicalSerialCode } from '../types/mediaTypes';
import { SAMPLE_MEDIA_ITEMS } from '../data/sampleMediaItems';
import { X, Layers, Plus, Trash2, MapPin, Hash, Sparkles, Ruler, Search, Lock, ShieldCheck, DollarSign, ExternalLink, Award, FileCheck } from 'lucide-react';

const MEDIA_ITEMS_STORAGE_KEY = 'lc_md_physical_media_v3';

function loadSavedMediaItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_ITEMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load physical media items:', err);
  }
  return SAMPLE_MEDIA_ITEMS;
}

function saveMediaItems(items: MediaItem[]): void {
  try {
    localStorage.setItem(MEDIA_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save physical media items:', err);
  }
}

interface MediaTypeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaTypeManagerModal: React.FC<MediaTypeManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<MediaItem[]>(loadSavedMediaItems);
  const [selectedCategory, setSelectedCategory] = useState<MediaTypeId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form State for Adding New Item
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [mediaType, setMediaType] = useState<MediaTypeId>('tcg');
  const [country, setCountry] = useState('United States');
  const [addressFacility, setAddressFacility] = useState('123 Evergreen Terrace');
  const [room, setRoom] = useState('Master Study Vault');
  const [bookshelfRack, setBookshelfRack] = useState('Fireproof Safe A');
  const [shelfTier, setShelfTier] = useState('Lockbox 1');
  const [width, setWidth] = useState<number>(3.2);
  const [height, setHeight] = useState<number>(5.4);
  const [depth, setDepth] = useState<number>(0.3);
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [materialFrame, setMaterialFrame] = useState('PSA Acrylic Encapsulated Slab');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('pokemon, psa10, vaulted, vintage');

  // TCG Specific Fields
  const [cardName, setCardName] = useState('');
  const [setName, setSetName] = useState('');
  const [rarity, setRarity] = useState('Secret Holo Rare');
  const [grading, setGrading] = useState('PSA 10 Gem Mint');
  const [purchasePrice, setPurchasePrice] = useState<number>(500);
  const [currentValuation, setCurrentValuation] = useState<number>(3500);
  const [tradeStatus, setTradeStatus] = useState<TcgTradeStatus>('kept');
  const [tcgStorage, setTcgStorage] = useState<TcgStorageType>('slab-case');
  const [isVaultedInSafe, setIsVaultedInSafe] = useState<boolean>(true);
  const [isDigitalOnlyWishlist, setIsDigitalOnlyWishlist] = useState<boolean>(false);

  // Creator & Maker Portfolio State
  const [isSelfCreated, setIsSelfCreated] = useState<boolean>(false);
  const [mediumTools, setMediumTools] = useState('Oil on Canvas / Blender 3D / Procreate');
  const [creationDate, setCreationDate] = useState('2026-08-17');
  const [editionInfo, setEditionInfo] = useState('Original 1/1');
  const [portfolioStatus, setPortfolioStatus] = useState<'in-progress' | 'completed' | 'for-sale' | 'nfs-archived'>('completed');

  // Requester & Commission State
  const [clientName, setClientName] = useState('');
  const [commissionStatus, setCommissionStatus] = useState<'self-initiated' | 'commissioned' | 'client-proof' | 'delivered'>('self-initiated');
  const [commissionFee, setCommissionFee] = useState<number>(0);
  const [deliveryDeadline, setDeliveryDeadline] = useState('');

  // Distribution Channels State
  const [distChannelName, setDistChannelName] = useState('ArtStation Portfolio');
  const [distUrl, setDistUrl] = useState('https://www.artstation.com/artist/artwork/masterpiece');
  const [distChannels, setDistChannels] = useState<DistributionChannel[]>([]);

  // Provenance Form State
  const [provenanceTitle, setProvenanceTitle] = useState('');
  const [provenanceUrl, setProvenanceUrl] = useState('');
  const [provenanceVerifier, setProvenanceVerifier] = useState('');
  const [provenanceDate, setProvenanceDate] = useState('');
  const [provenanceNotes, setProvenanceNotes] = useState('');
  const [addedProvenanceLinks, setAddedProvenanceLinks] = useState<ProvenanceRecord[]>([]);

  useEffect(() => {
    saveMediaItems(items);
  }, [items]);

  if (!isOpen) return null;

  // Real-time calculated serial code
  const calculatedSerial = generatePhysicalSerialCode(
    addressFacility || 'Main',
    room || 'Study',
    bookshelfRack || 'Rack',
    mediaType,
    items.length + 1
  );

  const handleAddProvenance = () => {
    if (!provenanceTitle || !provenanceUrl) return;
    const newProv: ProvenanceRecord = {
      id: `prov-${Date.now()}`,
      title: provenanceTitle,
      url: provenanceUrl,
      verifiedBy: provenanceVerifier || 'Official Authority',
      date: provenanceDate || new Date().toISOString().split('T')[0],
      notes: provenanceNotes
    };
    setAddedProvenanceLinks([...addedProvenanceLinks, newProv]);
    setProvenanceTitle('');
    setProvenanceUrl('');
    setProvenanceNotes('');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: title || cardName || 'Untitled Card',
      creator: creator || setName || 'Unknown Publisher',
      mediaType,
      location: {
        country,
        addressFacility,
        room,
        bookshelfRack,
        shelfTier,
        serializationCode: calculatedSerial
      },
      dimensions: {
        width,
        height,
        depth,
        unit,
        materialFrame
      },
      tcgInfo: mediaType === 'tcg' ? {
        cardName: cardName || title,
        setName: setName || creator,
        rarity,
        grading,
        purchasePrice,
        currentValuation,
        tradeStatus,
        tcgStorage,
        isVaultedInSafe
      } : undefined,
      provenanceLinks: addedProvenanceLinks.length > 0 ? addedProvenanceLinks : undefined,
      isDigitalOnlyWishlist,
      notes,
      serialCode: calculatedSerial,
      sidecarMdPath: `./${mediaType}/${(title || cardName || 'item').toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`,
      tags: tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      coverColor: mediaType === 'tcg' ? '#dc2626' : '#0284c7'
    };

    const updated = [newItem, ...items];
    setItems(updated);
    setIsAdding(false);
    
    // Reset Form
    setTitle('');
    setCreator('');
    setCardName('');
    setNotes('');
    setAddedProvenanceLinks([]);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
  };

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.mediaType === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.serialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.tcgInfo && item.tcgInfo.cardName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 flex-wrap gap-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">TCG Collections, Media & Provenance Manager</h3>
              <p className="text-xs text-slate-400">Pokemon &bull; MTG &bull; Provenance Verification Links &bull; Market Valuations &bull; Safe Vaulted Protocol</p>
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
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {!isAdding ? (
            <>
              {/* Category Filter Pills & Add Controls */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                
                {/* Media Category Filter Chips */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      selectedCategory === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    🌟 All Items ({items.length})
                  </button>

                  {MEDIA_TYPE_CATEGORIES.map(cat => {
                    const count = items.filter(i => i.mediaType === cat.id).length;
                    const isSel = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1 ${
                          isSel ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name.split(' ')[0]} ({count})</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsAdding(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add TCG / Physical Item</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item, card name, grading, room, serial code, or provenance..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Physical Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const cat = MEDIA_TYPE_CATEGORIES.find(c => c.id === item.mediaType);
                  const isTcg = item.mediaType === 'tcg';

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-3xl border transition-all space-y-3 shadow-md flex flex-col justify-between ${
                        isTcg
                          ? 'bg-slate-950 border-amber-500/60 shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">
                              {cat?.icon || '📦'}
                            </span>
                            <div>
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <h4 className="font-extrabold text-sm text-slate-100">{item.title}</h4>
                                 {item.tcgInfo?.isVaultedInSafe && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center space-x-1">
                                    <Lock className="w-2.5 h-2.5 text-amber-400" />
                                    <span>VAULTED IN SAFE</span>
                                  </span>
                                )}
                                {item.isDigitalOnlyWishlist && (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center space-x-1">
                                    <span>📱 DIGITAL ONLY (WISHLIST)</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{cat?.creatorLabel}: <span className="text-slate-200 font-semibold">{item.creator}</span></p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* TCG Specific Valuation & Storage Box */}
                        {item.tcgInfo && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2 text-xs font-mono">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-amber-400 font-bold flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span>MARKET VALUATION</span>
                              </span>

                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                item.tcgInfo.tradeStatus === 'for-sale'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : item.tcgInfo.tradeStatus === 'for-trade'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}>
                                {item.tcgInfo.tradeStatus}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-500 block">Purchase Cost:</span>
                                <span className="text-slate-300 font-bold">${item.tcgInfo.purchasePrice.toLocaleString()} USD</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Estimated Valuation:</span>
                                <span className="text-emerald-400 font-extrabold text-sm">${item.tcgInfo.currentValuation.toLocaleString()} USD</span>
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
                              <span>Grading: <strong className="text-amber-300">{item.tcgInfo.grading || 'Raw NM'}</strong></span>
                              <span>Storage: <strong className="text-sky-300 uppercase">{item.tcgInfo.tcgStorage}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Provenance Verification Links Box */}
                        {item.provenanceLinks && item.provenanceLinks.length > 0 && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2 text-xs font-mono">
                            <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                              <span className="text-amber-300 font-bold flex items-center space-x-1.5 text-[11px]">
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span>PROVENANCE CHAIN & AUTHENTICITY</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                                VERIFIED ({item.provenanceLinks.length})
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {item.provenanceLinks.map((prov) => (
                                <a
                                  key={prov.id}
                                  href={prov.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 block transition-all group"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-200 group-hover:text-amber-300">
                                    <span className="truncate pr-2 flex items-center space-x-1">
                                      <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <span>{prov.title}</span>
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300 shrink-0" />
                                  </div>
                                  {prov.notes && (
                                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{prov.notes}</p>
                                  )}
                                  <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                                    <span>Verified: <strong className="text-slate-300">{prov.verifiedBy || 'Authority'}</strong></span>
                                    {prov.date && <span>Date: {prov.date}</span>}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Physical Location Box */}
                        <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-400" />
                              <span>PHYSICAL LOCATION HIERARCHY</span>
                            </span>
                            <span className="text-emerald-400 text-[10px]">{item.location.country}</span>
                          </div>

                          <p className="text-slate-300">
                            <span className="text-slate-500">Address/Facility:</span> {item.location.addressFacility || 'Main Residence'}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">Room & Storage:</span> <strong className="text-sky-300">{item.location.room}</strong> &bull; <span className="text-amber-300">{item.location.bookshelfRack} ({item.location.shelfTier})</span>
                          </p>

                          {/* Auto Serial Code */}
                          <div className="pt-1 flex items-center space-x-1 text-[11px] text-indigo-300">
                            <Hash className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Serial Code:</span>
                            <code className="text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-indigo-500/30">
                              {item.serialCode}
                            </code>
                          </div>
                        </div>

                        {/* Physical Dimension Info */}
                        {item.dimensions && (
                          <div className="mt-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono space-y-1">
                            <div className="flex items-center space-x-1 text-slate-400">
                              <Ruler className="w-3.5 h-3.5 text-sky-400" />
                              <span>Dimensions ({item.dimensions.unit}):</span>
                              <strong className="text-slate-200">{item.dimensions.width} W x {item.dimensions.height} H x {item.dimensions.depth} D {item.dimensions.unit}</strong>
                            </div>
                            {item.dimensions.materialFrame && (
                              <p className="text-slate-400">
                                <span className="text-slate-500">Protection/Case:</span> {item.dimensions.materialFrame}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Notes & Sidecar Link */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500 truncate max-w-[60%]">{item.notes || 'No extra notes.'}</span>
                        <code className="text-amber-300 text-[10px]">{item.sidecarMdPath}</code>
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add New Physical / TCG Item Form */
            <form onSubmit={handleAddItem} className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-amber-400 uppercase tracking-wider font-mono flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Register New TCG Card / Physical Item</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  Back to Item Catalog
                </button>
              </div>

              {/* Select Media Category */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Media Type Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {MEDIA_TYPE_CATEGORIES.map(cat => {
                    const isSel = mediaType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setMediaType(cat.id);
                          setUnit(cat.defaultUnit);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSel ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <p className="font-bold text-xs mt-1 truncate">{cat.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TCG Specific Form Fields */}
              {mediaType === 'tcg' && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between text-amber-300 font-bold text-xs font-mono">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>TCG CARD VALUATION & STORAGE PROTOCOL</span>
                    </span>

                    <div className="flex items-center space-x-3 flex-wrap">
                      {/* Vaulted in Safe Toggle */}
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isVaultedInSafe}
                          onChange={(e) => setIsVaultedInSafe(e.target.checked)}
                          className="rounded bg-slate-900 border-amber-500 text-amber-500 focus:ring-0"
                        />
                        <span className="text-xs text-amber-300 font-bold flex items-center space-x-1">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Vaulted in Safe</span>
                        </span>
                      </label>

                      {/* Self-Created Work Toggle */}
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelfCreated}
                          onChange={(e) => setIsSelfCreated(e.target.checked)}
                          className="rounded bg-slate-900 border-amber-400 text-amber-400 focus:ring-0"
                        />
                        <span className="text-xs text-amber-300 font-bold flex items-center space-x-1">
                          <span>🎨 Self-Created Work</span>
                        </span>
                      </label>

                      {/* Digital Only Wishlist Toggle */}
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDigitalOnlyWishlist}
                          onChange={(e) => setIsDigitalOnlyWishlist(e.target.checked)}
                          className="rounded bg-slate-900 border-purple-500 text-purple-500 focus:ring-0"
                        />
                        <span className="text-xs text-purple-300 font-bold flex items-center space-x-1">
                          <span>✨ Digital Only / Dreamlist (Unacquired Target)</span>
                        </span>
                      </label>
                    </div>

                    {/* Self-Created Creator / Designer Metadata Form Block */}
                    {isSelfCreated && (
                      <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                        <span className="text-xs text-amber-300 font-bold font-mono uppercase tracking-wider block">
                          🎨 Creator & Maker Design Portfolio Metadata
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-300 mb-1">Medium & Tools Used</label>
                            <input
                              type="text"
                              value={mediumTools}
                              onChange={(e) => setMediumTools(e.target.value)}
                              placeholder="e.g. Oil on Canvas, Procreate, Leather, Figma"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-300 mb-1">Creation Date</label>
                            <input
                              type="date"
                              value={creationDate}
                              onChange={(e) => setCreationDate(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-300 mb-1">Edition / Proof Info</label>
                            <input
                              type="text"
                              value={editionInfo}
                              onChange={(e) => setEditionInfo(e.target.value)}
                              placeholder="e.g. Original 1/1, AP #2, Run #45/100"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-purple-300 font-mono focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-300 mb-1">Portfolio Status</label>
                            <select
                              value={portfolioStatus}
                              onChange={(e) => setPortfolioStatus(e.target.value as any)}
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-none"
                            >
                              <option value="completed">Completed Work</option>
                              <option value="in-progress">In Progress (WIP)</option>
                              <option value="for-sale">Available For Sale</option>
                              <option value="nfs-archived">NFS (Archived / Personal)</option>
                            </select>
                          </div>
                        </div>

                        {/* Commission & Requester Info Block */}
                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          <span className="text-[11px] text-purple-300 font-bold font-mono uppercase tracking-wider block">
                            👤 Client / Requester Commission Details
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <label className="block text-[10px] text-slate-300 mb-1">Requester / Client Name</label>
                              <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="e.g. Museum of Fine Arts or @art_collector"
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-sky-300 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-300 mb-1">Commission Status</label>
                              <select
                                value={commissionStatus}
                                onChange={(e) => setCommissionStatus(e.target.value as any)}
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none"
                              >
                                <option value="self-initiated">Self-Initiated Work</option>
                                <option value="commissioned">Commissioned Order</option>
                                <option value="client-proof">Client Proof Sent</option>
                                <option value="delivered">Delivered to Client</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-300 mb-1">Commission Fee ($ USD)</label>
                              <input
                                type="number"
                                value={commissionFee}
                                onChange={(e) => setCommissionFee(Number(e.target.value))}
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 font-bold focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-300 mb-1">Delivery Deadline</label>
                              <input
                                type="date"
                                value={deliveryDeadline}
                                onChange={(e) => setDeliveryDeadline(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Distribution Channel Plugins Block */}
                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          <span className="text-[11px] text-indigo-300 font-bold font-mono uppercase tracking-wider block">
                            🌐 Distribution Channel Plugins (ArtStation, Etsy, Gumroad, KDP, OpenSea)
                          </span>

                          <div className="flex items-center space-x-2 text-xs">
                            <input
                              type="text"
                              value={distChannelName}
                              onChange={(e) => setDistChannelName(e.target.value)}
                              placeholder="Channel Name (e.g. ArtStation, Etsy, KDP)"
                              className="w-1/3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                            />
                            <input
                              type="url"
                              value={distUrl}
                              onChange={(e) => setDistUrl(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-sky-300 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (distChannelName && distUrl) {
                                  setDistChannels(prev => [...prev, {
                                    id: `dist_${Date.now()}`,
                                    channelName: distChannelName,
                                    icon: '🌐',
                                    url: distUrl,
                                    isPublic: true
                                  }]);
                                  setDistChannelName('');
                                  setDistUrl('');
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0"
                            >
                              + Add Channel
                            </button>
                          </div>

                          {distChannels.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {distChannels.map(ch => (
                                <div key={ch.id} className="p-2 rounded-xl bg-slate-950 border border-indigo-500/30 flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-indigo-300 font-bold">{ch.channelName}: <a href={ch.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline font-normal">{ch.url}</a></span>
                                  <button
                                    type="button"
                                    onClick={() => setDistChannels(prev => prev.filter(c => c.id !== ch.id))}
                                    className="text-rose-400 hover:text-rose-300 text-[10px]"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Card Name & Number</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. Charizard #4/102 or Black Lotus"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Card Set / Expansion</label>
                      <input
                        type="text"
                        value={setName}
                        onChange={(e) => setSetName(e.target.value)}
                        placeholder="e.g. Base Set 1st Edition or Alpha"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Card Rarity</label>
                      <input
                        type="text"
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value)}
                        placeholder="e.g. Secret Holo Rare or Ultra Rare"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-purple-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Grading (PSA / BGS / CGC / Raw)</label>
                      <input
                        type="text"
                        value={grading}
                        onChange={(e) => setGrading(e.target.value)}
                        placeholder="e.g. PSA 10 Gem Mint or BGS 9.5"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Purchase Price ($ USD)</label>
                      <input
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-emerald-400 font-bold mb-1">Current Valuation ($ USD)</label>
                      <input
                        type="number"
                        value={currentValuation}
                        onChange={(e) => setCurrentValuation(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Trade / Sale Status</label>
                      <select
                        value={tradeStatus}
                        onChange={(e) => setTradeStatus(e.target.value as TcgTradeStatus)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="kept">🔒 Kept in Personal Vault</option>
                        <option value="for-sale">💰 For Sale</option>
                        <option value="for-trade">🔄 For Trade</option>
                        <option value="sold">✅ Sold</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">TCG Storage Holder</label>
                      <select
                        value={tcgStorage}
                        onChange={(e) => setTcgStorage(e.target.value as TcgStorageType)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="slab-case">🛡️ Slab Case (PSA/BGS/CGC)</option>
                        <option value="binder">📖 9-Pocket Leather Binder</option>
                        <option value="toploader">📄 Toploader Sleeve</option>
                        <option value="one-touch">🧲 One-Touch Magnetic Case</option>
                        <option value="deck-box">📦 Deck Box / Storage Case</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Provenance Chain & Authenticity Verification Links Form */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between text-amber-300 font-bold text-xs font-mono">
                  <span className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>PROVENANCE CHAIN & AUTHENTICITY VERIFICATION LINKS</span>
                  </span>
                  <span className="text-[10px] text-amber-400">Attach Official Cert / Auction Links</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Title / Cert Name</label>
                    <input
                      type="text"
                      value={provenanceTitle}
                      onChange={(e) => setProvenanceTitle(e.target.value)}
                      placeholder="e.g. PSA Cert Verification #4910291"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Verification URL</label>
                    <input
                      type="url"
                      value={provenanceUrl}
                      onChange={(e) => setProvenanceUrl(e.target.value)}
                      placeholder="https://www.psacard.com/cert/..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-sky-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Verification Date</label>
                    <input
                      type="date"
                      value={provenanceDate}
                      onChange={(e) => setProvenanceDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Verifier / Authority</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={provenanceVerifier}
                        onChange={(e) => setProvenanceVerifier(e.target.value)}
                        placeholder="e.g. PSA or Heritage"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddProvenance}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {addedProvenanceLinks.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Attached Links:</span>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {addedProvenanceLinks.map((p, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-[10px] font-mono text-amber-300 flex items-center space-x-1">
                          <span>📜 {p.title}</span>
                          <span className="text-slate-500 font-bold">({p.verifiedBy})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Details */}
              {mediaType !== 'tcg' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Item Title / Name
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Starry Night Canvas or Air Jordan 1"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      {MEDIA_TYPE_CATEGORIES.find(c => c.id === mediaType)?.creatorLabel || 'Creator / Brand'}
                    </label>
                    <input
                      type="text"
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      placeholder="e.g. Vincent van Gogh or Nike"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Physical Location Hierarchy Form */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Physical Location & Auto-Serialization Configurator</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">Address / Facility (Optional)</label>
                    <input
                      type="text"
                      value={addressFacility}
                      onChange={(e) => setAddressFacility(e.target.value)}
                      placeholder="123 Evergreen Terrace or Beach House"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">Room in Home</label>
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="Master Study Vault or Library"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-sky-300 font-bold focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">Bookshelf / Safe ID</label>
                    <input
                      type="text"
                      value={bookshelfRack}
                      onChange={(e) => setBookshelfRack(e.target.value)}
                      placeholder="Fireproof Safe A or Binder 3"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">Shelf Tier / Slot</label>
                    <input
                      type="text"
                      value={shelfTier}
                      onChange={(e) => setShelfTier(e.target.value)}
                      placeholder="Lockbox 1 or Page 4 Slot 5"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Real-time Computed Serialization Code Display */}
                <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 flex items-center justify-between">
                  <span className="text-xs text-indigo-300 font-mono flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Generated Serial Code:</span>
                  </span>
                  <code className="text-xs font-extrabold font-mono text-amber-300 bg-slate-950 px-3 py-1 rounded-lg border border-amber-500/50">
                    {calculatedSerial}
                  </code>
                </div>
              </div>

              {/* Physical Dimension Info Form */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Physical Dimensions & Case Specs</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Height</label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Depth</label>
                    <input
                      type="number"
                      step="0.1"
                      value={depth}
                      onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as 'in' | 'cm')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="in">Inches (in)</option>
                      <option value="cm">Centimeters (cm)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Case / Holder / Protection Specs</label>
                  <input
                    type="text"
                    value={materialFrame}
                    onChange={(e) => setMaterialFrame(e.target.value)}
                    placeholder="PSA Acrylic Slab, Leather Vault X Binder, Toploader, etc."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Item Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="pokemon, psa10, charizard, shadowless, vaulted"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-purple-300 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save TCG / Physical Item
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">TCG & Provenance Engine v3.8</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
