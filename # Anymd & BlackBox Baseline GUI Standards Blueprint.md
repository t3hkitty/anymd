# Anymd & BlackBox Baseline GUI Standards Blueprint

## 1. Core Shell Layout, Navigation & Header Consolidation

The strategic importance of a unified shell for **anymd** and **myBlackbox** lies in the establishment of a reliable spatial mental model. For the neurodivergent user, high-density telemetry and personal knowledge management (PKM) environments can easily trigger choice paralysis or cognitive friction. By consolidating the layout, we minimize the executive load required to navigate the interface, allowing the user to focus entirely on data synthesis rather than UI orientation. A consolidated shell provides a sense of "somatic permanence"—a stable digital home that remains predictable across complex context switches.

The interface is anchored by the **Master Top Bar**, which categorizes system capabilities into four primary Hubs:

| Hub Name | Functional Purpose |
| :--- | :--- |
| **Ingest / Sourcing** | Telemetry intake, notification streams, and Echo Loopback services. Must provide **split raw/parsed views** and a one-tap replay/resend trigger for real-time telemetry audits. |
| **Vault Tools** | Core file management, encryption protocols, **Zettelkasten serialization**, and **hydration/excretion tracking** for data lifecycle management. |
| **Cloud / Auth** | API credential management (e.g., Google Gemini tokens), SSH configurations, and VPS syncing. Operations are routed via a `background.js` service worker acting as a zero-latency proxy. |
| **Creative Studio** | Accessing the 3D visual canvas (Mindscape), ASCII storyboard visualizers, and skeuomorphic asset management views. |

To maximize focus and screen real estate, the system employs **vertical split workspaces**. These workspaces must be fully collapsible and include active dashboard headers that update dynamically based on the current context, providing high-level summaries of the active data stream.

This structural reliability provides the necessary framework for the system’s specialized visual aesthetic.

## 2. High-Density Kawaii Brutalism & Thematic Presets

The "Kawaii Brutalism" aesthetic is a strategic juxtaposition designed to satisfy the neurodivergent need for both absolute order and sensory comfort. The "brutal" structural constraints—high-density layouts, sharp edges, and unambiguous boundaries—reduce the "Wall of Awful" by eliminating visual ambiguity. Meanwhile, the "kawaii" layer (pastels, kaomojis, and soft accents) acts as a sensory shield, protecting the user from the high-cortisol fatigue often triggered by industrial, red-alert-style professional interfaces.

**Strict Design Constraints:**
*   **0px Border-Radii:** All containers, buttons, and input fields must utilize sharp, 90-degree corners to emphasize structural rigidity.
*   **2px Solid Borders:** Every UI element must be defined by a 2-pixel solid border to maintain a clear visual hierarchy.
*   **Asset Purity:** **Default bugdroid assets are 100% removed.** All system icons must be replaced with custom **Adaptive Vector Launcher Icons** (mipmap-anydpi-v26) and themed icon support.
*   **Color Palette:** Use only desaturated cream and pastel presets to mitigate sensory overstimulation.

The system includes a persistent **Theme Picker** that modifies the global UI state via **Jetpack DataStore** (Android) or `localStorage` (Web):
*   **Classic:** A high-functionality professional view focused on data density.
*   **Cute:** Increased pastel saturation and softer UI transitions.
*   **Silly:** Extensive integration of kaomojis and playful micro-animations to maintain engagement.

**Atmospheric Layers:**
*   **Dynamic Clock Layer:** A persistent, high-visibility time tracker integrated into the shell to combat time blindness.
*   **Weather Layer:** A real-time environmental layer that subtly influences background accents based on local conditions, grounding the digital workspace in the physical world.

These visual constraints ensure that even the most specialized media views remain consistent with the system's core identity.

## 3. Specialized Media Views & Bookshelf Layouts

Digital asset management is transformed through skeuomorphic library displays, which move beyond abstract lists to provide a tactile interface. These views leverage the user's spatial memory, making digital storage feel like a physical, navigable room.

**Library Display Modes:**
1.  **Bookshelf Grid:** A high-density grid where files are organized as standardized items on a structured shelf.
2.  **Mahogany Spines:** A specialized view for text-heavy vaults or Zettelkasten notebooks, where files appear as book spines with customizable titles and colors.
3.  **Wardrobe Closet:** A metaphorical layout for character designs, species badges, or CRM packs, where assets are displayed as "Books on Dress Hangers."

The "Bookshelf" metaphor reinforces a sense of academic rigor and long-term storage, ideal for technical blueprints and research. The "Wardrobe" metaphor treats assets as interchangeable components or "outfits," facilitating creative immersion. By grounding digital files in recognizable physical objects, the system reduces the cognitive load of abstract data management.

