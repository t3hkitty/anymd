# 🌸 Library Companion MD (Anymd) Pages Web App 🌸

```text
    /\_/\           🐾 welcome to docs!
   ( >.< )  _______
    > ^ <  /       \
   /     \|  meow!  |
  /  | |  | \_______/
  \_/ \_/ /
```

## 🐾 Overview
This folder contains the self-contained static site bundle for **Library Companion MD (Anymd)** deployed via GitHub Pages. It functions as an offline-first single-page app and local database coordinator.

---

## 🚀 Quick Setup & Installation

### 1. Enable GitHub Pages
* Navigate to your repository settings on GitHub: **Settings** ──► **Pages**.
* Under **Build and deployment**, select **Deploy from a branch**.
* Choose `main` (or your active branch) and select the `/docs` folder.
* Click **Save**.

### 2. Integration with Local database (Port 3050)
* Ensure your local webhook receiver is running:
  ```bash
  node vault-webhook-server.cjs
  ```
* Web requests triggered from the Pages UI will automatically route to `http://localhost:3050` using [`anymd-adapter.js`](anymd-adapter.js).

### 3. Serverless n8n Sync Setup
* For browser-agnostic cloud synchronization, import the [`n8n-githubonly-anymd-workflow.json`](../01_applications_and_tools/n8n-githubonly-anymd/n8n-githubonly-anymd-workflow.json) into your n8n workspace.
* Route your webhook actions to save markdown records directly to your repository folder structure.
