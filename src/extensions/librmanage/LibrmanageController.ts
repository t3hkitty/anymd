/**
 * librmanage: eLibrary Manager-Style Faceted Catalog & Metadata Inspector
 * Provides Moon+ Reader catalog cards, interactive +/- tag chips, and atomic YAML editor.
 */

import { BookMetadataYaml, FilterState } from '../../types/kittlibr-ext';
import { FlatFileMetadataAdapter } from '../../adapters/storage/FlatFileMetadataAdapter';

export class LibrmanageController {
  private adapter: FlatFileMetadataAdapter;
  private currentFilter: FilterState = {
    includeTags: [],
    excludeTags: [],
    groupBy: 'Tags',
    searchQuery: '',
    sortBy: 'title',
    sortOrder: 'asc'
  };

  constructor(adapter: FlatFileMetadataAdapter) {
    this.adapter = adapter;
  }

  public getFilterState(): FilterState {
    return { ...this.currentFilter };
  }

  /**
   * Single Tap / Left Click: Add +include tag
   */
  public addIncludeTag(tag: string): void {
    if (!this.currentFilter.includeTags.includes(tag)) {
      this.currentFilter.includeTags.push(tag);
      this.currentFilter.excludeTags = this.currentFilter.excludeTags.filter(t => t !== tag);
    }
  }

  /**
   * Long-Press / Right Click: Add -exclude tag
   */
  public addExcludeTag(tag: string): void {
    if (!this.currentFilter.excludeTags.includes(tag)) {
      this.currentFilter.excludeTags.push(tag);
      this.currentFilter.includeTags = this.currentFilter.includeTags.filter(t => t !== tag);
    }
  }

  public removeFilterTag(tag: string): void {
    this.currentFilter.includeTags = this.currentFilter.includeTags.filter(t => t !== tag);
    this.currentFilter.excludeTags = this.currentFilter.excludeTags.filter(t => t !== tag);
  }

  public clearFilters(): void {
    this.currentFilter.includeTags = [];
    this.currentFilter.excludeTags = [];
    this.currentFilter.searchQuery = '';
  }

  public setGroupBy(groupBy: FilterState['groupBy']): void {
    this.currentFilter.groupBy = groupBy;
  }

  public setSort(by: FilterState['sortBy'], order: FilterState['sortOrder'] = 'asc'): void {
    this.currentFilter.sortBy = by;
    this.currentFilter.sortOrder = order;
  }

  /**
   * Computes faceted groupings with live counts for the slide-out tree
   */
  public async computeFacetTree(): Promise<Map<string, number>> {
    const catalog = await this.adapter.loadCatalog();
    const counts = new Map<string, number>();

    catalog.forEach(book => {
      switch (this.currentFilter.groupBy) {
        case 'Authors':
          counts.set(book.author, (counts.get(book.author) || 0) + 1);
          break;
        case 'Series':
          if (book.series) counts.set(book.series, (counts.get(book.series) || 0) + 1);
          break;
        case 'Tags':
          book.tags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
          break;
        case 'Warnings':
          book.warnings?.forEach(w => counts.set(w, (counts.get(w) || 0) + 1));
          break;
        case 'Status':
          counts.set(book.status, (counts.get(book.status) || 0) + 1);
          break;
      }
    });

    return counts;
  }

  public async getFilteredCatalog(): Promise<BookMetadataYaml[]> {
    const list = await this.adapter.loadCatalog(this.currentFilter);
    return list.sort((a, b) => {
      let cmp = 0;
      switch (this.currentFilter.sortBy) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'author': cmp = a.author.localeCompare(b.author); break;
        case 'series_index': cmp = (a.series_index || 0) - (b.series_index || 0); break;
        case 'date_added': cmp = a.date_added.localeCompare(b.date_added); break;
        case 'rating': cmp = (a.rating || 0) - (b.rating || 0); break;
        case 'word_count': cmp = (a.word_count || 0) - (b.word_count || 0); break;
      }
      return this.currentFilter.sortOrder === 'asc' ? cmp : -cmp;
    });
  }

  /**
   * Atomic Save for the Universal 'More Info' Inspector Modal
   */
  public async saveMoreInfo(book: BookMetadataYaml, vaultRoot: string): Promise<{ success: boolean; error?: string }> {
    try {
      const ok = await this.adapter.saveBookMetadata(book, vaultRoot);
      return { success: ok };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
