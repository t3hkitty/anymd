import type { StorageAccessMode, ConfigStorageLocation } from './cloudAccounts';

export type PluginId =
  | 'library-view'
  | 'list-view'
  | 'carousel-view'
  | 'bookshelf-spines'
  | 'wardrobe-hangers'
  | 'selective-metadata'
  | 'micro-tweets'
  | 'moonplus-rel-root'
  | 'epub-engine'
  | 'calibre-db'
  | 'obsidian-notion-sync'
  | 'webnovel-reader'
  | 'webdav-indexer'
  | 'theme-engine'
  | 'custom-monetizer-plugin';

export interface PluginManifest {
  id: PluginId;
  name: string;
  version: string;
  description: string;
  author: string;
  enabledByDefault: boolean;
  category: 'metadata' | 'reader' | 'storage' | 'export' | 'social';
}

export interface WebDAVConfig {
  serverUrl: string;
  username: string;
  token: string;
  autoSync: boolean;
}

export interface PluginState {
  enabledPlugins: Record<PluginId, boolean>;
  relLinkRoot: string;
  webdavConfig: WebDAVConfig;
  activeTheme: string;
  localAccessMode?: StorageAccessMode;
  configStorageLocation?: ConfigStorageLocation;
}

export interface MetadataSearchResult {
  id?: string;
  title: string;
  author: string;
  coverUrl?: string;
  publishYear?: number;
  publisher?: string;
  isbn?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  genres?: string[];
}

export interface SelectiveMetadataSelection {
  title: boolean;
  author: boolean;
  publishYear: boolean;
  publisher: boolean;
  isbn: boolean;
  summary: boolean;
  tags: boolean;
  coverUrl?: boolean;
  description?: boolean;
  genres?: boolean;
}

export interface MicroTweetEntry {
  id: string;
  text: string;
  timestamp: string;
  cfi: string;
  chapterTitle: string;
  hashtags: string[];
  progressPercent?: number;
  formattedDate?: string;
  content?: string;
  tags?: string[];
}
