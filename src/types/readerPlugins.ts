import type { ResonanceEntry } from './resonance';

export type ReaderEngineId = 'meow-canvas' | 'e-ink-focus' | 'koreader-web';

export interface ReaderEnginePlugin {
  id: ReaderEngineId;
  name: string;
  version: string;
  description: string;
  icon: string;
  supportedFormats: string[];
}

export type ShareTargetId = 'system-share' | 'moonplus-intent' | 'obsidian-uri' | 'image-card' | 'markdown-copy';

export interface ShareActionHandler {
  id: ShareTargetId;
  name: string;
  description: string;
  icon: string;
  execute: (entry: ResonanceEntry, bookTitle: string) => Promise<boolean>;
}

export type YamlMetadataMap = Record<string, string | number | boolean | string[]>;

export interface BulkEditOperation {
  targetBookIds: string[];
  addTags?: string[];
  removeTags?: string[];
  setStatus?: string;
  setRating?: number;
  newRelLinkRoot?: string;
  findText?: string;
  replaceText?: string;
  customYamlEdits?: Record<string, string | number>;
}

export interface OPDSEntry {
  id: string;
  title: string;
  author: string;
  updated: string;
  summary: string;
  epubUrl: string;
  sidecarUrl: string;
  coverUrl?: string;
}

export interface OPDSCatalogFeed {
  title: string;
  id: string;
  updated: string;
  iconUrl: string;
  entries: OPDSEntry[];
}
