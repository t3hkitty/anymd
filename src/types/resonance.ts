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
  reactionImageUrl?: string; // Reaction GIF or image URL (Discord-style sticker/reaction)
  reactionGifCaption?: string; // Optional caption for the attached reaction image
  emojiReactions?: string[]; // Discord-style emoji reaction bursts (e.g. ['🔥', '💀', '😭'])
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  coverImageUrl?: string; // Cropped item / card cover image URL or base64 data
  originalImageUrl?: string; // Full size uncropped upload / binder scan URL
  externalReaderUri?: string; // Direct file URL or protocol handler to launch an external reader
  totalChapters: number;
  currentChapterIndex: number;
  currentParagraphIndex: number;
  sidecarMarkdown: string;
  tradeValueUsd?: number; // Estimated fair trade value in USD (supports decimals e.g. 24.50, 1250.75)
  isAvailableForTrade?: boolean; // Flag indicating if item is actively available for trading
  isWebPresenceOnly?: boolean; // Flag if webnovel exists as web presence only without local EPUB
  resonanceStream: ResonanceEntry[];
  chapters: {
    title: string;
    cfiBase: string;
    paragraphs: string[];
  }[];
}
