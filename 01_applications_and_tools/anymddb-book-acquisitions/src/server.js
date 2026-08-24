/**
 * AnyMDDB Book Curator & Acquisition Server API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const NytIngestion = require('./ingestion/nyt');
const SevenSeasIngestion = require('./ingestion/sevenseas');
const KindleIngestion = require('./ingestion/kindle');
const PlaceholderGenerator = require('./generator/placeholder');
const AcquisitionResolver = require('./acquisition/resolver');
const AuthorTracker = require('./authors/tracker');
const TagTracker = require('./subscriptions/tag_tracker');

const app = express();
const PORT = process.env.PORT || 3789;

let LIBRARY_BASE_DIR = process.env.ANYMD_LIBRARY_PATH || path.join(__dirname, '..', 'library');

if (!fs.existsSync(LIBRARY_BASE_DIR)) {
  fs.mkdirSync(LIBRARY_BASE_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// 1. Feeds Endpoints
app.get('/api/feeds/nyt', async (req, res) => {
  const category = req.query.category || 'combined-print-and-e-book-fiction';
  try {
    const list = await NytIngestion.fetchList(category);
    res.json({ source: 'New York Times Best Sellers', category, books: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/feeds/sevenseas', async (req, res) => {
  try {
    const releases = await SevenSeasIngestion.fetchReleases();
    res.json({ source: 'Seven Seas Entertainment', books: releases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/feeds/kindle', async (req, res) => {
  const genre = req.query.genre || 'progression-fantasy';
  try {
    const books = await KindleIngestion.fetchTopList(genre);
    res.json({ source: 'Top Kindle & Progression Fantasy', genre, books });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Placeholder & Wishlist Generation
app.post('/api/wishlist/generate', (req, res) => {
  const { books } = req.body;
  if (!Array.isArray(books) || books.length === 0) {
    return res.status(400).json({ error: 'Array of books is required.' });
  }

  const results = [];
  books.forEach(b => {
    const r = PlaceholderGenerator.createEntry(LIBRARY_BASE_DIR, b);
    results.push(r);
  });

  res.json({ success: true, createdCount: results.filter(r => r.status === 'created').length, results });
});

app.get('/api/wishlist', (req, res) => {
  try {
    const entries = PlaceholderGenerator.listEntries(LIBRARY_BASE_DIR);
    res.json({ libraryPath: LIBRARY_BASE_DIR, count: entries.length, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wishlist/update-status', (req, res) => {
  const { filePath, status, details } = req.body;
  if (!filePath || !status) {
    return res.status(400).json({ error: 'filePath and status are required.' });
  }

  try {
    const updated = PlaceholderGenerator.updateStatus(filePath, status, details || {});
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Author Tracking Endpoints
app.post('/api/authors/subscribe', (req, res) => {
  const { authorName, extraData } = req.body;
  if (!authorName) return res.status(400).json({ error: 'authorName is required' });

  try {
    const result = AuthorTracker.subscribe(LIBRARY_BASE_DIR, authorName, extraData || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/authors', (req, res) => {
  try {
    const authors = AuthorTracker.listAuthors(LIBRARY_BASE_DIR);
    res.json({ authors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/authors/check-releases', async (req, res) => {
  const { authorName, autoGenerateWishlist = true } = req.body;
  if (!authorName) return res.status(400).json({ error: 'authorName is required' });

  try {
    const result = await AuthorTracker.checkAuthorReleases(LIBRARY_BASE_DIR, authorName, autoGenerateWishlist);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/authors/check-all', async (req, res) => {
  try {
    const authors = AuthorTracker.listAuthors(LIBRARY_BASE_DIR);
    const results = [];

    for (const a of authors) {
      if (a.subscribed) {
        const r = await AuthorTracker.checkAuthorReleases(LIBRARY_BASE_DIR, a.name, true);
        results.push(r);
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Tag, Mood & Genre Subscriptions Endpoints
app.get('/api/subscriptions', (req, res) => {
  try {
    const subscriptions = TagTracker.listSubscriptions(LIBRARY_BASE_DIR);
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions/save', (req, res) => {
  const { name, type, sources, autoWishlist } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = TagTracker.saveSubscription(LIBRARY_BASE_DIR, {
      name,
      type: type || 'tag',
      sources: sources || ['openlibrary', 'novelupdates', 'kindle'],
      autoWishlist: autoWishlist !== false
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions/delete', (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: 'filePath is required' });

  try {
    const result = TagTracker.deleteSubscription(filePath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions/scan', async (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.name) {
    return res.status(400).json({ error: 'Subscription data is required' });
  }

  try {
    const result = await TagTracker.scanSubscription(LIBRARY_BASE_DIR, subscription);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions/scan-all', async (req, res) => {
  try {
    const subs = TagTracker.listSubscriptions(LIBRARY_BASE_DIR);
    const results = [];

    for (const s of subs) {
      if (s.subscribed) {
        const r = await TagTracker.scanSubscription(LIBRARY_BASE_DIR, s);
        results.push(r);
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Multi-Source Acquisition Resolver
app.post('/api/acquisition/resolve', async (req, res) => {
  const { book } = req.body;
  if (!book || !book.title) {
    return res.status(400).json({ error: 'Book metadata with title is required.' });
  }

  try {
    const resolved = await AcquisitionResolver.resolveAll(book);
    res.json(resolved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Download Direct Public Domain EPUB from Gutenberg
app.post('/api/acquisition/download-gutenberg', async (req, res) => {
  const { epubUrl, title, author, filePath } = req.body;
  if (!epubUrl) {
    return res.status(400).json({ error: 'epubUrl is required.' });
  }

  const downloadsDir = path.join(LIBRARY_BASE_DIR, 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const safeFilename = `${author || 'Unknown'} - ${title || 'Book'}.epub`.replace(/[/\\?%*:|"<>]/g, '-').trim();
  const targetPath = path.join(downloadsDir, safeFilename);

  try {
    const response = await axios({
      method: 'GET',
      url: epubUrl,
      responseType: 'arraybuffer',
      timeout: 15000
    });

    fs.writeFileSync(targetPath, response.data);

    if (filePath && fs.existsSync(filePath)) {
      PlaceholderGenerator.updateStatus(filePath, 'acquired', { localFilePath: targetPath });
    }

    res.json({ success: true, localFilePath: targetPath, filename: safeFilename });
  } catch (err) {
    res.status(500).json({ error: `Failed to download from Gutenberg: ${err.message}` });
  }
});

// 7. Config
app.get('/api/config', (req, res) => {
  res.json({ libraryPath: LIBRARY_BASE_DIR });
});

app.post('/api/config', (req, res) => {
  const { libraryPath } = req.body;
  if (libraryPath) {
    LIBRARY_BASE_DIR = libraryPath;
    if (!fs.existsSync(LIBRARY_BASE_DIR)) {
      fs.mkdirSync(LIBRARY_BASE_DIR, { recursive: true });
    }
  }
  res.json({ success: true, libraryPath: LIBRARY_BASE_DIR });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================================`);
  console.log(`AnyMDDB Book Curator running at http://localhost:${PORT}`);
  console.log(`Library base path: ${LIBRARY_BASE_DIR}`);
  console.log(`========================================================`);
});
