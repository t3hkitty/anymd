/**
 * Unified Multi-Source Acquisition Resolver
 */

const Gutenberg = require('./gutenberg');
const OpenLibrary = require('./openlibrary');
const AnnasArchive = require('./annas_archive');
const Overdrive = require('./overdrive');

class AcquisitionResolver {
  /**
   * Search across all repositories for acquisition candidates.
   * @param {object} book - Book metadata { title, author, isbn }
   */
  static async resolveAll(book) {
    const query = `${book.title || ''} ${book.author || ''}`.trim();

    // Run Gutenberg & OpenLibrary queries concurrently
    const [gutenbergResults, openLibraryResults] = await Promise.all([
      Gutenberg.search(query),
      OpenLibrary.search(query)
    ]);

    const annasData = AnnasArchive.buildSearchUrls(book);
    const overdriveData = Overdrive.buildSearchUrls(book);

    return {
      query,
      book,
      gutenberg: gutenbergResults,
      openLibrary: openLibraryResults,
      annasArchive: annasData,
      overdrive: overdriveData
    };
  }
}

module.exports = AcquisitionResolver;
