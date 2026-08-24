/**
 * NovelUpdates Source Extension for Cinder E-Reader
 * Version: 1.4.0
 * ContentType: books (Search, Discovery, Chaptered Reading & Downloads)
 */

var NovelUpdatesSource = {
  id: "novelupdates-cinder-source",
  name: "NovelUpdates",
  version: "1.4.0",
  icon: "https://www.novelupdates.com/favicon.ico",
  site: "https://www.novelupdates.com",
  contentType: "books",

  capabilities: {
    search: true,
    discover: true,
    download: true,
    resolve: true,
    searchDownloads: true,
    bookChapters: true
  },

  getSettings: function () {
    return [
      {
        id: "nu_cookies",
        label: "NovelUpdates Session Cookies (wordpress_logged_in)",
        type: "password",
        placeholder: "Paste: wordpress_logged_in_...=..."
      },
      {
        id: "user_agent",
        label: "Desktop User-Agent",
        type: "text",
        defaultValue: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"
      }
    ];
  },

  getHeaders: async function () {
    var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36";
    var cookies = "";

    try {
      if (cinder && cinder.store) {
        userAgent = (await cinder.store.get("user_agent")) || userAgent;
        cookies = (await cinder.store.get("nu_cookies")) || "";
      }
      if (cinder && cinder.secureStore && !cookies) {
        cookies = (await cinder.secureStore.get("nu_cookies")) || "";
      }
    } catch (_) {}

    var headers = {
      "User-Agent": userAgent,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Referer": "https://www.novelupdates.com/"
    };

    if (cookies) {
      headers["Cookie"] = cookies.trim();
    }

    return headers;
  },

  fetchHtml: async function (url, options) {
    options = options || {};
    var headers = await this.getHeaders();
    var mergedOptions = {
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    };

    if (typeof cinder.fetchBrowser === "function") {
      try {
        var browserRes = await cinder.fetchBrowser(url, mergedOptions);
        if (browserRes && (browserRes.status === 200 || (browserRes.data && browserRes.data.length > 200))) {
          return browserRes;
        }
      } catch (_) {}
    }

    return await cinder.fetch(url, mergedOptions);
  },

  search: async function (query, page) {
    page = page || 1;
    var searchUrl = this.site + "/?s=" + encodeURIComponent(query) + "&post_type=seriesortag";
    var res = await this.fetchHtml(searchUrl);

    // Fallback to Series Finder if standard search returns empty
    if (!res || res.status !== 200 || !res.data || res.data.indexOf("w-blog-entry") === -1) {
      var sfUrl = this.site + "/series-finder/?sf=1&sh=" + encodeURIComponent(query) + "&sort=sdate&order=2&pg=" + page;
      var sfRes = await this.fetchHtml(sfUrl);
      if (sfRes && sfRes.status === 200 && sfRes.data) {
        res = sfRes;
      }
    }

    if (!res || !res.data) return [];

    var $ = cinder.cheerio.load(res.data);
    var results = [];
    var seenUrls = {};

    // 1. Parse standard NovelUpdates search results (.w-blog-entry)
    $(".w-blog-entry").each(function (_, el) {
      var $el = $(el);
      var link = $el.find("a.w-blog-entry-link, a").first();
      var href = link.attr("href");
      var title = $el.find(".w-blog-entry-title-h, .w-blog-entry-title, h2").first().text().trim() || link.text().trim();
      var img = $el.find("img").attr("src") || "";

      if (href && title && href.indexOf("/series/") !== -1 && !seenUrls[href]) {
        seenUrls[href] = true;
        var fullUrl = href.indexOf("http") === 0 ? href : "https://www.novelupdates.com" + href;
        var coverUrl = img.indexOf("http") === 0 ? img : (img ? "https:" + img : "");

        results.push({
          id: fullUrl,
          title: title,
          name: title,
          author: "NovelUpdates",
          cover: coverUrl,
          coverHeaders: { "Referer": "https://www.novelupdates.com/" },
          url: fullUrl,
          format: "epub",
          source: "NovelUpdates"
        });
      }
    });

    // 2. Parse Series Finder results (.search_main_box)
    $(".search_main_box").each(function (_, el) {
      var $el = $(el);
      var link = $el.find(".search_title a").first();
      var href = link.attr("href");
      var title = link.text().trim();
      var img = $el.find(".search_img_nu img, img").attr("src") || "";
      var author = $el.find(".search_author").text().trim();

      if (href && title && !seenUrls[href]) {
        seenUrls[href] = true;
        var fullUrl = href.indexOf("http") === 0 ? href : "https://www.novelupdates.com" + href;
        var coverUrl = img.indexOf("http") === 0 ? img : (img ? "https:" + img : "");

        results.push({
          id: fullUrl,
          title: title,
          name: title,
          author: author ? author.replace(/^by\s+/i, "").trim() : "NovelUpdates",
          cover: coverUrl,
          coverHeaders: { "Referer": "https://www.novelupdates.com/" },
          url: fullUrl,
          format: "epub",
          source: "NovelUpdates"
        });
      }
    });

    return results;
  },

  getDiscoverSections: async function () {
    return [
      { id: "popular", title: "Popular Novels", icon: "flame" },
      { id: "latest", title: "Latest Releases", icon: "clock" }
    ];
  },

  getDiscoverItems: async function (sectionId, page) {
    page = page || 1;
    var url = sectionId === "latest"
      ? this.site + "/series-ranking/?rank=latest&pg=" + page
      : this.site + "/series-ranking/?rank=pop&pg=" + page;

    var res = await this.fetchHtml(url);
    if (!res || !res.data) return [];

    var $ = cinder.cheerio.load(res.data);
    var items = [];
    var seen = {};

    $(".search_main_box, .search_body_nu").each(function (_, el) {
      var $el = $(el);
      var link = $el.find(".search_title a").first();
      var title = link.text().trim();
      var novelUrl = link.attr("href");
      var img = $el.find(".search_img_nu img, img").attr("src") || "";

      if (title && novelUrl && !seen[novelUrl]) {
        seen[novelUrl] = true;
        var fullUrl = novelUrl.indexOf("http") === 0 ? novelUrl : "https://www.novelupdates.com" + novelUrl;
        var coverUrl = img.indexOf("http") === 0 ? img : (img ? "https:" + img : "");

        items.push({
          id: fullUrl,
          title: title,
          name: title,
          cover: coverUrl,
          coverHeaders: { "Referer": "https://www.novelupdates.com/" },
          url: fullUrl,
          format: "epub"
        });
      }
    });

    return items;
  },

  getBookChapters: async function (novelUrl) {
    var res = await this.fetchHtml(novelUrl);
    if (!res || !res.data) return [];

    var $ = cinder.cheerio.load(res.data);
    var postId = $("#mypostid").val() || $('input[id="mypostid"]').val();
    if (!postId) return [];

    var ajaxUrl = this.site + "/wp-admin/admin-ajax.php";
    var payload = "action=nd_get_chapters&mypostid=" + postId;
    var headers = await this.getHeaders();
    headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
    headers["X-Requested-With"] = "XMLHttpRequest";
    headers["Referer"] = novelUrl;

    var ajaxRes = await cinder.fetch(ajaxUrl, {
      method: "POST",
      headers: headers,
      body: payload
    });

    if (!ajaxRes || !ajaxRes.data) return [];

    var $ch = cinder.cheerio.load(ajaxRes.data);
    var chapters = [];

    $ch("li.sp_li_chp").each(function (idx, el) {
      var link = $ch(el).find("a").first();
      var redirectUrl = link.attr("href");
      var title = link.text().trim();
      var group = $ch(el).find("span").first().text().trim();

      if (redirectUrl) {
        var fullUrl = redirectUrl.indexOf("//") === 0 ? "https:" + redirectUrl : redirectUrl;
        chapters.push({
          id: fullUrl,
          title: title || ("Chapter " + (idx + 1)),
          name: title || ("Chapter " + (idx + 1)),
          chapterNumber: idx + 1,
          scanlator: group || "Translator"
        });
      }
    });

    return chapters.reverse().map(function (c, i) {
      return { ...c, chapterNumber: i + 1 };
    });
  },

  getBookChapter: async function (chapterRedirectUrl) {
    var res = await this.fetchHtml(chapterRedirectUrl);
    if (!res || !res.data) throw new Error("Could not load chapter content");

    var $ = cinder.cheerio.load(res.data);
    $("script, style, noscript, iframe, .advertisement, .ad-box").remove();

    $("*").each(function (_, el) {
      var style = ($(el).attr("style") || "").toLowerCase().replace(/\s+/g, "");
      if (style.indexOf("display:none") !== -1 || style.indexOf("visibility:hidden") !== -1 || style.indexOf("opacity:0") !== -1) {
        $(el).remove();
      }
    });

    var contentHtml = "";
    var selectors = [
      ".chapter-content", ".entry-content", "#chapter-content", 
      ".reading-content", ".post-content", "article"
    ];

    for (var i = 0; i < selectors.length; i++) {
      var sel = selectors[i];
      if ($(sel).length && $(sel).text().trim().length > 100) {
        contentHtml = $(sel).html();
        break;
      }
    }

    if (!contentHtml) {
      contentHtml = $("body").html() || "";
    }

    return {
      id: chapterRedirectUrl,
      title: $("h1").first().text().trim() || "Chapter",
      chapterText: contentHtml
    };
  },

  resolve: async function (item) {
    return {
      url: item.url || item.id,
      fileName: (item.title || "Novel") + ".epub",
      headers: { "Referer": "https://www.novelupdates.com/" }
    };
  }
};

__cinderExport = NovelUpdatesSource;
