/**
 * AnyMDDB Author Subscription & Release Tracking Engine
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yaml = require('js-yaml');
const PlaceholderGenerator = require('../generator/placeholder');

class AuthorTracker {
  /**
   * Subscribe to or update an author in AnyMDDB.
   */
  static subscribe(libraryBaseDir, authorName, extraData = {}) {
    const authorsDir = path.join(libraryBaseDir, 'authors');
    if (!fs.existsSync(authorsDir)) {
      fs.mkdirSync(authorsDir, { recursive: true });
    }

    const cleanAuthor = authorName.replace(/^by\s+/i, '').trim();
    if (!cleanAuthor || cleanAuthor.toLowerCase() === 'unknown' || cleanAuthor.toLowerCase() === 'unknown author') {
      throw new Error('Invalid author name');
    }

    const safeFilename = `${cleanAuthor.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
    const filePath = path.join(authorsDir, safeFilename);

    let existingMeta = {};
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const match = raw.match(/^---\n([\s\S]*?)\n---/);
        if (match) existingMeta = yaml.load(match[1]) || {};
      } catch (_) {}
    }

    const isSubscribed = extraData.subscribed !== undefined ? extraData.subscribed : true;

    const frontmatter = {
      name: cleanAuthor,
      subscribed: isSubscribed,
      subscribed_at: existingMeta.subscribed_at || new Date().toISOString(),
      last_checked: new Date().toISOString(),
      openlibrary_key: extraData.openlibraryKey || existingMeta.openlibrary_key || null,
      known_works_count: extraData.knownWorksCount || existingMeta.known_works_count || 0,
      tags: ['author-tracker', 'subscribed']
    };

    const content = `---\n${yaml.dump(frontmatter).trim()}\n---\n\n# ${cleanAuthor}\n\n**Tracking Status**: ${isSubscribed ? 'Subscribed (Auto-check new releases)' : 'Paused'}\n**Subscribed Since**: ${frontmatter.subscribed_at}\n\n## Monitored Bibliography\nAuto-tracks newly published works across Open Library, Seven Seas, and publisher feeds.\n`;

    fs.writeFileSync(filePath, content, 'utf-8');

    return { success: true, filePath, author: cleanAuthor, subscribed: isSubscribed };
  }

  /**
   * List all tracked authors.
   */
  static listAuthors(libraryBaseDir) {
    const authorsDir = path.join(libraryBaseDir, 'authors');
    if (!fs.existsSync(authorsDir)) return [];

    const files = fs.readdirSync(authorsDir).filter(f => f.endsWith('.md'));
    const authors = [];

    files.forEach(filename => {
      const filePath = path.join(authorsDir, filename);
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const match = raw.match(/^---\n([\s\S]*?)\n---/);
        if (match) {
          const fm = yaml.load(match[1]);
          authors.push({
            filename,
            filePath,
            ...fm
          });
        }
      } catch (_) {}
    });

    return authors;
  }

  /**
   * Scan Open Library for an author's complete bibliography and find missing works.
   */
  static async checkAuthorReleases(libraryBaseDir, authorName, autoGenerateWishlist = false) {
    const cleanAuthor = authorName.replace(/^by\s+/i, '').trim();

    try {
      // 1. Search for author key on Open Library
      const authorSearchUrl = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(cleanAuthor)}`;
      const searchRes = await axios.get(authorSearchUrl, { timeout: 8000 });
      const authorDoc = (searchRes.data.docs || [])[0];

      if (!authorDoc || !authorDoc.key) {
        return { author: cleanAuthor, works: [], newReleasesFound: 0 };
      }

      const authorKey = authorDoc.key; // e.g. OL12345A
      const worksUrl = `https://openlibrary.org/authors/${authorKey}/works.json?limit=50`;
      const worksRes = await axios.get(worksUrl, { timeout: 8000 });
      const entries = worksRes.data.entries || [];

      // 2. Fetch existing library + wishlist titles for comparison
      const existingTitles = new Set();
      const wishlistDir = path.join(libraryBaseDir, 'wishlist');
      if (fs.existsSync(wishlistDir)) {
        fs.readdirSync(wishlistDir).forEach(f => {
          existingTitles.add(f.toLowerCase().replace(/\.md$/, ''));
        });
      }

      const newBooks = [];
      entries.forEach(work => {
        const title = (work.title || '').trim();
        const normTitle = `${cleanAuthor} - ${title}`.toLowerCase().replace(/[/\\?%*:|"<>]/g, '-');

        const alreadyExists = Array.from(existingTitles).some(t => t.includes(title.toLowerCase()));
        if (!alreadyExists && title.length > 2) {
          const covers = work.covers || [];
          const coverUrl = covers[0] ? `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg` : '';

          const bookData = {
            title,
            author: cleanAuthor,
            coverUrl,
            description: typeof work.description === 'string' ? work.description : (work.description && work.description.value) || '',
            sourceList: `Author Tracking (${cleanAuthor})`,
            tags: ['author-tracked', 'wishlist']
          };

          newBooks.push(bookData);

          if (autoGenerateWishlist) {
            PlaceholderGenerator.createEntry(libraryBaseDir, bookData);
          }
        }
      });

      // Update author record with last check
      AuthorTracker.subscribe(libraryBaseDir, cleanAuthor, {
        openlibraryKey: authorKey,
        knownWorksCount: entries.length
      });

      return {
        author: cleanAuthor,
        totalWorksOnRecord: entries.length,
        newReleasesFound: newBooks.length,
        newBooks
      };
    } catch (err) {
      console.warn(`Error checking releases for author ${cleanAuthor}:`, err.message);
      return { author: cleanAuthor, works: [], newReleasesFound: 0, error: err.message };
    }
  }
}

module.exports = AuthorTracker;
