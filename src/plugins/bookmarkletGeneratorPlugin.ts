export interface BookmarkletTool {
  id: string;
  name: string;
  targetSite: string;
  icon: string;
  description: string;
  bookmarkletJs: string;
  rawJs: string;
}

export function getAppTargetEndpoint(): string {
  if (typeof window !== 'undefined') {
    return window.location.href.split('?')[0].split('#')[0];
  }
  return 'http://artkitty.net/meow/lcmd/';
}

export function createExecutableBookmarkletJs(rawJs: string): string {
  /* 1. Strip single line comments */
  const noLineComments = rawJs.replace(/\/\/[^\n\r]*/g, '');
  /* 2. Strip multi-line comments */
  const noComments = noLineComments.replace(/\/\*[\s\S]*?\*\//g, '');
  /* 3. Compact whitespace */
  const compacted = noComments.replace(/\s+/g, ' ').trim();
  return `javascript:${compacted};void 0;`;
}

export function generateNovelUpdatesBookmarklet(): { bookmarkletJs: string; rawJs: string } {
  const host = getAppTargetEndpoint();
  const rawJs = `(function(){
    try {
      var title = (document.querySelector('.seriestitlenew') && document.querySelector('.seriestitlenew').innerText.trim())
        || (document.querySelector('meta[property="og:title"]') && document.querySelector('meta[property="og:title"]').content.trim())
        || (document.querySelector('h1.entry-title, .series-title, h4.item-title') && document.querySelector('h1.entry-title, .series-title, h4.item-title').innerText.trim())
        || document.title.replace(/\\s*-\\s*Novel\\s*Updates.*/i, '').trim();

      var author = (document.querySelector('#showauthors a, .author') && document.querySelector('#showauthors a, .author').innerText.trim())
        || (document.querySelector('meta[property="books:author"]') && document.querySelector('meta[property="books:author"]').content.trim())
        || 'Asian Webnovel Author';

      var tagNodes = document.querySelectorAll('#showtags a, a.genre, .genre a');
      var tags = [];
      for (var i = 0; i < tagNodes.length; i++) {
        var t = tagNodes[i].innerText.trim();
        if (t) tags.push(t);
      }
      if (tags.length === 0) tags = ['Webnovel', 'Translated', 'NovelUpdates'];

      var ratingEl = document.querySelector('.uvote');
      var rating = ratingEl ? ratingEl.innerText.trim() : '4.5';

      var coverEl = document.querySelector('.seriesimg img, .series-thumb img');
      var coverUrl = coverEl ? coverEl.src : ((document.querySelector('meta[property="og:image"]') && document.querySelector('meta[property="og:image"]').content) || '');

      var dataObj = {
        title: title,
        author: author,
        tags: tags,
        rating: rating,
        coverUrl: coverUrl,
        sourceUrl: window.location.href,
        format: 'dcmd/webnovel'
      };

      var oldModal = document.getElementById('lc-md-nu-modal');
      if (oldModal) oldModal.remove();

      var modal = document.createElement('div');
      modal.id = 'lc-md-nu-modal';
      modal.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999999;width:360px;background:#090d16;color:#f8fafc;border:2px solid #6366f1;border-radius:20px;padding:18px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);font-family:system-ui,sans-serif;font-size:12px;';

      var targetUrl = '${host}?import_novel=' + encodeURIComponent(title) + '&author=' + encodeURIComponent(author) + '&tags=' + encodeURIComponent(tags.join(',')) + '&rating=' + encodeURIComponent(rating) + '&source=' + encodeURIComponent(window.location.href);

      modal.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
        + '<h3 style="margin:0;font-size:14px;color:#818cf8;font-weight:bold;display:flex;align-items:center;gap:6px;"><span>🌐</span> NovelUpdates Grabber</h3>'
        + '<button id="lc-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;">✖</button>'
        + '</div>'
        + '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px;margin-bottom:12px;">'
        + '<div style="font-weight:bold;color:#f1f5f9;font-size:13px;margin-bottom:4px;">' + title + '</div>'
        + '<div style="color:#94a3b8;font-size:11px;margin-bottom:6px;">By ' + author + ' &bull; ★ ' + rating + '</div>'
        + '<div style="color:#cbd5e1;font-size:10px;">' + tags.slice(0, 6).map(function(tg){ return '#' + tg; }).join(' ') + '</div>'
        + '</div>'
        + '<div style="display:flex;gap:8px;">'
        + '<a href="' + targetUrl + '" target="_blank" id="lc-open-btn" style="flex:1;text-align:center;padding:10px;background:#6366f1;color:#ffffff;border-radius:12px;font-weight:bold;text-decoration:none;font-size:12px;display:block;">🚀 Open in LC-MD</a>'
        + '<button id="lc-copy-btn" style="padding:10px;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:12px;font-weight:bold;cursor:pointer;font-size:12px;">📋 Copy JSON</button>'
        + '</div>';

      document.body.appendChild(modal);

      document.getElementById('lc-close-btn').onclick = function(){ modal.remove(); };
      document.getElementById('lc-copy-btn').onclick = function(){
        navigator.clipboard.writeText(JSON.stringify(dataObj, null, 2));
        this.innerText = '✓ Copied!';
        this.style.background = '#059669';
        this.style.color = '#ffffff';
      };

      var win = window.open(targetUrl, '_blank');
      if (win) {
        setTimeout(function(){ if (modal) modal.remove(); }, 3000);
      }
    } catch(err) {
      alert('NovelUpdates Grabber Error: ' + err.message);
    }
  })();`;

  const bookmarkletJs = createExecutableBookmarkletJs(rawJs);
  return { bookmarkletJs, rawJs };
}

export function generateGoodreadsBookmarklet(): { bookmarkletJs: string; rawJs: string } {
  const host = getAppTargetEndpoint();
  const rawJs = `(function(){
    try {
      var singleEl = document.querySelector('h1[data-testid="bookTitle"], h1.Text__title1, .BookPageTitleSection__title, #bookTitle');
      var singleTitle = singleEl ? singleEl.innerText.trim() : ((document.querySelector('meta[property="og:title"]') && document.querySelector('meta[property="og:title"]').content.trim()) || '');

      var authorEl = document.querySelector('span[data-testid="name"], .ContributorLinksList a, .authorName');
      var author = authorEl ? authorEl.innerText.trim() : ((document.querySelector('meta[property="books:author"]') && document.querySelector('meta[property="books:author"]').content.trim()) || 'Goodreads Author');

      var ratingEl = document.querySelector('.RatingStatistics__rating, span[itemprop="ratingValue"]');
      var rating = ratingEl ? ratingEl.innerText.trim() : '4.2';

      var listTitles = [];
      if (!singleTitle) {
        var elements = document.querySelectorAll('.listText a.bookTitle, tr.bookalike .title a, a.bookTitle span, a.bookTitle');
        for (var i = 0; i < elements.length; i++) {
          var t = elements[i].innerText.trim();
          if (t && listTitles.indexOf(t) === -1) listTitles.push(t);
          if (listTitles.length >= 30) break;
        }
      }

      var finalTitle = singleTitle || (listTitles.length > 0 ? listTitles[0] : document.title.replace(/\\s*\\|\\s*Goodreads.*/i, '').trim());
      var titlesJson = JSON.stringify(singleTitle ? [singleTitle] : listTitles);

      var dataObj = {
        title: finalTitle,
        author: author,
        rating: rating,
        titles: singleTitle ? [singleTitle] : listTitles,
        sourceUrl: window.location.href,
        format: 'dcmd/goodreads'
      };

      var oldModal = document.getElementById('lc-md-gr-modal');
      if (oldModal) oldModal.remove();

      var modal = document.createElement('div');
      modal.id = 'lc-md-gr-modal';
      modal.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999999;width:360px;background:#090d16;color:#f8fafc;border:2px solid #eab308;border-radius:20px;padding:18px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);font-family:system-ui,sans-serif;font-size:12px;';

      var targetUrl = '${host}?import_goodreads=' + encodeURIComponent(titlesJson) + '&author=' + encodeURIComponent(author) + '&rating=' + encodeURIComponent(rating) + '&source=' + encodeURIComponent(window.location.href);

      modal.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
        + '<h3 style="margin:0;font-size:14px;color:#facc15;font-weight:bold;display:flex;align-items:center;gap:6px;"><span>📖</span> Goodreads Grabber</h3>'
        + '<button id="lc-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;">✖</button>'
        + '</div>'
        + '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px;margin-bottom:12px;">'
        + '<div style="font-weight:bold;color:#f1f5f9;font-size:13px;margin-bottom:4px;">' + finalTitle + '</div>'
        + '<div style="color:#94a3b8;font-size:11px;margin-bottom:6px;">By ' + author + ' &bull; ★ ' + rating + '</div>'
        + (listTitles.length > 1 ? '<div style="color:#facc15;font-size:10px;">Found ' + listTitles.length + ' books in reading list</div>' : '')
        + '</div>'
        + '<div style="display:flex;gap:8px;">'
        + '<a href="' + targetUrl + '" target="_blank" id="lc-open-btn" style="flex:1;text-align:center;padding:10px;background:#eab308;color:#0f172a;border-radius:12px;font-weight:bold;text-decoration:none;font-size:12px;display:block;">🚀 Open in LC-MD</a>'
        + '<button id="lc-copy-btn" style="padding:10px;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:12px;font-weight:bold;cursor:pointer;font-size:12px;">📋 Copy JSON</button>'
        + '</div>';

      document.body.appendChild(modal);

      document.getElementById('lc-close-btn').onclick = function(){ modal.remove(); };
      document.getElementById('lc-copy-btn').onclick = function(){
        navigator.clipboard.writeText(JSON.stringify(dataObj, null, 2));
        this.innerText = '✓ Copied!';
        this.style.background = '#059669';
        this.style.color = '#ffffff';
      };

      var win = window.open(targetUrl, '_blank');
      if (win) {
        setTimeout(function(){ if (modal) modal.remove(); }, 3000);
      }
    } catch(err) {
      alert('Goodreads Grabber Error: ' + err.message);
    }
  })();`;

  const bookmarkletJs = createExecutableBookmarkletJs(rawJs);
  return { bookmarkletJs, rawJs };
}

export function generateYouTubeVodBookmarklet(): { bookmarkletJs: string; rawJs: string } {
  const host = getAppTargetEndpoint();
  const rawJs = `(function(){
    try {
      var titleEl = document.querySelector('h1.ytd-watch-metadata, h1.title, #title h1, h2[data-a-target="stream-title"], .tw-title');
      var title = titleEl ? titleEl.innerText.trim() : ((document.querySelector('meta[property="og:title"]') && document.querySelector('meta[property="og:title"]').content.trim()) || document.title.replace(/\\s*-\\s*(YouTube|Twitch|Kick).*/i, '').trim());

      var creatorEl = document.querySelector('ytd-channel-name a, #channel-name a, a[data-a-target="user-channel-link"], .channel-header__user h1');
      var creator = creatorEl ? creatorEl.innerText.trim() : ((document.querySelector('meta[name="author"]') && document.querySelector('meta[name="author"]').content.trim()) || 'Video Creator');

      var descEl = document.querySelector('#description-inline-expander, #description, .tw-rich-text');
      var descText = descEl ? descEl.innerText.trim() : ((document.querySelector('meta[property="og:description"]') && document.querySelector('meta[property="og:description"]').content.trim()) || '');

      var durEl = document.querySelector('.ytp-time-duration, .tw-time');
      var duration = durEl ? durEl.innerText.trim() : 'N/A';

      var thumbMeta = document.querySelector('meta[property="og:image"]');
      var thumb = thumbMeta ? thumbMeta.content : '';

      var dataObj = {
        title: title,
        creator: creator,
        duration: duration,
        streamUrl: window.location.href,
        thumbnailUrl: thumb,
        description: descText.slice(0, 1000),
        format: 'dcmd/vod'
      };

      var oldModal = document.getElementById('lc-md-vod-modal');
      if (oldModal) oldModal.remove();

      var modal = document.createElement('div');
      modal.id = 'lc-md-vod-modal';
      modal.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999999;width:380px;background:#090d16;color:#f8fafc;border:2px solid #ef4444;border-radius:20px;padding:18px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);font-family:system-ui,sans-serif;font-size:12px;';

      var targetUrl = '${host}?import_vod=' + encodeURIComponent(title) + '&creator=' + encodeURIComponent(creator) + '&duration=' + encodeURIComponent(duration) + '&thumb=' + encodeURIComponent(thumb) + '&source=' + encodeURIComponent(window.location.href);

      modal.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
        + '<h3 style="margin:0;font-size:14px;color:#f87171;font-weight:bold;display:flex;align-items:center;gap:6px;"><span>🎬</span> VOD & Stream Grabber</h3>'
        + '<button id="lc-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;">✖</button>'
        + '</div>'
        + '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px;margin-bottom:12px;">'
        + '<div style="font-weight:bold;color:#f1f5f9;font-size:13px;margin-bottom:4px;">' + title + '</div>'
        + '<div style="color:#94a3b8;font-size:11px;margin-bottom:6px;">By ' + creator + ' &bull; ⏱ ' + duration + '</div>'
        + '</div>'
        + '<div style="display:flex;gap:8px;">'
        + '<a href="' + targetUrl + '" target="_blank" id="lc-open-btn" style="flex:1;text-align:center;padding:10px;background:#ef4444;color:#ffffff;border-radius:12px;font-weight:bold;text-decoration:none;font-size:12px;display:block;">🚀 Open in LC-MD</a>'
        + '<button id="lc-copy-btn" style="padding:10px;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:12px;font-weight:bold;cursor:pointer;font-size:12px;">📋 Copy JSON</button>'
        + '</div>';

      document.body.appendChild(modal);

      document.getElementById('lc-close-btn').onclick = function(){ modal.remove(); };
      document.getElementById('lc-copy-btn').onclick = function(){
        navigator.clipboard.writeText(JSON.stringify(dataObj, null, 2));
        this.innerText = '✓ Copied!';
        this.style.background = '#059669';
        this.style.color = '#ffffff';
      };

      var win = window.open(targetUrl, '_blank');
      if (win) {
        setTimeout(function(){ if (modal) modal.remove(); }, 3000);
      }
    } catch(err) {
      alert('VOD Grabber Error: ' + err.message);
    }
  })();`;

  const bookmarkletJs = createExecutableBookmarkletJs(rawJs);
  return { bookmarkletJs, rawJs };
}

export function getBookmarkletTools(): BookmarkletTool[] {
  const nu = generateNovelUpdatesBookmarklet();
  const gr = generateGoodreadsBookmarklet();
  const vod = generateYouTubeVodBookmarklet();

  return [
    {
      id: 'novelupdates-grabber',
      name: '🌐 NovelUpdates 1-Click Grabber',
      targetSite: 'NovelUpdates.com',
      icon: '🌐',
      description: 'Click while browsing any NovelUpdates series page or search results to instantly extract titles, author, webnovel tags, rating, and translation links into LC-MD with non-intrusive popup and clipboard fallback.',
      bookmarkletJs: nu.bookmarkletJs,
      rawJs: nu.rawJs
    },
    {
      id: 'goodreads-importer',
      name: '📖 Goodreads List & Book Grabber',
      targetSite: 'Goodreads.com',
      icon: '📖',
      description: 'Click while browsing any Goodreads book page, reading list, or custom bookshelf to grab titles and send them directly to your Sovereign Library with instant popup and clipboard fallback.',
      bookmarkletJs: gr.bookmarkletJs,
      rawJs: gr.rawJs
    },
    {
      id: 'vod-stream-grabber',
      name: '🎬 YouTube & Twitch VOD Grabber',
      targetSite: 'YouTube.com / Twitch.tv / Kick.com',
      icon: '🎬',
      description: 'Click on any YouTube video, Twitch broadcast VOD, or Kick stream to instantly capture title, streamer name, duration, and timestamp chapters into your Sovereign Vault.',
      bookmarkletJs: vod.bookmarkletJs,
      rawJs: vod.rawJs
    }
  ];
}

export const BOOKMARKLET_TOOLS: BookmarkletTool[] = getBookmarkletTools();
