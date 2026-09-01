/**
 * Zettelkasten ID: 20260826-1921
 * Project: @lorik/meow-mud-bext
 * Role: Service worker capturing text selections and routing to port 3050 webhooks [cite: 197]
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "meow-mud-selection-grab",
    title: "🐾 Send selection to Meow MUD",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "meow-mud-selection-grab" && info.selectionText) {
    sendSelectionToLocalNode(info.selectionText, tab.url, tab.title);
  }
});

async function sendSelectionToLocalNode(text, url, title) {
  // Query storage for custom sticky server endpoints [cite: 324]
  chrome.storage.local.get({
    anymd_webhook_url: "http://127.0.0.1:3050/webhook/device-vault",
    anymd_default_file: "inbox.md"
  }, async (settings) => {
    try {
      const payload = {
        title: `Web Grab: ${title}`,
        url: url,
        content: text,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(settings.anymd_webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log("[MeowMUD Bext] Grab routed successfully.");
      } else {
        console.warn("[MeowMUD Bext] Grab server returned error status:", response.status);
      }
    } catch (e) {
      console.error("[MeowMUD Bext] Failed connecting to local offline port 3050 daemon:", e);
    }
  });
}
