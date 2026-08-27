# 🍳 AnyMD Mixtmoji Kitchen Chrome Extension

An elegant, client-side, local-first browser extension for compiling beautiful text combinations of kaomojis and emojis into custom mashup expressions, injecting them directly into page inputs, and shipping them straight to **AnyMD** or your serverless **n8n database pipeline** [cite: 7, 79, 340].

---

## ✨ Features
* **Double-Bowl Mixer System**: Combine your favorite text-based kaomojis and standard visual emojis [cite: 7].
* **Responsive Styling Frames**: Choose from Sandwich `✨(=^.^=)✨`, Left-Sided, Right-Sided, or Sparkle-Bubble framing layouts.
* **1-Click Text Field Caret Injection**: Programmatically injects your baked mixtures straight into the active text caret on whatever tab you are browsing [cite: 79].
* **LocalStorage Sticky Preferences**: Selected themes, custom selectors, and active frames save instantly inside browser scopes [cite: 43].
* **Kawaiian Brutalist Styling**: A desaturated-pastel, high-density retro layout honoring strict design guidelines (0px border radius, clear text outputs, solid 2px borders) [cite: 14].

---

## 🛠️ Step-by-Step Installation

Because this is an open-source, local-first utility, you do not need to download it from the official Chrome Web Store:

1. Download the files in this directory (**`manifest.json`**, **`anymd-mixtmoji-popup.html`**, **`anymd-mixtmoji-popup.js`**, **`anymd-mixtmoji-content.js`**) to a local directory on your PC (e.g., `C:\Users\lorik\Documents\anymd-mixtmoji-kitchen\`).
2. Open your Google Chrome browser and navigate to the extensions control page:
   `chrome://extensions/`
3. In the top-right corner of the Extensions dashboard, toggle **Developer Mode** to **ON**.
4. In the top-left corner, click **Load unpacked**.
5. Select the folder containing your unpacked files. The extension will compile instantly and add itself to your active toolbar list!

---

## 📡 Integrating with n8n & AnyMD

* **AnyMD Local Ingress (Port 3050)**: Ensure your local `vault-webhook-server` is running [cite: 7]. Clicking the **⚡ Ship to AnyMD** button will dispatch a JSON payload containing the mixtmoji text, timestamp, and the title and URL of the webpage you are currently viewing [cite: 7].
* **Cloud Serverless n8n Integration**: If you have n8n running on your local machine, Termux, or a remote VPS, clicking the **Forward to n8n** button shoots your baked payload straight to your configured Webhook Receiver, committing the record directly to your GitHub repository folder [cite: 339, 340]!
