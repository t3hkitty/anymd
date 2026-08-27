# 🐾 AnyMD: Browser Extension Companion, On-Page Reactions & Caret Overlay Spec 🐾 (v3.3.0)

```text
    /\_/\           🐾 universal sidepanel & caret inline overlays!
   ( >.< )  _______
    > ^ <  /       \
   /     \|  nyaa~  |
  /  | |  | \_______/
  \_/ \_/ /
```

---

### Tags: #zettelkasten #anymd #specs #chrome-extension #sidepanel #reactions #caret-overlay #saf-picker

---

## 🌸 Overview
This specification details the structural design and integration blueprints for the **AnyMD Browser Companion Sidepanel Extension**, the **On-Page Floating Text Selection reaction HUD**, and the **Caret Autocomplete Vault Overlay Ingestion Engine**.

By utilizing stateless webhooks, Chrome's Manifest V3 sidePanel API, and local-first caret-focused overlays, the AnyMD ecosystem connects external web activities (like watching Twitch breaks, reading novels, or browsing repositories) directly into your secure on-disk Markdown Zettelkasten, completely free of cloud-tracking or heavy database architectures.

---

## 🏛️ Section 1: Manifest V3 Sidepanel Companion (`chrome.sidePanel`)

Rather than forcing users to switch tabs or split screens manually, the **AnyMD Companion Extension** leverages Chrome’s native `sidePanel` API to lock the workspace directly on the right edge of any active browsing tab.

```text
  ┌────────────────────────────────────────────────────────┐┌────────────────────────┐
  │                                                        ││ 📱 AnyMD Side Panel   │
  │  Twitch VOD (undiisclosed) / YouTube Video            ││                        │
  │  https://www.twitch.tv/videos/2847299726              ││ 📚 [Primary] [Signal]  │
  │                                                        │├────────────────────────┤
  │  ┌──────────────────────────────────────────────────┐  ││ 📥 Grab Active Tab    │
  │  │                                                  │  │├────────────────────────┤
  │  │                 [ Video Player ]                 │  ││ 🎴 Live TCG Break Log  │
  │  │                                                  │  ││                        │
  │  └──────────────────────────────────────────────────┘  ││ [05:30] Alt Art Pull!  │
  │                                                        ││ [15:10] Alt Art Chase! │
  │                                                        ││                        │
  │                                                        ││ 💾 Save Break Sidecar  │
  └────────────────────────────────────────────────────────┘└────────────────────────┘
```

### 1.1 Core Component Features
* **1-Click Active Tab Grabber (`Grab to Vault`)**:
  * Clicking the primary grab button executes an on-page content script that scrapes the active tab's metadata (document title, author, URL, description, or video duration).
  * Encodes the compiled metadata into a structured JSON payload and fires it over an asynchronous POST request directly to your local **Port 3050 Webhook Gateway** (`vault-webhook-server.js`).
* **Live TCG Break & Annotation Logger**:
  * Designed specifically for tracking card openings and live streams without needing to leave the video viewport.
  * Tapping **`+ Log Hit`** captures the active video playback timestamp, opens a desaturated-pastel inline input text box, and appends a row (e.g., `[00:15:10] - Chase Card: Charizard Base Set #4!`) directly into the active `.vod.md` session file.
  * Clicking **`Save Complete Break Sidecar`** commits the compiled Markdown file with custom YAML frontmatter directly to your target mounted directory.
* **Dynamic Host Configuration (`chrome.storage.sync`)**:
  * Eliminates the need for custom-building or repackaging your extension to point to different environments.
  * The **⚙️ Host Settings** panel provides a text entry field to enter any custom destination URL alongside 1-click preset chips:
    * 💻 **Localhost Dev Server**: `http://localhost:5173`
    * 🌐 **Production Portal**: `https://meow.artkitty.net/lcmd/`
    * 🔒 **Self-Hosted VPS / Custom Domain**: `https://my-vault.mydomain.com/`
  * Configurations are saved to Chrome's synced storage, dynamically routing all clipboard grabs, webnovel clippers, and PWA integrations to your target host.

---

## 🎭 Section 2: On-Page Floating reactions & Selection HUD

When reading articles, books, or watching videos in your main browser window, selecting any sentence or paragraph automatically triggers the **Floating Text Selection HUD** directly at your cursor anchor.

```text
  Selecting a sentence triggers:
  ┌─────────────────────────────────────────────────────────┐
  │ Selecting a sentence pops up the floating reaction HUD  │
  └─────────────────────────────────────────────────────────┘
  ┌───────────────────────────────────────────────┐
  │  🔥   💀   😭   🤣   🍿   🤯   [+] More   [✖]  │
  └───────────────────────────────────────────────┘
```

### 2.1 The Hold-to-React Rage Channel
* **Tap vs. Hold Gesture Thresholds**:
  * **Short Tap (<250ms)**: Drops the selected static reaction emoji directly into the marginalia gutter of your active e-Reader canvas or webpage sidecar.
  * **Hold & Charge (>250ms)**: Triggers a rapid, satisfying circular visual charge animation (visual progress radial fill) wrapped around the clicked icon.
  * **Release (Tirade Focus)**: Releasing the hold after charge completion automatically spawns the **Expanded Rant/Tirade input drawer** focused at that specific paragraph anchor, matching your mobile muscle memory and letting you vent immediately without modal interruptions.
