# (=^･ω･^=) AnyMD / Kittlibr: Words Are Magic Edition

```text
  /\_/\  
 ( ='.'= ) KITTLIBR: WORDS ARE MAGIC EDITION
 (")_(")  Pure Markdown Architecture • FOSS Archival Preservation • Kawaiianism v3.1
```

> *The decentralized metadata resolution, indexing, and vault pipeline for curated e-book libraries and open archival contribution.*

## 🐾 Overview & About This Project
**Kittlibr (Words Are Magic Edition)** combines automated SQLite tracking, Stale-While-Revalidate caching, universal seedbox profiling, and Calibre CLI integration to turn scrambled archival torrent dumps and remote network shares into pristine, searchable libraries.

- **Platform:** `TypeScript / Python / Jetpack Compose / Flutter`
- **Aesthetic:** KawaiiNeko Kawaiian Minimalist
- **License:** FOSS / MIT

---

## 🤖 AI Token Contribution Statement
**This dataset, metadata structure, and associated tooling were generated, refined, and organized utilizing AI assistant tokens as a personal contribution to the world's most complete directory of written artifacts.** 

Every structured schema, parsing script, and mapping index represents an effort to bring clarity, discoverability, and accessibility to open-source archival preservation under FOSS/MIT licensing guidelines.

---

## 🛠️ Core Modules & Features
- **Universal Directory Profiler**: Scans remote seedboxes or local mounts (`universal_directory_profiler.py`) to cluster authors and genres on demand.
- **Acquisition & Reading Queues**: Manages web serial ingest links, FanFicFare scraping targets, and shelf states (`TBR`, `In-Progress`, `Read`, `DNF`).
- **Taste Profile Training**: Ingests Google Play Books "Thumbs Up" super-liked lists to prioritize future recommendations.
- **Zettelkasten Temporal Indexing**: Timestamps all notes and literary sidecars with Pacific Time anchors (`YYYYMMDD-HHMM`).
- **SQLite Mapping & Contribution Dumps**: Generates lightweight, queryable manifests linking file hashes, extracted metadata, and confidence scores.
- **Selective Vault Filtering**: Automatically separates personal reading whitelist genres (LitRPG, Danmei, Romance, Sci-Fi/Fantasy) from archival contribution indexes to preserve storage.
- **Calibre CLI & Sidecar Integration**: Automatically builds YAML frontmatter sidecars and maintains pristine EPUB structures.

---

## ⚖️ FOSS Compliance & Feature Integration Roadmap

Keeping the fork strictly FOSS-compliant while integrating the full suite of automation, indexing, and vault management features ensures clean distribution and easy contribution back to the archival community.

### Core Module Integration Checklist

| Module | Purpose | Storage & Binding |
| --- | --- | --- |
| **Unified SQLite DB** | Centralizes records, streams, and queues | `Z:\kittlib\metadata.db` |
| **Universal Seedbox Profiler** | Scans any remote mount/folder to cluster authors & genres | `directory_profiles` table |
| **Acquisition & Reading Queues** | Managed input targets (`+ Add URL`) and shelves (`TBR`, `In-Progress`, etc.) | `acquisition_queue`, `reading_lists` |
| **Taste Profile & Thumbs Up** | Trains recommendation weights via Super-Liked entries | `taste_profile` table |
| **Zettelkasten Serializer** | Timestamps written stories/articles with Pacific Time anchors | `master_zettelkasten_index` + `S:\md\` |
| **AI Contribution README** | Documents AI token assistance as a gift to the open archive | Root `README.md` |

---

## 🏛️ Master Architecture & SQLite Vault (`Z:\kittlib\metadata.db`)

### Unified Table Definitions

```sql
-- 1. Vault Catalog & Books
CREATE TABLE IF NOT EXISTS books (
    stem TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    extension TEXT,
    primary_tag TEXT,
    major_category TEXT CHECK(major_category IN ('Fiction', 'Non-Fiction')) DEFAULT 'Fiction',
    pristine_status TEXT CHECK(pristine_status IN ('pristine', 'broken', 'ai_identified', 'index_only')) DEFAULT 'pristine',
    description TEXT,
    cover_path TEXT,
    md_path TEXT
);

