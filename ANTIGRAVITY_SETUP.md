# 🚀 Replicating the Sovereign Antigravity LC-MD Setup

This codebase was pair-programmed with **Google Antigravity AI** to build a **100% sovereign, local-first, multi-media library companion and e-reader system**.

---

## 🛠️ Key System Architecture

1. **Frontend Core**:
   - **Framework**: React 18 + Vite + TypeScript
   - **Styling**: Tailwind CSS + Custom HSL Theme Engine (`Midnight`, `Sepia`, `Nord`, `Dracula`, `E-Ink Paper`, `Piplup & Dawn Sapphire & Ice Pearl`)
   - **Icons**: Lucide React Icons

2. **Data & Storage Sovereignty**:
   - **Sidecar Format**: Standardized `.companion.md` sidecars with YAML frontmatter metadata (`isbn13`, `loc_classification`, `tags`, `card_metadata`).
   - **Cloud Sync Engines**: WebDAV (`Filejump`, `TorBox`, `Koofr`, `Nextcloud`, `pCloud`, `Google Drive`), Rsync compatibility generator, and Google OAuth 2.0 family account storage.

3. **Multi-Media Collection Category Hubs**:
   - 📚 **LitRPG & Danmei Ebooks** (`#litrpg`, `#bl`, `#danmei`, `#scum-villain`, `#xianxia`, `#mxtx`)
   - 🃏 **TCG Cards & High Valuation Grails** (`#psa-10`, `#first-edition`, `#holographic`, `#charizard`, `#black-lotus`, `#bgs-9.5`, `#shadowless`)
   - 🏛️ **Pop Figures & Physical Relics** (`#funko-pop`, `#vaulted`, `#screen-used-relic`, `#loki-multiverse`)
   - 👗 **Wardrobe & Closets** (`#haute-couture`, `#silk-gown`, `#cashmere-coat`, `#gothic-lolita`)
   - 🎶 **Music & Vinyl** (`#first-pressing`, `#audiophile`, `#picture-disc`)
   - 🎮 **Retro Video Games** (`#sealed-cib`, `#retrogaming`, `#wata-9.8`)

4. **Multi-Host Deployment**:
   - **Midphase Server**: Apache `.htaccess` rewrite rules generator + Google OAuth 2.0 family access whitelist.
   - **StackCP Server**: `deploy_meow.sh` FTP auto-deployment for `meow.artkitty.net`.

---

## 🚀 How to Replicate / Mimic This Setup

1. **Clone the GitHub Repository**:
   ```bash
   git clone https://github.com/t3hkitty/library-companion-md.git
   cd library-companion-md
   npm install
   ```

2. **Run Locally**:
   ```bash
   npm run dev
   ```

3. **Build Production Bundle**:
   ```bash
   npm run build
   ```

4. **Deploy to StackCP / Midphase / cPanel**:
   - Use the in-app **`🐱 StackCP Deploy`** or **`☁️ Midphase & Google Auth`** modals for 1-click `.htaccess` and FTP scripts!
