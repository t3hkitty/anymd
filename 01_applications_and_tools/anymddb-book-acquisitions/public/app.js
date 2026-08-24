/**
 * AnyMDDB Book Curator & Acquisition Client Controller
 */

(function () {
  'use strict';

  let currentFeedType = 'sevenseas';
  let feedBooks = [];
  let wishlistEntries = [];
  let trackedAuthors = [];
  let subscriptionsList = [];

  // DOM Elements
  const feedResultsGrid = document.getElementById('feed-results-grid');
  const wishlistContainer = document.getElementById('wishlist-container');
  const authorsContainer = document.getElementById('authors-container');
  const subscriptionsContainer = document.getElementById('subscriptions-container');
  const displayLibPath = document.getElementById('display-lib-path');
  const filterWishlistStatus = document.getElementById('filter-wishlist-status');

  const modalAcquisition = document.getElementById('modal-acquisition');
  const acqModalTitle = document.getElementById('acq-modal-title');
  const acqModalBody = document.getElementById('acq-modal-body');

  const formSearchAcquisition = document.getElementById('form-search-acquisition');

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupModals();
    setupEventListeners();
    fetchConfig();
    loadFeed(currentFeedType);
    loadWishlist();
    loadAuthors();
    loadSubscriptions();
  });

  async function fetchConfig() {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.libraryPath) {
        displayLibPath.textContent = `Library: ${data.libraryPath}`;
        document.getElementById('cfg-library-dir').value = data.libraryPath;
      }
    } catch (_) {}
  }

  function setupNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

        btn.classList.add('active');
        const view = document.getElementById(targetTab);
        if (view) view.classList.add('active');

        if (targetTab === 'tab-wishlist') loadWishlist();
        if (targetTab === 'tab-authors') loadAuthors();
        if (targetTab === 'tab-tags') loadSubscriptions();
      });
    });

    document.querySelectorAll('.feed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.feed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFeedType = btn.getAttribute('data-feed');
        loadFeed(currentFeedType);
      });
    });
  }

  function setupEventListeners() {
    document.getElementById('btn-refresh-wishlist').addEventListener('click', loadWishlist);
    document.getElementById('btn-refresh-authors').addEventListener('click', loadAuthors);
    document.getElementById('btn-refresh-tags').addEventListener('click', loadSubscriptions);

    filterWishlistStatus.addEventListener('change', () => {
      renderWishlist(wishlistEntries);
    });

    // Check All Authors
    document.getElementById('btn-check-all-authors').addEventListener('click', async () => {
      const btn = document.getElementById('btn-check-all-authors');
      btn.disabled = true;
      btn.textContent = 'Scanning Open Library...';
      try {
        await fetch('/api/authors/check-all', { method: 'POST' });
        showToast('Scan complete. Missing works added to wishlist.');
        loadAuthors();
        loadWishlist();
      } catch (_) {
        showToast('Failed to scan authors.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Scan All Authors';
      }
    });

    // Scan All Tag Subscriptions
    document.getElementById('btn-scan-all-tags').addEventListener('click', async () => {
      const btn = document.getElementById('btn-scan-all-tags');
      btn.disabled = true;
      btn.textContent = 'Scanning Feeds...';
      try {
        const res = await fetch('/api/subscriptions/scan-all', { method: 'POST' });
        const data = await res.json();
        showToast('Subscription sweep finished! New matches added to wishlist.');
        loadSubscriptions();
        loadWishlist();
      } catch (_) {
        showToast('Failed to scan subscriptions.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Scan All Subscriptions';
      }
    });

    // Quick Preset Chips Click
    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', async () => {
        const name = chip.getAttribute('data-name');
        const type = chip.getAttribute('data-type');
        await saveSubscription({ name, type });
      });
    });

    // Create Subscription Form
    document.getElementById('form-create-subscription').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('sub-input-name').value.trim();
      const type = document.getElementById('sub-select-type').value;
      if (!name) return;

      await saveSubscription({ name, type });
      document.getElementById('sub-input-name').value = '';
    });

    // Batch Add Button
    document.getElementById('btn-batch-add-selected').addEventListener('click', async () => {
      const checkedBoxes = Array.from(document.querySelectorAll('.feed-book-cb:checked'));
      if (checkedBoxes.length === 0) {
        showToast('Please check at least one book from the feed.');
        return;
      }

      const selectedIndices = new Set(checkedBoxes.map(cb => parseInt(cb.getAttribute('data-idx'), 10)));
      const selectedBooks = feedBooks.filter((_, idx) => selectedIndices.has(idx));

      await addBooksToWishlist(selectedBooks);
    });

    // Instant Acquisition Search
    formSearchAcquisition.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('acq-search-title').value.trim();
      const author = document.getElementById('acq-search-author').value.trim();
      if (!title) return;

      const btn = document.getElementById('btn-run-search');
      btn.disabled = true;
      btn.textContent = 'Searching...';

      try {
        const res = await fetch('/api/acquisition/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book: { title, author } })
        });

        const data = await res.json();
        renderAcquisitionDetails(data);
        openModal('modal-acquisition');
      } catch (err) {
        showToast(`Search failed: ${err.message}`);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search Sources`;
      }
    });

    // Settings Form
    document.getElementById('form-plugin-settings').addEventListener('submit', async (e) => {
      e.preventDefault();
      const libraryPath = document.getElementById('cfg-library-dir').value.trim();
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ libraryPath })
        });
        showToast('Settings saved.');
        fetchConfig();
        loadWishlist();
        loadAuthors();
        loadSubscriptions();
        closeAllModals();
      } catch (_) {
        showToast('Failed to update config.');
      }
    });
  }

  // --- Subscriptions Management ---
  async function saveSubscription(subData) {
    try {
      const res = await fetch('/api/subscriptions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subData)
      });
      const data = await res.json();
      showToast(`Subscribed to ${subData.type.toUpperCase()}: "${subData.name}"!`);
      loadSubscriptions();
    } catch (_) {
      showToast('Could not save subscription.');
    }
  }

  async function loadSubscriptions() {
    subscriptionsContainer.innerHTML = `<p class="text-muted">Loading subscriptions...</p>`;
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      subscriptionsList = data.subscriptions || [];
      renderSubscriptions(subscriptionsList);
    } catch (err) {
      subscriptionsContainer.innerHTML = `<p class="text-muted">Failed to load subscriptions.</p>`;
    }
  }

  function renderSubscriptions(subs) {
    if (subs.length === 0) {
      subscriptionsContainer.innerHTML = `<p class="text-muted">No tag, genre, or mood subscriptions active yet. Click a quick preset or add one above!</p>`;
      return;
    }

    subscriptionsContainer.innerHTML = '';
    subs.forEach(s => {
      const card = document.createElement('div');
      card.className = 'subscription-card';
      const typeBadge = s.type === 'mood' ? 'badge-wishlist' : (s.type === 'genre' ? 'badge-acquired' : 'badge');

      card.innerHTML = `
        <div>
          <h4>
            <span class="badge ${typeBadge}">${s.type.toUpperCase()}</span>
            ${s.name}
          </h4>
          <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
            Sources: ${(s.sources || []).join(', ')} • Auto-Wishlist: ${s.auto_wishlist ? 'Yes' : 'No'}
          </p>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-primary btn-scan-single-sub" data-file="${s.filePath}">Scan Feed</button>
          <button type="button" class="btn btn-sm btn-outline btn-delete-sub" data-file="${s.filePath}" style="color:var(--danger);">&times;</button>
        </div>
      `;
      subscriptionsContainer.appendChild(card);
    });

    subscriptionsContainer.querySelectorAll('.btn-scan-single-sub').forEach(btn => {
      btn.addEventListener('click', async () => {
        const filePath = btn.getAttribute('data-file');
        const item = subscriptionsList.find(s => s.filePath === filePath);
        if (!item) return;

        btn.disabled = true;
        btn.textContent = 'Scanning...';
        try {
          const res = await fetch('/api/subscriptions/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: item })
          });
          const data = await res.json();
          showToast(`Found ${data.newMatchesAdded} new matches for "${item.name}". Added to wishlist!`);
          loadWishlist();
          loadSubscriptions();
        } catch (err) {
          showToast('Failed to scan subscription.');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Scan Feed';
        }
      });
    });

    subscriptionsContainer.querySelectorAll('.btn-delete-sub').forEach(btn => {
      btn.addEventListener('click', async () => {
        const filePath = btn.getAttribute('data-file');
        try {
          await fetch('/api/subscriptions/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath })
          });
          showToast('Subscription removed.');
          loadSubscriptions();
        } catch (_) {
          showToast('Failed to delete subscription.');
        }
      });
    });
  }

  // --- Feeds Loader ---
  async function loadFeed(feedType) {
    feedResultsGrid.innerHTML = `<p class="text-muted">Loading ${feedType} feed...</p>`;
    try {
      let endpoint = `/api/feeds/${feedType}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      feedBooks = data.books || [];
      renderFeedBooks(feedBooks);
    } catch (err) {
      feedResultsGrid.innerHTML = `<p class="text-muted">Failed to load feed: ${err.message}</p>`;
    }
  }

  function renderFeedBooks(books) {
    if (books.length === 0) {
      feedResultsGrid.innerHTML = `<p class="text-muted">No entries found for this list.</p>`;
      return;
    }

    feedResultsGrid.innerHTML = '';
    books.forEach((book, idx) => {
      const card = document.createElement('div');
      card.className = 'book-card';
      const cover = book.coverUrl || 'https://via.placeholder.com/70x100/1f2937/9ca3af?text=Cover';
      const author = book.author || 'Unknown';

      const tagsHtml = (book.tags || []).slice(0, 3).map(t => `<span class="chip-btn btn-quick-sub-tag" data-tag="${t}">#${t}</span>`).join(' ');

      card.innerHTML = `
        <div class="book-cover">
          <img src="${cover}" alt="${book.title}" loading="lazy">
        </div>
        <div class="book-meta">
          <div>
            <h3>${book.title}</h3>
            <p class="author">
              <button type="button" class="btn-author-link" data-author="${author}" title="Subscribe to ${author}">
                👤 ${author}
              </button>
            </p>
            <p class="pub">${book.publisher || book.imprint || ''} ${book.releaseDate ? '• ' + book.releaseDate : ''}</p>
            <div style="margin-top:4px;">${tagsHtml}</div>
          </div>
          <div class="card-actions">
            <label class="checkbox-label" style="font-size: 11px; display:flex; align-items:center; gap:4px;">
              <input type="checkbox" class="feed-book-cb" data-idx="${idx}">
              <span>Select</span>
            </label>
            <div style="display:flex; gap:4px;">
              <button type="button" class="btn btn-sm btn-outline btn-quick-resolve" data-idx="${idx}">Search</button>
              <button type="button" class="btn btn-sm btn-primary btn-add-single" data-idx="${idx}">+ Wishlist</button>
            </div>
          </div>
        </div>
      `;

      feedResultsGrid.appendChild(card);
    });

    feedResultsGrid.querySelectorAll('.btn-quick-sub-tag').forEach(chip => {
      chip.addEventListener('click', async (e) => {
        e.stopPropagation();
        const tag = chip.getAttribute('data-tag');
        await saveSubscription({ name: tag, type: 'tag' });
      });
    });

    feedResultsGrid.querySelectorAll('.btn-author-link').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const author = btn.getAttribute('data-author');
        await toggleAuthorSubscription(author);
      });
    });

    feedResultsGrid.querySelectorAll('.btn-add-single').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        await addBooksToWishlist([feedBooks[idx]]);
      });
    });

    feedResultsGrid.querySelectorAll('.btn-quick-resolve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        await resolveBookAcquisition(feedBooks[idx]);
      });
    });
  }

  // --- Author Subscription Management ---
  async function toggleAuthorSubscription(authorName) {
    try {
      await fetch('/api/authors/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName })
      });
      showToast(`Subscribed to ${authorName}! Monitoring bibliography.`);
      loadAuthors();
    } catch (_) {
      showToast('Could not subscribe to author.');
    }
  }

  async function loadAuthors() {
    authorsContainer.innerHTML = `<p class="text-muted">Loading subscribed authors...</p>`;
    try {
      const res = await fetch('/api/authors');
      const data = await res.json();
      trackedAuthors = data.authors || [];
      renderAuthors(trackedAuthors);
    } catch (err) {
      authorsContainer.innerHTML = `<p class="text-muted">Failed to load authors: ${err.message}</p>`;
    }
  }

  function renderAuthors(authors) {
    if (authors.length === 0) {
      authorsContainer.innerHTML = `<p class="text-muted">No authors tracked yet. Click any author name (👤 Author) in a book card to start tracking releases.</p>`;
      return;
    }

    authorsContainer.innerHTML = '';
    authors.forEach(a => {
      const card = document.createElement('div');
      card.className = 'author-card';
      card.style.cssText = "background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;";

      card.innerHTML = `
        <div>
          <h4 style="font-size:14px; font-weight:600;">👤 ${a.name}</h4>
          <p style="font-size:12px; color:var(--text-secondary);">
            Tracking Active • Last Checked: ${a.last_checked ? a.last_checked.split('T')[0] : 'Today'} • Works on file: ${a.known_works_count || 0}
          </p>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-primary btn-scan-single-author" data-name="${a.name}">Scan Releases</button>
        </div>
      `;
      authorsContainer.appendChild(card);
    });

    authorsContainer.querySelectorAll('.btn-scan-single-author').forEach(btn => {
      btn.addEventListener('click', async () => {
        const name = btn.getAttribute('data-name');
        btn.disabled = true;
        btn.textContent = 'Scanning...';
        try {
          const res = await fetch('/api/authors/check-releases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorName: name, autoGenerateWishlist: true })
          });
          const data = await res.json();
          showToast(`Found ${data.newReleasesFound} uncollected works by ${name}. Added to wishlist!`);
          loadWishlist();
          loadAuthors();
        } catch (_) {
          showToast(`Error scanning ${name}`);
        } finally {
          btn.disabled = false;
          btn.textContent = 'Scan Releases';
        }
      });
    });
  }

  // --- Wishlist Management ---
  async function addBooksToWishlist(books) {
    try {
      const res = await fetch('/api/wishlist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books })
      });
      const data = await res.json();
      showToast(`Added ${data.createdCount} placeholder(s) to AnyMDDB.`);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }

  async function loadWishlist() {
    wishlistContainer.innerHTML = `<p class="text-muted">Loading AnyMDDB wishlist...</p>`;
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      wishlistEntries = data.entries || [];
      renderWishlist(wishlistEntries);
    } catch (err) {
      wishlistContainer.innerHTML = `<p class="text-muted">Failed to load wishlist: ${err.message}</p>`;
    }
  }

  function renderWishlist(entries) {
    const filter = filterWishlistStatus.value;
    const filtered = entries.filter(e => {
      if (filter === 'all') return true;
      return e.status === filter;
    });

    if (filtered.length === 0) {
      wishlistContainer.innerHTML = `<p class="text-muted">No matching AnyMDDB entries found.</p>`;
      return;
    }

    wishlistContainer.innerHTML = '';
    filtered.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'wishlist-item-row';
      const isAcquired = entry.status === 'acquired';
      const author = entry.author || 'Unknown';

      row.innerHTML = `
        <div class="wishlist-item-info">
          <h4>${entry.title}</h4>
          <p>
            <button type="button" class="btn-author-link" data-author="${author}">👤 ${author}</button>
            • <span class="badge ${isAcquired ? 'badge-acquired' : 'badge-wishlist'}">${entry.status.toUpperCase()}</span>
            • <em>${entry.source_list || 'Curated'}</em>
          </p>
        </div>
        <div class="wishlist-item-actions">
          <button type="button" class="btn btn-sm btn-outline btn-view-acq" data-file="${entry.filePath}">Acquisition Options</button>
          ${!isAcquired ? `<button type="button" class="btn btn-sm btn-secondary btn-mark-acquired" data-file="${entry.filePath}">Mark Acquired</button>` : ''}
        </div>
      `;

      wishlistContainer.appendChild(row);
    });

    wishlistContainer.querySelectorAll('.btn-author-link').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const author = btn.getAttribute('data-author');
        await toggleAuthorSubscription(author);
      });
    });

    wishlistContainer.querySelectorAll('.btn-view-acq').forEach(btn => {
      btn.addEventListener('click', async () => {
        const filePath = btn.getAttribute('data-file');
        const item = wishlistEntries.find(e => e.filePath === filePath);
        if (item) await resolveBookAcquisition(item);
      });
    });

    wishlistContainer.querySelectorAll('.btn-mark-acquired').forEach(btn => {
      btn.addEventListener('click', async () => {
        const filePath = btn.getAttribute('data-file');
        await updateEntryStatus(filePath, 'acquired');
      });
    });
  }

  async function updateEntryStatus(filePath, status) {
    try {
      await fetch('/api/wishlist/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, status })
      });
      showToast(`Status updated to ${status}.`);
      loadWishlist();
    } catch (_) {
      showToast('Failed to update status.');
    }
  }

  // --- Multi-Source Acquisition Resolver ---
  async function resolveBookAcquisition(book) {
    acqModalTitle.textContent = `Acquiring: ${book.title}`;
    acqModalBody.innerHTML = `<p class="text-muted">Querying Project Gutenberg, Open Library, Anna's Archive, and OverDrive...</p>`;
    openModal('modal-acquisition');

    try {
      const res = await fetch('/api/acquisition/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book })
      });

      const data = await res.json();
      renderAcquisitionDetails(data, book.filePath);
    } catch (err) {
      acqModalBody.innerHTML = `<p class="text-muted">Failed to query sources: ${err.message}</p>`;
    }
  }

  function renderAcquisitionDetails(data, linkedFilePath = '') {
    const gutenberg = data.gutenberg || [];
    const openLibrary = data.openLibrary || [];
    const annas = data.annasArchive || {};
    const overdrive = data.overdrive || {};

    let html = `<div class="acq-channels-grid">`;

    // 1. Project Gutenberg
    html += `
      <div class="channel-box">
        <h4><span>📖 Project Gutenberg (Public Domain)</span> <span class="badge badge-acquired">${gutenberg.length} Matches</span></h4>
    `;
    if (gutenberg.length > 0) {
      gutenberg.forEach(g => {
        html += `
          <div class="channel-item">
            <div>
              <strong>${g.title}</strong> (${g.author})
              <div style="font-size:11px; color:var(--text-muted);">Downloads: ${g.downloadCount}</div>
            </div>
            ${g.directDownloadAvailable ? `
              <button type="button" class="btn btn-sm btn-success btn-download-gutenberg" 
                data-url="${g.epubUrl}" 
                data-title="${g.title}" 
                data-author="${g.author}"
                data-file="${linkedFilePath}">
                1-Click Download EPUB
              </button>
            ` : `<span class="text-muted">No EPUB</span>`}
          </div>
        `;
      });
    } else {
      html += `<p style="font-size:12px; color:var(--text-muted);">No public domain match found in Gutenberg.</p>`;
    }
    html += `</div>`;

    // 2. Open Library & Internet Archive
    html += `
      <div class="channel-box">
        <h4><span>🏛️ Open Library & Internet Archive</span> <span class="badge">${openLibrary.length} Editions</span></h4>
    `;
    if (openLibrary.length > 0) {
      openLibrary.forEach(ol => {
        html += `
          <div class="channel-item">
            <div>
              <strong>${ol.title}</strong> (${ol.author}) ${ol.firstPublishYear ? '• ' + ol.firstPublishYear : ''}
            </div>
            <a href="${ol.archiveUrl || ol.openLibraryUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">View / Borrow</a>
          </div>
        `;
      });
    } else {
      html += `<p style="font-size:12px; color:var(--text-muted);">No Open Library catalog match found.</p>`;
    }
    html += `</div>`;

    // 3. Anna's Archive & Shadow Repositories
    html += `
      <div class="channel-box">
        <h4><span>🔍 Anna's Archive & Repositories</span></h4>
        <div class="channel-item">
          <div>Query: <code>${data.query}</code></div>
          <div style="display:flex; gap:6px;">
            <a href="${annas.epubFilterUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">Search EPUBs</a>
            <a href="${annas.libgenUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">Libgen Search</a>
          </div>
        </div>
      </div>
    `;

    // 4. OverDrive & Libby
    html += `
      <div class="channel-box">
        <h4><span>📱 OverDrive / Libby Public Library</span></h4>
        <div class="channel-item">
          <div>Check availability at your connected public library card.</div>
          <div style="display:flex; gap:6px;">
            <a href="${overdrive.libbyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">Open Libby</a>
            <a href="${overdrive.overdriveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">OverDrive Catalog</a>
          </div>
        </div>
      </div>
    `;

    html += `</div>`;
    acqModalBody.innerHTML = html;

    acqModalBody.querySelectorAll('.btn-download-gutenberg').forEach(btn => {
      btn.addEventListener('click', async () => {
        const epubUrl = btn.getAttribute('data-url');
        const title = btn.getAttribute('data-title');
        const author = btn.getAttribute('data-author');
        const filePath = btn.getAttribute('data-file');

        btn.disabled = true;
        btn.textContent = 'Downloading...';

        try {
          const dlRes = await fetch('/api/acquisition/download-gutenberg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ epubUrl, title, author, filePath })
          });
          const dlData = await dlRes.json();
          if (dlData.success) {
            btn.textContent = 'Acquired ✓';
            showToast(`Downloaded: ${dlData.filename}`);
            loadWishlist();
          } else {
            throw new Error(dlData.error);
          }
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Download Failed';
          showToast(`Download error: ${err.message}`);
        }
      });
    });
  }

  // --- Modal Helpers ---
  function setupModals() {
    document.getElementById('btn-settings').addEventListener('click', () => openModal('modal-settings'));
    document.getElementById('btn-faq').addEventListener('click', () => openModal('modal-faq'));

    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.closest('.modal-backdrop');
        if (m) closeModal(m.id);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop.id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.removeAttribute('hidden');
      el.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('hidden', '');
      el.setAttribute('aria-hidden', 'true');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.setAttribute('hidden', '');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

})();
