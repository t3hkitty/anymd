anymd GUI Standards Blueprint: A Design System for High-Density Kawaii Brutalism
1. Architectural Foundation: The Core Shell & Navigation
The application shell of  anymd  is architected as a "meow local workspace," a strategic fortress for private data in a cloud-saturated landscape. It is designed to maximize information density for high-stakes telemetry and deep work while maintaining a "low-friction" UX that removes the cognitive tax of manual logging. The shell provides a mathematically stable container for expressive visual layers, ensuring that aesthetic "Kawaii" elements never compromise "Brutalist" functional efficiency.
Master Top Bar & Hub Consolidation
The navigation shall be anchored by a Master Top Bar featuring 4 Categorized Dropdown Hubs.
* Cloud & Auth Hub:  This hub is the primary controller for the  Gemini Spark MCP Bridge . It manages localized sidecar paths (e.g., G:\My Drive\anymd\Sidecars) and cloud storage presets.
* Storage Specifications:  Must support the  Google Drive Bridge (rclone / WebDAV)  preset, allowing the static frontend to interface with cloud APIs via an OAuth Access Token or local rclone bridge.
Workspace Management & State
* Layouts:  The system utilizes a  DualPaneWorkspace  and  VaultWorkspaceLayout .
* Collapsible Infrastructure:  Headers and vertical sidebars must be collapsible to prioritize the workspace.
* Sidebars:  The left-hand vertical sidebar shall contain: Settings (⚙️), Database/Vaults (🗄️), and CRM (◴).
* Persistence:  Active tabs (Inbox, Drafting, Telemetry, CRM, Settings) and theme preferences must persist via localStorage to ensure state survival through refreshes and builds.
The "Cheesy Cat" Vault Protocol
The system enforces strict directory isolation via the "Cheesy Cat" protocol. Directory handles are managed through the Native File System Access API (mountMeowLocalFolder()).
* Vault Designations:  The system must recognize three distinct vaults:  Anymd Primary ,  SignalStack , and  StoryCraft Lore .
* Placeholder State:  Until a directory handle is mounted, the vault view must display the exact ASCII string: (=^.^=).
* Interaction:  Users mount vaults via a "Mount Local Folder" prompt, creating a persistent, isolated link to local directories.
2. Visual Identity: High-Density Kawaii Brutalism & Atmospheric Theming
Kawaii Brutalism is a UX strategy designed to mitigate the "coldness" of high-density information architecture. By overlaying soft, "cute" layers onto strict, brutalist structures, the system reduces cortisol levels during data triage and improves long-term user retention.
Theming Logic & Presets
The GUI shall support three programmatic presets defined by transparency, color, and rounding:| Theme Preset | Glassmorphism Transparency | Accent Colors | Frame Rounding || ------ | ------ | ------ | ------ || Classic | 10% Blur / 80% Opacity | Neutral Grays / Blues | 4px (Standard) || Cute (🌸) | 20% Blur / 60% Opacity | Pastel Pinks / Lavenders | 16px (Maximum) || Silly (🤪) | 5% Blur / 90% Opacity | High-Contrast Neons | Random/Asymmetric |
Dynamic Atmospheric Background System
The background layer must react to both the chosen theme and weather telemetry. The background provides a "translucent glow" that persists across all views.
* Weather Telemetry Presets:  The background must include relatable weather strings such as  "Gallon of sweat here"  (High Heat),  "Human popsicle mode"  (Extreme Cold), and  "It's only 10????"  (Low Temperature alert).
Hyperbole Monitor: Linguistic Inflation Logic Gate
The GUI enforces "local noise grounding" to prevent emotional desensitization (Hedonic Drift).
* Triggers:  The monitor shall flag specific linguistic inflation strings: "literally", "worst thing ever", and "100000_favorites".
* Recovery Logic:  Flagged terms must suggest grounded reframes. Specifically, "100000_favorites" must be programmatically reframed as "local_noise_grounding".
* The Grief List Rule:  The word "loooove" is programmatically reserved for entities on the "Grief List." It is blocked from use in standard telemetry to preserve its emotional resonance.
3. Specialized Media Views & Bookshelf Layouts
Context-Aware Switching
The UI must shift between productivity and discovery based on the active vault preset.
* Trigger Condition:  Selecting the  SignalStack  preset  forces  the view state from List to Grid (Discovery Board).
The Gmail-Style Inbox
The default high-density view for vault files. Required elements include:
* Selection checkboxes and star toggles.
* File extension badges:  MD ,  JSON ,  TXT .
* Snippet previews for content peeking without activation.
The Consumed Media Vault
A specialized interface for tracking media consumption with a "Mahogany Spines" 3D Carousel metaphor.
* Media Mode Switcher:  Must support toggling between  Ebook ,  TV Show , and  Movie  modes.
* Review Standards:  Must capture "Before/After Moods," a "1 thing you'd change" entry, and "DNF (Did Not Finish) Tirades."
* Live Tweet Bar:  A private, twitter-style reaction bar that generates Zettel entries tagged with #live_tweet.
4. Interactive Card Elements & Micro-Graphics
Context-Aware ASCII Thumbnails
The getAsciiThumbnail() logic provides instant visual recognition in text-heavy environments.| Data Type | ASCII Icon | Label || ------ | ------ | ------ || Health/Heart | (/\/\) | Pulse Wave || Logs/Alarms | (o_o) | Traffic Radar || Music/Audio | ( | \|) || Zettel/Lore | LORE | Lore Book |
The "Sticky Tape" Pinning System
* Badge:  Panels pinned to the top must display the  "📌 STICKY TAPE PINNED"  badge with a retro tape overlay.
* Grid Behavior:  The Pinned Dock must function as a  Horizontal Flexbox , allowing for side-by-side sticky tape pins to maximize top-level visibility.
CRM & Species Badges
Character nodes must use a card-deck metaphor.
* Person Slugs:  Required categorization badges: MC, NPC:merchant, NPC:ally.
* Interactive Headers:  CRM input cards must feature interactive ASCII squirrel or cat headers.
5. Zero-Friction Controls & the C4 Interaction Engine
The C4 Dynamic Button Swapper
The C4 Engine serves as a 1-tap telemetry trigger for the six-phase creator cycle:
1. Create:  Writing/Design/Coding.
2. Consume:  Reading/Watching/Listening.
3. Chat:  Messaging/AI interaction.
4. Collaborate:  Group work/Sharing.
5. Chow Down:  Fueling/Nourishment.
6. Calm:  Rest/Reset.
Universal Inbound Webhooks
The system shall bypass the "Google Sheets bottleneck" by using a local webhook server.
* Port:  localhost:3050.
* Protocol:  Accepts raw text or JSON via POST requests from IFTTT, Tasker, or iOS Shortcuts.
* Ingestion:  Incoming data is immediately converted to a Zettel markdown file in the designated vault.
6. Utility Widgets, Assistants & The Corollary Engine
The Airplane Blackbox Corollary Engine
This engine performs pattern discovery using "Selectable Mood Emoji" filters. It correlates low moods (😭, 😔) with missing context tags like #meds or #chocolate.
The 3-Minute Bio-Telemetry Rule
The system must apply a mathematical classifier for bio-telemetry task pairs:
* Duration  $\ge 3$  minutes:  Classify as  💩 Poop .
* Duration  $< 3$  minutes:  Classify as  🚽 Pee .
Relatable Hydration & Excretion Station
The Sip Tracker measures volume in 8 relatable comparison tiers:
1. Hamster Dropper:  0-10 sips.
2. A Toddler’s Sippy Cup:  10-20 sips.
3. Standard Soda Can:  20-35 sips.
4. Gym Shaker Bottle:  35-60 sips.
5. Venti Stanley Tumbler:  60-100 sips.
6. 2-Liter Soda Jug:  100-150 sips.
7. 1-Gallon Milk Jug:  150-250 sips.
8. Warehouse Pallet of Water:  >250 sips.
* Ratio Manager:  The system tracks the sips-to-pee ratio. If the ratio drops below the  3.0 constant , the system must trigger an  "Insufficient Beverage Notice."
Braindump Watcher & Dopamine Sprint
* Braindump Watcher:  Real-time sensor for "All-or-Nothing" thinking or "Catastrophizing." Triggers a 60-second  Box Breathing  widget upon detection.
* #tbd Pomodoro Sprint:  A 5-minute "Beat-The-Clock" dopamine engine.
* Victory Celebration:  Completion of a sprint must trigger a  Dopamine Victory Celebration  consisting of multi-burst confetti.
* No Zero Days:  The GUI must feature a permanent  "Make Today Non-Zero"  1-tap action button, grounded in Ryan’s 4 Pillars (No Zero Days, Gratitude, Self-Forgiveness, Fueling).