* **Non-Destructive Comment Gutter Storage**:
  * To maintain 100% plaintext portability, on-page reactions are written directly at the block boundaries as standardized HTML comments:
    ```markdown
    <!-- anymd-reaction: {"emoji": "‽", "author": "@lorik", "timestamp": "2026-08-26T14:47:00Z", "note": "THE CSS IS SENTIENT AND THE DOM IS ON FIRE."} -->
    ```
  * Standard Markdown parsers ignore these tags entirely, keeping files perfectly clean, while AnyMD's rendering pipeline parses the comments to draw dynamic commentary cards in the margins.

---

## 🔌 Section 3: Caret Autocomplete Vault Overlay ("The Vault Injector")

Inside any text entry field in AnyMD (such as your **StoryCraft Serials Editor**, **Running Litany Input Box**, or **Daily Captain's Logs**), typing specific trigger sequences dynamically spawns a floating overlay relative to your active typing cursor caret.

```text
  Prose: Nate opened his cabinet and grabbed his custom [[_
                                                    ┌─────────────────────────┐
                                                    │ 🔍 Search Vault...      │
                                                    ├─────────────────────────┤
                                                    │ 📖 The Crafting of Chess│
                                                    │ 🧸 Piplup Plushie Card  │
                                                    │ 🃏 Alpha Black Lotus    │
                                                    └─────────────────────────┘
```

### 3.1 Trigger Keys & Injection Payloads
* **`[[` (WikiLinks & Snippet Previews)**:
  * Triggers a fuzzy-search popup filtering filenames in your active vault.
  * Highlights matching documents and renders an inline, non-destructive text snippet preview so you can peek at the file contents before injecting the reference.
* **`@` (CRM Person Slugs)**:
  * Instantly queries your relational CRM contact directory.
  * Injecting a contact auto-completes as `[Contact:name]` (e.g. `[Contact:russell]`), linking your daily journal entries to their specific communication boundaries and gift registries.
* **`:` (Mixtji Cookbook Recipes)**:
  * Pulls up your custom **Emoji Vault and Mixtji Kitchen cookbook**.
  * Lets you select your custom baked creations (e.g., `[🐱 + 💜 + ✨] (Lavender Star Cat)`) and inserts their human-readable additive formula directly into the text stream.
* **`#` (Lexicon & Tag Autocomplete)**:
  * Queries your **Saratoga Neologisms & Inside Joke Dictionary Vault** alongside standard vault tags.
  * Helps you quickly autocomplete unique coined slang (like `#bathroom_fros` or `#attict`) with tooltip-hover definition cards.

### 3.2 Thread-Safe Surgical AST Patching
* To prevent file corruption when injecting block references, the editor routes all inputs through the thread-safe **`VaultIOWorker.ts`**.
* Instead of rewriting a 50MB file on every injection, it uses synchronous FIFO queues and performs **Surgical AST Segment Patching**, locating the specific paragraph node, cutting out its block slice, and injecting the reference cleanly before flushing to your disk.

---

## 🔒 Section 4: Pillar 7 Enforcement (The Folder Picker Invariant)

To ensure this entire local-first, decentralized network remains cryptographically secure and resilient across build updates:
* **NO folder field, settings path, or repository target is permitted to render as a plain freeform text input box.** Hand-typing directories is highly error-prone and causes silent read/write blocks on mobile and sandboxed OS tiers.
* **All path fields must trigger the native OS Document Selector**:
  * **Web Dashboard**: Fires the File System Access API's `window.showDirectoryPicker()`.
  * **Android Client**: Triggers the Storage Access Framework (SAF) `ACTION_OPEN_DOCUMENT_TREE` contract.
* Tapping a directory trigger automatically registers a persistent handle using `contentResolver.takePersistableUriPermission()`, storing the permission token inside Jetpack DataStore so all backgrounds, widgets, and clippers can write to disk silently across device reboots.

---

## 🗂️ Task Verification Checklists for AGVbro

AGVbro can run these targeted tests to ensure your extension and overlay packages are ready for deployment with zero regressions:

### 🧪 Test 1: Verify Sidepanel MV3 API Compliance
```powershell
# Checks that manifest.json correctly binds chrome.sidePanel rules
Get-Content "C:\Users\lorik\.gemini\antigravity\scratch\Antigravity companion-studio-2026-08-24\20260826-1520_anymd_mixtmoji_manifest.json" | ConvertFrom-Json | Select-Object -ExpandProperty "permissions"
```

### 🧪 Test 2: Verify Autocomplete Event Listeners
```powershell
# Asserts that the dashboard React source binds keydown listeners for autocomplete triggers
Select-String -Path "C:\Users\lorik\.gemini\antigravity\scratch\Antigravity companion-studio-2026-08-24\AnymdDashboard.tsx" -Pattern "addEventListener", "keydown", "selectionStart"
```
