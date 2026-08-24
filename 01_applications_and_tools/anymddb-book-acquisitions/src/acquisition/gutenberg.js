/**
 * Project Gutenberg Public Domain API (Gutendex)
 */

const axios = require('axios');

class GutenbergAcquisition {
  /**
   * Search Project Gutenberg via Gutendex REST API.
   * @param {string} query - Title and/or Author.
   */
  static async search(query) {
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(url, { timeout: 8000 });
      const results = res.data.results || [];

      return results.slice(0, 5).map(b => {
        const formats = b.formats || {};
        const epubUrl = formats['application/epub+zip'] || '';
        const htmlUrl = formats['text/html'] || '';
        const coverUrl = formats['image/jpeg'] || '';
        const authors = (b.authors || []).map(a => a.name).join(', ') || 'Unknown';

        return {
          source: 'Project Gutenberg',
          id: b.id,
          title: b.title,
          author: authors,
          downloadCount: b.download_count,
          coverUrl,
          epubUrl,
          htmlUrl,
          isPublicDomain: true,
          directDownloadAvailable: !!epubUrl
        };
      });
    } catch (err) {
      console.warn('Gutenberg search error:', err.message);
      return [];
    }
  }
}

module.exports = GutenbergAcquisition;
