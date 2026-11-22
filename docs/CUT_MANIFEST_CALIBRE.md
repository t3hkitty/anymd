# 🐾 CUT_MANIFEST_CALIBRE.md — Calibre Engine Precision Cut & UI Decoupling

## 1. Upstream Citation & Licensing
- **Upstream Project:** [kovidgoyal/calibre](https://github.com/kovidgoyal/calibre)
- **License:** GPL-3.0
- **Architectural Seam:** Calibre is integrated purely as a headless Python backend / CLI conversion & metadata service (`src/extensions/librmanage/engine/`).
- **Isolation:** Decoupled from the AGPL-3.0 `koodo-reader` UI frontend across localhost HTTP/JSON-RPC (`127.0.0.1:5820`). Preserves upstream license headers in all submodules.

---

## 2. Harvested Engine Modules (`src/extensions/librmanage/engine/`)

| Engine Component | Upstream Calibre Source | Kittlibr Target | Responsibility |
| :--- | :--- | :--- | :--- |
| **Metadata Extraction & Sync** | `calibre.ebooks.metadata.meta` | `metadata_bridge.py` | Reads/writes embedded EPUB/MOBI/AZW3/FB2/PDF metadata, covers, series, and tags; syncs atomically with sister `.md` YAML frontmatter |
| **Format Normalization** | `calibre.ebooks.conversion` / `ebook-convert` | `convert_worker.py` | Converts incoming formats (`FB2`, `MOBI`, `AZW3`, `DOCX`, `RTF`) into clean **EPUB 3** and Markdown staged in local `C:\` cache |
| **Query Engine** | `calibre.utils.search_query_parser` | `query_engine.py` | Parses complex boolean expressions (`tags:"=LitRPG" and not tags:"=slow-burn"`, custom `#warnings`, `#fandom`, `#zettelkasten_id`) |
| **Sub-Plugin Registry** | `calibre.customize` | `plugin_registry.py` | Provides metadata reader/writer/transform lifecycle hooks for `librget`, `librscrape`, `librfind`, and `libr_ai` |

---

## 3. Retired Calibre Subsystems (Severed from Kittlibr)

- ❌ `src/calibre/gui2/`: Complete exclusion of Calibre's Qt desktop GUI and dialogs.
- ❌ **Folder Hierarchy Lock-In:** Strictly banned Calibre's `Author/Title (ID)/` filesystem restructuring. Flat-file Markdown (`.md` with YAML frontmatter) + `object_db.json` / `metadata.db` sidecars remain the single source of truth.
- ❌ `src/calibre/devices/`: Hardware e-reader USB sync loops retired (handled via non-FUSE Rclone sync to devices/remotes).
- ❌ `src/calibre/srv/`: Legacy Calibre web content server severed. Replaced by Kittlibr's high-density React/TypeScript chassis.
