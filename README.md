# 📖 Library Companion MD (LC-MD)
## Section 3.8: The Reader Resonance Stream & Expressive Micro-Logging Engine

> **A private, sovereign micro-journaling layer designed to capture authentic, visceral physical and emotional collisions between reader and text as they happen.**

---

## 🌟 Overview & Reader Philosophy

Traditional reading applications compress human reactions into sterile 5-star ratings or performative public feeds designed for social validation. **Library Companion MD (LC-MD)** introduces the **Reader Resonance Stream**—a sovereign micro-journaling protocol operating alongside active reading sessions.

By bypassing public feeds and algorithmic clout, readers drop unfiltered reactions into their private vault the exact second a narrative twist, tear-jerker, or comedic disaster strikes.

---

## ⚡ Section 3.8 Feature Matrix

### 1. Floating Quick-Capture Trigger (`Alt + R` / `Cmd + K`)
- Overlay available during active reading.
- Auto-captures timestamp, reading progress percentage (e.g. `94.1%`), chapter title, and internal `epubcfi` locator string (e.g. `epubcfi(/6/4[chap01]!/4/2/8/1:42)`).

### 2. Pre-Filled Sentimental Context Tags (Emotional Presets)
Four high-intensity emotional archetypes ready for single-tap selection:
- **The "Diaper Emergency" Tier** (`Comedy / Laughter Exile` 🤣): Uncontrolled silent laughter, mattress shaking, exile from the bed by an angry spouse.
- **The "Snot & Tear Cascade" Tier** (`Devastation / Tear Cascade` 😭): Absolute structural failure of nasal passages, blindsiding emotional devastation.
- **The "Betrayal & Rage" Tier** (`Character Betrayal` 🤬): Sudden character death ("Joss Whedon special"), last-minute narrative rug-pulls (*"Remember the Alamo, stop dating the new guy!"*).
- **The "Trash Fire" Tier** (`Trash Fire DNF` 🔥): Abandoning a book halfway through due to repetitive, mind-numbing character obsession.

### 3. Atomic Sidecar Commit (`.md`)
- Every micro-log is appended directly into the book's companion `.md` sidecar file under `## Reader Resonance Stream`:
  ```markdown
  ## Reader Resonance Stream
  - **[2026-08-17 | 94.1%] [Category: Comedy / Laughter Exile]** *LAUGHED SO HARD THE RIBS SEIZED... BANISHED TO THE LIVING ROOM FLOOR.*
  - **[2026-08-17 | 98.4%] [Category: Character Betrayal]** *HE IS DOING IT AGAIN. IMPALED BY BAD GUYS? REALLY??*
  ```

### 4. One-Tap Re-Encounter Deep-Links
- Tapping any entry in the Resonance Stream timeline fires a jump intent back to the reader view, smoothly scrolling to and pulsing the exact paragraph where the emotional collision occurred.

---

## 🚀 Getting Started

### Local Launch
```bash
# Navigate to the workspace
cd library_companion_md

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 🎨 Design & Sovereign Architecture
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Sidecar Format:** Standard GitHub-Flavored Markdown (`.md`) compatible with Obsidian, Joplin, Logseq, and Notion.
