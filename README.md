# 🐾 Library Companion MD (LC-MD) & Sovereign Black Box

> **A 100% Self-Hostable, Local-First Discovery Library, E-Reader & Companion Vault**  
> *Natural Expansion of the Black Box Site • Zero-Telemetry • Markdown Sidecars • MIT Licensed*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy with Docker](https://img.shields.io/badge/Deploy-Docker-blue.svg)](https://www.docker.com/)
[![Sovereign Storage](https://img.shields.io/badge/Storage-100%25%20Local-emerald.svg)](#zero-telemetry-privacy)
[![Free SSL](https://img.shields.io/badge/SSL-StackCP%20AutoSSL%20%2F%20HTTPS-emerald.svg)](#-free-ssl-through-stackcp--24-hour-nameserver-propagation-notice)

---

## 🌟 Overview

**Library Companion MD (LC-MD)** is an open-source, local-first companion system and discovery library designed to keep your personal reading data, custom PC rig builds, trading card grails, home insurance valuations, and gift histories **100% private to your hardware**.

- **Grand Bookcase & Multi-View Studio**: 3D bookshelf UI, realistic mahogany spines, wardrobe closet hangers, list view, and interactive 3D carousel showcase.
- **🧪 Dedicated Sandbox Demo Vault**: Isolated non-sensitive sandbox playground to safely test bulk edits, batch tag replacements, bulk deletions, and ZIP exports, with 1-click restore.
- **🎸 Music Album & Track-Linked Sidecars**: Full rock opera concept albums (e.g. Green Day's *American Idiot*) linking to individual song sidecars (*Boulevard of Broken Dreams*, *Holiday*, etc.) with nested Zettelkasten wikilinks.
- **🚪 Spatial-Chained Routine Registry & TTS Director**: Dual-channel (TTS podcast-style audio cadence + visual cards) for 4 daily protocols: `[Leaving the House]`, `[Morning Wake & Prep]`, `[Morning Sustenance]`, and `[Bedtime Closure]`.
- **🛡️ "No Bad Days" Script Engine**: Goblin Tools-style shame-free task deconstructor that automatically chunks unfinished tasks into atomic 2-minute steps.
- **🎭 Story Maker & Author Bible**: Uncurated Zettelkasten Inspo Ledger (`ZK-INSP-...`), dynamic character role slugs (`[MC]`, `[ML]`, `[MC:eyes]`, `[ML:secret]`), live refined prose compiler, and AI structural drafting interrogator.
- **⚡ Running Litany & Inactivity Watchdog**: Real-time activity pulse stream replacing old Live Tweet with high-frequency blackbox logging, 2-minute idle watchdog with audio check-in chime, and AuDHD Morning Manager with traffic delay lead-time calculator.
- **💖 Persona Sanctuary & Plushie Cubbies**: 4-7-8 visual breathing pacer, Preference & Suffering Ledger, Person Slugs (`[Contact:Name]`), Piplup/Dawn Cameo Radar, and digital Plushie Cubbies with Build-A-Bear Wardrobe & scent tracking.
- **Auto-Card Cropper & Dual Media Linking**: Extracts individual slab-framed card covers from scans with HTML5 canvas while linking to raw full-resolution uncropped master uploads.
- **Structured ZIP Archive & `/media/` Packaging**: 1-click full vault backup with `.companion.md` sidecars in `/Sidecars/`, all image covers & raw scans in `/media/`, and standard `manifest.json`.
- **Storage Quota & Local Folder Upgrade**: Native File System Access API integration (`mountSovereignLocalFolder()`) to mount local drives without browser cache limitations.
- **Discord-Style Reaction Bursts & Pac-Man Retro GIFs**: Quick reaction capture with 24-emoji burst bar and context GIFs (Pac-Man ghost-chasing & fruit chomp, Popcat, Doge).
- **Natural Black Box Expansion**: Tamper-proof, zero-cloud data processing with controlled outbound egress.
- **Hardware Passkeys & OpenSSO**: Biometric Touch ID, Face ID, Windows Hello (WebAuthn), GitHub OAuth, or self-hosted SMTP email verification.
- **Fair Trade Calculator & Sourcing Digest**: Multi-currency valuation engine (`$ USD`, `§ Simoleons`, `Ð Doge`, `₹ INR`, `🪙 Gold`), executive PA procurement lists, and Google Sheets CSV exports.
- **Library Action Controls**: 1-click `✏️ Edit / Review` sidecar inspector and direct `👁️ View` external reader file link launcher.

---

## 🚀 Dual Deployment Options

Deploy LC-MD to your private infrastructure in minutes using either method below.

### 🌐 Option A: Static Hosting / StackCP / Midphase / GitHub Pages

Deploy effortlessly as a static web application to Apache, Nginx, or shared hosting (e.g. `meow.artkitty.net`):

```bash
# 1. Clone the repository
git clone https://github.com/t3hkitty/library-companion-md.git
cd library-companion-md

# 2. Install dependencies
npm install

# 3. Configure your secret invite code (optional, defaults to 'meow')
cp .env.example .env
# Edit VITE_INVITE_CODE in .env

# 4. Build the production bundle
npm run build

# 5. Upload files to your web root or subfolder
# Copy `meow_root_index.html` -> `/public_html/meow/index.html`
# Copy `./dist/` -> `/public_html/meow/lcmd/`
```

---

### 🐳 Option B: Sovereign Docker & Homelab (Raspberry Pi / NAS / VPS)

Deploy as an isolated container in one command:

```bash
# 1. Launch with Docker Compose
docker-compose up -d

# 2. Access the portal at http://localhost:8080/
# Subfolder app: http://localhost:8080/lcmd/
```

---

## 🔒 Free SSL Through StackCP & 24-Hour Nameserver Propagation Notice

StackCP provides 100% **Free SSL/TLS Certificates (Let's Encrypt / AutoSSL)** for all hosted domains and subdomains (such as `meow.artkitty.net`).

### ⏳ The 24-Hour Wait Pause for Resetting Nameservers

When pointing your custom domain to StackCP nameservers (`ns1.stackdns.com`, `ns2.stackdns.com`, `ns3.stackdns.com`, `ns4.stackdns.com`):

1. **DNS Propagation Window**: Domain Registrars (Namecheap, GoDaddy, Cloudflare, Midphase) require up to **24 to 48 hours** for new nameserver records to propagate across global DNS root servers.
2. **ACME Challenge Requirement**: StackCP's automated SSL provisioning bot must verify that your domain's DNS resolves directly to the StackCP cluster before issuing the Let's Encrypt certificate.
3. **If SSL Fails on Initial Setup**: If you receive a *"DNS record not propagated / challenge failed"* message, **pause and wait for the 24-hour DNS TTL propagation period to complete**. Do not repeatedly reconfigure records during this window.

### 🛠️ Activating Free SSL in StackCP

Once the 24-hour nameserver propagation has completed:
1. Log in to the **StackCP Dashboard**.
2. Navigate to **Security** &rarr; **SSL/TLS Certificates**.
3. Under *Free SSL*, select **Let's Encrypt / AutoSSL** and click **Activate Free SSL**.
4. Toggle **"Force HTTPS (301 Redirect)"** to **ON** to ensure all HTTP traffic is automatically secured over SSL.

---

## 🔑 Self-Configurable Invite Code

Registration on your sovereign node is restricted by an invite code to prevent unauthorized registrations.

You can configure or rotate your invite code in two ways:
1. **Via Environment Variable**: Set `VITE_INVITE_CODE=your_secret_code` in your `.env` file before building.
2. **In-App Admin Rotation**: Open the **Profile Management** modal (`👤 @lorik_admin`), enter a new invite code in the **Node Admin** settings, and click **Save New Code** to update it instantly without rebuilding!

## 📦 Card Cropping, Media Packaging & Storage Quota Upgrades

- **🃏 HTML5 Canvas Card & Slab Auto-Cropper**: Automatically crops individual trading cards from multi-slot binder pages or single photo uploads, rendering custom PSA/CGC-styled slab frames for cover displays.
- **📁 Structured Dual Media Linking**: Markdown sidecars retain relative links to both the cropped display cover (`cover_image: "./media/cover_{slug}.png"`) and the uncropped high-resolution master scan (`original_uncropped_image: "./media/uncropped_{slug}.jpg"`).
- **📦 Complete ZIP Archive with `/media/` Folder**: Exports all vault sidecars into `/Sidecars/`, all image covers & raw scans into `/media/`, and indexes valuation schemas in `manifest.json`.
- **💾 Sovereign Local Folder Upgrade**: Built-in quota monitor warns when browser cache usage grows and prompts users to mount a local directory via the native **File System Access API** (`window.showDirectoryPicker()`) for unlimited image storage.

---

## ⚖️ Decimal Fair Trade Calculator & Trade Flags

- **Decimal Precision ($ USD)**: Set exact decimal trade valuations (e.g. `$24.50`, `$1,250.75`).
- **`🤝 Available for Trade` Flags**: 1-click toggle on bookshelf cards to mark items as trade-ready or personal vault keepers.
- **Fair Trade Balance Meter**: Side A vs Side B valuation comparison with automated cash balancing suggestions.

---

## 📲 PWA Installation & Mobile Web Share Target

LC-MD includes a full Progressive Web App (PWA) manifest with **Web Share Target API** integration:

- **1-Click Mobile Installation**: Add LC-MD to your iOS Home Screen (Safari) or Android App Drawer (Chrome) for offline standalone access.
- **Mobile Share Sheet Import**: When bookmarklets are unavailable or cumbersome on mobile browsers, simply tap your phone's native **Share (⎙)** button while browsing Goodreads, NovelUpdates, Amazon, or Reddit &rarr; select **"Library Companion MD"** &rarr; the webnovel or book URL is automatically converted into a structured vault sidecar!

---

## 📖 Sovereign Bookmatter & Directory Studio

Transform raw ebook files or WebDAV/local directories into richly-typeset volumes:

- **📜 Front Matter Studio**: Synthesize Title Pages, Sovereign CC0 / Custody Licenses, Dedications, Epigraphs, **Dramatis Personae (Character & Faction Tables)**, and **Pronunciation / Pinyin Keys**.
- **📑 Back Matter & Appendices**: Synthesize Author & Translator Afterwords, **Lore Lexicons & Worldbuilding Glossaries**, Reading Resonance Logs, Colophons, and **Sovereign Vault Provenance Certificates** (with SHA-256 and Fair Trade Valuation).
- **☁️ WebDAV & Local Sync Directory Batcher**: Scan remote cloud servers (Filejump, Nextcloud, Koofr) or local folders and auto-generate structured bookmatter for every discovered book!

---

## 🛡️ Zero-Telemetry Privacy Shield

- **0 Trackers**: Zero Google Analytics, Facebook Pixels, or ad-tech scripts.
- **Local Markdown Sidecars**: All bookmarks, ratings, and notes save to `.companion.md` sidecar files on your device.
- **Anti-Scraper `.htaccess` Rules**: Automatically blocks FLoC, Google Topics API profiling, and cross-site framing.

---

## 📜 Terms of Service & Standard Country Agreements

This project complies with standard international digital legal frameworks:

- **United States (CCPA/CPRA / DMCA)**: Zero selling of consumer personal information; full DMCA safe harbor notice procedures for node operators.
- **European Union & UK (GDPR / UK GDPR)**: 100% Right to Erasure ("Right to be Forgotten") via one-click vault purge; 0 tracking cookies; local data portability.
- **Canada (PIPEDA)**: Explicit user consent and local-first data custody.
- **Australia & New Zealand (ACL / CGA)**: Full preservation of statutory consumer guarantees.
- **Japan (APPI)**: Direct personal custody and sovereign device storage.

---

## ✍️ Ecosystem Integration: StoryCraft AI Storytelling Platform

The on-device local AI processing pipeline in LC-MD (`window.ai`, Prompt API, zero-server ingress, and ethical provenance disclosures) seamlessly bridges with our sister project:

- **[StoryCraft AI (Sovereign Storytelling Studio)](../storycraft-ai/README.md)**:
  - **Diagnostic Story Engines & Socratic Questioners**: AutoCrit pacing, narrative diagnostics, and trope analysis.
  - **Goblin Task Decomposition**: Breaks complex novel chapters and worldbuilding into bite-sized writing quests.
  - **Shared Sovereign `.companion.md` Format**: Export stories and lore directly into Library Companion MD sidecars.

---

## 📄 License & Open Source Notice

This project is licensed under the **MIT Open Source License**. You are completely free to host, fork, customize, and run your own sovereign node!

- **GitHub Repository**: [https://github.com/t3hkitty/library-companion-md](https://github.com/t3hkitty/library-companion-md)
- **Live Demo & Black Box Hub**: [https://meow.artkitty.net](https://meow.artkitty.net)
