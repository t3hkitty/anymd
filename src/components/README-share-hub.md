# 📤 AnyMD Sovereign Share Hub Plugin

A 100% self-hosted, local-first React plugin designed to facilitate outbound sharing and active brainstorming logs from your local AnyMD workspace directly to third-party clients (mobile SMS, WhatsApp, Discord, or AI agents like Gemini and NotebookLM) [cite: 345, 423].

## Features
- **⎙ Native Web Share Interceptor:** Integrates with `navigator.share()` to trigger your native phone/tablet system share drawer on iOS and Android with zero cloud dependencies [cite: 345].
- **✨ Gemini Web Deep Linker:** Dynamically formats and compiles your note body, YAML header, and category tags, launching them directly into the Gemini prompt editor with pre-staged instructions [cite: 205].
- **📓 NotebookLM Source Ingest:** Places note content inside local browser cache to enable immediate, automated ingestion scripts when navigating to NotebookLM as a pasted text source [cite: 205].
- **💾 Sticky Settings:** Explicit caching keys inside `localStorage` preserve default dispatch preferences, auto-clipboard copies, and formatting preferences across page refreshes [cite: 2].

## Usage & Shortcuts
- Type note or brainstorm in AnyMD dashboard.
- Tap the **📤 Share** icon on the note toolbar.
- Press `Esc` to instantly dismiss FAQ/Release logs.
- Run `python3 scripts/deploy_share_hub.py` to compile and transfer updates to the live node [cite: 340].
