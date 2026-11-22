# Cut Manifest: AnyMD & Zettlr FOSS Integration

## License Notice & Attribution
- **Project:** AnyMD / AnyMDDB Sovereign Markdown & Zettelkasten Workspace
- **Upstream Source Integration:** Zettlr (GPL-3.0 License)
- **Attribution:** Parts of the markdown parsing, frontmatter extraction, and Zettelkasten link resolution patterns are adapted from the open-source Zettlr repository under the terms of the GNU General Public License v3.0 (GPL-3.0).

---

## 1. Extracted from Zettlr
- **Markdown & Frontmatter AST Parser:** Extracts YAML frontmatter blocks (`title`, `tags`, `created_pt`, `vault_area`, `status`) and parses headers without altering the underlying plain text files.
- **Zettelkasten Link Resolver:** Resolves `[[WikiLinks]]` and note identifiers (`YYYYMMDD-HHMM`) to build bi-directional reference graphs and backlink indexes.
- **Export Bridges:** Pandoc-compatible markdown formatting and HTML/EPUB export structuring helpers.

## 2. Stripped / Severed from Zettlr
- **Electron / Desktop Bloat:** Removed heavy desktop GUI frameworks, CodeMirror monolithic bindings, and opaque sqlite caching layers that obscure the raw `.md` files.
- **Proprietary Metadata Stores:** Stripped any background indexing that stores metadata outside `.md` frontmatter or flat-file JSON sidecars.

## 3. Storage & Sync Architecture (Non-FUSE `rclone`)
- **Primary Source of Truth:** Local flat-file Markdown (`.md`) + YAML frontmatter.
- **Cold Storage / Archive Offload:** Uses non-FUSE `rclone` (`rclone copyto`, `rclone rcd`, `rclone sync`) to stage backups and archive cold vaults to remote cloud storage (WebDAV, S3, Google Drive, OneDrive) without sluggish OS FUSE mount overhead or database locking.
