# Kitty's Cinder Reader Plugins

> Community extensions repository for **Cinder E-Reader** with built-in NovelUpdates discovery & Cloudflare cookie bridge, Royal Road, and ScribbleHub.

---

## 📲 How to Install in Cinder Reader

1. Open **Cinder Reader** on your device.
2. Go to **Settings** → **Extensions**.
3. Tap **+** (Add Repository) and paste:
   ```
   https://raw.githubusercontent.com/t3hkitty/kitty-cinder-reader-plugins/main/repo.json
   ```
4. Browse and tap **Install** on your desired sources:
   - **NovelUpdates**: Web novel discovery, tags, and chapter index tracker.
   - **Royal Road**: Top LitRPG, Progression Fantasy, and original web serials.
   - **ScribbleHub**: Original web fiction and light novel reader.

---

## ⚙️ Configuring NovelUpdates (Cloudflare Cookie Bypass)

Because NovelUpdates uses Cloudflare Turnstile bot protection:

1. In Cinder, go to **Settings** → **Extensions** → **NovelUpdates** → **Settings**.
2. Paste your browser's `cf_clearance` and session cookies into the **NovelUpdates Session Cookies** field.
3. Paste the matching **Desktop User-Agent** from that browser.
4. Tap **Save**. You can now search and browse NovelUpdates catalogs without bot challenge blocks.

---

## 📂 Included Sources

| Source | ID | Capabilities | Description |
| :--- | :--- | :--- | :--- |
| **NovelUpdates** | `novelupdates-cinder-source` | Search, Discover, BookChapters, Resolve | Web novel index & discovery with cookie auth |
| **Royal Road** | `royalroad-cinder-source` | Search, Discover, BookChapters | Popular LitRPG & Progression Fantasy |
| **ScribbleHub** | `scribblehub-cinder-source` | Search, Discover, BookChapters | Web novel serialization reader |

---

## 📄 License
MIT
