/**
 * Story Maker & Author Bible Plugin
 * Inspo Ledger (Zettelkasten tagged brain-dumps), Character Role Slugs ([MC], [ML], [MC:eyes]),
 * and AI-Guided Structural Interrogative Drafting Engine.
 */

export interface InspoEntry {
  id: string;
  zettelSerial: string;
  title: string;
  rawThought: string;
  tags: string[];
  category: 'trope' | 'worldbuilding' | 'dialogue-spark' | 'aesthetic' | 'scene-beat';
  createdAt: string;
}

export interface CharacterSlugDefinition {
  roleSlug: string; // e.g. '[MC]', '[ML]', '[Villain]', '[Rival]'
  characterName: string;
  aliases: string[];
  roleTitle: string;
  characteristics: Record<string, string>; // e.g. { eyes: 'Obsidian gold flecks', flaw: 'Impatient pride', secret: 'Sealed meridian' }
  color: string;
  avatarEmoji: string;
}

export interface StructuralDraftingPrompt {
  id: string;
  category: 'narrative-tension' | 'sensory-layer' | 'subtext-conflict' | 'stakes-escalation';
  question: string;
  guidance: string;
  atomicChecklist: string[];
}

export const DEFAULT_CHARACTER_SLUGS: CharacterSlugDefinition[] = [
  {
    roleSlug: '[MC]',
    characterName: 'Shen Qingqiu (Shen Yuan)',
    aliases: ['Peak Lord', 'Cucumber Bro', 'Shizun'],
    roleTitle: 'Protagonist / Transmigrated Scholar',
    characteristics: {
      eyes: 'Cool jade green with analytical sharpness',
      flaw: 'Internal sarcastic panic masked by icy aloofness',
      weapon: 'Xiu Ya (Elegance Sword)',
      secret: 'Bound to the System with point deductions',
      tell: 'Snaps fan shut when agitated'
    },
    color: '#059669',
    avatarEmoji: '🎋'
  },
  {
    roleSlug: '[ML]',
    characterName: 'Luo Binghe',
    aliases: ['Bing-mei', 'Demon Lord', 'White Lotus'],
    roleTitle: 'Male Lead / Heavenly Demon Sovereign',
    characteristics: {
      eyes: 'Starry obsidian with hidden crimson flames',
      flaw: 'Overwhelming abandonment dread',
      weapon: 'Xin Mo (Heart Devil Sword)',
      secret: 'Keeps Shizun\'s dropped fan under pillow',
      tell: 'Puppy-dog eyes when seeking approval'
    },
    color: '#e11d48',
    avatarEmoji: '🗡️'
  },
  {
    roleSlug: '[Villain]',
    characterName: 'Huan Hua Palace Master',
    aliases: ['Old Palace Master', 'Lao Gongzhu'],
    roleTitle: 'Antagonist / Sect Hegemon',
    characteristics: {
      eyes: 'Narrow serpent amber',
      flaw: 'Delusional obsessive possessiveness',
      weapon: 'Water Moon Mirror',
      secret: 'Fabricates rumors to frame Qing Jing Peak',
      tell: 'Strokes golden prayer beads rhythmically'
    },
    color: '#9333ea',
    avatarEmoji: '🐍'
  }
];

export const DEFAULT_INSPO_ENTRIES: InspoEntry[] = [
  {
    id: 'insp-1',
    zettelSerial: 'ZK-20260818-INSP-92F1',
    title: 'Rainstorm Broken Fan Repair Scene',
    rawThought: 'During a midnight thunderstorm, [ML] silently attempts to re-bind the broken bamboo ribs of [MC:weapon] with glowing spirit thread while [MC] pretends to be asleep.',
    tags: ['angst', 'caretaking', 'thunderstorm', 'bamboo-fan'],
    category: 'scene-beat',
    createdAt: '2026-08-18'
  },
  {
    id: 'insp-2',
    zettelSerial: 'ZK-20260818-INSP-43A8',
    title: 'System Penalty Inversion Trope',
    rawThought: 'What if the AI system deducts points every time [MC] tells the truth about his feelings, forcing him into hilarious tsundere dialogue maneuvers?',
    tags: ['comedy', 'system-mechanic', 'dramedy', 'tsundere'],
    category: 'trope',
    createdAt: '2026-08-18'
  }
];

