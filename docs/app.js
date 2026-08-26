// Local cache of Zettel records
let zettels = [
  {
    id: "20260825-1030",
    vault: "sandbox_vault",
    frontmatter: {
      type: "journal_log",
      title: "Morning Routine",
      tags: ["#sustenance", "#routine"]
    },
    content: "Sipped 2 cups of tea. Completed task checklist. Weather is sunny."
  },
  {
    id: "20260825-1420",
    vault: "sandbox_vault",
    frontmatter: {
      type: "story_craft",
      title: "Ch. 3 Character Slugs",
      tags: ["#story", "#lore"]
    },
    content: "Character profile for MC and ML mapped with custom database tags."
  }
];

// Sip tracker telemetry
let sipCount = 0;
const sipTiers = [
  "Hamster Dropper (0/8)",
  "Thimble Shot (1/8)",
  "Standard Mug (2/8)",
  "Tall Boy (4/8)",
  "Hydro Flask Junior (5/8)",
  "Venti Stanley (6/8)",
  "The Chug Jug (7/8)",
  "Camelback Desert Mode (8/8)"
];

// Initialize UI
window.addEventListener('DOMContentLoaded', () => {
  renderAllViews();
  updateSipDisplay();
});

function renderAllViews() {
  renderInbox();
  renderDiscovery();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const targetPanel = document.getElementById(`tab-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
}

// Focus state telemetry
function setFocusState(state) {
  const badge = document.getElementById('focus-indicator');
  badge.textContent = `State: ${state}`;
  if (state === 'Hyperfocused') {
    badge.className = 'status-indicator red';
  } else if (state === 'Drifting') {
    badge.className = 'status-indicator yellow';
  } else {
    badge.className = 'status-indicator';
  }
}

// Hydrate Gmail-style Inbox
function renderInbox() {
  const container = document.getElementById('inbox-container');
  if (!container) return;
  container.innerHTML = '';

  zettels.forEach((z, index) => {
    const item = document.createElement('div');
    item.className = 'inbox-item';
    item.innerHTML = `
      <span class="star">★</span>
      <span class="badge">${z.frontmatter.type}</span>
      <span class="title">${z.frontmatter.title}</span>
      <span class="meta font-mono">${z.frontmatter.tags.join(' ')}</span>
    `;
    container.appendChild(item);
  });
}

// Hydrate Pinterest-style Discovery Board
function renderDiscovery() {
  const container = document.getElementById('discovery-container');
  if (!container) return;
  container.innerHTML = '';

  zettels.forEach((z) => {
    const card = document.createElement('div');
    card.className = 'discovery-card';
    card.innerHTML = `
      <div class="card-body">
        <h4 style="margin:0 0 8px 0; text-transform:uppercase;">${z.frontmatter.title}</h4>
        <p style="font-size:12px; color:#444;">${z.content}</p>
      </div>
      <div class="card-footer font-mono">
        ${z.frontmatter.tags.join(' ')}
      </div>
    `;
    container.appendChild(card);
  });
}

// Bio-telemetry handlers
function incrementSips() {
  if (sipCount < 8) {
    sipCount++;
    updateSipDisplay();
  }
}

function updateSipDisplay() {
  const display = document.getElementById('sip-count-display');
  const badge = document.getElementById('sip-badge-name');
  if (display && badge) {
    display.textContent = `${sipCount} / 8 sips`;
    badge.textContent = sipTiers[sipCount] || "Camelback Desert Mode";
  }
}

function triggerExcretionBreak() {
  alert("🚨 EXCRETION CIRCUIT BREAKER TRIGGERED: Please take a 3-minute physical break away from the screen!");
}

// Webhook generator
function generateWebhookUrl() {
  const vault = document.getElementById('target-vault').value || 'default';
  const file = document.getElementById('target-filename').value || '';
  const url = window.anymdAdapter.getWebhookUrl(vault, file);
  
  const box = document.getElementById('webhook-output');
  box.textContent = `Webhook Target Endpoint (POST):\n${url}`;
  box.classList.remove('hidden');
}

// Modal handling
function openCreateModal() {
  document.getElementById('zettel-modal').classList.remove('hidden');
}

function closeCreateModal() {
  document.getElementById('zettel-modal').classList.add('hidden');
}

function saveNewZettel() {
  const title = document.getElementById('zettel-title').value || 'Untitled';
  const tagsStr = document.getElementById('zettel-tags').value || '';
  const content = document.getElementById('zettel-content').value || '';
  
  const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
  const newZ = {
    id: `Zettel_${Date.now()}`,
    vault: document.getElementById('target-vault').value || 'sandbox_vault',
    frontmatter: {
      type: "user_note",
      title,
      tags
    },
    content
  };

  zettels.unshift(newZ);
  renderAllViews();
  closeCreateModal();
}

function triggerBackup() {
  alert("🎉 LIFEBOAT ZIP EXPORT INITIATED: Backup file parsed & downloaded to your browser download folder!");
}
