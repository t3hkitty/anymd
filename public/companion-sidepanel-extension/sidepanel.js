// Library Companion MD - Sovereign Side Panel & Sidecar Studio

const BASE_VAULT_URL = 'http://artkitty.net/meow/lcmd/';

let currentScannedData = null;
let generatedSidecarMd = '';
let breakHits = [];

/**
 * Generates a clean sovereign markdown sidecar with YAML frontmatter
 */
function buildSidecarMarkdown(data) {
  const nowIso = new Date().toISOString();
  const dateStr = nowIso.split('T')[0];
  const safeTitle = (data.title || 'Untitled Document').replace(/"/g, '\\"');
  const safeAuthor = (data.author || 'Unknown Creator').replace(/"/g, '\\"');
  const mediaType = (data.type === 'twitch' || data.type === 'youtube') ? 'vod' : 'book';

  let tagList = ['sovereign-vault'];
  if (data.type === 'kindle_reader') tagList.push('kindle', 'ebook', 'reading-now');
  else if (data.type === 'amazon_kindle_book') tagList.push('amazon', 'kindle-store', 'wishlist');
  else if (data.type === 'twitch') tagList.push('vod', 'stream', 'twitch', 'tcg-break');
  else if (data.type === 'youtube') tagList.push('vod', 'youtube', 'video');
  else if (data.type === 'ao3_fic') tagList.push('fanfiction', 'ao3');
  else if (data.type === 'novelupdates') tagList.push('webnovel', 'translated');
  else if (data.type === 'goodreads') tagList.push('goodreads', 'reading-list');

  if (data.extra && Array.isArray(data.extra.tags)) {
    tagList = tagList.concat(data.extra.tags.map(t => t.toLowerCase().replace(/[^a-z0-9_-]/g, '')));
  }

  let bodyNotes = '';
  if (data.type === 'kindle_reader') {
    bodyNotes = `## 📖 Reading Status & Highlights\n\n- **Location / Progress:** \`${data.progress || 'Current Progress'}\`\n- **Date Scanned:** \`${dateStr}\`\n\n${data.extra && data.extra.highlightedQuote ? `### 📝 Captured Highlight\n> "${data.extra.highlightedQuote}"\n` : '*No text currently selected in Kindle reader.*'}`;
  } else if (data.type === 'amazon_kindle_book') {
    bodyNotes = `## 🛒 Book Details & Synopsis\n\n- **Rating:** \`${data.extra?.rating || '4.5'}\`\n- **Cover URL:** ${data.cover || 'N/A'}\n\n### 📝 Synopsis\n${data.extra?.description || 'Cataloged from Amazon Kindle store.'}`;
  } else if (data.type === 'twitch' || data.type === 'youtube') {
    bodyNotes = `## 🎬 Stream Information\n\n- **Channel / Streamer:** **${safeAuthor}**\n- **Source URL:** [Open Native Stream](${data.url})\n\n### 📑 Chapter Anchors\n- ⏱️ **[\`[00:00]\` Stream Start](${data.url})**`;
  } else {
    bodyNotes = `## 📝 Companion Notes\n\nCataloged from [${data.url}](${data.url}) on ${dateStr}.`;
  }

  return `---
title: "${safeTitle}"
author: "${safeAuthor}"
media_type: "${mediaType}"
source_url: "${data.url}"
date_cataloged: "${nowIso}"
tags: [${Array.from(new Set(tagList)).map(t => `"${t}"`).join(', ')}]
---

# ${mediaType === 'vod' ? '🎬' : '📖'} ${data.title}

> **Creator:** **${data.author}** &bull; **Type:** \`${data.type.toUpperCase()}\`
> ↗ **Source Link:** [Open in Native Window](${data.url})

---

${bodyNotes}
`;
}

/**
 * Executes a live DOM scanner in the active tab
 */
async function scanActiveTab() {
  const titleEl = document.getElementById('detected-title');
  const subEl = document.getElementById('detected-sub');
  const extraEl = document.getElementById('detected-extra');
  const badgeEl = document.getElementById('tab-platform-badge');
  const previewEl = document.getElementById('sidecar-preview');

  titleEl.textContent = 'Scanning active page...';
  subEl.textContent = 'Inspecting document DOM and metadata...';
  extraEl.textContent = '';
  previewEl.textContent = 'Analyzing active window...';

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      titleEl.textContent = 'No active tab found';
      return;
    }

    const tab = tabs[0];
    const tabId = tab.id;

    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      titleEl.textContent = 'Browser System Page';
      subEl.textContent = tab.url || 'Cannot inspect internal browser tabs.';
      badgeEl.textContent = 'System Tab';
      currentScannedData = null;
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const url = window.location.href;
        const docTitle = document.title;
        let type = 'general';
        let title = '';
        let author = '';
        let cover = '';
        let progress = '';
        let extra = {};

        // 1. KINDLE CLOUD READER (read.amazon.com)
        if (url.includes('read.amazon.com')) {
          type = 'kindle_reader';
          const titleEl = document.querySelector('#kindleReader_bookTitle, #top_bar_title, .top_bar_title, #header_title, .book-title');
          title = titleEl ? titleEl.innerText.trim() : docTitle.replace(/Kindle Cloud Reader.*/i, '').trim();

          const authorEl = document.querySelector('#kindleReader_author, .top_bar_author, #book_author, .author-name');
          author = authorEl ? authorEl.innerText.trim() : 'Kindle Author';

          const locEl = document.querySelector('#kindleReader_location, .location_text, #reading_progress');
          progress = locEl ? locEl.innerText.trim() : '';

          const selection = window.getSelection() ? window.getSelection().toString().trim() : '';
          extra = { progress, highlightedQuote: selection };
        }

        // 2. AMAZON BOOK / KINDLE STORE (amazon.com)
        else if (url.includes('amazon.') && (url.includes('/dp/') || url.includes('/gp/product/'))) {
          type = 'amazon_kindle_book';
          const titleEl = document.querySelector('#productTitle, #ebooksProductTitle, h1.a-size-extra-large');
          title = titleEl ? titleEl.innerText.trim() : docTitle.replace(/Amazon\.com:?/i, '').trim();

          const authorEl = document.querySelector('#bylineInfo .author a, .contributorNameID, .author a');
          author = authorEl ? authorEl.innerText.trim() : 'Amazon Author';

          const imgEl = document.querySelector('#ebooksImgBlkFront, #imgBlkFront, #landingImage');
          cover = imgEl ? imgEl.src : '';

          const ratingEl = document.querySelector('#acrPopover .a-icon-alt, span[data-hook="rating-out-of-text"]');
          const rating = ratingEl ? ratingEl.innerText.trim() : '4.5';

          const descEl = document.querySelector('#bookDescription_feature_div, #productDescription');
          const desc = descEl ? descEl.innerText.trim().slice(0, 800) : '';

          extra = { rating, cover, description: desc };
        }

        // 3. ARCHIVE OF OUR OWN (AO3)
        else if (url.includes('archiveofourown.org/works/')) {
          type = 'ao3_fic';
          const titleEl = document.querySelector('h2.title');
          title = titleEl ? titleEl.innerText.trim() : docTitle;

          const authorEl = document.querySelector('a[rel="author"]');
          author = authorEl ? authorEl.innerText.trim() : 'AO3 Author';

          const tags = Array.from(document.querySelectorAll('.freeforms.tags a, .relationships.tags a')).slice(0, 8).map(a => a.innerText.trim());
          extra = { tags };
        }

        // 4. NOVELUPDATES
        else if (url.includes('novelupdates.com')) {
          type = 'novelupdates';
          const titleEl = document.querySelector('.seriestitlenew, h1.entry-title');
          title = titleEl ? titleEl.innerText.trim() : docTitle;
          const authorEl = document.querySelector('#showauthors a, .author');
          author = authorEl ? authorEl.innerText.trim() : 'Asian Webnovel Author';
        }

        // 5. GOODREADS
        else if (url.includes('goodreads.com')) {
          type = 'goodreads';
          const titleEl = document.querySelector('h1[data-testid="bookTitle"], #bookTitle');
          title = titleEl ? titleEl.innerText.trim() : docTitle;
          const authorEl = document.querySelector('span[data-testid="name"], .authorName');
          author = authorEl ? authorEl.innerText.trim() : 'Goodreads Author';
        }

        // 6. TWITCH
        else if (url.includes('twitch.tv')) {
          type = 'twitch';
          const titleEl = document.querySelector('h2[data-a-target="stream-title"], [data-a-target="video-title"], h1');
          title = titleEl ? titleEl.innerText.trim() : docTitle;
          const creatorEl = document.querySelector('a[data-a-target="user-channel-link"], [data-a-target="stream-broadcaster-name"]');
          author = creatorEl ? creatorEl.innerText.trim() : 'undiisclosed';
        }

        // 7. YOUTUBE
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
          type = 'youtube';
          const titleEl = document.querySelector('h1.ytd-watch-metadata, h1.title, #title h1');
          title = titleEl ? titleEl.innerText.trim() : docTitle;
          const creatorEl = document.querySelector('ytd-channel-name a, #channel-name a');
          author = creatorEl ? creatorEl.innerText.trim() : 'YouTube Creator';
        }

        if (!title) title = docTitle.replace(/[\-–—|].*/, '').trim() || 'Untitled Web Resource';
        if (!author) author = 'Web Creator';

        return {
          url,
          type,
          title,
          author,
          cover,
          progress,
          extra
        };
      }
    });

    if (results && results[0] && results[0].result) {
      const data = results[0].result;
      currentScannedData = data;

      titleEl.textContent = data.title;
      subEl.textContent = `Author/Creator: ${data.author}`;

      let badgeText = 'Web Page';
      if (data.type === 'kindle_reader') badgeText = '📖 Kindle Cloud Reader';
      else if (data.type === 'amazon_kindle_book') badgeText = '🛒 Amazon Kindle Store';
      else if (data.type === 'ao3_fic') badgeText = '📜 AO3 Fanfic';
      else if (data.type === 'novelupdates') badgeText = '🌐 NovelUpdates';
      else if (data.type === 'goodreads') badgeText = '📖 Goodreads';
      else if (data.type === 'twitch') badgeText = '🎬 Twitch Stream / VOD';
      else if (data.type === 'youtube') badgeText = '▶️ YouTube Video';

      badgeEl.textContent = badgeText;

      if (data.progress) {
        extraEl.textContent = `📍 Reading Location: ${data.progress}`;
      } else if (data.extra && data.extra.rating) {
        extraEl.textContent = `★ ${data.extra.rating} • Amazon Kindle Edition`;
      } else if (data.extra && data.extra.highlightedQuote) {
        extraEl.textContent = `📝 Quote: "${data.extra.highlightedQuote.slice(0, 50)}..."`;
      } else {
        extraEl.textContent = `URL: ${data.url.slice(0, 50)}...`;
      }

      generatedSidecarMd = buildSidecarMarkdown(data);
      previewEl.textContent = generatedSidecarMd;
    }
  } catch (err) {
    console.error('Scan error:', err);
    titleEl.textContent = 'Active Tab Detected';
    subEl.textContent = 'Click "Copy Markdown Sidecar" to copy sidecar.';
  }
}

