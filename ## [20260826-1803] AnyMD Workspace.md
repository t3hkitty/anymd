## [20260826-1803] AnyMD Workspace Architecture & Vault Settings Spec

# Tags: #zettelkasten #anymd #ui_architecture #ux_spec #workspace_settings

• Core Summary:

* Move away from the opaque vault chooser to granular **Per-Vault Config Profiles** (default mode tab, default tool/view, custom theme/colorways for work vs. personal).
* Relocate MBB actions into a lightweight **1-Click Right-Side Widget / Extension Panel** for zero-friction telemetry capture.
* Re-anchor top navigation around situational awareness: **Current Task (Top-Center)** + **Modular Working Profile Avatar (Top-Right)**.

• Peripheral Nodes / Context:

* Source Context: AnyMD App Shell & Extension Side Panel Spec
* Related Frameworks: Visual context switching, tactical micro-logging, avatar state management

• Raw Transcribed Text / Snippets:

> Feature Architecture: Vault profiles, visual theme separation, side-panel MBB widget, top task anchor, custom profile switcher.

---

**Workspace Layout & Component Hierarchy**

| Zone | Component | Function & Behavior |
| --- | --- | --- |
| **Top Left** | Vault / Mode Tabs | Manila folder-style tab strip; switches contexts with active vault theme tint |
| **Top Center** | Active Task Hub | Persistent high-contrast pill displaying current high-friction chore/sprint |
| **Top Right** | Profile / Avatar Button | Clickable toggle to switch identity (ASCII mascot `( o.o )` vs. uploaded avatar) |
| **Main Center** | Default Tool / View | Loads vault-specific default (e.g., Editor, Blueprint Grid, or Chore Board) |
| **Right Dock / Side Panel** | MBB 1-Click Widget | Slide-out or pinned strip for quick logging, prompt traces, and companion triggers |

---

**Vault-Level Configuration Settings**

* **Default Mode & Tool Auto-Load**: Each vault stores its own startup preset (e.g., "Work Vault" automatically boots into `Journal Vaults` with the Queue Log view; "StoryCraft" boots into `Books` with the Lore Outline view).
* **Workspace Theme Isolation**: Distinct visual themes (e.g., corporate deep navy/slate for Work to trigger work-mode focus, rich velvet purple/obsidian for creative sandboxes) so you instantly know where you are peripherally.
* **Telemetry Routing**: Defines whether MBB captures push directly to the local vault flight log or route to the global side-panel queue.

---

**MBB 1-Click Widget & Side Panel Integration**

* **Quick-Fire Actions**: Persistent right-docked icon stack (`+ Sample`, `Trace Fail`, `Purge`, `Deploy AGV`) accessible across any view without opening the heavy flight recorder card.
* **Extension Companion**: Accessible via the AnyMD browser side panel to log context without leaving the active browser window.