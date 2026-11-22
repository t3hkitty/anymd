# 🐾 CUT_MANIFEST.md — Kittlibr Host Precision Cut & Architecture Spec

## 1. Executive Summary & Licensing Decoupling
- **Upstream Project:** [koodo-reader/koodo-reader](https://github.com/koodo-reader/koodo-reader)
- **Host License:** AGPL-3.0 (retained in all derived UI host chassis files)
- **Extension & Sidecar License:** MIT / Permissive (decoupled via loopback HTTP/JSON-RPC and flat-file contracts)
- **Persistence Model:** Flat-file `.md` with YAML frontmatter + `object_db.json` / SQLite WAL sidecar (`metadata.db`). Zero FUSE drive-letter locks (`K:\`, `Z:\`, `T:\`).

---

## 2. Severed & Gutted Modules (Stock Bloat Removal)

### A. Stock Default Plugins Severed (`src/utils/plugins/`)
- **DELETED:** All bundled default translation JSON/JS dictionaries (Google Translate, Bing, Baidu, DeepL stubs).
- **DELETED:** Built-in proprietary TTS voice engines and closed API integrations.
- **RETAINED:** Lightweight plugin registry loader schema (`identifier`, `type`, `displayName`, `config`, `script`, `scriptSHA256`) and 1 minimal test stub (`stub-plugin.json`).

### B. Hardcoded Cloud & Third-Party Sync Gutted (`src/utils/storage/syncService.ts`)
- **DELETED:** Stock hardcoded sync adapters:
  - OneDrive, Dropbox, MEGA, Yandex Disk, Baidu Wangpan, Aliyun Drive, WebDAV direct lock-in.
  - Readwise, Notion, Obsidian, Anki, Eudic connectors.
  - Hardcoded commercial AI/OCR wrappers.
- **REPLACED WITH:** `ILibraryStorageAdapter` interface delegating vault I/O to local cache staging + `librsync` (Non-FUSE Rclone HTTP/JSON-RPC pipeline).

### C. Internal Storage Lock-In Severed (`src/utils/storage/databaseService.ts`)
- **DELETED:** Opaque browser `IndexedDB`-only assumption for raw file blobs and library metadata.
- **REPLACED WITH:** Pluggable flat-file metadata adapter (`FlatFileMetadataAdapter`) reading and writing Markdown `.md` YAML frontmatter atomically with `object_db.json` and sidecar index support.

---

## 3. Retained Core Chassis Components

| Component | Upstream Path | Purpose |
| :--- | :--- | :--- |
| **Viewport Engine** | `src/assets/lib/kookit.min.js` | Core EPUB, PDF, MOBI, TXT rendering, pagination, text selection, themes |
| **Plugin Harness** | `src/utils/plugins/customPlugin.ts` | Generalized into Kittlibr extension runner with SHA-256 integrity validation |
| **Reading Controls** | `src/containers/reader/` | Font sizing, margin, reading mode, dark/light themes, bookmarks, highlights |
| **Slimmed Shell** | `src/containers/header/`, `src/containers/sidebar/` | Refactored into a single slim top bar and slide-out navigation drawer |

---

## 4. The 6 Kittlibr Extension Slots (`kittlibr-ext.json`)

1. **`librmanage` (Primary View):** Faceted eLibrary catalog browser, Moon+ Reader style cards with clickable metadata chips, multi-tag Boolean drill-down (`+include` / `-exclude`), slide-out **Group By** hierarchy tree (`Authors`, `Series`, `Tags`, `Warnings`, `Smart Shelves`), and atomic YAML `More Info` modal.
2. **`librget` (Acquisition Bridge):** Hook slot for search and download queues from shadow libraries (Anna's Archive, Internet Archive, LibGen via `OpenlibExtended` / sidecar API).
3. **`librscrape` (Web Serial Ingestion):** Hook slot for chapter URL fetching and EPUB 3 assembly using `WebToEpub` / `lncrawl` backends.
4. **`librfind` (Discovery & Content Warnings):** Discovery feeds and warning badge enrichment (`does-the-dog-die`, `piss-your-pants`, trigger warnings).
5. **`libr_ai` (On-Demand Enrichment):** Standalone hook for local/remote LLM blurb generation, tag inference, and cover art (zero network calls unless user-triggered).
6. **`librsync` (Non-FUSE Rclone Pipe):** Multi-vault manager (`vaults.json`), loopback `rclone rcd` (`127.0.0.1:5572`) control plane, and C:\ cache-first sync staging.
