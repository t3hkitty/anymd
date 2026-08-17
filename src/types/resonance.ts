export type EmotionalTier = 'diaper-emergency' | 'snot-cascade' | 'betrayal-rage' | 'trash-fire';

export interface EmotionalPreset {
  id: EmotionalTier;
  title: string;
  badgeCategory: string;
  tierName: string;
  emoji: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  exampleQuote: string;
}

export interface ReadingPosition {
  cfi: string;
  progressPercent: number;
  chapterIndex: number;
  chapterTitle: string;
  paragraphIndex: number;
  paragraphSnippet: string;
}

export interface ResonanceEntry {
  id: string;
  timestamp: string; // ISO date string or formatted date
  formattedDate: string; // e.g. 2026-08-17
  progressPercent: number;
  category: string;
  presetTier?: EmotionalTier;
  rawText: string;
  cfi: string;
  chapterTitle: string;
  paragraphIndex: number;
  paragraphSnippet: string;
  intensityScore?: number; // 1-5 scale
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  totalChapters: number;
  currentChapterIndex: number;
  currentParagraphIndex: number;
  sidecarMarkdown: string;
  resonanceStream: ResonanceEntry[];
  chapters: {
    title: string;
    cfiBase: string;
    paragraphs: string[];
  }[];
}
