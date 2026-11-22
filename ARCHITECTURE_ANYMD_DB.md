# Architecture Specification: AnyMD Flat-File Markdown/YAML SQL Replacement & Cloud-Efficient Indexer

## 0. Core Architectural Premise
`AnyMD` is a high-throughput, SQL-free database replacement designed to run locally and remain exceptionally fast over cloud and remote storage (`Koofr`, `FileJump`, `Google Drive`, `TorBox`). 
- **Source of Truth:** Markdown (`.md`) + YAML frontmatter act directly as database records and typed fields. Every file and metadata record remains 100% human-readable and editable in any standard Markdown editor or text viewer.
- **Zero FUSE Dependency:** Never rely on OS FUSE mounts for bulk directory scans or metadata writes. All cloud operations are routed through non-FUSE `rclone` (`rclone rcd` JSON-RPC loopback HTTP / `rclone lsf` / `rclone copyto` / `rclone bisync`).

---

## 1. Storage & Sharded Sidecar Schema

### A. Per-File YAML/Markdown Sidecars (Dual Placement Mode)
- **Side-by-Side Mode:** `<file>.ext` sits next to `<file>.ext.md` in the same directory.
- **Hidden `.anymd/` Subfolder Mode:** Sidecars live inside `<dir>/.anymd/<file>.ext.md` so raw media/book folders stay visually clean while preserving 1:1 path mapping.
- **Atomic Delta Writes:** All sidecar mutations use temp-file -> verify -> atomic rename (`os.replace` / atomic write) to prevent cloud sync conflicts.

### B. Sharded Directory Index Rollups (For Enormous File Counts)
- Bucketized/sharded index sidecars per configurable batch size ($N = 250$ or $500$ files per shard: `.anymd/index_0001.yaml`, `.anymd/index_0002.yaml`) plus a lightweight root `.anymd/manifest.yaml`.
- Each shard stores compact, queryable field projections (`id`, `rel_path`, `size`, `mtime`, `hash`, `tags`, `series`, `links`) and a shard checksum so `AnyMD` only re-reads or re-uploads changed shards.

### C. Robust Cross-Referencing & Relationship Graph
- Deterministic Pacific Time Zettelkasten serial IDs (`YYYYMMDD-HHMM` / `1113202613240100234-00200400001`), `[[wikilinks]]`, and typed YAML link fields (`parent_id`, `related_ids`, `alias_of`, `collection`).
- Fast rebuildable reverse-link index inside `.anymd/backlinks_XXXX.yaml` shards.

---

## 2. Upstream FOSS Slicing
- **`anymd-cloud-driver` (from `rclone`):** Non-FUSE `rclone rcd` (`127.0.0.1:5572`) and fast remote listing (`operations/list`).
- **`anymd-md-parser` (from `Zettlr` - GPL-3.0 isolated):** Battle-tested YAML frontmatter parsing and Markdown AST/link extraction helpers.

---

## 3. Extension & Database-Translation Layer
- **SQL-to-AnyMD Query Translator:** Accepts standard SQL-like `SELECT / WHERE / ORDER BY` or Calibre-style boolean expressions (`tags:"=LitRPG" and not status:"=finished"`).
- **SQLite / JSON Virtual Bridge:** Projections into in-memory SQLite tables or `object_db.json`.
- **Pluggable Extension Lifecycle (`anymd-ext.json`):** Hooks for `onFileDiscovered`, `onSidecarWrite`, `onShardCompact`, `onQueryTranslate`, and `onCloudSync`.
