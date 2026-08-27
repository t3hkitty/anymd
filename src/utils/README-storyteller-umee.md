# 🐾 Storyteller AI: Universal Multi-Vector Export Engine (UMEE-9500) 🐾 (v1.0.0)

```text
       _..._                  🐾 Infinite Mediums, Single Manuscript!
     .'     '.      _
    /    .-.  \   _/ \
  .-|   |   |  |-'    |
  |  \   '-'  /       |
   \  '._ _.-'       /
    '-..____...---'
```

## 🌸 Overview
This project documents the core technical operations, design invariants, and compilation targets for the **Storyteller AI Universal Multi-Vector Export Engine (UMEE-9500)**. 

Rather than isolating written manuscripts inside sterile, locked word processors, UMEE-9500 treats your master creative outline and prose as a consolidated source tree, dynamically compiling it into **three highly distinct downstream formats** with zero duplicated labor:

1. 🎮 **Super FabiMeow 256 Game Cartridges (`.kat`)**: Interactive ROM dialogue maps [cite: 413, 421].
2. 🎥 **Feature-Length Monospace ASCII Cinema (`_cinema.ans`)**: Standard VT100/ANSI terminal screen animatic playbacks [cite: 420].
3. 🎨 **Three-Panel Saturday "Tonal Puncture" Comic Strips (`_saturday_comic.txt`)**: Sarcastic, character-driven ASCII layout frames [cite: 418, 419].

---

## 🔒 Strict Compliance: The Folder Selection Invariant (Pillar 7)

To eliminate the fragile, error-prone manual path entry boxes that caused silent write locks in older iterations [cite: 114], **all UMEE-9500 export routines enforce the native Folder/Directory Selector rule**:

* **The Invariant**: All folder paths, output locations, and settings directories must be obtained by triggering the native OS folder selector dialogue (`showDirectoryPicker()` in modern browsers, and the **Storage Access Framework (SAF) `ACTION_OPEN_DOCUMENT_TREE`** contract in Android) [cite: 114, 1027].
* **Persistable Urity**: Pushing your files to disk automatically triggers `contentResolver.takePersistableUriPermission()`, caching a secure cryptographic directory handle in your local Jetpack DataStore [cite: 1, 1027]. This ensures that your background export compilers, sync daemons, and quick tiles retain direct local write permissions across device cold-starts [cite: 13, 1027].

---

## 🕹️ Compilation Target 1: Super FabiMeow 256 Cartridges (`.kat`)

UMEE-9500 parses your story manuscripts and translates scene dialogue matrices directly into **playable .kat/KATS ROM packages**:

* **Haptic Action Bindings**: Encodes phone-jerking sensors directly. For instance, an upward jerk ( $+a_y > 2.2g$ ) triggers an instant "Mario jump" character foundation snap, while physical chassis back-taps ( $+a_z > 1.6g$ ) register as pinball-cabinet nudges [cite: 413].
* **Sentient Tantrums**: Inactive dialogue trees automatically run a background watchdog; if left idle, character cards throw dramatic Kaomoji fits (`(｡•́︿•̀｡)` ➔ `(╥﹏╥)`) to grab your attention [cite: 413].
* **Soft-Deck Mapping**: Automatically compiles custom on-screen 5-button touch controllers positioned to align with your one-handed transition paces, ensuring you don't trigger accidental clicks during high-intensity sequences [cite: 413].

---

## 🎥 Compilation Target 2: Monospace ASCII Cinema (`.ans` / `.vt`)

Your narrative’s descriptions, dialogue lines, and emotional pacing metrics are dynamically compiled into **feature-length retro terminal formats**:

* **Raw Terminal Streams (`.ans`)**: Outputs standard 80x25 ANSI escape sequences. You can execute these animations directly in standard Unix shell consoles using `cat` or `pv` to watch your story act out in real-time.
* **WebGL ASCII Web Player (`.html` / `.wasm`)**: Renders monospace raymarched lighting, camera shakes, and character Kaomoji speech banners directly inside web environments at **144Hz** [cite: 413, 420].
* **Lyric-Linked LRC Sync**: Time-aligns Web Audio sound effects and musical BPM crescendos directly to dialogue text blocks using standard LRC/SRT subtitle files [cite: 420].

---

## 🎨 Compilation Target 3: Three-Panel Saturday Comic Strips

For high-contrast creative breaks, UMEE-9500 compiles dramatic scene changes into a classic **three-panel Saturday ASCII newspaper strip**:

* **The Structure**: Packages three consecutive panels containing a custom vector ASCII character vignette, a high-level narrative caption, and structured dialog speech bubbles.
* **The Aesthetics**: Uses rigid, high-density retro box frames (`0px` border-radii, `2px` black bounding frames) to preserve terminal-focused Kawaii brutalism and prevent cognitive clutter [cite: 114].

---

## 🛠️ Developer Testing & Operations

AGVbro can easily run a local compile test of your export script inside PowerShell:

```powershell
# Compiles the TS module to verify type assertions and syntax bounds
tsc "C:\Users\lorik\.gemini\antigravity\scratch\generated-stuff\storycraft-ai\20260826-1640_storyteller_umee_export_engine.ts" --noEmit
```
