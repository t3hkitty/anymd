// Content Script to mount the Universal Sidebar on any web page
(function() {
  const sidebarId = 'anymd-universal-sidebar-root';
  if (document.getElementById(sidebarId)) return;

  // Create Mount Node
  const mountNode = document.createElement('div');
  mountNode.id = sidebarId;
  document.body.appendChild(mountNode);

  // Sync state from chrome storage or local storage
  let state = {
    sidebarPosition: 'right',
    isCollapsed: false,
    themePalette: 'bubblegum'
  };

  function updateSidebarLayout() {
    mountNode.className = `anymd-bext-root ${state.sidebarPosition} ${state.isCollapsed ? 'collapsed' : 'expanded'}`;
    mountNode.style.position = 'fixed';
    mountNode.style.top = '0';
    mountNode.style.bottom = '0';
    mountNode.style.zIndex = '999999';
    mountNode.style.width = state.isCollapsed ? '60px' : '380px';
    mountNode.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    if (state.sidebarPosition === 'left') {
      mountNode.style.left = '0';
      mountNode.style.right = 'auto';
      mountNode.style.borderRight = '4px solid #f3e8ff';
      mountNode.style.borderLeft = 'none';
    } else {
      mountNode.style.right = '0';
      mountNode.style.left = 'auto';
      mountNode.style.borderLeft = '4px solid #f3e8ff';
      mountNode.style.borderRight = 'none';
    }
  }

  // Poll LocalStorage/Sync events for dynamic side swapping
  window.addEventListener('storage', (e) => {
    if (e.key === '@anymd/universal-sidebar-config' && e.newValue) {
      const parsed = JSON.parse(e.newValue);
      state.sidebarPosition = parsed.sidebarPosition;
      state.isCollapsed = parsed.isCollapsed;
      updateSidebarLayout();
    }
  });

  // Load Initial Configuration
  const saved = localStorage.getItem('@anymd/universal-sidebar-config');
  if (saved) {
    const parsed = JSON.parse(saved);
    state.sidebarPosition = parsed.sidebarPosition || 'right';
    state.isCollapsed = parsed.isCollapsed || false;
  }
  updateSidebarLayout();

  // Draw Chibi-style Frame
  mountNode.innerHTML = `
    <div style="background: #FFF5F7; height: 100%; display: flex; flex-col; font-family: sans-serif; border-radius: ${state.sidebarPosition === 'left' ? '0 32px 32px 0' : '32px 0 0 32px'}; overflow: hidden;">
      <div style="padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e9d5ff;">
        <span style="font-weight: 900; color: #611A24;">🌸 AnyMD Extension</span>
        <button id="anymd-toggle-side" style="padding: 6px 12px; background: #FF69B4; color: white; border: none; border-radius: 9999px; font-weight: bold; cursor: pointer;">
          ⇆ Swap Side
        </button>
      </div>
      <div style="padding: 24px; color: #611A24;">
        <p style="font-weight: bold;">Status: Active Gutter Feed</p>
        <p style="font-size: 13px;">This extension injects a universal, fully rounded companion sidebar to coordinate writing and reading.</p>
      </div>
    </div>
  `;

  document.getElementById('anymd-toggle-side').addEventListener('click', () => {
    state.sidebarPosition = state.sidebarPosition === 'right' ? 'left' : 'right';
    updateSidebarLayout();
    localStorage.setItem('@anymd/universal-sidebar-config', JSON.stringify(state));
  });
})();
