# Changelog
All notable changes to the anyMD and KVMeowboard local-first suites are documented here.

## [v8.0.0-KAWAII] - 2026-08-31
### Added
- **Native Chunker Engine (`AnymdDbEngine.kt`):** Zero-copy byte-offset AST slicing for local Markdown directories.
- **Ktor Foreground Server (`LocalWebhookService.kt`):** Unkillable netty listener running on Port 3050 with Shizuku process locks.
- **BLE KVM Input Method (`KVMeowIME.kt`):** Android `InputMethodService` utilizing physical `BluetoothHidDevice` API.
- **Hierarchical Datastore (`StickyOmniDataStore.kt`):** Hierarchical overrides: System Default -> App Default -> Vault Pin.
- **Anti-Slop Directives:** Permanently banned WebViews, HTML wrappers, and fake python stubs.
