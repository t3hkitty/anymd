# 🐾 AnyMD: Dynamic Widget Dashboard & Button Builder Playbook (v3.2.0)

```text
    /\_/\           🐾 drag & drop widget builder inside!
   ( >.< )  _______
    > ^ <  /       \
   /     \|  meow!  |
  /  | |  | \_______/
  \_/ \_/ /
```

## 🌸 Overview
This project introduces the **AnyMD WYSIWYG Widget Dashboard & Dynamic Button Builder**—a highly customized, local-first configuration portal built directly into your active dashboard. 

While your native mobile app executes compiling sequences for actual **Kotlin + Jetpack Compose widgets and tiles**, this in-app dashboard **mirrors the layout of your mobile device on a live editing grid**. This makes customization intuitive, visual, and immediately accessible, allowing you to build, reorder, and sync your micrologging triggers on the fly.

---

## 🎨 Somatic Sovereignty: The Accidental Wipe & Edge Guard

When navigating rehabilitation and physical recovery (such as post-stroke or post-seizure motor limits), holding a physical device and cleaning/wiping the screen glass are frequent sources of **accidental touch inputs**. Traditional mobile widgets arrange buttons on sterile, unyielding grids that trigger messy, duplicate logs when your hand brushes the edge of the glass.

The AnyMD Widget Dashboard directly integrates an **Accidental Wipe & Edge Guard**:
* **Bottom-Left Safety Boundaries**: The bottom-left of the phone screen (typically Slot 5 and Slot 7 on a standard grid) is a high-risk zone for thumbs and palms during casual holding or wiping.
* **Wipe Guard Warning Alerts**: Dragging and dropping high-frequency loggers (like `🚽 Log Pee` or `💊 Meds Taken`) into these zones triggers an active warning banner, guiding you to shift high-importance logs to central, safe slots, keeping the edge boundaries clear.

---

## ⚙️ Core Subsystem Capabilities

### 1. The Visual Layout Mirror (Grid Slots 1 - 8)
* Features a high-density, **Kawaiian Brutalist visual mockup** representing the native Android quick-capture widget.
* Integrates **HTML5 Drag-and-Drop Swapping**: Clicking and dragging a button between slots seamlessly swaps their indices and stores their spatial arrangement instantly inside `localStorage` (Sticky Settings).

### 2. The Button Builder Configurator
* **Icon Selector**: Choose custom emojis and Kaomojis to represent your active biological and work states (e.g. `💧`, `🚽`, `💩`, `💊`, `🍳`, `💻`, `🧘`).
* **Somatic Preconfigs**: Toggle instant presets that automatically lock button templates and append standard telemetry tags:
  * `💧 Sip`: Logs a `Hydration Log: +1 Sip` Zettel with `#sip #hydration #telemetry` tags.
  * `🚽 Pee`: Logs a `Bio Break: Urination` Zettel with `#pee #bio_break #telemetry` tags.
  * `💩 Poop`: Logs a `Bio Break: Bowel Movement` Zettel with `#poop #bio_break #telemetry` tags.
  * `💊 Meds`: Logs a `Meds Log: Morning Dose Confirmed` Zettel with `#meds #health #telemetry` tags.
* **Custom Template Builder**: Unlock and author custom, variable-driven templates with optional tag additions (e.g. `Focus Started: Coding` paired with `#create #coding #deep_work` tags).

### 3. Color-Coded Pills & Markdown Previews
* **Pill Badges Preview**: Displays a live, real-time render of your chosen category tags styled as color-coded, soft glassmorphic pill badges (e.g., teal for hydration, purple for coding, pink for meds).
* **Zettelkasten Card Compiler**: Renders a scrollable GFM Markdown card showing the exact, raw file structure (comprising titles, timestamps, categories, and tags) that will commit to your local flat-file folder upon logging.

---

## 🚀 Interactive Setup & Execution

### Step 1: Initialize the Dashboard Component
Save **`20260826-1610_anymd_widget_dashboard.tsx`** into your components folder and register it inside your main workspace layout:
```tsx
import { AnymdWidgetDashboard } from './components/20260826-1610_anymd_widget_dashboard';

export const App = () => {
  return (
    <div className="workspace-mode">
      <AnymdWidgetDashboard />
    </div>
  );
};
```

### Step 2: Test the Logging Loop Locally
1. Type a note into the **Companion Keyboard Input Buffer** (e.g., *"Feeling great, slept 8 hours"*).
2. Tap the **`💧 Sip Water`** quick-logger button.
3. The input field will automatically clear, and the console will output a complete Zettel card appending your text note directly to the hydration template:
   ```text
   [2026-08-26 14:00:00] 💧 Hydration Log: +1 Sip - Note: "Feeling great, slept 8 hours" #sip #hydration #telemetry
   ```

### Step 3: Run the SSH Deployer to Your VPS
Execute your new, Zettel-aligned python deployment hook to compile and transfer these dashboard changes straight to your live production VPS:
```bash
python3 20260826-1611_anymd_widget_dashboard_deploy.py
```
Do a hard refresh in your browser and start building custom widgets with zero-frictional overhead!
