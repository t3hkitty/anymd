# 🐾 meow-8n: GitHub-Only AnyMD Sync Service 🐾 (v3.0.0)

```text
    /\_/\           🐾 full serverless setup inside!
   ( >.< )  _______
    > ^ <  /       \
   /     \|  meow!  |
  /  | |  | \_______/
  \_/ \_/ /
```

## 🌸 Overview
This project provides a **GitHub-only AnyMD database sync adapter** utilizing **n8n** as a serverless backend pipeline [cite: 3]. By forwarding incoming webhooks (from your browser extensions, mobile devices, or external APIs) through n8n directly to your **AnyMD GitHub repository** (the repository hosting your static GitHub Pages site), it converts raw payloads into standard Markdown files with structured YAML frontmatter [cite: 340]. 

This allows you to store and serve your personal notes, clippers, and databases securely, privately, and completely free under Git version control, without paying for a cloud server [cite: 102, 124, 340]!

---

## 🚀 Step 1: Start n8n and Access the Dashboard (The Gateway)

Before configuring any database rules or syncing workflows, you must first have an active **n8n instance** running. Think of n8n as your background traffic controller [cite: 3]. While your **AnyMD static site runs for free on GitHub Pages** [cite: 31, 104], n8n acts as the translator that writes files into it [cite: 340].

Select your preferred n8n deployment environment from the options below:

### Option A: GitHub-Only Static Sync (Our Primary $0 Setup)
This is the recommended serverless approach for static deployments [cite: 35, 102].
* **The Concept**: Your AnyMD static dashboard is hosted completely for free on a **GitHub Pages repository** [cite: 31, 104]. n8n runs as a backend task queue on one of the devices below [cite: 339]. 
* **The Flow**: When you clip an article or save a note, n8n intercept the webhook [cite: 339], compiles it into a Base64-encoded Markdown file, and commits it directly to your repository folder using the secure **GitHub API** [cite: 340].
* **The Friction**: Because GitHub Pages is static, it **cannot host the n8n application process itself** [cite: 339]. This means your commits are updated *locally* or on a personal node, and pushing to GitHub triggers a static Jekyll build. This introduces a **15 to 45-second build delay** before fresh notes appear live in your AnyMD browser window [cite: 51, 340].

### Option B: Locally on your PC or Mac (Free & Interactive)
Best if your development computer is your primary workstation.
1. Make sure you have **Node.js** installed on your system.
2. Open PowerShell (Windows) or Terminal (Mac/Linux) and install n8n globally:
   ```bash
   npm install n8n -g
   ```
3. Start the server daemon:
   ```bash
   n8n start
   ```
4. **Access the Dashboard**: Once initialized, open your web browser and navigate to:
   👉 **`http://localhost:5678`**

### Option C: Locally on Android via Termux (Free & Always-On)
Perfect if you have an old Android device lying around that you don't mind leaving plugged in 24/7 as a quiet, low-power home server!
1. Download and install **Termux** from F-Droid.
2. Initialize Node, Git, and n8n dependencies:
   ```bash
   pkg update -y && pkg install -y nodejs-lts python build-essential git openssl
   npm install -g n8n pm2
   ```
3. Launch n8n as a background daemon utilizing PM2 process manager:
   ```bash
   pm2 start n8n --name "n8n-local" -- --tunnel=false
   ```
