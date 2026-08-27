// anymd-mixtmoji-content.js
// Listens for external trigger demands from background popup services and inserts text at caret.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "inject_text" && request.text) {
    const activeEl = document.activeElement;
    if (!activeEl) {
      sendResponse({ success: false, reason: "No active text field focused" });
      return;
    }

    if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      const value = activeEl.value;

      activeEl.value = value.substring(0, start) + request.text + value.substring(end);
      activeEl.selectionStart = activeEl.selectionEnd = start + request.text.length;

      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      sendResponse({ success: true });
      return;
    }

    if (activeEl.hasAttribute('contenteditable') || activeEl.contentEditable === 'true') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(request.text));
        sendResponse({ success: true });
        return;
      }
    }
    
    sendResponse({ success: false, reason: "Active element is not an editable field" });
  }
});
