export interface MusicTrackMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  trackNumber?: number;
  year?: number;
  genre: string[];
  durationSeconds: number;
  bpm?: number;
  musicalKey?: string;
  audioUrl: string;
  coverArtUrl?: string;
  lrcContent?: string;
  hasMondegreens: boolean;
  mondegreenCount: number;
  playCount: number;
  lastPlayed?: string;
  energyLevel?: 'Low Focus' | 'Steady Cadence' | 'Hyperfocus High' | 'Sprint Rage';
  tags?: string[];
  sidecarPath?: string;
}

export interface LyricSyllable {
  timeSec: number;
  text: string;
}

export interface LyricLine {
  index: number;
  startTimeSec: number;
  endTimeSec?: number;
  canonicalText: string;
  mondegreenText?: string;
  wwsgdText?: string;
  syllables?: LyricSyllable[];
}

export interface MondegreenEntry {
  id: string;
  startTimeSec: number;
  endTimeSec: number;
  canonical: string;
  mondegreen: string;
  wwsgdHumor: string;
  humorScore: number;
  personalMemoryAnchor?: string;
}

export type LyricDisplayTier = 'canonical' | 'mondegreen' | 'wwsgd' | 'dual';
export type AudioPlaybackSpeed = 0.75 | 1.0 | 1.15 | 1.25;
