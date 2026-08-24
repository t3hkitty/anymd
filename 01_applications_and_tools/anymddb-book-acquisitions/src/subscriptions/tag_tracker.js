/**
 * AnyMDDB Tag, Mood, and Genre Subscription Engine
 * Monitors NovelUpdates, Open Library/Hardcover subjects, and Kindle/Royal Road feeds.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const yaml = require('js-yaml');
const PlaceholderGenerator = require('../generator/placeholder');

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

class TagTracker {
  /**
   * Save or update a Tag/Mood/Genre subscription.
   */
  static saveSubscription(libraryBaseDir, subData) {
    const subsDir = path.join(libraryBaseDir, 'subscriptions');
    if (!fs.existsSync(subsDir)) {
      fs.mkdirSync(subsDir, { recursive: true });
    }

    const name = (subData.name || '').trim();
    const type = subData.type || 'tag'; // 'tag', 'mood', 'genre'
    if (!name) throw new Error('Subscription name is required');

    const safeName = `${type}_${name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
    const filePath = path.join(subsDir, `${safeName}.md`);

    let existingMeta = {};
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const match = raw.match(/^---\n([\s\S]*?)\n---/);
        if (match) existingMeta = yaml.load(match[1]) || {};
      } catch (_) {}
    }

    const frontmatter = {
      name: name,
      type: type,
      subscribed: subData.subscribed !== undefined ? subData.subscribed : true,
      sources: subData.sources || existingMeta.sources || ['openlibrary', 'novelupdates', 'kindle'],
      subscribed_at: existingMeta.subscribed_at || new Date().toISOString(),
      last_checked: new Date().toISOString(),
      min_rating: subData.minRating || existingMeta.min_rating || 3.8,
      auto_wishlist: subData.autoWishlist !== undefined ? subData.autoWishlist : true,
      tags: [type, name.toLowerCase().replace(/\s+/g, '-'), 'subscription-feed']
    };

    const content = `---\n${yaml.dump(frontmatter).trim()}\n---\n\n# ${type.toUpperCase()}: ${name}\n\n**Type**: \`${type}\`\n**Active Sources**: ${frontmatter.sources.join(', ')}\n**Auto-Add to Wishlist**: ${frontmatter.auto_wishlist ? 'Yes' : 'No'}\n\n## Discovery Log\nMonitors release and trending feeds matching this ${type}.\n`;

    fs.writeFileSync(filePath, content, 'utf-8');

    return { success: true, filePath, subscription: frontmatter };
  }

  /**
   * List all active tag/mood/genre subscriptions.
   */
  static listSubscriptions(libraryBaseDir) {
    const subsDir = path.join(libraryBaseDir, 'subscriptions');
    if (!fs.existsSync(subsDir)) return [];

    const files = fs.readdirSync(subsDir).filter(f => f.endsWith('.md'));
    const subscriptions = [];

    files.forEach(filename => {
      const filePath = path.join(subsDir, filename);
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const match = raw.match(/^---\n([\s\S]*?)\n---/);
        if (match) {
          const fm = yaml.load(match[1]);
          subscriptions.push({
            filename,
            filePath,
            ...fm
          });
        }
      } catch (_) {}
    });

    return subscriptions;
  }

  /**
   * Delete a subscription.
   */
  static deleteSubscription(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  }

  /**
   * Run multi-source discovery scan for a tag/mood/genre.
   */
  static async scanSubscription(libraryBaseDir, subData) {
    const { name, type, sources = ['openlibrary', 'novelupdates', 'kindle'], auto_wishlist = true } = subData;
    const discovered = [];

    // 1. Source: Open Library Subject / Mood API
    if (sources.includes('openlibrary') || sources.includes('hardcover')) {
      try {
        const subject = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=15`;
        const res = await axios.get(url, { headers: { 'User-Agent': DEFAULT_USER_AGENT }, timeout: 8000 });
        const works = res.data.works || [];

        works.forEach(w => {
          const title = w.title;
          const author = (w.authors || []).map(a => a.name).join(', ') || 'Unknown Author';
          const coverId = w.cover_id;
          const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';

          discovered.push({
            title,
            author,
            coverUrl,
            sourceList: `Feed [${type.toUpperCase()}: ${name}] via Open Library`,
            tags: [type, name.toLowerCase().replace(/\s+/g, '-'), 'feed-discovery', 'wishlist'],
            description: `Discovered from ${type} subscription "${name}".`
          });
        });
      } catch (err) {
        console.warn(`Open Library subject scan error (${name}):`, err.message);
      }
    }

    // 2. Source: NovelUpdates / Web Novel Tag Query
    if (sources.includes('novelupdates')) {
      try {
        const nuResults = await TagTracker.scanNovelUpdatesTag(name, type);
        discovered.push(...nuResults);
      } catch (err) {
        console.warn(`NovelUpdates tag scan error (${name}):`, err.message);
      }
    }

    // 3. Deduplicate against existing library & wishlist
    const existingTitles = new Set();
    const wishlistDir = path.join(libraryBaseDir, 'wishlist');
    if (fs.existsSync(wishlistDir)) {
      fs.readdirSync(wishlistDir).forEach(f => {
        existingTitles.add(f.toLowerCase().replace(/\.md$/, ''));
      });
    }

    const newBooks = [];
    discovered.forEach(book => {
      const titleLower = book.title.toLowerCase();
      const alreadyExists = Array.from(existingTitles).some(t => t.includes(titleLower));

      if (!alreadyExists && book.title.length > 2) {
        newBooks.push(book);
        if (auto_wishlist) {
          PlaceholderGenerator.createEntry(libraryBaseDir, book);
        }
      }
    });

    // Update subscription timestamp
    TagTracker.saveSubscription(libraryBaseDir, subData);

    return {
      subscriptionName: name,
      type: type,
      totalDiscovered: discovered.length,
      newMatchesAdded: newBooks.length,
      newBooks
    };
  }

  /**
   * Helper to scan NovelUpdates series by genre/tag.
   */
  static async scanNovelUpdatesTag(tagName, type) {
    const searchUrl = `https://www.novelupdates.com/?s=${encodeURIComponent(tagName)}&post_type=seriesortag`;
    try {
      const res = await axios.get(searchUrl, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 8000
      });

      const $ = cheerio.load(res.data);
      const results = [];

      $('.search_main_box, .w-blog-entry').slice(0, 10).each((_, el) => {
        const $el = $(el);
        const title = $el.find('.search_title a, .w-blog-entry-title a').first().text().trim();
        const author = $el.find('.search_author, .w-blog-entry-author').first().text().trim() || 'Unknown';
        const coverUrl = $el.find('.search_img_nu img, img').attr('src') || '';
        const desc = $el.find('.search_body_nu').text().trim();

        if (title) {
          results.push({
            title,
            author,
            coverUrl,
            description: desc,
            sourceList: `Feed [${type.toUpperCase()}: ${tagName}] via NovelUpdates`,
            tags: [type, tagName.toLowerCase().replace(/\s+/g, '-'), 'web-novel', 'wishlist']
          });
        }
      });

      return results;
    } catch (_) {
      return [];
    }
  }
}

module.exports = TagTracker;
