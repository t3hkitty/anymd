/**
 * ScribbleHub Source Extension for Cinder E-Reader
 */

const ScribbleHubSource = {
  id: "scribblehub-cinder-source",
  name: "ScribbleHub",
  version: "1.0.0",
  icon: "https://www.scribblehub.com/favicon.ico",
  site: "https://www.scribblehub.com",

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
    const url = `${this.site}/?s=${encodeURIComponent(query)}&post_type=fictionposts&paged=${page}`;
    const res = await cinder.fetch(url, { headers: this.getHeaders() });
    if (res.status !== 200) return [];

    const $ = cinder.cheerio.load(res.data);
    const results = [];

    $(".search_main_box").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find(".search_title a").first();
      const title = titleLink.text().trim();
      const novelUrl = titleLink.attr("href");
      const cover = $el.find(".search_img img").attr("src");
      const author = $el.find(".search_author a").text().trim();

      if (title && novelUrl) {
        results.push({
          id: novelUrl,
          title: title,
          author: author || "Unknown",
          cover: cover || "",
          url: novelUrl
        });
      }
    });

    return results;
  },

  getDiscoverSections: async function () {
    return [
      { id: "weekly", title: "Trending This Week" },
      { id: "latest", title: "Latest Updates" }
    ];
  },

  getDiscoverItems: async function (sectionId, page = 1) {
    const url = sectionId === "latest"
      ? `${this.site}/latest-series/?pg=${page}`
      : `${this.site}/series-ranking/?sort=1&order=4&pg=${page}`;

    const res = await cinder.fetch(url, { headers: this.getHeaders() });
    if (res.status !== 200) return [];

    const $ = cinder.cheerio.load(res.data);
    const items = [];

    $(".search_main_box").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find(".search_title a").first();
      const title = titleLink.text().trim();
      const novelUrl = titleLink.attr("href");
      const cover = $el.find(".search_img img").attr("src");

      if (title && novelUrl) {
        items.push({
          id: novelUrl,
          title: title,
          cover: cover || "",
          url: novelUrl
        });
      }
    });

    return items;
  },

  getBookChapters: async function (novelUrl) {
    const res = await cinder.fetch(novelUrl, { headers: this.getHeaders() });
    if (res.status !== 200) return [];

    const $ = cinder.cheerio.load(res.data);
    const mypostId = $("#mypostid").val() || $('input[id="mypostid"]').val();
    if (!mypostId) return [];

    // Query full chapter TOC from ScribbleHub admin-ajax endpoint
    const ajaxUrl = `${this.site}/wp-admin/admin-ajax.php`;
    const payload = `action=wi_getreleases_pagination&mypostid=${mypostId}`;
    const headers = {
      ...this.getHeaders(),
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    };

    const ajaxRes = await cinder.fetch(ajaxUrl, {
      method: "POST",
      headers: headers,
      body: payload
    });

    if (ajaxRes.status !== 200) return [];

    const $ch = cinder.cheerio.load(ajaxRes.data);
    const chapters = [];

    $ch("li.toc_w").each((idx, el) => {
      const link = $ch(el).find("a").first();
      const title = link.text().trim();
      const href = link.attr("href");

      if (title && href) {
        chapters.push({
          id: href,
          title: title,
          chapterNumber: idx + 1
        });
      }
    });

    return chapters.reverse().map((c, i) => ({ ...c, chapterNumber: i + 1 }));
  },

  getBookChapter: async function (chapterUrl) {
    const res = await cinder.fetch(chapterUrl, { headers: this.getHeaders() });
    if (res.status !== 200) throw new Error(`Failed to load chapter (${res.status})`);

    const $ = cinder.cheerio.load(res.data);

    $("script, style, noscript, .wi_authornotes").remove();

    const title = $("h1.chapter-title").text().trim() || $("h1").first().text().trim();
    const content = $("#chp_contents").html() || $(".chp_raw").html() || "";

    return {
      id: chapterUrl,
      title: title || "Chapter",
      chapterText: content
    };
  }
};

__cinderExport = ScribbleHubSource;
