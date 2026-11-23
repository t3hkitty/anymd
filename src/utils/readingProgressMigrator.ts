/**
 * Reading Progress & Canonical Identity Migrator (`readingProgressMigrator.ts`)
 * 🐾 Kawaiianism v3.1 Anti-Slop Directive
 *
 * Guarantees that ebook file remapping, WebDAV URL changes, or offline mode
 * never wipes out active reading progress, chapter indices, or bookmarks.
 *
 * Migration Rules:
 * 1. Primary key is strictly `kittlibr_reading_pos_<bookId>` or `kittlibr_reading_pos_<contentHash>`.
 * 2. Scans for legacy progress saved under raw URLs (e.g. https://uploads.filejump.com/dav/...)
 *    or local file:// URIs and migrates them safely to the stable canonical ID.
 * 3. Logs unmapped keys via defaultHostInstance.log() with stage: 'progress_migration'.
 */

import type { Book, ReadingPosition } from '../types/resonance';
import { defaultHostInstance } from '../../contracts/libr-contract';

const PROGRESS_PREFIX = 'kittlibr_reading_pos_';

/**
 * Generate a deterministic canonical slug for a book (author + title normalized)
 */
export function generateCanonicalBookSlug(author: string, title: string): string {
  const normAuth = (author || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const normTitle = (title || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${normAuth}_${normTitle}`.replace(/_+/g, '_').slice(0, 80);
}

/**
 * Get stored reading position for a book by stable ID or fallback slug
 */
export function getStoredReadingPosition(book: Book): ReadingPosition | null {
  if (!book) return null;

  // 1. Check primary ID key
  const primaryKey = `${PROGRESS_PREFIX}${book.id}`;
  const raw = localStorage.getItem(primaryKey);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Pass through
    }
  }

  // 2. Check canonical slug fallback
  const slug = generateCanonicalBookSlug(book.author, book.title);
  const slugKey = `${PROGRESS_PREFIX}${slug}`;
  const slugRaw = localStorage.getItem(slugKey);
  if (slugRaw) {
    try {
      return JSON.parse(slugRaw);
    } catch {
      // Pass through
    }
  }

  // 3. Check legacy externalReaderUri / webdavPath aliases
  if (book.externalReaderUri) {
    const legacyUriRaw = localStorage.getItem(`${PROGRESS_PREFIX}${book.externalReaderUri}`);
    if (legacyUriRaw) {
      try {
        const parsed = JSON.parse(legacyUriRaw);
        // Self-heal: persist under primary ID
        saveReadingPosition(book, parsed);
        return parsed;
      } catch {}
    }
  }

  // Return book's embedded defaults if nothing in localStorage
  return {
    cfi: book.chapters?.[book.currentChapterIndex]?.cfiBase || 'epubcfi(/6/2[chapter-1]!/4/1:0)',
    progressPercent: 0,
    chapterIndex: book.currentChapterIndex || 0,
    chapterTitle: book.chapters?.[book.currentChapterIndex]?.title || 'Chapter 1',
    paragraphIndex: book.currentParagraphIndex || 0,
    paragraphSnippet: book.chapters?.[book.currentChapterIndex]?.paragraphs?.[book.currentParagraphIndex] || ''
  };
}

/**
 * Persist reading position under stable book ID and canonical slug
 */
export function saveReadingPosition(book: Book, position: ReadingPosition): void {
  if (!book || !position) return;
  const payload = JSON.stringify(position);

  // Store under primary book ID
  localStorage.setItem(`${PROGRESS_PREFIX}${book.id}`, payload);

  // Also mirror under normalized slug for portable cross-import resilience
  const slug = generateCanonicalBookSlug(book.author, book.title);
  localStorage.setItem(`${PROGRESS_PREFIX}${slug}`, payload);

  defaultHostInstance.log({
    level: 'debug',
    source: 'reading-progress',
    stage: 'runtime',
    message: `Saved progress for "${book.title}": Ch ${position.chapterIndex + 1}, Para ${position.paragraphIndex} (${position.progressPercent}%)`,
    meta: { bookId: book.id, chapterIndex: position.chapterIndex, paragraphIndex: position.paragraphIndex }
  });
}

/**
 * Scan localStorage and migrate any legacy URL-keyed progress to canonical IDs
 */
export function migrateLegacyReadingProgressKeys(knownBooks: Book[]): { migrated: number; unmapped: string[] } {
  const unmapped: string[] = [];
  let migrated = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Detect legacy keys containing URLs or raw paths
      const isLegacy = key.includes('uploads.filejump.com') ||
                       key.includes('/dav/') ||
                       key.includes('file://') ||
                       (key.startsWith('reading_pos_') && !key.startsWith(PROGRESS_PREFIX));

      if (isLegacy) {
        const rawVal = localStorage.getItem(key);
        if (!rawVal) continue;

        // Try to match against a known book by title or URI
        const matchedBook = knownBooks.find(b => 
          key.toLowerCase().includes(b.title.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
          (b.externalReaderUri && key.includes(b.externalReaderUri))
        );

        if (matchedBook) {
          try {
            const parsed = JSON.parse(rawVal);
            saveReadingPosition(matchedBook, parsed);
            localStorage.removeItem(key); // Cleanup legacy entry
            migrated++;
            defaultHostInstance.log({
              level: 'info',
              source: 'progress-migration',
              stage: 'progress_migration',
              message: `Migrated legacy progress key "${key}" to canonical ID "${matchedBook.id}"`,
              meta: { legacyKey: key, bookId: matchedBook.id }
            });
          } catch {
            unmapped.push(key);
          }
        } else {
          unmapped.push(key);
        }
      }
    }
  } catch (err: any) {
    defaultHostInstance.log({
      level: 'warn',
      source: 'progress-migration',
      stage: 'progress_migration',
      message: `Error during progress migration scan: ${err?.message || err}`,
      meta: { error: String(err) }
    });
  }

  if (unmapped.length > 0) {
    defaultHostInstance.log({
      level: 'debug',
      source: 'progress-migration',
      stage: 'progress_migration',
      message: `Preserved ${unmapped.length} unmapped legacy progress keys without deleting.`,
      meta: { count: unmapped.length }
    });
  }

  return { migrated, unmapped };
}