4. **Access the Dashboard**: Access your n8n interface on your local network by navigating to:
   👉 **`http://127.0.0.1:5678`** (or your phone's local IP address, e.g. `http://192.168.1.100:5678`)

### Option D: VPS / Cloud Instance (Remote 24/7 Access)
Best for uninterrupted Webhook URLs accessible from anywhere globally.
1. Spin up a lightweight VPS instance (such as Oracle Cloud Free Tier, DigitalOcean, or a cheap $3.50/month server).
2. Install Docker or PM2 and configure n8n to listen behind a secure domain proxy on port `5678`.

---

## 🏛️ "The Rest of the Owl" - Step-by-Step Setup Instructions

Once you have opened your **n8n Workspace Dashboard** (`http://localhost:5678`), complete this sequence to wire up the synchronization pipeline.

```text
  [Inbound Trigger] ────► [n8n Webhook] ────► [Base64 Parser] ────► [GitHub Repositories API]
                                                                              │ (Commit Push)
                                                                              ▼
                                                                     [GitHub Pages Rebuild]
                                                                              │ (30s Propagate)
                                                                              ▼
                                                                     [AnyMD Live Refresh]
```

### 🛠️ Step 2: Import the Sync Workflow File
1. Inside your active n8n Dashboard browser tab, complete the quick admin registration (if prompted on your first run).
2. Locate the **Workflows** category in the left sidebar and click **Add Workflow** (or click the **+** icon in the top right corner).
3. This opens your **Workspace Canvas**—a blank grid sheet where you build custom logic.
4. Click the **three horizontal dots `...`** in the top-right corner of the canvas panel.
5. Select **Import from File** from the dropdown menu.
6. Choose the **`n8n-githubonly-anymd-workflow-v3.json`** file included in this deployment bundle.
7. The pre-configured nodes (**Webhook Receiver**, **Parse & Format Markdown**, and **Push to GitHub Repo**) will instantly materialize on your screen.

---

### 🛠️ Step 3: Generate Your GitHub Personal Access Token (PAT)
For n8n to write commits and push files directly to your AnyMD GitHub repository, you must grant it a secure credential key:
1. Log in to your **GitHub Account**.
2. Click your profile avatar (top-right) and navigate to **Settings** ➔ **Developer Settings** (bottom of the left sidebar).
3. Select **Personal access tokens** ➔ **Tokens (classic)**.
4. Click **Generate new token** ➔ **Generate new token (classic)**.
5. Give your token an explicit name like `AnyMD-n8n-Workflow-Sync`.
6. Select the **`repo`** checkbox. This grants full control of private and public repositories (allowing file writes and commits) [cite: 340].
7. Scroll to the bottom and click **Generate token**.
8. **CRUCIAL**: Copy the token string immediately (`ghp_...`). It will be hidden permanently once you refresh the page!

---

### 🛠️ Step 4: Configure n8n Header Authentication
Now we must authenticate your n8n blocks so they can speak directly to GitHub's REST API:
1. Double-click the HTTP Request node labeled **"Push to GitHub Repo"** on your n8n canvas.
2. In its properties panel, look for **Authentication** and set it to **Generic Credential Type**.
3. Under **Generic Auth Type**, set the option to **Header Auth**.
4. In the **Credential** dropdown, select **Create New Credential**.
5. Configure your header credentials exactly as follows:
   * **Name**: `Authorization`
   * **Value**: `token ghp_YOUR_COPIED_GITHUB_TOKEN` *(Make sure to write the word "token", add a single space, and then paste your `ghp_` key!)*
6. Additionally, click **Add Header** under parameters and register your User Agent to prevent GitHub API rate limits:
   * **Name**: `User-Agent`
   * **Value**: `n8n-AnyMD-Sync-v3`
7. Click **Save** (top right) and close the credentials window.

---

### 🛠️ Step 5: Map Your Target Repository URL
Inside that same **"Push to GitHub Repo"** properties panel, we need to instruct n8n which repository to commit to:
1. Locate the **URL** text input block. It looks like this:
   `https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/contents/={{$json.filename}}`
2. Replace **`YOUR_GITHUB_USERNAME`** with your exact GitHub account username.
3. Replace **`YOUR_REPO_NAME`** with your exact AnyMD repository name (e.g., `anymd`).
4. Close the node settings panel.

---

### 🛠️ Step 6: Trigger Your First Test Sync
1. Click on the **Webhook Receiver** node at the left side of your canvas.
2. Under the *Webhook Path*, switch to the **Test URL** tab and copy the endpoint URL (it looks like `http://localhost:5678/webhook-test/anymd-git-sync`).
3. Click the red button labeled **Listen for Test Event** at the bottom.
4. Open your local PowerShell or terminal window and execute this test payload to send data to n8n:
   ```powershell
   Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook-test/anymd-git-sync" -ContentType "application/json" -Body '{"title": "Cozy Evening", "content": "This is a local note written to n8n!"}'
   ```
5. Check your n8n workflow canvas. The nodes will light up in green, indicating that your payload was successfully parsed, compiled into a Base64 string, and committed directly into your repository's `/Sidecars` folder!

---

### 🛠️ Step 7: Activate and Deploy 24/7
1. If your test run executes successfully, locate the **Active** toggle switch in the top-right corner of the n8n visual dashboard.
2. Flip the toggle from **Inactive** to **Active**.
3. **CRUCIAL**: For production environments (like browser extensions or mobile triggers), switch your endpoint URLs from the *Test URL* to your **Production URL** (which removes the `-test` parameter from the URL path, e.g. `http://localhost:5678/webhook/anymd-git-sync`).
4. Your serverless AnyMD static database pipeline is now fully armed!