export const STRUCTURAL_DRAFTING_PROMPTS: StructuralDraftingPrompt[] = [
  {
    id: 'sdp-1',
    category: 'narrative-tension',
    question: 'What immediate desire is driving [MC] in this room, and what prevents [ML] from giving it to them?',
    guidance: 'Ensure both characters have incompatible micro-goals in this single paragraph to generate crackling subtext.',
    atomicChecklist: [
      'Establish the physical distance between them in space',
      'Describe a physical micro-action (e.g. [MC:tell])',
      'Deliver dialogue where the surface topic is completely different from the emotional topic'
    ]
  },
  {
    id: 'sdp-2',
    category: 'sensory-layer',
    question: 'What atmospheric sensory cue (smell, temperature, ambient sound) grounds the room right now?',
    guidance: 'Avoid abstract feelings. Root the mood in cold mountain air, faint incense smoke, or distant rain.',
    atomicChecklist: [
      'Name 1 tactile texture (silk sleeve, cold steel, damp cedar)',
      'Describe how light hits [ML:eyes]',
      'End the beat on an interrupted sound'
    ]
  },
  {
    id: 'sdp-3',
    category: 'stakes-escalation',
    question: 'If this conversation ends without resolution, what irreversible disaster looms?',
    guidance: 'Raise the cost of inaction before the paragraph closes.',
    atomicChecklist: [
      'Reference the ticking clock or looming deadline',
      'Show [Villain]\'s shadow or lingering threat',
      'Commit to a decision point that cannot be retracted'
    ]
  }
];

export const INSPO_STORAGE_KEY = 'lc_md_inspo_ledger_v1';
export const SLUGS_STORAGE_KEY = 'lc_md_character_slugs_v1';

export function loadInspoLedger(): InspoEntry[] {
  try {
    const raw = localStorage.getItem(INSPO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load inspo ledger:', err);
  }
  return DEFAULT_INSPO_ENTRIES;
}

export function saveInspoLedger(entries: InspoEntry[]): void {
  try {
    localStorage.setItem(INSPO_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save inspo ledger:', err);
  }
}

export function loadCharacterSlugs(): CharacterSlugDefinition[] {
  try {
    const raw = localStorage.getItem(SLUGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load character slugs:', err);
  }
  return DEFAULT_CHARACTER_SLUGS;
}

export function saveCharacterSlugs(slugs: CharacterSlugDefinition[]): void {
  try {
    localStorage.setItem(SLUGS_STORAGE_KEY, JSON.stringify(slugs));
  } catch (err) {
    console.error('Failed to save character slugs:', err);
  }
}

/**
 * Replace character role and characteristic slugs into polished prose
 * Example: "[MC] looked at [ML:eyes]" -> "Shen Qingqiu looked at Luo Binghe's starry obsidian with hidden crimson flames"
 */
export function compileProseSlugs(draftText: string, slugs: CharacterSlugDefinition[]): string {
  let result = draftText;

  slugs.forEach(char => {
    // 1. Replace characteristic slugs like [MC:eyes], [ML:secret], etc.
    Object.entries(char.characteristics).forEach(([key, val]) => {
      const charSlugPattern = new RegExp(`\\[${char.roleSlug.replace(/[[\]]/g, '')}:${key}\\]`, 'gi');
      result = result.replace(charSlugPattern, val);
    });

    // 2. Replace base role slugs like [MC], [ML], [Villain]
    const baseSlugPattern = new RegExp(`\\[${char.roleSlug.replace(/[[\]]/g, '')}\\]`, 'g');
    result = result.replace(baseSlugPattern, char.characterName);
  });

  return result;
}
