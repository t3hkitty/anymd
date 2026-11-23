/**
 * rcloneLsfSidecarEngine.ts
 * 🐾 Kawaiianism v3.1 Anti-Slop Directive
 *
 * Implements high-speed targeted `rclone lsf` output parsing and .anymd sidecar generation:
 * - Supports `rclone lsf --format "pst" --separator ";"` or `rclone lsf --csv --files-only`
 * - Extracts book titles, authors, relative roots, file sizes, and formats (.epub, .pdf, .mobi, .cbr, .cbz, .md)
 * - Emits diagnostic telemetry via defaultHostInstance.log() for stage: 'catalog_read' and 'sidecar_gen'
 * - Provides step-by-step progress callback for live countdowns: (detected X files, importing #/####, ~2m left)
 */

import type { Book } from '../types/resonance';
import { cleanMeowFilename, buildCompanionSidecarHeader } from '../utils/pathResolver';
import { defaultHostInstance } from '../../contracts/libr-contract';

export interface RcloneLsfItem {
  path: string;
  filename: string;
  sizeBytes: number;
  modTime?: string;
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
 * Parses raw output from `rclone lsf`
 * Standard formats supported:
 * 1. Semi-colon separated `--format "pst"` -> `path;size;modTime`
 * 2. Comma separated `--csv --format "ps"` -> `path,size`
 * 3. Plain filenames (one per line)
 */
export function parseRcloneLsfOutput(rawOutput: string, separator: string = ';'): RcloneLsfItem[] {
  if (!rawOutput) return [];
  const lines = rawOutput.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: RcloneLsfItem[] = [];

  for (const line of lines) {
    if (line.startsWith('#') || line.length === 0) continue;

    const isDir = line.endsWith('/');
    let cleanLine = isDir ? line.slice(0, -1) : line;

    let path = cleanLine;
    let sizeBytes = 0;
    let modTime: string | undefined = undefined;

    if (cleanLine.includes(separator)) {
      const parts = cleanLine.split(separator);
      path = parts[0]?.trim() || '';
      const rawSize = parseInt(parts[1]?.trim() || '0', 10);
      if (!isNaN(rawSize)) sizeBytes = rawSize;
      if (parts[2]) modTime = parts[2].trim();
    }

    const filename = path.split('/').pop() || path;
    const extMatch = filename.match(/\.([0-9a-z]+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    items.push({
      path,
      filename,
      sizeBytes,
      modTime,
      ext,
      isDir
    });
  }

  defaultHostInstance.log({
    level: 'info',
    source: 'rclone-lsf',
    stage: 'catalog_read',
    message: `Parsed ${items.length} entries from rclone lsf output (${items.filter(i => !i.isDir).length} files)`,
    meta: { total: items.length, sample: items.slice(0, 3) }
  });

  return items;
}

/**
 * Extracts author and title heuristically from folder paths or filenames
 * E.g. "Frank Herbert/Dune/Dune.epub" -> Author: Frank Herbert, Title: Dune
 * E.g. "Brandon Sanderson - The Way of Kings.epub" -> Author: Brandon Sanderson, Title: The Way of Kings
 */
export function extractMetadataFromPath(itemPath: string): { author: string; title: string } {
  const parts = itemPath.split('/').filter(Boolean);
  const rawFileName = parts.pop() || itemPath;
  const baseName = rawFileName.replace(/\.(epub|pdf|mobi|azw3|cbr|cbz|md|txt)$/i, '');

  if (parts.length >= 2) {
    const authorDir = cleanMeowFilename(parts[0]);
    const titleDir = cleanMeowFilename(parts[1]);
    return {
      author: authorDir || 'Unknown Author',
      title: titleDir || cleanMeowFilename(baseName)
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
 * Converts parsed rclone lsf items into Books with .anymd YAML sidecars.
 * Dispatches live progress events to track: "detected X files, importing #/####, ~2m left"
 */
export async function generateSidecarsFromLsf(
  lsfItems: RcloneLsfItem[],
  relLinkRoot: string = './Library',
  onProgress?: (p: SidecarGenerationProgress) => void,
  chunkSize: number = 25
): Promise<Book[]> {
  const fileItems = lsfItems.filter(i => !i.isDir && /\.(epub|pdf|mobi|azw3|cbr|cbz|md)$/i.test(i.filename));
  const total = fileItems.length;
  const books: Book[] = [];
  const startTime = Date.now();

  defaultHostInstance.log({
    level: 'info',
    source: 'rclone-lsf',
    stage: 'catalog_read',
    message: `Starting sidecar generation for ${total} detected ebook files with relRoot: ${relLinkRoot}`,
    meta: { totalFiles: total, relLinkRoot }
  });

  for (let i = 0; i < total; i++) {
    const item = fileItems[i];
    const { author, title } = extractMetadataFromPath(item.path);

    const bookId = `rclone-lsf-${Date.now()}-${i}`;
    const sidecarHeader = buildCompanionSidecarHeader(title, author, relLinkRoot, {
      rclone_remote_path: item.path,
      file_size_bytes: item.sizeBytes,
      extension: item.ext,
      mod_time: item.modTime || new Date().toISOString()
    });

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
      sidecarMarkdown: sidecarHeader + `## Reading Telemetry\n- File: \`${item.filename}\` (${(item.sizeBytes / 1024 / 1024).toFixed(2)} MB)\n\n## Reader Resonance Stream\n`,
      resonanceStream: [],
      chapters: [
        {
          title: `Chapter 1: ${title}`,
          cfiBase: `epubcfi(/6/2[lsf_${i}]!`,
          paragraphs: [
            `Indexed via targeted rclone lsf from remote path: ${item.path}.`,
            `File size: ${(item.sizeBytes / 1024 / 1024).toFixed(2)} MB.`,
            `Sidecar companion metadata generated cleanly.`
          ]
        }
      ]
    };

    books.push(book);

    // Yield back to main thread periodically so UI stays reactive and smooth
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
      // Micro-pause to unblock frame rendering
      await new Promise(res => setTimeout(res, 4));
    }
  }

  defaultHostInstance.log({
    level: 'info',
    source: 'rclone-lsf',
    stage: 'sidecar_gen',
    message: `Generated ${books.length} .anymd sidecars in ${((Date.now() - startTime) / 1000).toFixed(2)}s`,
    meta: { generatedCount: books.length }
  });

  return books;
}
