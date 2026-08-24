/**
 * Anna's Archive & Shadow Library Search Resolver
 */

class AnnasArchiveAcquisition {
  /**
   * Build targeted search and mirror query URLs for Anna's Archive.
   * @param {object} book - Book metadata (title, author, isbn).
   */
  static buildSearchUrls(book) {
    const title = (book.title || '').trim();
    const author = (book.author || '').trim();
    const isbn = (book.isbn || '').replace(/[- ]/g, '').trim();

    const query = isbn || `${title} ${author}`.trim();
    const encoded = encodeURIComponent(query);

    return {
      source: "Anna's Archive",
      searchUrl: `https://annas-archive.org/search?q=${encoded}`,
      epubFilterUrl: `https://annas-archive.org/search?ext=epub&q=${encoded}`,
      libgenUrl: `https://libgen.is/search.php?req=${encoded}&column=default`,
      isSearchQuery: true,
      tip: "Click search URL to inspect available IPFS and mirror download slots."
    };
  }
}

module.exports = AnnasArchiveAcquisition;
