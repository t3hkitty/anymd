# 🐾 GitHubOnly n8n Service using AnyMD as a DB 🐾

```text
    /\_/\           🐾 nyaa~
   ( >.< )  _______
    > ^ <  /       \
   /     \|  meow!  |
  /  | |  | \_______/
  \_/ \_/ /
```

## 🌸 Overview
This project provides a **GitHub-only n8n service** that acts as a serverless, local-first database adapter. By forwarding webhooks through n8n directly to your target GitHub repository, it converts incoming payloads into standard **AnyMD** Markdown files with structured YAML frontmatter—storing your records securely, privately, and for free under standard Git version control.

---

## 🏛️ Architecture

```text
 [Client Webhook] ──► [n8n Webhook Node] ──► [Code Node (AnyMD Compiler)] ──► [GitHub Commit API]
```

1. **Webhook Ingestion**: Receives JSON metadata payloads.
2. **AnyMD Compiler**: Formats raw variables into frontmatter Markdown.
3. **GitHub Push Node**: Converts the compiled Markdown file to Base64 and commits it directly to the designated repository folder.

---

## 🚀 Setup Instructions

1. **Import Workflow**:
   * Open your n8n workspace dashboard.
   * Click **Add Workflow** ──► **Import from File**.
   * Select `n8n-githubonly-anymd-workflow.json`.

2. **Configure Credentials**:
   * Set up a GitHub OAuth2 credential or Personal Access Token (PAT) with `repo` permissions in n8n.
   * Attach it to the **Push to GitHub Repo** node.

3. **Trigger Webhook Test**:
   Send a `POST` request to the active webhook URL with the following JSON body payload:
   ```json
   {
     "owner": "your-github-username",
     "repository": "your-anymd-vault-repo",
     "vault": "sandbox_vault",
     "filename": "Zettel_20260825.md",
     "frontmatter": {
       "type": "journal_log",
       "title": "Cozy Evening",
       "tags": ["#lifeboat", "#journal"]
     },
     "content": "This is the body of the markdown record."
   }
   ```
