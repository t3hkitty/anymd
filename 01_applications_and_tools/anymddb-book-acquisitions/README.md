# AnyMDDB Book Curator, Subscriptions & Multi-Source Acquisition Plugin

> Ingest curated book feeds, subscribe to **Authors**, **Genres**, **Moods**, and **Tags** across NovelUpdates, Amazon, Open Library/Hardcover, and resolve acquisitions across digital repositories (Gutenberg, Open Library, Anna's Archive, OverDrive).

---

## 🎯 Architecture Overview

```
[Curated Feeds & Subscriptions] (Authors, Tags, Moods, Genres)
         │
         ▼
[Multi-Source Feed Scanner] (NovelUpdates, Open Library/Hardcover, Amazon, Royal Road)
         │
         ▼
[Deduplication Engine] (Checks against existing Library & Wishlist)
         │
         ▼ Writes `library/wishlist/Author - Title.md`
[AnyMDDB Markdown Placeholders] (YAML frontmatter with tags, mood, source metadata)
         │
         ▼
[Unified Acquisition Resolver]
         ├─► Project Gutenberg (1-Click Public Domain EPUB Download)
         ├─► Open Library / Internet Archive (Lending & Catalog Inspection)
         ├─► Anna's Archive (Targeted Search Queries & Mirror Formats)
         └─► OverDrive / Libby (Public Library Digital Card Lookup)
         │
         ▼
[Auto-Transition from `status: wishlist` to `status: acquired`]
```

---

## 📂 AnyMDDB Subscriptions & Placeholders Schema

### 1. Tag / Mood / Genre Subscription (`library/subscriptions/genre_progression_fantasy.md`)
```yaml
---
name: "Progression Fantasy"
type: "genre"
subscribed: true
sources:
  - openlibrary
  - novelupdates
  - kindle
subscribed_at: "2026-08-22T20:38:00.000Z"
last_checked: "2026-08-22T20:38:00.000Z"
min_rating: 3.8
auto_wishlist: true
tags:
  - genre
  - progression-fantasy
  - subscription-feed
---
```

### 2. Author Subscription (`library/authors/Matt_Dinniman.md`)
```yaml
---
name: "Matt Dinniman"
subscribed: true
subscribed_at: "2026-08-22T20:33:00.000Z"
last_checked: "2026-08-22T20:38:00.000Z"
openlibrary_key: "OL7528345A"
known_works_count: 12
tags:
  - author-tracker
  - subscribed
---
```

---

## 🚀 Quick Start

```bash
# 1. Navigate to directory and install dependencies
cd anymddb-book-acquisitions
npm install

# 2. Start the local server
npm start
```
Open **`http://localhost:3789`** in your browser.

---

## ⚙️ REST API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/feeds/sevenseas` | `GET` | Fetches Seven Seas new releases and upcoming light novels |
| `/api/feeds/nyt` | `GET` | Fetches NYT Best Seller charts (Fiction / Nonfiction) |
| `/api/feeds/kindle` | `GET` | Fetches top Kindle charts across LitRPG, Fantasy, and Sci-Fi |
| `/api/authors` | `GET` | Lists all tracked author profiles |
| `/api/authors/subscribe` | `POST` | Subscribes to an author and creates `library/authors/Author.md` |
| `/api/authors/check-all` | `POST` | Scans all followed authors for new/missing works |
| `/api/subscriptions` | `GET` | Lists all Tag, Genre, and Mood subscriptions |
| `/api/subscriptions/save` | `POST` | Saves a new Tag/Mood/Genre subscription |
| `/api/subscriptions/scan-all` | `POST` | Executes a multi-source sweep across all subscribed tags |
| `/api/wishlist` | `GET` | Lists all active Markdown placeholders |
| `/api/acquisition/resolve` | `POST` | Resolves acquisition channels across Gutenberg, Open Library, Anna's Archive, and OverDrive |
| `/api/acquisition/download-gutenberg` | `POST` | 1-Click download of public domain EPUB into `library/downloads/` |

---

## 📄 License
MIT
