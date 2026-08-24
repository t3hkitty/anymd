/**
 * Open Library & Internet Archive Book Search
 */

const axios = require('axios');

class OpenLibraryAcquisition {
  /**
   * Query Open Library Search API for bibliographic data and lending availability.
   * @param {string} query - Book title / Author / ISBN.
   */
  static async search(query) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`;

    try {
      const res = await axios.get(url, { timeout: 8000 });
      const docs = res.data.docs || [];

      return docs.map(doc => {
        const title = doc.title;
        const authors = (doc.author_name || []).join(', ') || 'Unknown Author';
        const coverId = doc.cover_i;
        const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';
        const isbn = (doc.isbn || [])[0] || '';
        const firstPublishYear = doc.first_publish_year || '';
        const key = doc.key; // e.g. /works/OL12345W
        const ia = (doc.ia || [])[0]; // Internet Archive ID

        return {
          source: 'Open Library / Internet Archive',
          title,
          author: authors,
          firstPublishYear,
          isbn,
          coverUrl,
          openLibraryUrl: `https://openlibrary.org${key}`,
          archiveUrl: ia ? `https://archive.org/details/${ia}` : null,
          hasEbook: !!doc.has_fulltext || !!ia
        };
      });
    } catch (err) {
      console.warn('Open Library search error:', err.message);
      return [];
    }
  }
}

module.exports = OpenLibraryAcquisition;
