# AnyMD Instruction Sheet & Master Architectural Blueprint

## 1. Executive Summary & Purpose
**AnyMD** is a high-throughput, SQL-free database replacement designed to run locally and remain exceptionally fast over cloud and remote storage (`Koofr`, `FileJump`, `Google Drive`, `TorBox`, `rclone`).
- **Core Premise:** Markdown (`.md`) + YAML frontmatter act directly as database records and typed fields. Every file and metadata record remains 100% human-readable and editable in any standard Markdown editor or text viewer—no binary database lock-in.
- **Cross-Platform Engine:** Implemented as a Python 3.11+ engine and local FastAPI loopback daemon (`127.0.0.1:3050`), running identically on Windows 11, Android Termux, and Linux.
- **Zero FUSE Dependency:** Never relies on OS FUSE mounts for bulk directory scans or metadata writes. All cloud operations route through non-FUSE `rclone rcd` (`127.0.0.1:5572`).

---

## 2. Storage & Sharded Sidecar Schema
1. **Dual Placement Sidecar Modes:**
   - *Side-by-Side Mode:* `<file>.ext` sits next to `<file>.ext.md`.
   - *Hidden `.anymd/` Subfolder Mode:* Sidecars live inside `<dir>/.anymd/<file>.ext.md` to keep raw media/book folders clean while preserving 1:1 path mapping.
   - *Atomic Delta Writes:* Uses temp-file -> verify -> atomic rename (`os.replace`) to prevent cloud sync conflicts.
2. **Sharded Directory Index Rollups:**
   - Sharded index sidecars (`.anymd/index_0001.yaml`, `.anymd/index_0002.yaml`) per configurable batch size ($N = 250$ or $500$ files) plus root `.anymd/manifest.yaml`.
   - Stores compact projections (`id`, `rel_path`, `size`, `mtime`, `xxhash`, `tags`, `series`, `links`) and shard checksums so AnyMD only re-reads or re-uploads changed shards.
3. **Cross-Referencing & Relationship Graph:**
   - Deterministic Pacific Time Zettelkasten serial IDs (`YYYYMMDD-HHMM`), `[[wikilinks]]`, and typed YAML link fields (`parent_id`, `related_ids`, `alias_of`, `collection`).

---

## 3. Python 3.11+ Loopback Daemon & Primitives
- **FastAPI Daemon (`src/daemon/anymd_daemon.py`):** Runs on `127.0.0.1:3050`. Exposes REST endpoints (`/`, `/scan`, `/rclone/status`, `/sidecar/write`).
- **High-Performance Primitives (`src/core/sidecar_engine.py`):**
  - `os.scandir` for fast directory traversal.
  - C-backed PyYAML (`CSafeLoader`/`CSafeDumper`) for ultra-fast YAML parsing.
  - `xxhash` for non-cryptographic fast file fingerprinting.
  - Atomic writes (`os.replace`).
- **Rclone Integration (`src/core/rclone_daemon_client.py`):** Connects to local `rclone rcd` (`127.0.0.1:5572`) JSON-RPC loops for remote listing and syncing.

---

## 4. Translators & Extension Lifecycle (`src/translators/`)
- **Query Translator (`query_translator.ts` / `query_translator.py`):** Accepts SQL-like `SELECT / WHERE / ORDER BY` or Calibre-style boolean expressions (`tags:"=LitRPG" and status="active"`).
- **SQLite / JSON Projection:** Projections into ephemeral in-memory SQLite tables or `object_db.json`.
- **Extension Hook Registry (`extension_hook_registry.ts` & `anymd-ext.json`):** Pluggable lifecycle hooks (`onFileDiscovered`, `onSidecarWrite`, `onShardCompact`, `onQueryTranslate`, `onCloudSync`) for plugins like `librmanage`, `plugin-vault-roomba`, `plugin-ocr-transcriber`, and `plugin-n8n-bridge`.

---

## 5. Upstream FOSS Slicing & License Isolation
- **`anymd-cloud-driver` (from `rclone` - MIT):** Non-FUSE `rclone rcd` integration.
- **`anymd-md-parser` (from `Zettlr` - GPL-3.0 isolated):** YAML frontmatter parsing and Markdown AST extraction helpers, strictly isolated with GPL-3.0 attribution notices (`CUT_MANIFEST_ANYMD_ZETTLR.md`).

---

## 6. Guide for Future Updates & Maintenance
When requesting future updates or extensions for AnyMD:
1. **Preserve the Flat-File Premise:** Never introduce proprietary binary databases; all records must remain human-editable Markdown + YAML.
2. **Maintain Zero FUSE Rule:** Use `rclone rcd` or direct HTTP/RPC calls for cloud synchronization.
3. **Respect Module Isolation:** Keep core storage, translation, and plugin extensions modular in `src/core/`, `src/daemon/`, and `src/translators/`.
