/**
 * rcloneLsfSidecarEngine.ts
 * 🐾 Kawaiianism v3.1 Anti-Slop Directive
 *
 * Implements high-speed targeted `rclone lsf` output parsing and maximum-fidelity .anymd YAML sidecar generation.
 * Extracts EVERYTHING possible from rclone commands:
 * - p: path (full relative remote path)
 * - s: size (exact bytes and human-readable MB)
 * - t: modification time (ISO 8601)
 * - h: content hash (MD5, SHA-1, or DropboxHash)
 * - i: remote object ID
 * - o: original underlying object ID
 * - m: MIME type (e.g. application/epub+zip, application/pdf)
 * - e: encrypted name if obfuscated
 * - T: storage tier (Hot, Cool, Archive)
 * - M: full JSON metadata blob ({ "mtime": "...", "btime": "...", "owner": "..." })
 *
 * Emits structured YAML frontmatter for seamless reuse across Calibre, Obsidian, Moon+ Reader,
 * and AnyMD Zettelkasten databases.
 */

import type { Book } from '../types/resonance';
import { cleanMeowFilename, buildCompanionSidecarHeader } from '../utils/pathResolver';
import { defaultHostInstance } from '../../contracts/libr-contract';

export interface RcloneLsfItem {
  path: string;
  filename: string;
  sizeBytes: number;
  modTime?: string;
  hash?: string;
  hashType?: string;
  objectId?: string;
  originalId?: string;
  mimeType?: string;
  encryptedName?: string;
  storageTier?: string;
  rawMetadata?: Record<string, any>;
  ext: string;
  isDir: boolean;
}

export interface SidecarGenerationProgress {
  totalDetected: number;
  currentProcessed: number;
  currentFilename: string;
  percent: number;
  etaSeconds: number;
  stage: 'scanning' | 'parsing' | 'generating_sidecars' | 'completed';
}

/**
 * Format string tokens for rclone lsf:
 * 'p': path, 's': size, 't': modTime, 'h': hash, 'i': id, 'o': origId, 'm': mimeType, 'e': encName, 'T': tier, 'M': metadataJson
 */
export const RECOMMENDED_RCLONE_LSF_FORMAT = 'psthiomeTM';

/**
 * Parses raw output from `rclone lsf` with arbitrary format specifiers or JSON
 * Supports:
 * 1. Delimited text with known format string (e.g. `psthimTeM` or `pst`)
 * 2. `rclone lsjson` or `rclone lsf --csv`
 * 3. Default semicolon/comma separated files
 */