-- 2. Offline-First Stream & RSS Cache
CREATE TABLE IF NOT EXISTS rss_feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_url TEXT UNIQUE NOT NULL,
    title TEXT,
    site_url TEXT,
    category TEXT,
    last_fetched TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rss_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER,
    entry_id TEXT UNIQUE,
    title TEXT,
    link TEXT,
    author TEXT,
    content TEXT,
    published_date TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(feed_id) REFERENCES rss_feeds(id) ON DELETE CASCADE
);

-- 3. Custom Curation Lists
CREATE TABLE IF NOT EXISTS custom_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_name TEXT NOT NULL,
    stem TEXT NOT NULL,
    curation_notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(stem) REFERENCES books(stem) ON DELETE CASCADE
);

-- 4. Acquisition Queue (Raw links, NovelUpdates, FanFicFare)
CREATE TABLE IF NOT EXISTS acquisition_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_url TEXT UNIQUE NOT NULL,
    source_type TEXT CHECK(source_type IN ('novelupdates', 'fanficfare', 'direct_url', 'rss', 'manual')) DEFAULT 'manual',
    status TEXT CHECK(status IN ('pending', 'downloading', 'completed', 'failed')) DEFAULT 'pending',
    notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reading Status & Progress Lists
CREATE TABLE IF NOT EXISTS reading_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stem TEXT NOT NULL,
    status TEXT CHECK(status IN ('tbr', 'in_progress', 'read', 'dnf')) DEFAULT 'tbr',
    progress_percentage REAL DEFAULT 0.0,
    current_chapter TEXT,
    last_read_date TIMESTAMP,
    FOREIGN KEY(stem) REFERENCES books(stem) ON DELETE CASCADE
);

-- 6. Taste Profile Preferences (Super-liked & Thumbs Up)
CREATE TABLE IF NOT EXISTS taste_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stem TEXT,
    title TEXT,
    author TEXT,
    source_platform TEXT DEFAULT 'google_play_books',
    rating_type TEXT CHECK(rating_type IN ('thumbs_up', 'super_liked', 'favorite')) DEFAULT 'thumbs_up',
    genre_tags TEXT,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(stem) REFERENCES books(stem) ON DELETE SET NULL
);

-- 7. Master Zettelkasten Temporal Index
CREATE TABLE IF NOT EXISTS master_zettelkasten_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zettel_id TEXT UNIQUE NOT NULL,
    temporal_anchor TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    file_path TEXT,
    yaml_sidecar_path TEXT,
    content_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Torrent File Mapping & Contribution Engine
CREATE TABLE IF NOT EXISTS torrent_file_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    torrent_hash TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    extracted_title TEXT,
    extracted_author TEXT,
    confidence_score REAL,
    matched_genre TEXT,
    status TEXT DEFAULT 'indexed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Directory Profiler & Heuristic Classifier
CREATE TABLE IF NOT EXISTS directory_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT UNIQUE NOT NULL,
    filename TEXT,
    inferred_author TEXT,
    inferred_title TEXT,
    detected_genre TEXT,
    file_size_mb REAL,
    status TEXT DEFAULT 'unprocessed'
);
```

---

## 🛠️ Build & CI/CD Pipelines

- **Windows Executable**: PyInstaller compilation via `build_exe.py` targeting `OpenlibExtended.exe`.
- **Android APK**: Native Gradle pipeline exporting `${applicationId}_v${versionName}_${buildType}.apk` to Google Drive `G:\My Drive\myapks`.
- **CI/CD**: GitHub Actions workflow `.github/workflows/release_builds.yml` automating cross-platform build artifacts.

---
*Maintained with Antigravity AI Pair Programmer & Kawaiian KawaiiNekoty 🌸*
