/**
 * AnyMD Sidecar Database & Cloud-Efficient Rclone Indexing Engine
 * Acts as a SQL database replacement over flat-file Markdown and YAML sidecar metadata.
 * Supports side-by-side or .folder/.anymd/ sidecars, paginated index sidecars,
 * and rclone cloud-efficient streaming queries.
 */

import { parseMarkdownNote, serializeMarkdownNote, type VaultNote } from './vaultEngine';

export interface FileMetadataSidecar {
  fileId: string;
  originalFilename: string;
  fileSize: number;
  checksum: string;
  tags: string[];
  customFields: Record<string, any>;
  lastIndexed: string;
}

export interface FolderIndexSidecar {
  indexVersion: string;
  batchNumber: number;
  itemsIndexed: number;
  files: FileMetadataSidecar[];
  updatedAt: string;
}

export class AnyMDSidecarDatabase {
  private vaultRoot: string;
  private batchSize: number;

  constructor(vaultRoot = './sandbox_vault', batchSize = 100) {
    this.vaultRoot = vaultRoot;
    this.batchSize = batchSize;
  }

  /**
   * Generate sidecar metadata for a target file
   */
  public generateSidecar(filename: string, content: string, tags: string[] = []): FileMetadataSidecar {
    return {
      fileId: `id-${Math.random().toString(36).substring(2, 11)}`,
      originalFilename: filename,
      fileSize: content.length,
      checksum: `sha256-${Math.abs(content.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)).toString(16)}`,
      tags,
      customFields: {
        author: '@lorik',
        engine: 'AnyMD-Sidecar-DB'
      },
      lastIndexed: new Date().toISOString()
    };
  }

  /**
   * Generate paginated folder index sidecar (e.g. index_001.yaml) for a batch of files
   */
  public generateFolderIndex(batchNumber: number, sidecars: FileMetadataSidecar[]): FolderIndexSidecar {
    return {
      indexVersion: '1.0.0',
      batchNumber,
      itemsIndexed: sidecars.length,
      files: sidecars,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Simulate SQL-like query over markdown frontmatter and sidecar metadata
   */
  public queryDatabase(notes: VaultNote[], query: { tag?: string; vaultArea?: string; searchTerm?: string }): VaultNote[] {
    return notes.filter(note => {
      if (query.tag && !note.frontmatter.tags.includes(query.tag)) {
        return false;
      }
      if (query.vaultArea && note.frontmatter.vault_area !== query.vaultArea) {
        return false;
      }
      if (query.searchTerm) {
        const term = query.searchTerm.toLowerCase();
        const matchTitle = note.frontmatter.title.toLowerCase().includes(term);
        const matchBody = note.body.toLowerCase().includes(term);
        if (!matchTitle && !matchBody) return false;
      }
      return true;
    });
  }

  /**
   * Generate non-FUSE rclone indexing command for cloud-efficient sidecar processing
   */
  public getRcloneCloudIndexCommand(remotePath = 'gdrive-cold:AnyMD_Vault'): string {
    return `rclone rc operations/list fs="${remotePath}" --fast-list --json`;
  }
}
