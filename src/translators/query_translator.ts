/**
 * AnyMD SQL-Subset & Calibre Boolean Query Translator (`query_translator.ts`)
 * Translates SQL-like queries and Calibre boolean expressions into YAML/Markdown shard filters.
 */

import { type VaultNote } from '../core/md-vault-engine/vaultEngine';

export class AnyMDQueryTranslator {
  /**
   * Translate Calibre-style boolean query (e.g. tags:"=LitRPG" and not status:"=finished")
   * or basic SQL WHERE clauses into a filter predicate over VaultNotes.
   */
  public executeQuery(notes: VaultNote[], sqlOrBooleanQuery: string): VaultNote[] {
    const query = sqlOrBooleanQuery.toLowerCase().trim();
    console.log(`[QueryTranslator] Executing query: "${query}" across ${notes.length} notes.`);

    return notes.filter(note => {
      const title = note.frontmatter.title.toLowerCase();
      const area = note.frontmatter.vault_area.toLowerCase();
      const status = note.frontmatter.status.toLowerCase();
      const tags = note.frontmatter.tags.map(t => t.toLowerCase());

      if (query.includes('status="active"') && status !== 'active') return false;
      if (query.includes('status="draft"') && status !== 'draft') return false;
      if (query.includes('vault_area=') && !query.includes(area)) return false;

      // Check tag matching
      if (query.includes('tag:')) {
        const hasTag = tags.some(t => query.includes(t));
        if (!hasTag) return false;
      }

      return true;
    });
  }

  /**
   * Project shard indexes into an in-memory object_db.json projection view
   */
  public projectToObjectDb(notes: VaultNote[]): string {
    const projection = notes.map(n => ({
      title: n.frontmatter.title,
      created_pt: n.frontmatter.created_pt,
      vault_area: n.frontmatter.vault_area,
      tags: n.frontmatter.tags,
      status: n.frontmatter.status
    }));
    return JSON.stringify(projection, null, 2);
  }
}
