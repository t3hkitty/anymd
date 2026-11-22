# 🐾 CUT_MANIFEST_KOODO.md — Koodo Reader Host Precision Cuts

## 1. Upstream Citation & Licensing
- **Upstream Project:** [koodo-reader/koodo-reader](https://github.com/koodo-reader/koodo-reader)
- **License:** AGPL-3.0 (retained in host UI chassis files)
- **Target Form:** High-density, plump, slim-chrome reader chassis (`kittlibr_host`).

---

## 2. Severed Bloat & Proprietary Integrations

1. **Stock Bundled Plugins:**
   - ✂️ Severed default dictionaries and translation scripts (Google Translate, Bing, DeepL stubs).
   - ✂️ Severed proprietary cloud TTS voices.
   - 🛡️ Retained: JSON/SHA-256 extension registry harness (`kittlibr-ext.ts`).

2. **Proprietary Third-Party Sync & Storage Lock-In:**
   - ✂️ Severed stock sync adapters: OneDrive, MEGA, Dropbox, Yandex Disk, Baidu Wangpan, Aliyun Drive.
   - ✂️ Severed notes export adapters: Readwise, Notion, Obsidian, Anki, Eudic.
   - ✂️ Severed closed browser-only `IndexedDB` requirement.
   - 🛡️ Retained: `ILibraryStorageAdapter` bound to flat-file `.md` (YAML frontmatter) + `object_db.json`.

3. **Shell Layout Reduction:**
   - ✂️ Stripped multi-row promo banners, account sync popups, and redundant toolbars.
   - 🛡️ Refactored: One slim top bar, slide-out navigation drawer, and maximized viewport.
