export type ImportSourceType = 'goodreads-csv' | 'markdown-list' | 'json-opds' | 'html-list' | 'auto';

export interface AcquisitionLink {
  providerId: string;
  providerName: string;
  icon: string;
  label: string;
  url: string;
  isAppScheme: boolean; // e.g. kindle:// or libby://
}

export interface AcquisitionProviderPlugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  generateLinks: (title: string, author: string, isbn?: string) => AcquisitionLink[];
}

export interface ImportedBookItem {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  rating?: number;
  dateRead?: string;
  tags: string[];
  readingStatus: 'to-read' | 'reading' | 'completed' | 'DNF';
  confidenceScore: number; // 0 - 100
  selected: boolean;
  isWebPresenceOnly?: boolean; // Flag if item is online webnovel / web presence only without local EPUB
  acquisitionLinks?: AcquisitionLink[];
}

export interface PostImportVerificationResult {
  verifiedCount: number;
  totalParsed: number;
  relLinkRoot: string;
}
