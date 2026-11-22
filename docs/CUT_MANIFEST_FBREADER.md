# 🐾 CUT_MANIFEST_FBREADER.md — FBReader Pattern Harvest & Source Retirement

## 1. Upstream Citation & Licensing
- **Upstream Project:** [geometer/FBReader](https://github.com/geometer/FBReader)
- **License:** GPL-2.0+
- **Harvest Scope:** Stability & edge-case resiliency algorithms ported into standalone, clean-room TypeScript utilities in `src/utils/hardening/`.
- **Retirement Decision:** FBReader's legacy C++ / Java UI and database stack are completely retired. We do NOT retain any hybrid shell or runtime dependencies.

---

## 2. Harvested Stability Patterns (`src/utils/hardening/`)

| Pattern | Upstream Origin (FBReader) | Kittlibr Implementation | Purpose |
| :--- | :--- | :--- | :--- |
| **Malformed/Legacy Encoding Sniffer** | `zlibrary/core/src/util/ZLUnicodeUtil.cpp` & `ZLEncodingConverter.cpp` | `src/utils/hardening/EncodingFallbackSniffer.ts` | Detects BOM / UTF-8 / UTF-16 / Windows-1252 / Shift-JIS / GBK / Big5 to eliminate mojibake in raw TXT, legacy FB2, and web novel scrapes |
| **Defensive Archive Unpacker** | `zlibrary/core/src/filesystem/zip/` & `tar/` | `src/utils/hardening/DefensiveArchiveUnpacker.ts` | Handles `.fb2.zip`, nested multi-file archives, corrupt central-directory recovery, and Zip-Slip traversal protection |
| **Structural Location Anchors** | `fbreader/common/ZLTextPosition.h` | `src/utils/hardening/StructuralLocationAnchor.ts` | Provides paragraph/word/character offset fallback anchors so bookmark position survives viewport resizes and font reflows |

---

## 3. Retired FBReader Source Trees (Excluded from Build)

- ❌ `zlibrary/ui/`: All GTK, Qt, Maemo, Android, and Win32 widgets and layout code.
- ❌ `fbreader/src/formats/`: Legacy C++ parsers replaced by `kookit.min.js` and modern web standards.
- ❌ `fbreader/src/network/`: Legacy OPDS/catalog client retired in favor of `librmanage` + `librget` sidecar APIs.
- ❌ `fbreader/src/bookmodel/`: Proprietary book model trees and SQLite schemas replaced by flat-file YAML frontmatter + `object_db.json`.
- ❌ Native binaries, toolbars, and legacy Makefiles (`makefiles/`, `icons/`, `fbreader/opensimpad*`).
