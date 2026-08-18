import type { EmotionalTier } from '../types/resonance';

export interface ReactionGifItem {
  id: string;
  title: string;
  url: string;
  category: EmotionalTier | 'mind-blown' | 'cinema' | 'wholesome';
  tags: string[];
  emoji: string;
}

export const CONTEXT_AWARE_REACTION_GIFS: ReactionGifItem[] = [
  // 1. Diaper Emergency / Laughing / Hysterical
  {
    id: 'gif-laughing-cat',
    title: 'Vibing / Laughing Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    category: 'diaper-emergency',
    tags: ['laughing', 'cat', 'hysterical', 'wheezing', 'comedy', 'funny'],
    emoji: '🤣'
  },
  {
    id: 'gif-spiderman-pointing',
    title: 'Spider-Man Pointing',
    url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400',
    category: 'diaper-emergency',
    tags: ['spiderman', 'meme', 'pointing', 'twins', 'parallel'],
    emoji: '👉'
  },
  {
    id: 'gif-popcat',
    title: 'Popcat Open Mouth',
    url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400',
    category: 'diaper-emergency',
    tags: ['popcat', 'clicking', 'meme', 'viral', 'hype'],
    emoji: '🐱'
  },

  // 2. Snot Cascade / Weeping / Pure Emotion / Heartbreak
  {
    id: 'gif-crying-thumbsup',
    title: 'Crying Thumbs Up Cat',
    url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400',
    category: 'snot-cascade',
    tags: ['crying', 'tears', 'thumbsup', 'emotional', 'pain', 'sad'],
    emoji: '😭'
  },
  {
    id: 'gif-rain-solitude',
    title: 'Dramatic Rain Window',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400',
    category: 'snot-cascade',
    tags: ['rain', 'solitude', 'melancholy', 'drama', 'grief'],
    emoji: '🌧️'
  },

  // 3. Betrayal Rage / Table Flip / Shock
  {
    id: 'gif-shocked-expression',
    title: 'Shocked / Mind Blown Gasp',
    url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400',
    category: 'betrayal-rage',
    tags: ['shock', 'betrayal', 'gasp', 'unbelievable', 'rage', 'tableflip'],
    emoji: '😱'
  },
  {
    id: 'gif-dramatic-fire',
    title: 'Burning Inferno / Rage',
    url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400',
    category: 'betrayal-rage',
    tags: ['fire', 'rage', 'furious', 'villain', 'revenge'],
    emoji: '🔥'
  },

  // 4. Trash Fire / This is Fine / Cringe
  {
    id: 'gif-this-is-fine',
    title: 'This is Fine (Everything is Burning)',
    url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category: 'trash-fire',
    tags: ['thisisfine', 'trashfire', 'cringe', 'chaos', 'burning'],
    emoji: '☕'
  },
  {
    id: 'gif-facepalm',
    title: 'Cat Facepalm / Despair',
    url: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=400',
    category: 'trash-fire',
    tags: ['facepalm', 'cringe', 'awkward', 'ooc', 'scum-villain'],
    emoji: '🤦'
  },

  // 5. Mind-Blown / Absolute Cinema
  {
    id: 'gif-galaxy-brain',
    title: 'Galaxy Brain / Cosmic Energy',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    category: 'mind-blown',
    tags: ['galaxy', 'brain', 'genius', 'chess', 'litrpg', 'mindblown'],
    emoji: '🤯'
  },
  {
    id: 'gif-cinema-applause',
    title: 'Standing Ovation / Absolute Cinema',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
    category: 'cinema',
    tags: ['cinema', 'applause', 'masterpiece', 'danmei', 'mxtx', 'epic'],
    emoji: '🎬'
  },
  {
    id: 'gif-doge-wow',
    title: 'Doge Much Wow',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
    category: 'wholesome',
    tags: ['doge', 'much-wow', 'wholesome', 'meme', 'kabosu'],
    emoji: '🐕'
  },
  {
    id: 'gif-pacman-ghost-fruit',
    title: 'Pac-Man Chasing Ghosts & Eating Fruit (Waka Waka Waka)',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    category: 'wholesome',
    tags: ['pacman', 'waka', 'ghost', 'fruit', 'arcade', 'retro', 'alone', 'greenday', 'boulevard', 'eating', 'nostalgia', 'kid', 'tweet', 'punk', 'rock'],
    emoji: '🕹️'
  }
];

export function getContextAwareGifs(
  tier?: EmotionalTier | null,
  text: string = ''
): ReactionGifItem[] {
  const lowerText = text.toLowerCase();

  // If text mentions specific keywords, prioritize those matches
  const keywordMatches = CONTEXT_AWARE_REACTION_GIFS.filter(g => 
    g.tags.some(tag => lowerText.includes(tag))
  );

  if (keywordMatches.length > 0) {
    const others = CONTEXT_AWARE_REACTION_GIFS.filter(g => !keywordMatches.includes(g));
    return [...keywordMatches, ...others];
  }

  if (tier) {
    const tierMatches = CONTEXT_AWARE_REACTION_GIFS.filter(g => g.category === tier);
    const others = CONTEXT_AWARE_REACTION_GIFS.filter(g => g.category !== tier);
    return [...tierMatches, ...others];
  }

  return CONTEXT_AWARE_REACTION_GIFS;
}
