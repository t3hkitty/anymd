/**
 * kittlibr-ext.ts — Kittlibr 6-Slot Extension Contract & Metadata Types
 * Decoupled from AGPL host chassis via serializable JSON/IPC schemas.
 */

export type KittlibrSlotId =
  | 'librmanage'
  | 'librget'
  | 'librscrape'
  | 'librfind'
  | 'libr_ai'
  | 'librsync';

export interface KittlibrExtensionManifest {
  identifier: string;
  slot: KittlibrSlotId;
  displayName: string;
  version: string;
  author: string;
  license: 'MIT' | 'Apache-2.0' | 'AGPL-3.0';
  entrypoint: string;
  sha256?: string;
  permissions: Array<'storage:read' | 'storage:write' | 'rclone:rpc' | 'network:loopback'>;
}

export interface BookMetadataYaml {
  title: string;
  author: string;
  series?: string;
  series_index?: number;
  tags: string[];
  warnings?: string[];
  status: 'Unread' | 'Reading' | 'Finished';
  rating?: number;
  word_count?: number;
  page_count?: number;
  date_added: string;
  last_read?: string;
  source_vault: string;
  relative_path: string;
  zettelkasten_id?: string;
  synopsis?: string;
}

export interface FilterState {
  includeTags: string[];
  excludeTags: string[];
  groupBy: 'Authors' | 'Series' | 'Tags' | 'Warnings' | 'Status' | 'Smart Shelves';
  searchQuery: string;
  sortBy: 'title' | 'author' | 'series_index' | 'date_added' | 'last_read' | 'rating' | 'word_count';
  sortOrder: 'asc' | 'desc';
}

export interface KittlibrExtensionHooks {
  onCatalogQuery?(filter: FilterState): Promise<BookMetadataYaml[]>;
  onBookCardRender?(book: BookMetadataYaml): void;
  onBookInfoOpen?(book: BookMetadataYaml): void;
  onBookMetadataSave?(book: BookMetadataYaml): Promise<{ success: boolean; error?: string }>;
  onIngestFile?(fileUri: string, targetVault: string): Promise<string>;
  onSyncTrigger?(vaultId: string, dryRun?: boolean): Promise<{ filesTransferred: number }>;
}
