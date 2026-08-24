# Changelog

## [1.1.0] - 2026-08-22

### Added
- **Genre, Mood & Tag Subscriptions**:
  - Subscription management engine (`src/subscriptions/tag_tracker.js`) storing rules in `library/subscriptions/`.
  - Multi-source scraper monitoring NovelUpdates, Open Library/Hardcover subjects, and Kindle/Royal Road rankings.
  - Dedicated "Tags & Moods" dashboard tab with quick-add preset chips (`Progression Fantasy`, `LitRPG`, `Cozy Fantasy`, `Time Loop`, `Wholesome`, `Dark Fantasy`, `Danmei`, `Cyberpunk`).
  - Clickable tag badges on book cards to instantly follow tags and moods.
- **Author Tracking**:
  - Click-to-subscribe on any author name (`👤 Author`).
  - Open Library Author Works API scanner.

## [1.0.0] - 2026-08-22
- Initial release with NYT, Seven Seas, and Kindle feed ingestion.
- Multi-source acquisition resolver (Gutenberg, Open Library, Anna's Archive, OverDrive).
- Markdown placeholder generator for AnyMDDB.
