// anymd-mixtmoji-popup.js
// Logic, State, Modals, and Sync handler for the Mixtmoji Kitchen Extension

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const selectKaomoji = document.getElementById('select-kaomoji');
  const selectEmoji = document.getElementById('select-emoji');
  const selectFrame = document.getElementById('select-frame');
  const outputDisplay = document.getElementById('output-display');
  
  const btnCopy = document.getElementById('btn-copy');
  const btnInject = document.getElementById('btn-inject');
  const btnSyncAnymd = document.getElementById('btn-sync-anymd');
  const btnSyncN8n = document.getElementById('btn-sync-n8n');
  
  const btnFaq = document.getElementById('btn-faq');
  const btnChangelog = document.getElementById('btn-changelog');
  const btnCloseFaq = document.getElementById('btn-close-faq');
  const btnCloseChangelog = document.getElementById('btn-close-changelog');
  
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalFaq = document.getElementById('modal-faq');
  const modalChangelog = document.getElementById('modal-changelog');
  
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // --- Sticky Settings: load saved state from localStorage / chrome.storage ---
  const loadStickySettings = () => {
    chrome.storage.local.get(['mixtmoji_kaomoji', 'mixtmoji_emoji', 'mixtmoji_frame'], (items) => {
      if (items.mixtmoji_kaomoji) selectKaomoji.value = items.mixtmoji_kaomoji;
      if (items.mixtmoji_emoji) selectEmoji.value = items.mixtmoji_emoji;
      if (items.mixtmoji_frame) selectFrame.value = items.mixtmoji_frame;
      
      bakeMixtmoji();
    });
  };

  const persistSetting = (key, value) => {
    const data = {};
    data[key] = value;
    chrome.storage.local.set(data);
  };

  // --- Toast Notification Helper ---
  const showNotification = (message) => {
    toastText.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('opacity-100');
    
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      setTimeout(() => toast.classList.add('hidden'), 350);
    }, 2500);
  };

  // --- Mixing & Baking Core ---
  const bakeMixtmoji = () => {
    const kaomoji = selectKaomoji.value;
    const emoji = selectEmoji.value;
    const frame = selectFrame.value;
    let result = '';

    switch (frame) {
      case 'left':
        result = `${emoji} ${kaomoji}`;
        break;
      case 'right':
        result = `${kaomoji} ${emoji}`;
        break;
      case 'sparkle-bubble':
        result = `🫧 ${emoji} ${kaomoji} ${emoji} 🫧`;
        break;
      case 'sandwich':
      default:
        result = `${emoji}${kaomoji}${emoji}`;
        break;
    }

    outputDisplay.textContent = result;
  };

  // --- Event Listeners for Select Inputs ---
  selectKaomoji.addEventListener('change', (e) => {
    persistSetting('mixtmoji_kaomoji', e.target.value);
    bakeMixtmoji();
  });

  selectEmoji.addEventListener('change', (e) => {
    persistSetting('mixtmoji_emoji', e.target.value);
    bakeMixtmoji();
  });

  selectFrame.addEventListener('change', (e) => {
    persistSetting('mixtmoji_frame', e.target.value);
    bakeMixtmoji();
  });

  // --- Clipboard Action ---
  btnCopy.addEventListener('click', () => {
    const text = outputDisplay.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
      showNotification('📋 Copied to Clipboard!');
    });
  });

  // --- Web Page Text Caret Injection Action ---
  btnInject.addEventListener('click', async () => {
    const text = outputDisplay.textContent.trim();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showNotification('❌ No active tab found!');
      return;
    }

    // Execute script inside the active browser tab context
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToInsert) => {
        const activeEl = document.activeElement;
        if (!activeEl) return false;

        // Target normal input fields and textareas
        if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
          const start = activeEl.selectionStart;
          const end = activeEl.selectionEnd;
          const value = activeEl.value;
          
          activeEl.value = value.substring(0, start) + textToInsert + value.substring(end);
          activeEl.selectionStart = activeEl.selectionEnd = start + textToInsert.length;
          
          // Trigger standard input event so modern frameworks track changes
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        } 
        
        // Target contenteditable containers
        if (activeEl.hasAttribute('contenteditable') || activeEl.contentEditable === 'true') {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(textToInsert));
            return true;
          }
        }
        return false;
      },
      args: [text]
    }, (results) => {
      if (results && results[0] && results[0].result) {
        showNotification('📥 Injected successfully!');
      } else {
        showNotification('⚠️ Focus a text box on the page first!');
      }
    });
  });

  // --- AnyMD Express Sync API Ingress (Port 3050) ---
  btnSyncAnymd.addEventListener('click', async () => {
    const text = outputDisplay.textContent.trim();
    showNotification('⏳ Syncing to AnyMD...');

    const payload = {
      type: 'text',
      category: 'mixtmoji_bake',
      content: `Baked Mixtmoji Output: \`${text}\` • Logged dynamically from browser popup context.`,
      sourceTitle: 'AnyMD Mixtmoji Kitchen Extension',
      sourceUrl: 'chrome-extension://anymd-mixtmoji-kitchen'
    };

    try {
      const response = await fetch('http://localhost:3050/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('🚀 Synced to local AnyMD Inbox!');
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      showNotification('❌ Local port 3050 offline. Opening AnyMD...');
      setTimeout(() => {
        window.open('http://localhost:8080/anymd/', '_blank');
      }, 1200);
    }
  });

  // --- Cloud Serverless n8n Sync Pipeline ---
  btnSyncN8n.addEventListener('click', async () => {
    const text = outputDisplay.textContent.trim();
    showNotification('⏳ Shipping to n8n...');

    const payload = {
      title: `Baked Mixtmoji: ${text}`,
      content: `Custom emoji mashup baked on your device: \`${text}\``,
      category: 'mixtmoji',
      sourceUrl: 'chrome-extension://anymd-mixtmoji-kitchen'
    };

    try {
      const response = await fetch('http://localhost:5678/webhook/anymd-git-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('🚀 Sync successful! Pushed via n8n.');
      } else {
        throw new Error('n8n error');
      }
    } catch (err) {
      showNotification('❌ n8n sync offline. Check your server settings.');
    }
  });

  // --- Modals Mechanics (Toggle screens, Esc closing, clicking outside) ---
  const toggleModal = (modal, forceOpen = null) => {
    const shouldOpen = forceOpen !== null ? forceOpen : modal.classList.contains('hidden');
    if (shouldOpen) {
      modalBackdrop.classList.remove('hidden');
      modal.classList.remove('hidden');
    } else {
      modalBackdrop.classList.add('hidden');
      modal.classList.add('hidden');
    }
  };

  btnFaq.addEventListener('click', () => toggleModal(modalFaq, true));
  btnChangelog.addEventListener('click', () => toggleModal(modalChangelog, true));
  btnCloseFaq.addEventListener('click', () => toggleModal(modalFaq, false));
  btnCloseChangelog.addEventListener('click', () => toggleModal(modalChangelog, false));

  modalBackdrop.addEventListener('click', () => {
    toggleModal(modalFaq, false);
    toggleModal(modalChangelog, false);
  });

  // Keyboard shortcut for escaping active modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleModal(modalFaq, false);
      toggleModal(modalChangelog, false);
    }
  });

  // --- Run Initialization ---
  loadStickySettings();
});
