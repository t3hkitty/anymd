const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// --- RATE LIMITING / FAILSAFE SYSTEM ---
// We track requests to prevent botting or accidental spam loops
const rateLimits = new Map();
const MAX_REQUESTS_PER_MINUTE = 30; 
const SUSPENSION_TIME_MS = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, firstRequest: now, suspendedUntil: 0 });
    return { allowed: true };
  }

  const record = rateLimits.get(ip);

  // If currently suspended
  if (now < record.suspendedUntil) {
    return { allowed: false, reason: `Suspended for bot-like activity. Resumes at ${new Date(record.suspendedUntil).toLocaleTimeString()}` };
  }

  // Reset window if it's been a minute
  if (now - record.firstRequest > 60000) {
    record.count = 1;
    record.firstRequest = now;
    return { allowed: true };
  }

  // Increment and check
  record.count++;
  if (record.count > MAX_REQUESTS_PER_MINUTE) {
    record.suspendedUntil = now + SUSPENSION_TIME_MS;
    console.warn(`[SECURITY] 🚨 IP ${ip} exceeded webhook limits. Suspended for 5 minutes.`);
    return { allowed: false, reason: 'Too many requests. Failsafe triggered. Pausing access for 5 minutes.' };
  }

  return { allowed: true };
}

// A simple local server that receives webhooks and writes them as Markdown files into the Vault!
app.post('/webhook/:vaultName/:folder?', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Enforce Rate Limits
  const limitCheck = checkRateLimit(ip);
  if (!limitCheck.allowed) {
    return res.status(429).json({ error: limitCheck.reason });
  }

  const vaultName = req.params.vaultName;
  const folder = req.params.folder || '';
  
  // Basic security: don't allow directory traversal
  if (vaultName.includes('..') || folder.includes('..')) {
    return res.status(403).json({ error: 'Invalid path' });
  }

  // Define the base path for local testing
  const targetDir = path.join(__dirname, 'sandbox_vault', folder);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // If the user specifies a specific filename, we operate in APPEND mode to that file
  // Otherwise, we create a new timestamped file for every payload
  const customFilename = req.query.filename;
  const filename = customFilename ? (customFilename.endsWith('.md') ? customFilename : `${customFilename}.md`) : `webhook-entry-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  const filePath = path.join(targetDir, filename);

  // Extract content. Discord-style webhooks usually send { content: "..." }
  let content = req.body.content || req.body.text || JSON.stringify(req.body, null, 2);

  // Apply Prepend and Append from query parameters
  const prepend = req.query.prepend ? req.query.prepend + '\n' : '';
  const append = req.query.append ? '\n' + req.query.append : '';
  
  content = prepend + content + append;

  const frontmatter = `---
source: webhook
last_received_at: ${new Date().toISOString()}
---

`;

  if (customFilename && fs.existsSync(filePath)) {
    // APPEND MODE: Just add a couple newlines and the new content to the bottom of the file
    fs.appendFileSync(filePath, `\n\n${content}`);
    console.log(`[Webhook Received] Appended to ${filePath} (Count: ${rateLimits.get(ip).count}/${MAX_REQUESTS_PER_MINUTE})`);
  } else {
    // WRITE NEW FILE MODE
    const fullContent = frontmatter + content + '\n';
    fs.writeFileSync(filePath, fullContent);
    console.log(`[Webhook Received] Created new file ${filePath} (Count: ${rateLimits.get(ip).count}/${MAX_REQUESTS_PER_MINUTE})`);
  }
  
  res.status(200).json({ success: true, file: filePath });
});

const PORT = 3050;
app.listen(PORT, () => {
  console.log(`🪐 anymd Webhook Receiver listening on http://localhost:${PORT}`);
  console.log(`To expose to the internet, use: ngrok http ${PORT}`);
});
