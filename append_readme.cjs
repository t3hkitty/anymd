const fs = require('fs');

const appendText = `
---

## 📡 Local Webhook Generator & n8n Engine

Library Companion MD now ships with a complete local-first webhook receiver and a universal API gateway (\`n8nEngine\`), completely eliminating the need for complex, manual OAuth loops with proprietary platforms like IFTTT or Zapier.

### ⚙️ How it Works
1. **The Webhook Server**: Run \`node vault-webhook-server.cjs\` locally. This spins up a lightweight Express receiver that listens for incoming \`POST\` requests.
2. **The UI Generator**: Inside the app, open the **Vault Webhook Generator Widget**. It generates a secure, Discord-style Webhook URL (e.g. \`https://your-ngrok.app/webhook/sandbox_vault/inbox\`).
3. **The \`n8nEngine\`**: If you use [n8n](https://n8n.io/) to handle your API connectivity (like fetching Fitbit stats or Google Tasks), you can use the built-in \`n8nEngine\` in \`@lorik/shared-kawaii-ui\` to completely abstract away OAuth!

### 📝 Core Workflows & Scenarios
*   **The 500 Files Issue (Standard Mode)**: By default, sending a webhook creates a brand new timestamped markdown file in your vault (e.g. \`webhook-entry-12345.md\`). This is perfect for distinct notes or bookmarks. However, if you are streaming high-frequency data (like heart rate every 5 minutes), you'll end up with 500 files a day cluttering your vault!
*   **The 5000 Newlines Solution (Append Mode)**: To fix this, simply type a specific filename (e.g., \`HeartRate-Log.md\`) into the **Specific Filename (Append Mode)** input in the UI. The generator appends \`&filename=HeartRate-Log.md\` to your webhook URL. 
    *   *Result*: The server will now use \`fs.appendFileSync()\` to drop 5000 rapid-fire incoming payloads as neat newlines at the bottom of that *single* file! 
*   **Auto-Formatting**: Use the \`Prepend\` and \`Append\` fields to wrap incoming data in bold markdown tags or dividers before it ever touches your vault!

### 🚨 Security, Rate Limiting, & Developer TOS
Because this system bypasses traditional APIs to write directly to your local file system, it includes strict, Discord-style Developer TOS safeguards:
*   **The Disclaimer "Lock"**: The URL generator is hidden behind a mandatory red security screen in the UI. You must explicitly agree that *sharing this URL allows anyone with the link to drop malicious files into your vault.*
*   **The 5-Minute Failsafe**: The \`vault-webhook-server.cjs\` includes a strict in-memory IP rate limiter. If a malicious user gets your URL or a bot spams your endpoint with more than **30 requests per minute**, the server automatically returns a \`429 Too Many Requests\` error and **completely suspends that IP's access for exactly 5 minutes** to prevent botting loops or malicious payloads.
`;

fs.appendFileSync('README.md', appendText);
console.log('Appended to README!');