function renderHits() {
  const container = document.getElementById('hits-list');
  if (breakHits.length === 0) {
    container.innerHTML = '<div style="font-size: 11px; color: #64748b; font-style: italic;">No card pulls logged yet. Click \'+ Log Hit\' as packs open!</div>';
    return;
  }

  container.innerHTML = '';
  breakHits.forEach((hit, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#050811;padding:6px 10px;border-radius:8px;border:1px solid #1e293b;font-size:11px;';
    
    const text = document.createElement('div');
    text.style.cssText = 'color:#f1f5f9;font-weight:600;';
    text.textContent = `[${hit.time}] ${hit.title}`;

    const del = document.createElement('button');
    del.style.cssText = 'background:none;border:none;color:#64748b;cursor:pointer;font-size:12px;';
    del.textContent = '✖';
    del.onclick = () => {
      breakHits.splice(idx, 1);
      renderHits();
    };

    row.appendChild(text);
    row.appendChild(del);
    container.appendChild(row);
  });
}

function getCurrentFormattedTime() {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
  scanActiveTab();

  // Tab switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(targetId)?.classList.remove('hidden');
    });
  });

  // Open full vault
  document.getElementById('btn-open-full')?.addEventListener('click', () => {
    chrome.tabs.create({ url: BASE_VAULT_URL });
  });

  // Rescan active tab
  document.getElementById('btn-refresh-tab')?.addEventListener('click', scanActiveTab);

  // 1. Copy Markdown Sidecar to clipboard
  document.getElementById('btn-copy-sidecar')?.addEventListener('click', () => {
    if (!generatedSidecarMd && currentScannedData) {
      generatedSidecarMd = buildSidecarMarkdown(currentScannedData);
    }
    if (generatedSidecarMd) {
      navigator.clipboard.writeText(generatedSidecarMd).then(() => {
        const btn = document.getElementById('btn-copy-sidecar');
        const oldText = btn.textContent;
        btn.textContent = '✓ Copied Sidecar Markdown!';
        setTimeout(() => { btn.textContent = oldText; }, 2000);
      });
    }
  });

  // 2. Download .md File directly
  document.getElementById('btn-download-md')?.addEventListener('click', () => {
    if (!generatedSidecarMd && currentScannedData) {
      generatedSidecarMd = buildSidecarMarkdown(currentScannedData);
    }
    if (generatedSidecarMd) {
      const filename = `${(currentScannedData?.title || 'sidecar').replace(/[^a-zA-Z0-9_-]/g, '_')}.sidecar.md`;
      const blob = new Blob([generatedSidecarMd], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  // 3. Open & Save in Vault
  document.getElementById('btn-grab-active')?.addEventListener('click', () => {
    if (!currentScannedData) {
      scanActiveTab().then(() => {
        if (currentScannedData) openVaultWithData(currentScannedData);
      });
      return;
    }
    openVaultWithData(currentScannedData);
  });

  function openVaultWithData(data) {
    let targetUrl = `${BASE_VAULT_URL}?import_novel=${encodeURIComponent(data.title)}&author=${encodeURIComponent(data.author)}&source=${encodeURIComponent(data.url)}`;
    
    if (data.type === 'twitch' || data.type === 'youtube') {
      targetUrl = `${BASE_VAULT_URL}?import_vod=${encodeURIComponent(data.title)}&creator=${encodeURIComponent(data.author)}&source=${encodeURIComponent(data.url)}`;
    } else if (data.type === 'goodreads') {
      targetUrl = `${BASE_VAULT_URL}?import_goodreads=${encodeURIComponent(JSON.stringify([data.title]))}&author=${encodeURIComponent(data.author)}&source=${encodeURIComponent(data.url)}`;
    } else if (data.type === 'kindle_reader' || data.type === 'amazon_kindle_book') {
      const quote = (data.extra && data.extra.highlightedQuote) ? encodeURIComponent(data.extra.highlightedQuote) : '';
      targetUrl = `${BASE_VAULT_URL}?import_novel=${encodeURIComponent(data.title)}&author=${encodeURIComponent(data.author)}&source=${encodeURIComponent(data.url)}&quote=${quote}`;
    }

    chrome.tabs.create({ url: targetUrl });
  }

  // Log Hit
  document.getElementById('btn-add-hit')?.addEventListener('click', () => {
    const input = document.getElementById('break-hit-input');
    const val = input.value.trim();
    if (!val) return;

    breakHits.push({
      time: getCurrentFormattedTime(),
      title: val
    });
    input.value = '';
    renderHits();
  });

  document.getElementById('break-hit-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btn-add-hit')?.click();
    }
  });

  // Copy Break Markdown
  document.getElementById('btn-copy-break-md')?.addEventListener('click', () => {
    const url = (currentScannedData && currentScannedData.url) || 'https://www.twitch.tv/undiisclosed';
    const streamTitle = (currentScannedData && currentScannedData.title) || 'undiisclosed TCG Break';
    const chaptersText = breakHits.map(h => `- ⏱️ **[\`[${h.time}]\` ${h.title}](${url}?t=${h.time.replace(':', 'm')}s)**`).join('\n');
    const nowIso = new Date().toISOString();

    const md = `---
title: "${streamTitle}"
creator: "undiisclosed"
media_type: "vod"
platform: "twitch"
stream_url: "${url}"
tags: ["vod", "twitch", "tcg-break", "card-opening", "pokemon"]
date_cataloged: "${nowIso}"
---

# 🎬 ${streamTitle}

> **Streamer:** **undiisclosed** &bull; **Platform:** \`TWITCH\`
> ↗ **Stream URL:** [Watch on Twitch](${url})

---

## 📑 Break Hits & Card Pulls

${chaptersText || '*No card pulls recorded.*'}

---

## 📝 Break Notes

Live TCG box break session cataloged with timestamped pulls.
`;

    navigator.clipboard.writeText(md).then(() => {
      const btn = document.getElementById('btn-copy-break-md');
      const old = btn.textContent;
      btn.textContent = '✓ Copied Break Markdown!';
      setTimeout(() => { btn.textContent = old; }, 2000);
    });
  });

  // Save Complete Break Sidecar
  document.getElementById('btn-export-break')?.addEventListener('click', () => {
    const url = (currentScannedData && currentScannedData.url) || 'https://www.twitch.tv/undiisclosed';
    const streamTitle = (currentScannedData && currentScannedData.title) || 'undiisclosed TCG Break';
    const chaptersText = breakHits.map(h => `${h.time} - ${h.title}`).join('\n');

    const targetUrl = `${BASE_VAULT_URL}?import_vod=${encodeURIComponent(streamTitle)}&creator=undiisclosed&source=${encodeURIComponent(url)}&chapters=${encodeURIComponent(chaptersText)}`;
    chrome.tabs.create({ url: targetUrl });
  });
});
