/**
 * OverDrive & Libby Digital Library Search Resolver
 */

class OverdriveAcquisition {
  /**
   * Build OverDrive and Libby catalog deep search links.
   * @param {object} book - Book metadata.
   */
  static buildSearchUrls(book) {
    const title = (book.title || '').trim();
    const author = (book.author || '').trim();
    const query = `${title} ${author}`.trim();
    const encoded = encodeURIComponent(query);

    return {
      source: 'OverDrive / Libby',
      overdriveUrl: `https://www.overdrive.com/search?q=${encoded}`,
      libbyUrl: `https://libbyapp.com/search/query-${encodeURIComponent(title)}/page-1`,
      isSearchQuery: true,
      tip: "Use Libby to check digital loan availability at your local public library."
    };
  }
}

module.exports = OverdriveAcquisition;