## 4. Interactive Card Elements & Micro-Graphics

The strategic importance of context-aware micro-graphics is rooted in the "delay-of-reinforcement gradient." Delays between an action and its visual outcome impair conditioning and increase executive fatigue. Therefore, the UI must provide **instantaneous visual confirmation** of data states to solve the "credit allocation" problem common in neurodivergent workflows.

**Micro-Graphic Standards:**

| Element Name | Visual Rule | Trigger / Context |
| :--- | :--- | :--- |
| **ASCII Thumbnails** | Text-based visual representations. | Default media view in high-density grids. |
| **Green Lock Icons** | 2px solid border, high-contrast green. | Displayed when a vault is under active encryption. |
| **Species Badges** | Modular icons representing data types. | Applied to files within the "Wardrobe" or CRM packs. |
| **ASCII Storyboard** | Monochromatic ASCII character maps. | Viewing video or narrative-sequence data. |

**Context-Awareness Rules:**
Micro-graphics must be reactive to the underlying data state. Any change in encryption status, vault lock-state, or sync progress must trigger an immediate visual update. This allows for a "passive visual audit," where the user can confirm system security and integrity without manual inspection.

## 5. Zero-Friction Ingestion & Bulk Timelines

"Zero-Friction Ingestion" is designed to bypass the "Wall of Awful"—the barrier to task initiation caused by executive dysfunction. The system must lower the "activation energy" required to capture data.

A primary requirement is the **Visual Template Builder**, which **replaces all freeform text boxes with modular variable chips** (e.g., `[Timestamp]`, `[Text]`, `[Header]`, `[Callout]`). This prevents the choice paralysis of a blank text field and enforces structured data entry from the moment of inception.

The **Micrologging Input Bar** is paired with **C4 Dynamic Scene-Switching** (Command, Control, Communications, and Computers). The C4 Engine allows the user to jump between pre-configured UI "scenes" (e.g., "Deep Work" to "Creative Triage") with zero latency.

**Timeline Management Rules:**
*   **Select-All Checkboxes:** Mandatory at the top of every telemetry list for rapid bulk action.
*   **Bulk Actions:** One-tap triggers for archiving or deleting selected telemetry frames (battery logs, network changes, notes).
*   **Chronological Feed:** All ingested data must be presented in a unified feed with clear, 2px solid separators to prevent data debt.

## 6. Utility Widgets & Easter Eggs

Utility widgets provide "Somatic KawaiiNekoty," addressing the user's physical and cognitive state as an integral part of the workspace.

*   **Startle Currency Ticker:** Monitors volatile data points with subtle alerts to prevent jump-scares or anxiety spikes from sudden data shifts.
*   **Somatic Crisis Assistant:** (AnymdGoblinSomaticTasks-v22). A specialized TTS utility using the `window.speechSynthesis` API. It functions as a **Virtual Body Doubling** tool, audibly decomposing complex tasks into single-step focus shields to prevent cognitive overload.
*   **Fair Trade Calculator:** Aids in decision-making by calculating the "effort vs. reward" ratio of a task, helping to prevent burnout.
*   **Kaomoji Sidebar Clicker:** An interactive "stimming" tool that provides a low-stakes sensory outlet during high-stress processing periods.

Easter eggs are not merely decorative; they serve as sensory reset points, maintaining user engagement by allowing for brief, controlled moments of "play" within the brutalist structure.

## 7. Folder Directory Selection Invariant

The "Directory Selection Invariant" is the non-negotiable foundation of the system's "local-first" architecture. By leveraging native OS pickers, the application ensures it maintains meow data handles without the need for cloud backends.

**Non-Negotiable Technical Command:**
The use of freeform text entry boxes for directory paths, vault locations, or folder inputs is strictly forbidden. This prevents path-resolution errors and reduces cognitive load by utilizing familiar OS-level navigation.

> **Required APIs for Directory Access:**
> *   **Android:** Must utilize the **Storage Access Framework (SAF) Directory Picker**.
> *   **Web:** Must utilize the **`showDirectoryPicker` Web API**.

**Persistence & Stability:**
The system must invoke `takePersistableUriPermission()` (on Android) or equivalent handle-storing logic to ensure vault access survives app cold-starts and reboots. All UI states, tile setups, and theme preferences must be persisted via **Jetpack DataStore** (Android) or `localStorage` (Web). This ensures that the high-density GUI remains a reliable, persistent gateway to the user's meow data.

By adhering to these standards, we produce a "High-Value, Comprehensive, and Professional" interface that respects the cognitive ergonomics and somatic needs of the neurodivergent knowledge worker.