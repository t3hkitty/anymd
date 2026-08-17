import type { EmotionalPreset } from '../types/resonance';

export const EMOTIONAL_PRESETS: EmotionalPreset[] = [
  {
    id: 'diaper-emergency',
    tierName: 'The "Diaper Emergency" Tier',
    title: 'Comedy / Laughter Exile',
    badgeCategory: 'Comedy / Laughter Exile',
    emoji: '🤣',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
    description: 'Uncontrolled silent laughter, mattress shaking, exile from the bed by an angry spouse.',
    exampleQuote: 'LAUGHED SO HARD THE RIBS SEIZED... BANISHED TO THE LIVING ROOM FLOOR.'
  },
  {
    id: 'snot-cascade',
    tierName: 'The "Snot & Tear Cascade" Tier',
    title: 'Devastation / Tear Cascade',
    badgeCategory: 'Devastation / Tear Cascade',
    emoji: '😭',
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.1) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    description: 'Absolute structural failure of the nasal passages, blindsiding emotional devastation without warning.',
    exampleQuote: 'ABSOLUTE STRUCTURAL FAILURE OF THE NASAL PASSAGES. DID NOT SEE THIS COMING.'
  },
  {
    id: 'betrayal-rage',
    tierName: 'The "Betrayal & Rage" Tier',
    title: 'Character Betrayal & Rage',
    badgeCategory: 'Character Betrayal',
    emoji: '🤬',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    description: 'Sudden character death, last-minute narrative rug-pulls, and absolute rejection of terrible relationship choices.',
    exampleQuote: 'HE IS DOING IT AGAIN. IMPALED BY BAD GUYS? REALLY?? REMEMBER THE ALAMO!'
  },
  {
    id: 'trash-fire',
    tierName: 'The "Trash Fire" Tier',
    title: 'Trash Fire DNF',
    badgeCategory: 'Trash Fire DNF',
    emoji: '🔥',
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(194, 65, 12, 0.1) 100%)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
    description: 'Abandoning a book halfway through due to repetitive, mind-numbing character obsession.',
    exampleQuote: 'ABANDONING SHIP AT 54%. REPETITIVE OBSESSION HAS CONSUMED THE PLOT.'
  }
];
