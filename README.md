Nearly your entire Personal Knowledge Management (PKM) and AI development suite can run 100% on a static GitHub Page with absolutely zero VPS backend or cloud hosting costs cite: 102, 124, 159.
Because AnyMD was built from the ground up as a local-first, serverless application, the web interface acts as a static client-side shell cite: 102, 124, 297. It operates completely inside your browser's sandboxed memory cite: 91, 124, meaning you don’t need to pay monthly server fees, configure firewalls, or manage SSH tunnels just to brainstorm, write code, or query AI cite: 159, 296.
The complete structural compatibility of your tools on a static GitHub Pages environment maps as follows:
🗺️ The \$0 Infrastructure & Compatibility Matrix
Tool / Component,Runs on GitHub Pages?,Execution Requirements,Infrastructure Needed
AnyMD Core Dashboard cite: 72,Yes (100%) cite: 102,"Runs in the user's browser cite: 30, 103. Loads instantly over free, secure HTTPS cite: 31, 104.","GitHub Pages (Free static hosting) cite: 31, 104"
Secret Developer Vault cite: 77,Yes (100%),Fully compiled as React client-side logic with regex colorizers and overlays cite: 43.,None (Client-side execution) cite: 297
Somatic Crisis Assistant cite: 75,Yes (100%),"Uses the browser’s native window.speechSynthesis API for offline TTS voice output cite: 3, 297.",None (Client-side execution) cite: 297
"Local Folder Mounting cite: 70, 87",Yes (100%) cite: 297,"Uses the standard Web File System Access API (window.showDirectoryPicker()) to read/write local folders cite: 87, 292.","None (Local directory handle permissions) cite: 87, 292"
Google Gemini API Playground cite: 38,Yes (100%),Makes direct HTTPS requests to generativelanguage.googleapis.com using a locally stored browser token cite: 38.,None (Your free Google AI Studio Key) cite: 38
AnyMD Web Clipper Extension cite: 79,Yes (Local) cite: 78,"Runs inside your personal Chrome browser, capturing and formatting text/images cite: 78, 80.",Chrome Browser (No external hosting) cite: 78
"Text Webhook Gateway cite: 7, 75","No (Local-Only) cite: 35, 108","Node.js Express background server that runs locally on your PC (Port 3050) to receive third-party feeds cite: 7, 114.","Your Local PC (Node.js runtime) cite: 110, 114"
Antigravity Workspace Audits cite: 38,No (Local-Only) cite: 35,"Requires python runtime to execute the google-antigravity SDK and inspect local files cite: 38, 55.","Your Local PC (Python 3 environment) cite: 38, 55"
AGV Remote Idea Deployer cite: 87,No (VPS/Server),"Background daemon that polls folders, runs commands, and triggers system-level tests cite: 83, 285.","VPS or Local Home Server cite: 83, 285"
🎨 How to Run a High-Performance Serverless Setup
When you host your AnyMD dashboard on a static GitHub Page, you gain unlimited file counts, fast load times, and automatic SSL cite: 31, 104, 152. To bypass the lack of a backend server, your local-first architecture relies on three elegant, serverless "bridges":
Storage via Google Drive or Koofr (Desktop Client Method):
Instead of attempting to write files to the cloud using complex server APIs, install the Google Drive Desktop or Koofr WebDAV client on your computer cite: 35, 132.
Mount AnyMD directly to your synced local folder (e.g. G:\My Drive\anymd) cite: 35.
When you edit notes in AnyMD, the browser writes them directly to your hard drive, and your desktop client automatically handles the cloud synchronization behind the scenes cite: 35, 41!
CORS-Free Extension Communication:
Standard static web pages are blocked from querying local ports (like localhost:3050) due to cross-origin resource sharing (CORS) security rules cite: 184.
Your custom Chrome Extension's background service worker (background.js) bypasses these limitations natively cite: 184, acting as a zero-latency proxy to pipe clippings directly from GitHub Pages straight into your local text webhook gateway cite: 120, 184.
Persistent Local Memory:
All your settings, custom interface themes (Classic, Cute, Silly), active workspaces, and personal API credentials save securely inside your browser's persistent localStorage cite: 43, 95, 296.
Even when GitHub Pages builds and publishes new updates to your repository, your local environment state remains intact, untouched, and fully authenticated cite: 43, 116.
🐾 Next Step Idea: Since your codebase compiles into clean static assets, would you like me to generate a GitHub Actions workflow script (deploy.yml) so that every time you save an idea or push a design edit, GitHub automatically builds and publishes your working site directly to your free HTTPS GitHub Pages domain cite: 32, 105?


---

## 🌸 Kawaii Feature Updates! (=^･ω･^=)

```text
      /\_/\
    ( =^.^= )  nyaa~
     \  -  /
    ( | | | )
   (__d_b___)
```

- **💾 Sync Directory Picker Gesture Fix**: Resolves browser permission blockages by calling `window.showDirectoryPicker()` synchronously inside the user-gesture click and change event handlers in settings and modals.
- **⚙️ Dynamic Plugins inside Settings Drawer**: Renders checkboxes dynamically for all active plugins from the anymd registry repository, allowing immediate toggle control.
- **🔄 Old LC_MD Vault Import & Migration**: Adds options inside the "Create New Vault" storage picker to import and convert old local-storage based `lc_md_` vaults (Personal or Sandbox) into modern companion Markdown (.md) structures.


