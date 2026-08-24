/**
 * AnyMDDB Markdown Placeholder & Wishlist Entry Generator
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class PlaceholderGenerator {
  /**
   * Create an AnyMDDB Markdown placeholder entry for a book.
   * @param {string} libraryBaseDir - Target library root directory.
   * @param {object} book - Book metadata from feed.
   */
  static createEntry(libraryBaseDir, book) {
    const wishlistDir = path.join(libraryBaseDir, 'wishlist');
    if (!fs.existsSync(wishlistDir)) {
      fs.mkdirSync(wishlistDir, { recursive: true });
    }

    const cleanTitle = (book.title || 'Untitled').trim();
    const cleanAuthor = (book.author || 'Unknown Author').trim();
    
    // File name: "Author - Title.md"
    const safeBaseName = `${cleanAuthor} - ${cleanTitle}`.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 100).trim();
    const filePath = path.join(wishlistDir, `${safeBaseName}.md`);

    // Check if already exists
    if (fs.existsSync(filePath)) {
      return { status: 'already_exists', filePath, title: cleanTitle };
    }

    const tags = Array.isArray(book.tags) ? book.tags : ['wishlist'];
    if (!tags.includes('wishlist')) tags.push('wishlist');

    const frontmatter = {
      title: cleanTitle,
      author: cleanAuthor,
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      asin: book.asin || '',
      release_date: book.releaseDate || '',
      status: 'wishlist',
      source_list: book.sourceList || 'Curated Ingestion',
      cover_url: book.coverUrl || '',
      created_at: new Date().toISOString(),
      tags: tags,
      acquisition: {
        checked_at: null,
        gutenberg_url: null,
        openlibrary_url: null,
        annas_archive_query: `https://annas-archive.org/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanAuthor)}`,
        overdrive_query: `https://www.overdrive.com/search?q=${encodeURIComponent(cleanTitle)}`
      }
    };

    const description = book.description || book.synopsis || 'No synopsis provided.';
    const content = `---\n${yaml.dump(frontmatter).trim()}\n---\n\n# ${cleanTitle}\n\n**Author**: ${cleanAuthor}\n**Source**: ${frontmatter.source_list}\n**Status**: \`wishlist\`\n\n## Synopsis\n\n${description}\n\n## Acquisition Notes\n- Auto-generated placeholder entry from curated feed.\n`;

    fs.writeFileSync(filePath, content, 'utf-8');

    return { status: 'created', filePath, title: cleanTitle, author: cleanAuthor };
  }

  /**
   * List all current wishlist placeholder entries in the library.
   */
  static listEntries(libraryBaseDir) {
    const wishlistDir = path.join(libraryBaseDir, 'wishlist');
    if (!fs.existsSync(wishlistDir)) return [];

    const files = fs.readdirSync(wishlistDir).filter(f => f.endsWith('.md'));
    const entries = [];

    files.forEach(filename => {
      const filePath = path.join(wishlistDir, filename);
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (match) {
          const fm = yaml.load(match[1]);
          entries.push({
            filename,
            filePath,
            ...fm,
            synopsisPreview: match[2].substring(0, 150)
          });
        }
      } catch (_) {}
    });

    return entries;
  }

  /**
   * Update status of an entry (e.g. from 'wishlist' to 'acquired').
   */
  static updateStatus(filePath, newStatus, acquiredDetails = {}) {
    if (!fs.existsSync(filePath)) throw new Error('File not found');

    const raw = fs.readFileSync(filePath, 'utf-8');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error('Invalid Markdown frontmatter');

    const fm = yaml.load(match[1]);
    fm.status = newStatus;
    fm.updated_at = new Date().toISOString();
    if (acquiredDetails.localFilePath) {
      fm.local_epub_path = acquiredDetails.localFilePath;
    }

    const newContent = `---\n${yaml.dump(fm).trim()}\n---\n${match[2]}`;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    return fm;
  }
}

module.exports = PlaceholderGenerator;
