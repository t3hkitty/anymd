// Library Companion MD - Sovereign Side Panel Logic

const BASE_VAULT_URL = 'http://artkitty.net/meow/lcmd/';

let currentTab = null;
let breakHits = [];

async function updateActiveTabInfo() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      currentTab = tabs[0];
      const url = currentTab.url || '';
      const title = currentTab.title || 'Untitled Page';

      const infoEl = document.getElementById('tab-info');
      const badgeEl = document.getElementById('tab-platform-badge');

      let platformName = 'Web Page';
      if (url.includes('twitch.tv')) platformName = 'Twitch Stream/VOD';
      else if (url.includes('youtube.com') || url.includes('youtu.be')) platformName = 'YouTube Video';
      else if (url.includes('goodreads.com')) platformName = 'Goodreads';
      else if (url.includes('novelupdates.com')) platformName = 'NovelUpdates';

      badgeEl.textContent = platformName;
      infoEl.textContent = title;
    }
  } catch (err) {
    console.error('Failed to query active tab:', err);
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
  updateActiveTabInfo();

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

  // Refresh tab
  document.getElementById('btn-refresh-tab')?.addEventListener('click', updateActiveTabInfo);

  // Grab active tab to vault
  document.getElementById('btn-grab-active')?.addEventListener('click', () => {
    if (!currentTab || !currentTab.url) return;
    const url = currentTab.url;
    const title = currentTab.title || 'Stream Video';

    let targetUrl = `${BASE_VAULT_URL}?import_vod=${encodeURIComponent(title)}&source=${encodeURIComponent(url)}`;
    if (url.includes('novelupdates.com')) {
      targetUrl = `${BASE_VAULT_URL}?import_novel=${encodeURIComponent(title)}&source=${encodeURIComponent(url)}`;
    } else if (url.includes('goodreads.com')) {
      targetUrl = `${BASE_VAULT_URL}?import_goodreads=${encodeURIComponent(JSON.stringify([title]))}&source=${encodeURIComponent(url)}`;
    }

    chrome.tabs.create({ url: targetUrl });
  });

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

  // Save Complete Break Sidecar
  document.getElementById('btn-export-break')?.addEventListener('click', () => {
    const url = (currentTab && currentTab.url) || 'https://www.twitch.tv/undiisclosed';
    const streamTitle = (currentTab && currentTab.title) || 'undiisclosed TCG Break';
    const chaptersText = breakHits.map(h => `${h.time} - ${h.title}`).join('\n');

    const targetUrl = `${BASE_VAULT_URL}?import_vod=${encodeURIComponent(streamTitle)}&creator=undiisclosed&source=${encodeURIComponent(url)}&chapters=${encodeURIComponent(chaptersText)}`;
    chrome.tabs.create({ url: targetUrl });
  });
});
