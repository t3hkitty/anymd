import type { MediaItem } from '../types/mediaTypes';

export const SAMPLE_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-collectible-loki',
    title: 'Loki (God of Stories - Glorious Purpose Variant)',
    creator: 'Funko Pop! / Marvel Studios (Loki S2)',
    mediaType: 'collectibles',
    location: {
      country: 'United States',
      addressFacility: '123 Evergreen Terrace',
      room: 'Digital Wishlist Cloud Storage',
      bookshelfRack: 'Wishlist Rack 1',
      shelfTier: 'Digital Record',
      serializationCode: '123-ET-DIGIT-WISH-CO001'
    },
    dimensions: {
      width: 3.5,
      height: 4.5,
      depth: 3.5,
      unit: 'in',
      materialFrame: 'Vinyl Box Case (Wishlist)'
    },
    isDigitalOnlyWishlist: true,
    notes: 'Digital only record. Don\'t have this Funko Pop figure just yet, but keeping notes to remember the exact shade of deep emerald olive green Loki was wearing in Season 2 Episode 6 (God of Stories outfit).',
    serialCode: '123-ET-DIGIT-WISH-CO001',
    sidecarMdPath: './Collectibles/loki_glorious_purpose_funko.md',
    tags: ['loki', 'funko-pop', 'digital-only', 'wishlist', 'shade-of-green', 'marvel'],
    coverColor: '#15803d'
  },
  {
    id: 'media-tcg-1',
    title: 'Charizard 1st Edition Holo (Shadowless)',
    creator: 'Wizards of the Coast / Pokemon Base Set (1999)',
    mediaType: 'tcg',
    location: {
      country: 'United States',
      addressFacility: '123 Evergreen Terrace',
      room: 'Master Study Vault',
      bookshelfRack: 'Fireproof Safe A',
      shelfTier: 'Lockbox 1',
      serializationCode: '123-ET-MASTE-FIRE-TC001'
    },
    dimensions: {
      width: 3.2,
      height: 5.4,
      depth: 0.3,
      unit: 'in',
      materialFrame: 'PSA Acrylic Encapsulated Slab'
    },
    tcgInfo: {
      cardName: 'Charizard #4/102 1st Edition',
      setName: 'Base Set 1st Edition Shadowless',
      rarity: 'Secret Holo Rare',
      grading: 'PSA 10 Gem Mint',
      purchasePrice: 12500,
      currentValuation: 245000,
      tradeStatus: 'kept',
      tcgStorage: 'slab-case',
      isVaultedInSafe: true
    },
    provenanceLinks: [
      {
        id: 'prov-1',
        title: 'PSA Official Certification Verification #4910291',
        url: 'https://www.psacard.com/cert/4910291',
        date: '2021-04-12',
        notes: 'Verified Gem Mint 10 Population 122 on official PSA registry database.',
        verifiedBy: 'PSA Professional Sports Authenticator'
      },
      {
        id: 'prov-2',
        title: 'Heritage Auctions Signature Trading Card Auction Lot #49102',
        url: 'https://ha.com/lot/49102',
        date: '2021-05-18',
        notes: 'Purchased at Dallas Signature Auction with physical Certificate of Authenticity.',
        verifiedBy: 'Heritage Auctions Dallas'
      }
    ],
    notes: 'Vaulted in fireproof digital combination safe. Gem mint 10 population 122.',
    serialCode: '123-ET-MASTE-FIRE-TC001',
    sidecarMdPath: './TCG/charizard_1st_edition_psa10.md',
    tags: ['pokemon', 'psa10', 'charizard', 'shadowless', 'vaulted', 'provenance-verified'],
    coverColor: '#dc2626'
  },
  {
    id: 'media-tcg-2',
    title: 'Black Lotus (Alpha Edition)',
    creator: 'Wizards of the Coast / Magic: The Gathering (1993)',
    mediaType: 'tcg',
    location: {
      country: 'United States',
      addressFacility: '123 Evergreen Terrace',
      room: 'Master Study Vault',
      bookshelfRack: 'Fireproof Safe A',
      shelfTier: 'Lockbox 1',
      serializationCode: '123-ET-MASTE-FIRE-TC002'
    },
    dimensions: {
      width: 3.2,
      height: 5.4,
      depth: 0.4,
      unit: 'in',
      materialFrame: 'Beckett Sub-Grades UV Case'
    },
    tcgInfo: {
      cardName: 'Black Lotus Power Nine',
      setName: 'Alpha Edition (1993)',
      rarity: 'Ultra Rare Power 9',
      grading: 'BGS 9.5 Gem Mint',
      purchasePrice: 45000,
      currentValuation: 380000,
      tradeStatus: 'kept',
      tcgStorage: 'slab-case',
      isVaultedInSafe: true
    },
    provenanceLinks: [
      {
        id: 'prov-3',
        title: 'Beckett Grading Services Verification Serial #001094812',
        url: 'https://www.beckett.com/grading/cert/001094812',
        date: '2019-11-05',
        notes: 'Subgrades: Centering 9.5, Corners 9.5, Edges 9.5, Surface 9.0.',
        verifiedBy: 'Beckett Grading Services (BGS)'
      },
      {
        id: 'prov-4',
        title: 'Sotheby\'s Fine Art & Collectibles Provenance Record',
        url: 'https://www.sothebys.com/en/auctions/ecatalogue/2020/trading-cards',
        date: '2020-02-14',
        notes: 'Documented chain of custody from original 1993 booster draft winner.',
        verifiedBy: 'Sotheby\'s New York'
      }
    ],
    notes: 'Subgrades: Centering 9.5, Corners 9.5, Edges 9.5, Surface 9.0. Locked in safe.',
    serialCode: '123-ET-MASTE-FIRE-TC002',
    sidecarMdPath: './TCG/black_lotus_alpha_bgs95.md',
    tags: ['mtg', 'bgs95', 'black-lotus', 'power-nine', 'vaulted', 'provenance-verified'],
    coverColor: '#1e1b4b'
  },
  {
    id: 'media-book-1',
    title: 'The Crafting of Chess',
    creator: 'Kit Falbo',
    mediaType: 'books',
    location: {
      country: 'United States',
      addressFacility: '123 Evergreen Terrace',
      room: 'Library Study',
      bookshelfRack: 'Oak Bookshelf 2',
      shelfTier: 'Shelf 3',
      serializationCode: '123-ET-STUDY-BS2-BK001'
    },
    dimensions: {
      width: 6,
      height: 9,
      depth: 1.2,
      unit: 'in',
      materialFrame: 'Hardcover Leatherette Binding'
    },
    provenanceLinks: [
      {
        id: 'prov-6',
        title: 'Author In-Person Signature & Book Signing Certificate',
        url: 'https://kitfalbo.com/signing-verification',
        date: '2020-11-08',
        notes: 'Signed in person by Kit Falbo at DragonCon 2020.',
        verifiedBy: 'Kit Falbo Official Site'
      }
    ],
    notes: 'Signed first edition hardcover. ASIN: B07P1YRHTX. KU Borrowed on Nov 8, 2020.',
    serialCode: '123-ET-STUDY-BS2-BK001',
    sidecarMdPath: './Library/crafting_of_chess.md',
    tags: ['litrpg', 'gamelit', 'crafting', 'vr', 'hardcover'],
    coverColor: '#0284c7'
  },
  {
    id: 'media-painting-1',
    title: 'Starry Night Over the Rhone (Gallery Print)',
    creator: 'Vincent van Gogh',
    mediaType: 'paintings',
    location: {
      country: 'United States',
      addressFacility: '123 Evergreen Terrace',
      room: 'Main Hallway',
      bookshelfRack: 'East Gallery Display Wall',
      shelfTier: 'Eye Level Mounting',
      serializationCode: '123-ET-MAINH-EAST-PA001'
    },
    dimensions: {
      width: 36,
      height: 28,
      depth: 1.8,
      unit: 'in',
      materialFrame: 'Oil on Canvas with Gilded Walnut Frame'
    },
    provenanceLinks: [
      {
        id: 'prov-7',
        title: 'Musée d\'Orsay Official Replica Provenance Certificate',
        url: 'https://www.musee-orsay.fr/en/collections/works/starry-night-over-rhone',
        date: '2018-09-20',
        notes: 'Hand-painted oil canvas replica authorized by Musée d\'Orsay gallery conservators.',
        verifiedBy: 'Musée d\'Orsay Conservators'
      }
    ],
    notes: 'Museum-grade textured oil canvas replica mounted with brass gallery light.',
    serialCode: '123-ET-MAINH-EAST-PA001',
    sidecarMdPath: './Art/starry_night_rhone.md',
    tags: ['post-impressionism', 'oil-canvas', 'gilded-frame', 'gallery', 'provenance-verified'],
    coverColor: '#1e3a8a'
  }
];
