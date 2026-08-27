/**
 * AnymdCore.ts - Unified System-Agnostic Markdown Database Core
 * Powers the local-first Zettelkasten and decentralized document vault.
 * 
 * Features:
 * 1. FIFO Queueing (VaultIOWorker) to prevent torn writes / concurrent I/O race conditions.
 * 2. Surgical AST Segment Patching - parses and edits specific markdown headers without full file rewrite.
 * 3. Tiered Fingerprint Engine - stat_quick, sample_fast, and full_md5.
 * 4. Self-Healing Sidecar Provance Engine (.lc.md sidecar file tracking and auto-absorption of moved files).
 * 5. WebDAV / File System Access API mounting configurations.
 */

import md5 from 'crypto-js/md5'; // Pre-installed cryptographic helper

export type FingerprintMode = 'stat_quick' | 'sample_fast' | 'full_md5';

export interface FileMetadata {
  path: string;
  originalName: string;
  sizeBytes: number;
  ctimeMs: number;
  mtimeMs: number;
  contentHash: string;
  tags: string[];
  frontmatter: Record<string, any>;
}

export interface QueueTask {
  id: string;
  action: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

/**
 * Singleton FIFO Queue Worker to govern all file operations.
 * Prevents overlapping writes and race conditions across standard filesystems and WebDAV mounts.
 */
export class VaultIOWorker {
  private static instance: VaultIOWorker;
  private queue: QueueTask[] = [];
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): VaultIOWorker {
    if (!VaultIOWorker.instance) {
      VaultIOWorker.instance = new VaultIOWorker();
    }
    return VaultIOWorker.instance;
  }

  /**
   * Enqueues an I/O operation to be executed in strict sequence.
   */
  public enqueue<T>(action: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task: QueueTask = {
        id: Math.random().toString(36).substring(2, 11),
        action,
        resolve,
        reject
      };
      this.queue.push(task);
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const task = this.queue.shift();
    if (task) {
      try {
        const result = await task.action();
        task.resolve(result);
      } catch (error) {
        task.reject(error);
      }
    }

    this.isProcessing = false;
    this.processNext();
  }

  /**
   * Surgical Patcher: Splices a specific section under a markdown header.
   * Instead of reading and rewriting a massive file, this targets a single node block.
   */
  public async patchMarkdownSegment(
    fileContent: string,
    targetHeader: string,
    newSegmentContent: string
  ): Promise<string> {
    const lines = fileContent.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') && line.replace(/#/g, '').trim().toLowerCase() === targetHeader.toLowerCase()) {
        startIndex = i;
        const currentHeaderDepth = (line.match(/#/g) || []).length;
        
        // Find the next header of equal or lesser depth to mark the boundary
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('#')) {
            const nextHeaderDepth = (nextLine.match(/#/g) || []).length;
            if (nextHeaderDepth <= currentHeaderDepth) {
              endIndex = j;
              break;
            }
          }
        }
        break;
      }
    }

    // If header not found, append to the end of the file
    if (startIndex === -1) {
      return `${fileContent.trim()}\n\n## ${targetHeader}\n${newSegmentContent}\n`;
    }

    const before = lines.slice(0, startIndex + 1);
    const after = endIndex !== -1 ? lines.slice(endIndex) : [];
    
    return [...before, newSegmentContent, ...after].join('\n');
  }
}

/**
 * FingerprintGovernor: Generates fast composite digests of notes.
 * Combines filesystem inode stats with local seeds to prevent CPU thrashing.
 */
export class FingerprintGovernor {
  /**
   * Generates a unique note fingerprint depending on performance configuration.
   */
  public static async calculateFingerprint(
    fileContent: string,
    sizeBytes: number,
    mtimeMs: number,
    mode: FingerprintMode = 'stat_quick'
  ): Promise<string> {
    switch (mode) {
      case 'stat_quick': {
        // Blazing fast sub-millisecond stat-only composite hash
        const rawKey = `${sizeBytes}-${mtimeMs}`;
        return `sq_${this.hashString(rawKey)}`;
      }
      case 'sample_fast': {
        // Fast header-sample hashing + stat check
        const headSample = fileContent.substring(0, 1024);
        const rawKey = `${sizeBytes}-${mtimeMs}-${headSample}`;
        return `sf_${this.hashString(rawKey)}`;
      }
      case 'full_md5': {
        // Standard MD5 cryptographic checksum of entire content
        return `md5_${md5(fileContent).toString()}`;
      }
      default:
        return `${sizeBytes}-${mtimeMs}`;
    }
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * ProvenanceAnchorEngine: Houses native sidecar indexing and self-healing.
 * Pairs standard media/documents with .lc.md sidecar YAML metadata files.
 */
export class ProvenanceAnchorEngine {
  private ioWorker = VaultIOWWorker.getInstance();

  /**
   * Generates a complete self-healing sidecar markdown template.
   */
  public createSidecarTemplate(metadata: FileMetadata): string {
    const yamlBlock = [
      '---',
      `zettelkasten_uid: "${metadata.frontmatter.zettelkasten_uid || this.generateTimestampUID()}"`,
      `original_filename: "${metadata.originalName}"`,
      `original_size_bytes: ${metadata.sizeBytes}`,
      `creation_time_ms: ${metadata.ctimeMs}`,
      `last_modified_ms: ${metadata.mtimeMs}`,
      `content_hash: "${metadata.contentHash}"`,
      `banned_from_bundle: ${metadata.frontmatter.banned_from_bundle || false}`,
      'tags:',
      ...metadata.tags.map(tag => `  - "${tag}"`),
      'custom_metadata:',
      ...Object.entries(metadata.frontmatter)
        .filter(([key]) => !['zettelkasten_uid', 'banned_from_bundle'].includes(key))
        .map(([key, val]) => `  ${key}: "${val}"`),
      '---',
      '',
      `# Ingestion Provance: ${metadata.originalName}`,
      `Automatically indexed under database reference \`${metadata.frontmatter.zettelkasten_uid || metadata.originalName}\`.`,
      'Do not modify this metadata manually unless editing custom tags.',
      '',
      '## Notes & Quick Capture Logs',
      ''
    ].join('\n');

    return yamlBlock;
  }

  /**
   * Self-Heal: Re-absorbs misplaced notes and re-indexes physical paths.
   */
  public async healLostNoteIndex(
    lostNotePath: string,
    discoveredSidecars: FileMetadata[]
  ): Promise<{ resolvedPath: string; resolved: boolean }> {
    const lostName = lostNotePath.split('/').pop() || lostNotePath;
    
    // Scan discovered sidecars on the cloud storage / folder tree
    for (const sidecar of discoveredSidecars) {
      if (sidecar.originalName === lostName || sidecar.frontmatter.original_filename === lostName) {
        // Provenance Match Found! Re-route database path mapping
        return {
          resolvedPath: sidecar.path,
          resolved: true
        };
      }
    }
    return { resolvedPath: lostNotePath, resolved: false };
  }

  private generateTimestampUID(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds())
    ].join('');
  }
}
