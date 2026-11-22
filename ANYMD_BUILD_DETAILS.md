# AnyMD Universal Build & Architecture Specification

## 1. Executive Summary
**AnyMD** is a high-throughput, SQL-free database replacement designed to run locally and remain exceptionally fast over cloud and remote storage (`Koofr`, `FileJump`, `Google Drive`, `TorBox`, `rclone`).
- **Source of Truth:** Markdown (`.md`) + YAML frontmatter act directly as database records and typed fields. Every file and metadata record remains 100% human-readable and editable in any standard Markdown editor or text viewer.
- **Cross-Platform Python 3.11+ Engine & Daemon:** Runs identically on Windows 11, Android Termux, and Linux via a lightweight FastAPI loopback daemon (`127.0.0.1:3050`).
- **Zero FUSE Dependency:** Never relies on OS FUSE mounts for bulk directory scans or metadata writes. All cloud operations are routed through non-FUSE `rclone rcd` (`127.0.0.1:5572`).

---

## 2. Core Python Components & Architecture

### A. High-Performance Sidecar Engine (`src/core/sidecar_engine.py`)
- **`os.scandir`**: Optimized directory traversal and file inspection.
- **C-Backed PyYAML (`CSafeLoader` / `CSafeDumper`)**: Ultra-fast YAML parsing and serialization.
- **`xxhash`**: Non-cryptographic fast file fingerprinting for instant drift and change detection.
- **Atomic Writes (`os.replace`)**: Temp-file generation and atomic replacement to prevent cloud sync corruption and disk wear.
- **Dual Placement Modes**: Supports both Side-by-Side (`<file>.ext.md`) and Hidden `.anymd/` Subfolder placement.

### B. Rclone RCD Loopback Integration (`src/core/rclone_daemon_client.py`)
- Connects natively to local `rclone rcd` (`127.0.0.1:5572`) JSON-RPC loops for cloud remote listing, diffing, and syncing (`operations/list`).

### C. FastAPI Loopback Daemon (`src/daemon/anymd_daemon.py`)
- **Host / Port:** `127.0.0.1:3050`
- **Endpoints:**
  - `GET /` — Health check & version information.
  - `GET /scan` — High-performance vault directory scan using `os.scandir` and `xxhash`.
  - `GET /rclone/status` — Checks connection to local `rclone rcd` daemon (`127.0.0.1:5572`).
  - `POST /sidecar/write` — Atomic write of sidecar YAML/Markdown metadata.

---

## 3. Upstream FOSS Slicing & License Isolation
- **`anymd-cloud-driver` (from `rclone` - MIT):** Non-FUSE `rclone rcd` (`127.0.0.1:5572`) and fast remote listing.
- **`anymd-md-parser` (from `Zettlr` - GPL-3.0 isolated):** YAML frontmatter parsing and Markdown AST/link extraction helpers, strictly isolated with GPL-3.0 attribution notices (`CUT_MANIFEST_ANYMD_ZETTLR.md`).

---

## 4. Query Translators & Extension Lifecycle (`src/translators/`)
- **`query_translator.ts` / `query_translator.py`**: SQL-subset and Calibre-style boolean expression query engine (`tags:"=LitRPG" and status="active"`) with `object_db.json` projection views.
- **`extension_hook_registry.ts`** & **`anymd-ext.json`**: Pluggable extension lifecycle hook registry (`onFileDiscovered`, `onSidecarWrite`, `onShardCompact`, `onQueryTranslate`, `onCloudSync`) for connecting external tools like `librmanage`, `plugin-vault-roomba`, and `plugin-n8n-bridge`.

---

## 5. Deployment & Dependencies
- **Requirements (`requirements.txt`):**
  - `fastapi>=0.110.0`
  - `uvicorn>=0.28.0`
  - `PyYAML>=6.0.1`
  - `xxhash>=3.4.1`
  - `pydantic>=2.6.0`
  - `requests>=2.31.0`
