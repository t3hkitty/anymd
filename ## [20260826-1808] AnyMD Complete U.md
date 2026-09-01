## [20260826-1808] AnyMD Complete UI/UX Specification

# Tags: #zettelkasten #anymd #ui_architecture #design_system #ux_spec

• Core Summary:

* Unified system specification integrating Manila folder chromatic inheritance, per-vault startup presets, top-bar situational anchors, docked 1-click MBB telemetry, and tiered progressive disclosure modals.

• Peripheral Nodes / Context:

* Target Platform: AnyMD Core App & Browser Extension Side Panel
* Preceding Reviews: Tab hierarchy, legibility failures, tactical pill builders, context isolation

• Raw Transcribed Text / Snippets:

> Unified Complete Specification: Navigation, Vault Settings, MBB Telemetry Dock, Tactile Chore Coach, and Contextual FAQ Tiers.
--> add multi-select and batch mode to all interfaces with multiple files, with pre and pos pend options and tagging _yaml edits. include a 1-at-a-time carousel batch edit mode with next buttons that save before loading the next file in the selection
>-- adding a new entry to a vault needs a + button.
> when opening a new folder, choose what ro do with sub folders ( individual notes or additional vaults,ignore sub folders, etc)
>idle bro helper needs a settings section for toggling or editing idle tasks
> community posts don't let you see replies
>prefilled vaults don't import, seem to produce a 404 error 
>the fantastic vault worth feature is gone and needs to come back with the default cost per entry setting and faux currency flipper/ticker

---

# AnyMD System & UI Specification

## 1. Top Shell & Manila Navigation

* **Staggered Hanging Folder Tabs (Top-Left)**:
* Overlapping physical lip design directly attached to the active workspace container.
* **Color-Coded Mode Palette**:
* `Books`: Slate Indigo / Heather Blue
* `Journal Vaults`: Warm Sage / Mint Slate
* `Blueprints`: Manila Amber / Ochre Gold
* `Sandboxes`: Vivid Iris / Amethyst Purple




* **Color-Inherited Vault Pills**:
* Vault selection pills dynamically inherit the border glow and accent fill of their parent mode tab for instant peripheral recognition.


* **Persistent Active Task Anchor (Top-Center)**:
* High-contrast, tactile pill displaying the active sprint, chore, or high-friction task.


* **Profile / Mascot Switcher (Top-Right)**:
* Modular button to toggle between active ASCII identity `( o.o )` and uploaded avatar.



---

## 2. Vault-Level Profiles & Workspace Isolation

* **Granular Startup Defaults**:
* Configurable auto-load parameters per vault: Default Mode Tab + Default Tool + Initial Workspace Layout.


* **Context Theme Isolation**:
* Work-specific vaults apply a dedicated steel-slate/navy theme to visually segregate professional queues from personal sandboxes.


* **Telemetry Routing**:
* Select whether MBB flight logs write to the vault's local Markdown tree or output directly to global telemetry.



---

## 3. MBB 1-Click Widget & Extension Side Panel

* **Persistent Docked Strip**:
* Moves flight recording overhead off the primary canvas into a right-edge dock or AnyMD browser side panel.
* **Quick-Fire Action Chips**: `+ Sample`, `Trace Fail`, `Purge Logs`, `Deploy to AGV`.


* **Tactile Routine & Coach Interface**:
* Replaces washed-out yellow banners with deep, high-contrast dark cards and legible typography.
* Replaces rigid text boxes and drop-downs with interactive, clickable pill buttons to rapidly assemble custom chore and habit loops.



---

## 4. Multi-Tiered Contextual Guidance & FAQ System

* **Tier 1: Instant Tooltips (Hover/Focus)**:
* Micro-hints displaying the direct action and keyboard shortcut for single-purpose buttons.


* **Tier 2: Inline Feature Cards (`(?)` Chips)**:
* Clickable chips adjacent to complex mechanics (`Troll Interceptor`, `Companion Telemetry`) showing a concise 2-sentence summary: **What it is** + **What it triggers**.


* **Tier 3: Slide-Out Mode Drawer (`F1` / Quick Guide)**:
* Non-blocking right-side FAQ drawer providing searchable field definitions, deployment specs, and syntax glossaries without breaking the active workspace view.