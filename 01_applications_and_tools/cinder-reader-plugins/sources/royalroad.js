/**
 * Royal Road Source Extension for Cinder E-Reader
 */

const RoyalRoadSource = {
  id: "royalroad-cinder-source",
  name: "Royal Road",
  version: "1.0.0",
  icon: "https://www.royalroad.com/favicon.ico",
  site: "https://www.royalroad.com",

  capabilities: {
    search: true,
    discover: true,
    bookChapters: true
  },

  getHeaders: function () {
    return {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    };
  },

  search: async function (query, page = 1) {
    const searchUrl = `${this.site}/fictions/search?title=${encodeURIComponent(query)}&page=${page}`;
    const res = await cinder.fetch(searchUrl, { headers: this.getHeaders() });
    if (res.status !== 200) return [];

    const $ = cinder.cheerio.load(res.data);
    const results = [];

    $(".fiction-list-item").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find("h2.fiction-title a").first();
      const title = titleLink.text().trim();
      const url = titleLink.attr("href");
      const cover = $el.find("figure img, img").attr("src");
      const author = $el.find(".author a").text().trim();

      if (title && url) {
        results.push({
          id: url.startsWith("http") ? url : `${this.site}${url}`,
          title: title,
          author: author || "Unknown",
          cover: cover && cover.startsWith("http") ? cover : `${this.site}${cover}`,
          url: url.startsWith("http") ? url : `${this.site}${url}`
        });
      }
    });

    return results;
  },

  getDiscoverSections: async function () {
    return [
      { id: "best-rated", title: "Best Rated" },
      { id: "trending", title: "Trending" },
      { id: "popular-this-week", title: "Popular This Week" }
    ];
  },

  getDiscoverItems: async function (sectionId, page = 1) {
    const url = `${this.site}/fictions/${sectionId}?page=${page}`;
    const res = await cinder.fetch(url, { headers: this.getHeaders() });
    if (res.status !== 200) return [];

    const $ = cinder.cheerio.load(res.data);
    const items = [];

    $(".fiction-list-item").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find("h2.fiction-title a").first();
      const title = titleLink.text().trim();
      const url = titleLink.attr("href");
      const cover = $el.find("figure img, img").attr("src");

      if (title && url) {
        items.push({
          id: url.startsWith("http") ? url : `${this.site}${url}`,
          title: title,
          cover: cover && cover.startsWith("http") ? cover : `${this.site}${cover}`,
          url: url.startsWith("http") ? url : `${this.site}${url}`
        });
      }
    });

    return items;
  },

  getBookChapters: async function (novelUrl) {
    const res = await cinder.fetch(novelUrl, { headers: this.getHeaders() });
    if (res.status !== 200) return [];

    const $ = cinder.cheerio.load(res.data);
    const chapters = [];

    $("#chapters tbody tr").each((idx, el) => {
      const $el = $(el);
      const link = $el.find("a").first();
      const title = link.text().trim();
      const href = link.attr("href");
      const date = $el.find("time").attr("datetime") || $el.find("time").text().trim();

      if (title && href) {
        chapters.push({
          id: href.startsWith("http") ? href : `${this.site}${href}`,
          title: title,
          chapterNumber: idx + 1,
          dateUploaded: date
        });
      }
    });

    return chapters;
  },

  getBookChapter: async function (chapterUrl) {
    const res = await cinder.fetch(chapterUrl, { headers: this.getHeaders() });
    if (res.status !== 200) throw new Error(`Failed to load chapter (${res.status})`);

    const $ = cinder.cheerio.load(res.data);

    $("script, style, noscript, .portlet, .author-note-portlet").remove();

    const title = $("h1").first().text().trim() || "Chapter";
    const content = $(".chapter-content").html() || "";

    return {
      id: chapterUrl,
      title: title,
      chapterText: content
    };
  }
};

__cinderExport = RoyalRoadSource;
