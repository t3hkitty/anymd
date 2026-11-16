# (=^･ω･^=) AnyMD / Kittlibr: Words Are Magic Edition

```text
  /\_/\  
 ( ='.'= ) KITTLIBR: WORDS ARE MAGIC EDITION
 (")_(")  Pure Markdown Architecture • FOSS Archival Preservation • Kawaiianism v3.1
 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾 🐾
```

> *The decentralized metadata resolution, indexing, and vault pipeline for curated e-book libraries and open archival contribution.*

---

## 🌸 About This Project & Relationship to Full Edition
**Kittlibr (Words Are Magic Edition)** is a community-oriented, stripped-down public release of a larger personal reading, writing, and cognitive indexing system. Its primary mission is to **promote reading and writing**, lower barriers to personal library management, and facilitate open archival indexing.

> [!NOTE]
> 🐾 **Replication & Scaling Up to Full Edition:**
> This repository contains the complete lite contribution architecture. By pairing **Google Antigravity (AGV)** with this repository and the master prompt instructions below, you can expand this lite edition back up toward the full personalized edition (complete with advanced webnovel continuous MTL translation, local Tasker webhooks, and automated multi-vault WebDAV replication).

---

## 🤖 AI Token Contribution Statement
**This dataset, metadata structure, and associated tooling were generated, refined, and organized utilizing AI assistant tokens as a personal contribution to the world's most complete directory of written artifacts.** 

Every structured schema, parsing script, and mapping index represents an effort to bring clarity, discoverability, and accessibility to open-source archival preservation under FOSS/MIT licensing guidelines.

---

## 🐾 Release Artifacts & Downloads (EXE & APK)

Pre-built binaries are generated via the integrated GitHub Actions CI/CD pipeline and local build scripts:

| Platform | Target Artifact | Build Script / Source | Release Artifact Location |
| --- | --- | --- | --- |
| **Windows 64-bit EXE** | `OpenlibExtended.exe` | `build_exe.py` (PyInstaller) | [GitHub Actions Artifacts](https://github.com/t3hkitty/anymd/actions) |
| **Android APK** | `kittlibr_v1.0.11_release.apk` | Gradle Native (`assembleRelease`) | [GitHub Actions Artifacts](https://github.com/t3hkitty/anymd/actions) / GDrive |

---

## 🛠️ Build Instructions

### 1. Building Windows Executable (`OpenlibExtended.exe`)
Prerequisites: Python 3.11+, PyInstaller

```powershell
# Install PyInstaller
pip install pyinstaller

# Run standalone compiler
python build_exe.py
# Outputs: dist/OpenlibExtended.exe
```

### 2. Building Native Android APK (`kittlibr_v*.apk`)
Prerequisites: JDK 17, Android SDK (API 34)

```bash
# Set execute permissions
chmod +x gradlew

# Assemble Release APK (outputs to app/build/outputs/apk/release/)
./gradlew assembleRelease

# Optional: Run automated Google Drive sync task
./gradlew copyApkToDrive
```

### 3. Automated GitHub Actions Workflow
Every push to `main` triggers `.github/workflows/release_builds.yml` which automatically compiles both the Windows one-file executable and the release APK, publishing them directly as downloadable workflow run artifacts.

---

## 🐾 Full-Edition AGV Replication Prompt

Use the following prompt in **Google Antigravity (AGV)** to bootstrap and expand this repository into the full multi-engine edition:

```markdown
# Antigravity (AGV) Master Workspace Directive: Kittlibr Words Are Magic Full Edition

## 1. Unified SQLite Master Architecture (Z:\kittlib\metadata.db)
Hydrate and link all 9 master tables:
* books: stem, title, author, extension, primary_tag, major_category (Fiction/Non-Fiction), pristine_status (pristine/broken/ai_identified/index_only), description, cover_path, md_path.
* rss_feeds & rss_entries: Offline-first stream caching.
* custom_lists: Custom curation groupings and stems.
* acquisition_queue: Web serials, NovelUpdates, FanFicFare queue.
* reading_lists: TBR, In Progress, Read, DNF progress tracking.
* taste_profile: Google Play Books Thumbs Up super-liked scoring.
* master_zettelkasten_index: Pacific Time anchors (YYYYMMDD-HHMM) with FIFO serials.
* torrent_file_mapping: TorBox / torrent dump indexing.
* directory_profiles: Heuristic author/genre classifier.

## 2. Reading Engine & Contrast Themes
* Dynamic RGB extraction with WCAG-compliant contrast modes (Solar Sunlight #FFF8DC/#281E0A, Night, High Contrast).

## 3. Automation & Sidecar Watchers
* Calibre CLI sync hooks, YAML frontmatter sidecar generator, and universal seedbox watcher.
```

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

## 🐾 Cat Paw Sign-off & Community Guarantee
Every line of code and schema is permissive, FOSS/MIT licensed, and intended to keep words, stories, and wisdom decentralized and accessible.

```text
       _                        
       \`*-.                    
        )  _`-.                 
       .  : `. .                
       : _   '  \               
       ; *` _.   `*-._          
       `-.-'          `-.       
         ;       `       `.     
         :.       .        \    
         . \  .   :   .-'   .   
         '  `+.;  ;  '      :   
         :  '  |    ;       ;-. 
         ; '   : :`-:     _.`* ;
      .*' /  .*' ; .*`- +'  `*' 
      `*-*   `*-*  `*-*'        
   🐾 🐾 🐾 WORDS ARE MAGIC 🐾 🐾 🐾
```

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
