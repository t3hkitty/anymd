# 📝 Somatic Webhook Server Changelog (v5.0.0)

All notable changes to the Somatic Webhook Server Subsystem will be documented in this file.

## [5.0.0] - 2026-08-26

### Added
- **Native Android Webhook Server**: Integrated Ktor Netty backend inside the Android source tree to listen on port `3050`.
- **Preconfig Ingress Routers**: Supports POST routing for both standard `/webhook/:vaultName` (separate files) and append mode `/webhook/:vaultName/:folder` (Newline append files).
- **Discord-Style TOS Gating**: Added active user agreement overlay in settings, requiring users to explicitly agree to local Wi-Fi ingress risks before the server initializes.
- **In-Memory IP Limiting**: Deployed automatic 5-minute failsafe lockouts for any client IP spamming greater than 30 requests/minute to prevent loop locks.
- **Persistent LocalStorage State**: Mapped `anymd_webhook_active` and `anymd_webhook_port` key states inside local persistent memory.