export function parseRcloneLsfOutput(
  rawOutput: string,
  separator: string = ';',
  formatTokens: string = 'pst'
): RcloneLsfItem[] {
  if (!rawOutput) return [];
  const trimmed = rawOutput.trim();

  // If input is JSON (from `rclone lsjson` or `rclone rc operations/list`)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsedJson = JSON.parse(trimmed);
      if (Array.isArray(parsedJson)) {
        return parsedJson.map((item: any) => {
          const path = item.Path || item.Name || '';
          const isDir = Boolean(item.IsDir);
          const filename = path.split('/').pop() || path;
          const extMatch = filename.match(/\.([0-9a-z]+)$/i);
          return {
            path,
            filename,
            sizeBytes: item.Size || 0,
            modTime: item.ModTime,
            hash: item.Hashes?.MD5 || item.Hashes?.SHA1 || item.Hashes?.DropboxHash || '',
            hashType: item.Hashes ? Object.keys(item.Hashes)[0] : undefined,
            objectId: item.ID,
            mimeType: item.MimeType,
            storageTier: item.Tier,
            rawMetadata: item.Metadata,
            ext: extMatch ? extMatch[1].toLowerCase() : '',
            isDir
          };
        });
      }
    } catch {
      // Fall through to line-by-line parsing
    }
  }

  const lines = rawOutput.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: RcloneLsfItem[] = [];
  const tokens = formatTokens.split('');

  for (const line of lines) {
    if (line.startsWith('#') || line.length === 0) continue;

    const isDir = line.endsWith('/');
    const cleanLine = isDir ? line.slice(0, -1) : line;

    if (!cleanLine.includes(separator) && !formatTokens.includes(';')) {
      // Simple path only
      const filename = cleanLine.split('/').pop() || cleanLine;
      const extMatch = filename.match(/\.([0-9a-z]+)$/i);
      items.push({
        path: cleanLine,
        filename,
        sizeBytes: 0,
        ext: extMatch ? extMatch[1].toLowerCase() : '',
        isDir
      });
      continue;
    }

    const parts = cleanLine.split(separator);
    let path = '';
    let sizeBytes = 0;
    let modTime: string | undefined;
    let hash: string | undefined;
    let objectId: string | undefined;
    let originalId: string | undefined;
    let mimeType: string | undefined;
    let encryptedName: string | undefined;
    let storageTier: string | undefined;
    let rawMetadata: Record<string, any> | undefined;

    tokens.forEach((tok, idx) => {
      const val = parts[idx]?.trim();
      if (!val) return;

      switch (tok) {
        case 'p':
          path = val;
          break;
        case 's': {
          const s = parseInt(val, 10);
          if (!isNaN(s)) sizeBytes = s;
          break;
        }
        case 't':
          modTime = val;
          break;
        case 'h':
          if (val !== 'ERROR' && val !== 'UNSUPPORTED') hash = val;
          break;
        case 'i':
          objectId = val;
          break;
        case 'o':
          originalId = val;
          break;
        case 'm':
          mimeType = val;
          break;
        case 'e':
          encryptedName = val;
          break;
        case 'T':
          storageTier = val;
          break;
        case 'M':
          try {
            rawMetadata = JSON.parse(val);
          } catch {
            rawMetadata = { raw: val };
          }
          break;
      }
    });

    if (!path && parts[0]) path = parts[0];
    const filename = path.split('/').pop() || path;
    const extMatch = filename.match(/\.([0-9a-z]+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    items.push({
      path,
      filename,
      sizeBytes,
      modTime,
      hash,
      objectId,
      originalId,
      mimeType: mimeType || inferMimeType(ext),
      encryptedName,
      storageTier,
      rawMetadata,
      ext,
      isDir
    });
  }

  defaultHostInstance.log({
    level: 'info',
    source: 'rclone-lsf',
    stage: 'catalog_read',
    message: `Parsed ${items.length} rclone items with full metadata schema (${items.filter(i => !i.isDir).length} files)`,
    meta: { total: items.length, formatTokens }
  });

  return items;
}

/**
 * Infer standard MIME type from extension
 */
export function inferMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'epub':
      return 'application/epub+zip';
    case 'pdf':
      return 'application/pdf';
    case 'mobi':
      return 'application/x-mobipocket-ebook';
    case 'azw3':
      return 'application/vnd.amazon.ebook';
    case 'cbr':
      return 'application/vnd.comicbook-rar';
    case 'cbz':
      return 'application/vnd.comicbook+zip';
    case 'md':
    case 'dcmd':
      return 'text/markdown';
    case 'txt':
      return 'text/plain';
    case 'mp3':
      return 'audio/mpeg';
    case 'm4b':
      return 'audio/mp4';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Extracts author and title heuristically from folder paths or filenames
 */
export function extractMetadataFromPath(itemPath: string): { author: string; title: string; series?: string } {
  const parts = itemPath.split('/').filter(Boolean);
  const rawFileName = parts.pop() || itemPath;
  const baseName = rawFileName.replace(/\.(epub|pdf|mobi|azw3|cbr|cbz|md|dcmd|txt)$/i, '');

  if (parts.length >= 2) {
    const authorDir = cleanMeowFilename(parts[0]);
    const secondDir = cleanMeowFilename(parts[1]);
    return {
      author: authorDir || 'Unknown Author',
      title: cleanMeowFilename(baseName) || secondDir,
      series: secondDir !== baseName ? secondDir : undefined
    };
  }

  if (baseName.includes(' - ')) {
    const split = baseName.split(' - ');
    return {
      author: cleanMeowFilename(split[0].trim()),
      title: cleanMeowFilename(split.slice(1).join(' - ').trim())
    };
  }

  return {
    author: parts[0] ? cleanMeowFilename(parts[0]) : 'Library Collection',
    title: cleanMeowFilename(baseName)
  };
}

/**
 * Converts parsed rclone lsf items into Books with exhaustive .anymd YAML sidecars.
 * Dispatches live progress events to track: "detected X files, importing #/####, ~2m left"
 */
export async function generateSidecarsFromLsf(
  lsfItems: RcloneLsfItem[],
  relLinkRoot: string = './Library',
  onProgress?: (p: SidecarGenerationProgress) => void,
  chunkSize: number = 25
): Promise<Book[]> {
  const fileItems = lsfItems.filter(i => !i.isDir && /\.(epub|pdf|mobi|azw3|cbr|cbz|md|dcmd|txt)$/i.test(i.filename));
  const total = fileItems.length;
  const books: Book[] = [];
  const startTime = Date.now();

  defaultHostInstance.log({
    level: 'info',
    source: 'rclone-lsf',
    stage: 'catalog_read',
    message: `Starting deep sidecar generation for ${total} detected ebook files with relRoot: ${relLinkRoot}`,
    meta: { totalFiles: total, relLinkRoot }
  });

  for (let i = 0; i < total; i++) {
    const item = fileItems[i];
    const { author, title, series } = extractMetadataFromPath(item.path);

    // Build comprehensive metadata dictionary to maximize reusability
    const extraMetadata: Record<string, string | number | string[]> = {
      rclone_remote_path: item.path,
      rclone_filename: item.filename,
      file_size_bytes: item.sizeBytes,
      file_size_formatted: `${(item.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
      mime_type: item.mimeType || inferMimeType(item.ext),
      file_extension: item.ext,
      storage_type: 'rclone_managed_vfs'
    };

    if (item.modTime) extraMetadata['modified_at'] = item.modTime;
    if (item.hash) extraMetadata['content_hash'] = item.hash;
    if (item.hashType) extraMetadata['hash_algorithm'] = item.hashType;
    if (item.objectId) extraMetadata['remote_object_id'] = item.objectId;
    if (item.originalId) extraMetadata['original_object_id'] = item.originalId;
    if (item.storageTier) extraMetadata['storage_tier'] = item.storageTier;
    if (item.encryptedName) extraMetadata['encrypted_alias'] = item.encryptedName;
    if (series) extraMetadata['series_name'] = series;

    // Flatten any raw metadata attributes from rclone JSON (e.g. mtime, btime, tier)
    if (item.rawMetadata) {
      Object.entries(item.rawMetadata).forEach(([k, v]) => {
        if (typeof v === 'string' || typeof v === 'number') {
          extraMetadata[`meta_${k.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`] = v;
        }
      });
    }

    const sidecarHeader = buildCompanionSidecarHeader(title, author, relLinkRoot, extraMetadata);

    const bookId = item.hash
      ? `rclone-${item.hash.slice(0, 16)}`
      : `rclone-lsf-${Date.now()}-${i}`;

    // Rich markdown body containing telemetry tables and technical properties
    let markdownBody = sidecarHeader;
    markdownBody += `## 📊 Rclone Storage Telemetry & VFS Properties\n`;
    markdownBody += `- **Remote Path:** \`${item.path}\`\n`;
    markdownBody += `- **MIME Type:** \`${extraMetadata.mime_type}\`\n`;
    markdownBody += `- **Size:** ${(item.sizeBytes / 1024 / 1024).toFixed(2)} MB (${item.sizeBytes.toLocaleString()} bytes)\n`;
    if (item.hash) markdownBody += `- **Content Hash:** \`${item.hash}\` (${item.hashType || 'MD5'})\n`;
    if (item.storageTier) markdownBody += `- **Storage Tier:** \`${item.storageTier}\`\n`;
    if (item.modTime) markdownBody += `- **Remote Timestamp:** \`${item.modTime}\`\n`;
    markdownBody += `\n## 📝 Reader Resonance Stream\n`;

    const book: Book = {
      id: bookId,
      title,
      author,
      coverColor: item.ext === 'pdf' ? '#dc2626' : item.ext === 'md' ? '#a855f7' : '#0284c7',
      externalReaderUri: `${relLinkRoot.replace(/\/+$/, '')}/${item.path}`,
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      isWebPresenceOnly: false,
      tradeValueUsd: 18.50,
      isAvailableForTrade: true,
      sidecarMarkdown: markdownBody,
      resonanceStream: [],
      chapters: [
        {
          title: `Chapter 1: ${title}`,
          cfiBase: `epubcfi(/6/2[lsf_${i}]!`,
          paragraphs: [
            `Indexed via targeted rclone lsf from remote path: ${item.path}.`,
            `File size: ${(item.sizeBytes / 1024 / 1024).toFixed(2)} MB (${item.sizeBytes.toLocaleString()} bytes).`,
            `MIME Type: ${extraMetadata.mime_type}${item.hash ? ` • Hash: ${item.hash}` : ''}.`,
            `Comprehensive companion .anymd YAML sidecar metadata generated.`
          ]
        }
      ]
    };

    books.push(book);

    // Yield to main thread periodically so the UI stays smooth
    if (i % chunkSize === 0 || i === total - 1) {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const rate = (i + 1) / Math.max(0.1, elapsedSec);
      const remainingSec = Math.max(0, Math.round((total - (i + 1)) / rate));

      if (onProgress) {
        onProgress({
          totalDetected: total,
          currentProcessed: i + 1,
          currentFilename: item.filename,
          percent: Math.min(100, Math.round(((i + 1) / total) * 100)),
          etaSeconds: remainingSec,
          stage: i === total - 1 ? 'completed' : 'generating_sidecars'
        });
      }
      await new Promise(res => setTimeout(res, 4));
    }
  }

  defaultHostInstance.log({
    level: 'info',
    source: 'rclone-lsf',
    stage: 'sidecar_gen',
    message: `Generated ${books.length} maximum-fidelity .anymd sidecars in ${((Date.now() - startTime) / 1000).toFixed(2)}s`,
    meta: { generatedCount: books.length }
  });

  return books;
}
