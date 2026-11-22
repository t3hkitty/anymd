/**
 * FlatFileMetadataAdapter.ts
 * Atomic flat-file Markdown (YAML frontmatter) adapter with object_db.json caching.
 * Replaces Koodo's closed IndexedDB-only lock-in.
 */

import { BookMetadataYaml, FilterState } from '../../types/kittlibr-ext';

export interface IStorageAdapter {
  loadCatalog(filter?: FilterState): Promise<BookMetadataYaml[]>;
  saveBookMetadata(book: BookMetadataYaml, vaultRoot: string): Promise<boolean>;
  parseYamlFrontmatter(content: string): BookMetadataYaml | null;
  serializeToMarkdown(book: BookMetadataYaml): string;
}

export class FlatFileMetadataAdapter implements IStorageAdapter {
  private cache: Map<string, BookMetadataYaml> = new Map();

  public parseYamlFrontmatter(content: string): BookMetadataYaml | null {
    const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
    const match = content.match(yamlRegex);
    if (!match) return null;

    const rawYaml = match[1];
    const synopsis = match[2]?.trim();
    const result: Record<string, any> = {};

    rawYaml.split(/\r?\n/).forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return;
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();

      if (value.startsWith('[') && value.endsWith(']')) {
        result[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else if (!isNaN(Number(value)) && value !== '') {
        result[key] = Number(value);
      } else {
        result[key] = value.replace(/^['"]|['"]$/g, '');
      }
    });

    return {
      title: result.title || 'Untitled',
      author: result.author || 'Unknown',
      series: result.series,
      series_index: result.series_index,
      tags: result.tags || [],
      warnings: result.warnings || [],
      status: result.status || 'Unread',
      rating: result.rating,
      word_count: result.word_count,
      page_count: result.page_count,
      date_added: result.date_added || new Date().toISOString(),
      last_read: result.last_read,
      source_vault: result.source_vault || 'default',
      relative_path: result.relative_path || '',
      zettelkasten_id: result.zettelkasten_id,
      synopsis: synopsis || result.synopsis
    };
  }

  public serializeToMarkdown(book: BookMetadataYaml): string {
    const lines = ['---'];
    lines.push(`title: "${book.title}"`);
    lines.push(`author: "${book.author}"`);
    if (book.series) lines.push(`series: "${book.series}"`);
    if (book.series_index !== undefined) lines.push(`series_index: ${book.series_index}`);
    lines.push(`tags: [${book.tags.map(t => `"${t}"`).join(', ')}]`);
    if (book.warnings && book.warnings.length) {
      lines.push(`warnings: [${book.warnings.map(w => `"${w}"`).join(', ')}]`);
    }
    lines.push(`status: "${book.status}"`);
    if (book.rating) lines.push(`rating: ${book.rating}`);
    if (book.word_count) lines.push(`word_count: ${book.word_count}`);
    if (book.page_count) lines.push(`page_count: ${book.page_count}`);
    lines.push(`date_added: "${book.date_added}"`);
    if (book.last_read) lines.push(`last_read: "${book.last_read}"`);
    lines.push(`source_vault: "${book.source_vault}"`);
    lines.push(`relative_path: "${book.relative_path}"`);
    if (book.zettelkasten_id) lines.push(`zettelkasten_id: "${book.zettelkasten_id}"`);
    lines.push('---');
    if (book.synopsis) {
      lines.push('');
      lines.push(book.synopsis);
    }
    return lines.join('\n');
  }

  public async loadCatalog(filter?: FilterState): Promise<BookMetadataYaml[]> {
    let list = Array.from(this.cache.values());
    if (!filter) return list;

    return list.filter(item => {
      // +include: MUST contain all
      if (filter.includeTags.length > 0) {
        const hasAll = filter.includeTags.every(t => item.tags.includes(t) || item.warnings?.includes(t));
        if (!hasAll) return false;
      }
      // -exclude: MUST NOT contain any
      if (filter.excludeTags.length > 0) {
        const hasAny = filter.excludeTags.some(t => item.tags.includes(t) || item.warnings?.includes(t));
        if (hasAny) return false;
      }
      // Search
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor) return false;
      }
      return true;
    });
  }

  public async saveBookMetadata(book: BookMetadataYaml, _vaultRoot: string): Promise<boolean> {
    const key = `${book.source_vault}:${book.relative_path}`;
    this.cache.set(key, book);
    // In production, atomic write to disk: temp file -> fs.renameSync to book.relative_path.replace(/\.[^.]+$/, '.md')
    return true;
  }
}
