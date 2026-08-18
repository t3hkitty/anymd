export type MediaTypeId =
  | 'books'
  | 'movies'
  | 'paintings'
  | 'shoes'
  | 'wardrobe'
  | 'music'
  | 'games'
  | 'collectibles'
  | 'tcg';

export type TcgStorageType = 'binder' | 'toploader' | 'one-touch' | 'slab-case' | 'deck-box';
export type TcgTradeStatus = 'kept' | 'for-sale' | 'for-trade' | 'sold';

export interface ProvenanceRecord {
  id: string;
  title: string; // e.g. "PSA Certification Verification #4910291"
  url: string;   // e.g. "https://www.psacard.com/cert/4910291"
  date?: string;  // e.g. "2021-04-15"
  notes?: string; // e.g. "Acquired from Heritage Auctions Lot #49102"
  verifiedBy?: string; // e.g. "PSA", "Heritage Auctions", "Sotheby's"
}

export interface TcgMetadata {
  cardName: string;
  setName: string;
  rarity: string;
  grading?: string; // e.g. "PSA 10 Gem Mint", "BGS 9.5", "Raw NM"
  purchasePrice: number;
  currentValuation: number;
  tradeStatus: TcgTradeStatus;
  tcgStorage: TcgStorageType;
  isVaultedInSafe: boolean;
}

export interface PhysicalLocation {
  country: string;
  addressFacility?: string;
  room: string;
  bookshelfRack: string;
  shelfTier?: string;
  serializationCode?: string;
}

export interface PhysicalDimensions {
  width: number;
  height: number;
  depth?: number;
  unit: 'in' | 'cm';
  materialFrame?: string;
}

export interface CreatorMetadata {
  mediumTools?: string; // e.g. "Oil on Canvas, Blender 3D, Procreate, Figma, Leather"
  creationDate?: string; // e.g. "2026-03-15"
  editionInfo?: string; // e.g. "Original 1/1, Artist Proof #2, Limited Run #45/100"
  portfolioStatus?: 'in-progress' | 'completed' | 'for-sale' | 'nfs-archived';
}

export interface RequesterInfo {
  clientName?: string; // e.g. "Museum of Fine Arts", "Private Collector @art_enthusiast"
  commissionStatus?: 'self-initiated' | 'commissioned' | 'client-proof' | 'delivered';
  commissionFee?: number; // Fee charged or paid ($ USD)
  deliveryDeadline?: string;
}

export interface DistributionChannel {
  id: string;
  channelName: string; // e.g. "ArtStation", "Etsy Shop", "Gumroad", "Amazon KDP", "OpenSea"
  icon: string;
  url: string;
  isPublic: boolean;
}

export interface CuratedCollection {
  id: string;
  name: string; // e.g. "Pop Collection", "Loki Multiverse Set", "90s Nostalgia Vault"
  description?: string;
  icon?: string;
  itemIds: string[]; // Array of book or media item IDs
}

export interface MediaItem {
  id: string;
  title: string;
  creator: string; // Author, Director, Artist, Designer/Brand, Card Set
  mediaType: MediaTypeId;
  location: PhysicalLocation;
  dimensions?: PhysicalDimensions;
  tcgInfo?: TcgMetadata;
  provenanceLinks?: ProvenanceRecord[];
  isDigitalOnlyDreamlist?: boolean; // True if item is digital-only / Dreamlist (unacquired target item, e.g. don't have that Pop figure just yet, but keeping notes on Loki's shade of green)
  isDigitalOnlyWishlist?: boolean; // Backward compatibility alias for Dreamlists
  isSelfCreated?: boolean; // True if artist/designer/author documenting their own creation
  creatorMetadata?: CreatorMetadata;
  requesterInfo?: RequesterInfo;
  distributionChannels?: DistributionChannel[];
  notes?: string;
  serialCode: string;
  sidecarMdPath?: string;
  tags: string[];
  coverColor?: string;
}

export interface MediaTypeCategoryInfo {
  id: MediaTypeId;
  name: string;
  icon: string;
  creatorLabel: string;
  description: string;
  defaultUnit: 'in' | 'cm';
}

export const MEDIA_TYPE_CATEGORIES: MediaTypeCategoryInfo[] = [
  {
    id: 'tcg',
    name: 'TCG & Trading Cards',
    icon: '🃏',
    creatorLabel: 'Card Set / Publisher',
    description: 'Trading cards (Pokemon, MTG, Yu-Gi-Oh!) with binders, slabs, market valuations & vaulted status.',
    defaultUnit: 'in'
  },
  {
    id: 'books',
    name: 'Books & Literature',
    icon: '📚',
    creatorLabel: 'Author / Translator',
    description: 'Physical hardcover, paperback, and companion sidecars (.md/dcmd).',
    defaultUnit: 'in'
  },
  {
    id: 'collectibles',
    name: 'Antiques & Collectibles / Pop Figures',
    icon: '🏛️',
    creatorLabel: 'Manufacturer / Brand',
    description: 'Funko Pops, figurines, relics, rare artifacts, and digital-only wishlist items.',
    defaultUnit: 'in'
  },
  {
    id: 'movies',
    name: 'Movies & Film (DVD / Blu-ray)',
    icon: '🎬',
    creatorLabel: 'Director / Studio',
    description: 'Physical Blu-ray, 4K UHD, DVD cases, and film media.',
    defaultUnit: 'in'
  },
  {
    id: 'paintings',
    name: 'Art & Paintings / Sculptures',
    icon: '🖼️',
    creatorLabel: 'Artist / Medium',
    description: 'Framed canvas paintings, prints, gallery art, and sculptures with precise dimensions.',
    defaultUnit: 'in'
  },
  {
    id: 'shoes',
    name: 'Shoes & Footwear Collection',
    icon: '👟',
    creatorLabel: 'Brand / Designer',
    description: 'Sneakers, boots, formal footwear, and boxed shoe racks.',
    defaultUnit: 'in'
  },
  {
    id: 'wardrobe',
    name: 'Wardrobe & Fashion / Outfits',
    icon: '👗',
    creatorLabel: 'Designer / Tailor',
    description: 'Hanging wardrobe items, suits, dresses, outerwear, and accessories.',
    defaultUnit: 'in'
  },
  {
    id: 'music',
    name: 'Vinyl Records & Music Albums',
    icon: '🎵',
    creatorLabel: 'Artist / Band / Label',
    description: 'Vinyl 12" LPs, CDs, cassettes, and physical music releases.',
    defaultUnit: 'in'
  },
  {
    id: 'games',
    name: 'Video Games & Cartridges',
    icon: '🎮',
    creatorLabel: 'Developer / Publisher',
    description: 'Retro game cartridges, disc cases, and physical gaming media.',
    defaultUnit: 'in'
  }
];

export function generatePhysicalSerialCode(
  address: string,
  room: string,
  bookshelfRack: string,
  mediaType: MediaTypeId,
  index: number
): string {
  const houseMatch = address.match(/\d+/);
  const houseNum = houseMatch ? houseMatch[0] : '100';

  const words = address.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  const streetInitials = words.map(w => w[0]?.toUpperCase() || '').join('').slice(0, 3) || 'MAIN';

  const roomCode = room.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'ROOM';
  const shelfCode = bookshelfRack.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'RACK';
  const typePrefix = mediaType.slice(0, 2).toUpperCase();
  const paddedIndex = String(index).padStart(3, '0');

  return `${houseNum}-${streetInitials}-${roomCode}-${shelfCode}-${typePrefix}${paddedIndex}`;
}
