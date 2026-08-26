import React, { useState, useEffect } from 'react';
import { 
  Database, Edit3, Users, Activity, PieChart, Layers, 
  FileText, X, Plus, Settings, Cloud, Palette, User, 
  Puzzle, ShieldOff, PenTool, Sparkles, FolderOpen, 
  HardDrive, Server, Zap, RefreshCw, Star 
} from 'lucide-react';
import { DynamicAtmosphericBackground } from '@lorik/shared-kawaii-ui';
import { MotivationHelperWidget } from './MotivationHelperWidget';
import { GeminiSparkPluginModal } from './GeminiSparkPluginModal';
import { PluginManagerModal } from './PluginManagerModal';
import { AddVaultModal } from './AddVaultModal';
import { loadSavedPluginState, savePluginState } from '../plugins/themeEnginePlugin';
import type { PluginState, PluginId } from '../types/plugins';

import { TopHeaderBar } from '../layout/TopHeaderBar';
import type { ModeType, SyncStatusType } from '../layout/TopHeaderBar';
import { VaultNavStrip } from '../layout/VaultNavStrip';
import type { CategoryType, VaultItem } from '../layout/VaultNavStrip';
import { MbbQuickActionZippy } from '../layout/MbbQuickActionZippy';
import { ViewSwitcherBar } from '../layout/ViewSwitcherBar';
import type { ViewLayoutType } from '../layout/ViewSwitcherBar';
import { MainContentViewport } from '../layout/MainContentViewport';
import { LeftIconRail } from '../layout/LeftIconRail';

// Settings drawer
import { SettingsDrawer } from '../settings/SettingsDrawer';
import { convertToObsidianVaultFormat } from '../plugins/obsidianNotionSyncPlugin';

// Security Guard
import { UiGuardOverlay } from '../security/UiGuardOverlay';

// Exporters
import { exportVaultToEncryptedZip } from '../export/zipVaultExporter';
import { importVaultFromEncryptedZip } from '../export/zipVaultImporter';

// Community modal
import { CommunityShareModal } from '../community/CommunityShareModal';
import { SpatialRoutineDirectorModal } from './SpatialRoutineDirectorModal';
import { UnifiedImportStudioModal } from './UnifiedImportStudioModal';
import { CardScannerModal } from './CardScannerModal';
import { HomeInsuranceScannerModal } from './HomeInsuranceScannerModal';
import { VodImporterModal } from './VodImporterModal';
import { NovelUpdatesModal } from './NovelUpdatesModal';
import { AnnasArchiveImporterModal } from './AnnasArchiveImporterModal';
import { PASourcingModal } from './PASourcingModal';
import { BookmarkletModal } from './BookmarkletModal';
import { CalibreImportModal } from './CalibreImportModal';
import { VaultBackupRestoreModal } from './VaultBackupRestoreModal';
import { CommunityHubView } from './CommunityHubView';
import { Grid } from 'lucide-react';

// Sidebar bridge
import { sidebarBridge } from '../sync/sidebarBridge';

// Core Plugins
import {
  renderReadingMode,
  generateLitanyZettelTemplate,
  dispatchToN8n,
  parseTranscribedTextToBlockquote,
  sweepVaultNote,
  getKawaiiBadge
} from '../plugins/anymdCorePlugins';

type MainTab = 'vaults' | 'drafting' | 'inputs' | 'processed' | 'all' | 'settings';
type VaultId = string;


interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
  handle?: FileSystemFileHandle;
  n8nContent?: string;
}

const getAsciiThumbnail = (filename: string): string => {
  const name = filename.toLowerCase();
  if (name.includes('heart') || name.includes('pulse') || name.includes('health') || name.includes('fit')) {
    return `
   /\\  /\\
  /  \\/  \\
  \\      /   [PULSE]
   \\    /
    \\  /
     \\/
    `;
  }
  if (name.includes('traffic') || name.includes('car') || name.includes('delay') || name.includes('alarm')) {
    return `
     ______
    /|_||_\\\`.__
   (   _    _ _\\ [RADAR]
    \`-(_)--(_)-'
    `;
  }
  if (name.includes('spotify') || name.includes('music') || name.includes('song') || name.includes('skip')) {
    return `
     |\\  
     | \\ 
     |__\\    [MUSIC]
    (●.●)
    /|🐾|\\
    `;
  }
  if (name.includes('lore') || name.includes('story') || name.includes('magic') || name.includes('character') || name.includes('book')) {
    return `
      ______ ______
    _/      Y      \\_
   //  lore  | book  \\\\
  ((   n    | n     ))
   \\\\_______|_______//
    `;
  }
  return `
     /\\_/\\
    ( o.o )
     > ^ <   [NODE]
    `;
};

export const VaultWorkspaceLayout: React.FC = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<MainTab>(() => (localStorage.getItem('anymd_active_tab') as MainTab) || 'vaults');
  const [activeMode, setActiveMode] = useState<ModeType>('WORK');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Books');
  const [activeVault, setActiveVault] = useState<VaultId>(() => (localStorage.getItem('anymd_active_vault') as VaultId) || 'anymd-main');
  const [viewLayout, setViewLayout] = useState<ViewLayoutType>('Grid');

  // Dynamic vaults list
  const [vaultList, setVaultList] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('anymd_vault_list_dynamic');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'storycraft-lore', name: '📖 StoryCraft Lore', category: 'Books' },
      { id: 'calibre-local', name: '📚 Calibre Local Library', category: 'Books' },
      { id: 'anymd-main', name: '🐱 Anymd Primary', category: 'Journal Vaults' },
      { id: 'daily-bullet', name: '📝 Daily Bullet Journal', category: 'Journal Vaults' },
      { id: 'signalstack-discovery', name: '📡 SignalStack Discovery', category: 'Blueprints' },
      { id: 'system-specs', name: '⚙️ System Architect Specs', category: 'Blueprints' },
      { id: 'memory-sandbox', name: '🏖️ Memory Sandbox', category: 'Sandboxes' },
      { id: 'draft-playground', name: '🧪 Draft Playground', category: 'Sandboxes' },
    ];
  });

  // Save vault list to localStorage
  useEffect(() => {
    localStorage.setItem('anymd_vault_list_dynamic', JSON.stringify(vaultList));
  }, [vaultList]);

  // Drawer / Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGeminiSparkOpen, setIsGeminiSparkOpen] = useState(false);
  const [isPluginManagerOpen, setIsPluginManagerOpen] = useState(false);
  const [isAddVaultOpen, setIsAddVaultOpen] = useState(false);

  // Plugin state
  const [pluginState, setPluginState] = useState<PluginState>(loadSavedPluginState);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('synced');
  const [syncTime, setSyncTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // File system and vault state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [selectedFileMetadata, setSelectedFileMetadata] = useState<string>('');
  const [isEditingMode, setIsEditingMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [vaultFolders, setVaultFolders] = useState<Record<string, FileSystemDirectoryHandle | null>>(() => {
    const initial: Record<string, FileSystemDirectoryHandle | null> = {};
    // Seed default keys
    initial['anymd-main'] = null;
    initial['signalstack-discovery'] = null;
    initial['storycraft-lore'] = null;
    return initial;
  });

  const [vaultFiles, setVaultFiles] = useState<Record<string, VaultFile[]>>(() => {
    const initial: Record<string, VaultFile[]> = {};
    initial['anymd-main'] = [];
    initial['signalstack-discovery'] = [];
    initial['storycraft-lore'] = [];
    return initial;
  });
  
  const [vaultLoadSource, setVaultLoadSource] = useState<Record<string, 'local_picker' | 'n8n_cloud' | 'local_storage'>>(() => {
    try {
      const saved = localStorage.getItem('anymd_vault_load_sources');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'anymd-main': 'local_storage',
      'signalstack-discovery': 'local_storage',
      'storycraft-lore': 'local_storage'
    };
  });


  // Settings
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('anymd_light_mode') === 'true');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('anymd_accent_color') || 'sky-500');
  const [themeStyleSet, setThemeStyleSet] = useState(() => localStorage.getItem('anymd_theme_style_set') || 'classic');
  const [webhookType, setWebhookType] = useState<'anymd' | 'n8n'>(() => (localStorage.getItem('anymd_webhook_type') as 'anymd' | 'n8n') || 'anymd');
  const [anymdWebhookEndpoint, setAnymdWebhookEndpoint] = useState(() => localStorage.getItem('anymd_webhook_endpoint') || 'http://localhost:3050');
  const [n8nEndpoint, setN8nEndpoint] = useState(() => localStorage.getItem('anymd_n8n_endpoint') || 'http://localhost:5678/webhook/anymd-action');
  const [mobileLocalhostEnabled, setMobileLocalhostEnabled] = useState(() => localStorage.getItem('anymd_mobile_localhost_enabled') === 'true');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('anymd_gemini_api_key') || '');
  const [starredFiles, setStarredFiles] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('anymd_starred_files') || '{}');
    } catch {
      return {};
    }
  });

  // UI Guard Soft Lock state
  const [uiGuardEnabled, setUiGuardEnabled] = useState(() => localStorage.getItem('anymd_ui_guard_enabled') === 'true');
  const [uiGuardPin, setUiGuardPin] = useState(() => localStorage.getItem('anymd_ui_guard_pin') || '1234');
  const [isUiGuardLocked, setIsUiGuardLocked] = useState(true);

  // CRM Nodes state
  interface CharacterNode {
    name: string;
    role: string;
    rel: string;
    color: string;
    mentions: number;
    slugs: string[];
    notes: string;
  }
  const [characters, setCharacters] = useState<CharacterNode[]>(() => {
    try {
      const saved = localStorage.getItem('anymd_characters');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { name: "Lorik", role: "Protagonist", rel: "Self", color: "indigo", mentions: 24, slugs: ["[MC]", "[MC:eyes]"], notes: "Main character. Survived the first blackbox test." },
      { name: "Goblin Merchant", role: "NPC", rel: "Neutral", color: "emerald", mentions: 12, slugs: ["[NPC:merchant]", "[NPC:eyes]"], notes: "Sells cursed mint and other sidecar assets." },
      { name: "The Algorithm", role: "Antagonist", rel: "Hostile", color: "red", mentions: 45, slugs: ["[BOSS]", "[BOSS:telemetry]"], notes: "Spams requests. Rate limiter watches them." }
    ];
  });
  const [editingCharacter, setEditingCharacter] = useState<CharacterNode | null>(null);

  // Modals for All View and Import features
  const [isSpatialRoutineOpen, setIsSpatialRoutineOpen] = useState(false);
  const [isUnifiedImportOpen, setIsUnifiedImportOpen] = useState(false);
  const [isCardScannerOpen, setIsCardScannerOpen] = useState(false);
  const [isHomeInsuranceScannerOpen, setIsHomeInsuranceScannerOpen] = useState(false);
  const [isVodImporterOpen, setIsVodImporterOpen] = useState(false);
  const [isNovelUpdatesOpen, setIsNovelUpdatesOpen] = useState(false);
  const [isAnnasArchiveOpen, setIsAnnasArchiveOpen] = useState(false);
  const [isPASourcingOpen, setIsPASourcingOpen] = useState(false);
  const [isBookmarkletOpen, setIsBookmarkletOpen] = useState(false);
  const [isCalibreImportOpen, setIsCalibreImportOpen] = useState(false);
  const [isVaultRestoreOpen, setIsVaultRestoreOpen] = useState(false);
  const [isExportShareOpen, setIsExportShareOpen] = useState(false);
  const [showCommunityInline, setShowCommunityInline] = useState(false);

  // Synchronize bridge state changes
  useEffect(() => {
    sidebarBridge.setState({
      mode: activeMode,
      category: activeCategory,
      activeVault,
      viewLayout,
    });
  }, [activeMode, activeCategory, activeVault, viewLayout]);

  // Subscribe to external sidebar state updates
  useEffect(() => {
    const unsubscribe = sidebarBridge.subscribe((state) => {
      if (state.mode) setActiveMode(state.mode as ModeType);
      if (state.category) setActiveCategory(state.category as CategoryType);
      if (state.activeVault) setActiveVault(state.activeVault as VaultId);
      if (state.viewLayout) setViewLayout(state.viewLayout as ViewLayoutType);
    });
    return unsubscribe;
  }, []);

  // Save states to Local Storage
  useEffect(() => {
    localStorage.setItem('anymd_vault_load_sources', JSON.stringify(vaultLoadSource));
  }, [vaultLoadSource]);
  useEffect(() => {
    localStorage.setItem('anymd_webhook_type', webhookType);
  }, [webhookType]);
  useEffect(() => {
    localStorage.setItem('anymd_webhook_endpoint', anymdWebhookEndpoint);
  }, [anymdWebhookEndpoint]);
  useEffect(() => {
    localStorage.setItem('anymd_n8n_endpoint', n8nEndpoint);
  }, [n8nEndpoint]);
  useEffect(() => {
    localStorage.setItem('anymd_mobile_localhost_enabled', mobileLocalhostEnabled ? 'true' : 'false');
  }, [mobileLocalhostEnabled]);
  useEffect(() => {
    localStorage.setItem('anymd_gemini_api_key', geminiApiKey);
  }, [geminiApiKey]);
  useEffect(() => {
    localStorage.setItem('anymd_active_tab', activeTab);
  }, [activeTab]);
  useEffect(() => {
    localStorage.setItem('anymd_active_vault', activeVault);
  }, [activeVault]);
  useEffect(() => {
    localStorage.setItem('anymd_theme_style_set', themeStyleSet);
  }, [themeStyleSet]);
  useEffect(() => {
    localStorage.setItem('anymd_light_mode', String(isLightMode));
  }, [isLightMode]);
  useEffect(() => {
    localStorage.setItem('anymd_accent_color', accentColor);
  }, [accentColor]);
  useEffect(() => {
    localStorage.setItem('anymd_starred_files', JSON.stringify(starredFiles));
  }, [starredFiles]);
  useEffect(() => {
    localStorage.setItem('anymd_ui_guard_enabled', uiGuardEnabled ? 'true' : 'false');
  }, [uiGuardEnabled]);
  useEffect(() => {
    localStorage.setItem('anymd_ui_guard_pin', uiGuardPin);
  }, [uiGuardPin]);
  useEffect(() => {
    localStorage.setItem('anymd_characters', JSON.stringify(characters));
  }, [characters]);

  // Load handlers
  const loadVaultFromN8n = async (vaultId: VaultId) => {
    setIsRefreshing(true);
    setSyncStatus('syncing');
    try {
      const response = await fetch(n8nEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LIST_FILES', vaultId })
      });
      if (response.ok) {
        const data = await response.json();
        const files: VaultFile[] = (data.files || []).map((f: any) => ({
          name: f.name,
          snippet: f.snippet || (f.content ? f.content.slice(0, 100) : ''),
          lastModified: f.lastModified || new Date().toLocaleString(),
          n8nContent: f.content || ''
        }));
        setVaultFiles(prev => ({ ...prev, [vaultId]: files }));
        setSyncStatus('synced');
        setSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      setSyncStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadVaultFromLocalStorage = (vaultId: VaultId) => {
    const prefix = `anymd_file_${vaultId}_`;
    const files: VaultFile[] = [];
    let hasFiles = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        hasFiles = true;
        const name = key.slice(prefix.length);
        const text = localStorage.getItem(key) || '';
        files.push({
          name,
          snippet: text.slice(0, 100).replace(/[\r\n\t]+/g, ' '),
          lastModified: new Date().toLocaleString()
        });
      }
    }
    if (!hasFiles) {
      const name = 'Welcome.md';
      const content = `---\ntitle: Welcome to Anymd Local Sandbox\ntags: [tutorial]\n---\nHello! This file is stored in your Local Storage Sandbox.\nConfigure n8n or use directory picker to link physical folders!`;
      localStorage.setItem(`${prefix}${name}`, content);
      files.push({
        name,
        snippet: content.slice(0, 100).replace(/[\r\n\t]+/g, ' '),
        lastModified: new Date().toLocaleString()
      });
    }
    setVaultFiles(prev => ({ ...prev, [vaultId]: files }));
    setSyncStatus('local_only');
  };

  const loadVaultFolder = async (vaultId: VaultId, sourceOverride?: 'local_picker' | 'n8n_cloud' | 'local_storage') => {
    const source = sourceOverride || vaultLoadSource[vaultId];
    if (source === 'n8n_cloud') {
      await loadVaultFromN8n(vaultId);
      return;
    }
    if (source === 'local_storage') {
      loadVaultFromLocalStorage(vaultId);
      return;
    }
    try {
      const dirHandle = await window.showDirectoryPicker();
      const files: VaultFile[] = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
          const file = await entry.getFile();
          const text = await file.text();
          const snippet = text.slice(0, 100).replace(/[\r\n\t]+/g, ' ') + (text.length > 100 ? '...' : '');
          const lastModified = new Date(file.lastModified).toLocaleDateString() + ' ' + new Date(file.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          files.push({
            name: entry.name,
            snippet,
            lastModified,
            handle: entry
          });
        }
      }
      setVaultFolders(prev => ({ ...prev, [vaultId]: dirHandle }));
      setVaultFiles(prev => ({ ...prev, [vaultId]: files }));
      setSyncStatus('synced');
    } catch (err) {
      console.warn(err);
    }
  };

  const refreshVault = async (vaultId: VaultId) => {
    if (vaultLoadSource[vaultId] === 'n8n_cloud') {
      await loadVaultFromN8n(vaultId);
      return;
    }
    if (vaultLoadSource[vaultId] === 'local_storage') {
      loadVaultFromLocalStorage(vaultId);
      return;
    }
    const dirHandle = vaultFolders[vaultId];
    if (!dirHandle) return;
    setIsRefreshing(true);
    setSyncStatus('syncing');
    try {
      const files: VaultFile[] = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
          const file = await entry.getFile();
          const text = await file.text();
          const snippet = text.slice(0, 100).replace(/[\r\n\t]+/g, ' ') + (text.length > 100 ? '...' : '');
          const lastModified = new Date(file.lastModified).toLocaleDateString() + ' ' + new Date(file.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          files.push({
            name: entry.name,
            snippet,
            lastModified,
            handle: entry
          });
        }
      }
      setVaultFiles(prev => ({ ...prev, [vaultId]: files }));
      setSyncStatus('synced');
      setSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setSyncStatus('error');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleSelectFile = async (file: VaultFile) => {
    if (uiGuardEnabled && isUiGuardLocked) {
      // Keep UI Guard locked screen active
      return;
    }

    try {
      let text = '';
      if (vaultLoadSource[activeVault] === 'n8n_cloud') {
        if (file.n8nContent) {
          text = file.n8nContent;
        } else {
          const response = await fetch(n8nEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'GET_FILE', vaultId: activeVault, filename: file.name })
          });
          if (response.ok) {
            const data = await response.json();
            text = data.content || '';
          }
        }
      } else if (vaultLoadSource[activeVault] === 'local_storage') {
        text = localStorage.getItem(`anymd_file_${activeVault}_${file.name}`) || '';
      } else if (file.handle) {
        const fileData = await file.handle.getFile();
        text = await fileData.text();
      }
      setSelectedFile(file.name);
      
      const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (fmMatch) {
        setSelectedFileMetadata(fmMatch[1].trim());
        setSelectedFileContent(text.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim());
      } else {
        setSelectedFileMetadata(`title: ${file.name}\ntags: [unclassified]`);
        setSelectedFileContent(text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger loading sandbox folders on startup or activeVault swap
  useEffect(() => {
    if ((vaultFiles[activeVault] || []).length === 0) {
      const source = vaultLoadSource[activeVault] || 'local_storage';
      if (source === 'local_storage') {
        loadVaultFromLocalStorage(activeVault);
      }
    }
  }, [activeVault]);

  // MBB quick action callbacks
  const handleAddSamples = () => {
    const prefix = `anymd_file_${activeVault}_`;
    const samples = [
      { name: 'Character_Concept.md', content: '---\ntitle: Hero Idea\ntags: [mbb, design]\n---\nGoblin merchant sells mint and sidecars. He seems friendly but watch out!' },
      { name: 'Lower_Market.md', content: '---\ntitle: Setting Description\ntags: [mbb, setting]\n---\nThe air is thick with rain. Tents sell strange gadgets.' }
    ];
    samples.forEach(s => {
      localStorage.setItem(`${prefix}${s.name}`, s.content);
    });
    loadVaultFromLocalStorage(activeVault);
    alert('Added sample notes to local sandbox storage!');
  };

  const handlePurgeAll = () => {
    if (confirm('Are you sure you want to purge all sandbox notes for this vault?')) {
      const prefix = `anymd_file_${activeVault}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setVaultFiles(prev => ({ ...prev, [activeVault]: [] }));
      alert('Vault sandbox purged.');
    }
  };

  const handleExportZip = async () => {
    const filesToExport = (vaultFiles[activeVault] || []).map(f => {
      const storedContent = localStorage.getItem(`anymd_file_${activeVault}_${f.name}`) || f.n8nContent || f.snippet;
      return {
        name: f.name,
        content: storedContent
      };
    });
    
    const pin = prompt('Enter a 4-6 digit numeric PIN to encrypt the ZIP archive:', uiGuardPin) || uiGuardPin;
    try {
      const zipBlob = await exportVaultToEncryptedZip(filesToExport, pin);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anymd-vault-${activeVault}-${new Date().toISOString().slice(0,10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Export failed: ' + e.message);
    }
  };

  const handleDeployAgv = () => {
    alert('🚀 Initiating automated deploy sequence to Google Antigravity (AGV) sidecar relay...');
  };

  const handleCreateNewLitanyNote = () => {
    const title = prompt('Enter note title:', 'New Litany Note');
    if (!title) return;
    const cleanName = `${title.replace(/[^a-zA-Z0-9_\-]/g, '_')}.md`;
    const template = generateLitanyZettelTemplate(title, activeVault);
    localStorage.setItem(`anymd_file_${activeVault}_${cleanName}`, template);
    if (vaultLoadSource[activeVault] === 'local_storage') {
      loadVaultFromLocalStorage(activeVault);
    } else {
      alert('Note template initialized in local cache buffer! Mount local storage to write to disk.');
    }
  };

  const handleSweepNote = () => {
    const fullText = `---\n${selectedFileMetadata}\n---\n${selectedFileContent}`;
    const result = sweepVaultNote(fullText);
    const fmMatch = result.cleanedContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fmMatch) {
      const newMeta = fmMatch[1].trim();
      const newBody = result.cleanedContent.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
      setSelectedFileMetadata(newMeta);
      setSelectedFileContent(newBody);
      if (result.changesMade.length > 0) {
        alert(`🧹 Roomba Swept Note:\n- ${result.changesMade.join('\n- ')}`);
      } else {
        alert('🧹 Roomba: Note is already clean!');
      }
    }
  };

  const handleSendToWebhook = async () => {
    if (!selectedFile) return;

    if (webhookType === 'anymd') {
      const fullText = `---\n${selectedFileMetadata}\n---\n${selectedFileContent}`;
      try {
        const url = `${anymdWebhookEndpoint.endsWith('/') ? anymdWebhookEndpoint.slice(0, -1) : anymdWebhookEndpoint}/webhook/${encodeURIComponent(activeVault)}?filename=${encodeURIComponent(selectedFile)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: fullText, append: false })
        });
        if (response.ok) {
          alert('🔮 Webhook dispatched successfully to anymd local server!');
        } else {
          alert('❌ Failed to dispatch to anymd webhook. Server returned ' + response.status);
        }
      } catch (err: any) {
        alert('❌ Failed to dispatch to anymd webhook: ' + err.message);
      }
    } else {
      const metaObj: Record<string, string> = {};
      selectedFileMetadata.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          metaObj[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      });

      const success = await dispatchToN8n(metaObj, selectedFileContent);
      if (success) {
        alert('🔮 Webhook dispatched successfully to n8n!');
      } else {
        alert('❌ Failed to dispatch webhook to n8n. Defaulting to: ' + getN8nWebhookEndpoint());
      }
    }
  };

  const handleSaveFileContent = async (newMetadata: string, newBody: string) => {
    if (!selectedFile) return;
    const fullText = `---\n${newMetadata}\n---\n${newBody}`;
    if (vaultLoadSource[activeVault] === 'local_storage') {
      localStorage.setItem(`anymd_file_${activeVault}_${selectedFile}`, fullText);
      setSelectedFileMetadata(newMetadata);
      setSelectedFileContent(newBody);
      loadVaultFromLocalStorage(activeVault);
      alert('✓ Note saved successfully!');
    } else {
      // Fallback
      alert('✓ Written to cache buffer. Please commit to Git or sync with n8n.');
    }
  };

  const handleToggleStar = (filename: string) => {
    setStarredFiles(prev => ({ ...prev, [filename]: !prev[filename] }));
  };

  const handleAddVault = (vaultData: {
    id: string;
    name: string;
    category: string;
    storageType: 'local_storage' | 'local_picker' | 'n8n_cloud' | 'lcmd_personal' | 'lcmd_sandbox';
    dirHandle: FileSystemDirectoryHandle | null;
    endpointUrl: string;
  }) => {
    const newVaultItem: VaultItem = {
      id: vaultData.id,
      name: vaultData.name,
      category: vaultData.category as CategoryType
    };
    setVaultList(prev => [...prev, newVaultItem]);

    // Handle old lcmd format migration
    if (vaultData.storageType === 'lcmd_personal' || vaultData.storageType === 'lcmd_sandbox') {
      const key = vaultData.storageType === 'lcmd_personal' ? 'lc_md_books_personal_v3' : 'lc_md_books_sandbox_v3';
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsedBooks = JSON.parse(raw);
          if (Array.isArray(parsedBooks)) {
            parsedBooks.forEach((book: any) => {
              const fileContent = convertToObsidianVaultFormat(book, '');
              const fileName = `${book.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}.md`;
              localStorage.setItem(`anymd_file_${vaultData.id}_${fileName}`, fileContent);
            });
          }
        } catch (e) {
          console.error('Failed to import old lcmd vault:', e);
        }
      }
    }

    setVaultLoadSource(prev => ({
      ...prev,
      [vaultData.id]: (vaultData.storageType === 'lcmd_personal' || vaultData.storageType === 'lcmd_sandbox')
        ? 'local_storage'
        : vaultData.storageType
    }));

    if (vaultData.dirHandle) {
      setVaultFolders(prev => ({
        ...prev,
        [vaultData.id]: vaultData.dirHandle
      }));
    }

    if (vaultData.endpointUrl) {
      setN8nEndpoint(vaultData.endpointUrl);
    }

    setActiveCategory(vaultData.category as CategoryType);
    setActiveVault(vaultData.id);

    setVaultFiles(prev => ({
      ...prev,
      [vaultData.id]: []
    }));

    if (vaultData.storageType === 'local_storage') {
      loadVaultFromLocalStorage(vaultData.id);
    } else if (vaultData.storageType === 'local_picker' && vaultData.dirHandle) {
      setIsRefreshing(true);
      setSyncStatus('syncing');
      
      const scanDir = async () => {
        try {
          const files: VaultFile[] = [];
          for await (const entry of vaultData.dirHandle!.values()) {
            if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
              const file = await entry.getFile();
              const text = await file.text();
              const snippet = text.slice(0, 100).replace(/[\r\n\t]+/g, ' ') + (text.length > 100 ? '...' : '');
              const lastModified = new Date(file.lastModified).toLocaleDateString() + ' ' + new Date(file.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              files.push({
                name: entry.name,
                snippet,
                lastModified,
                handle: entry
              });
            }
          }
          setVaultFiles(prev => ({ ...prev, [vaultData.id]: files }));
          setSyncStatus('synced');
        } catch (err) {
          setSyncStatus('error');
        } finally {
          setIsRefreshing(false);
        }
      };
      scanDir();
    } else if (vaultData.storageType === 'n8n_cloud') {
      loadVaultFromN8n(vaultData.id);
    }
  };


  // Layout stylings
  const rootBg = isLightMode ? 'bg-neutral-100 text-neutral-900' : 'bg-transparent text-neutral-100';
  const headerBg = isLightMode ? 'border-neutral-300 bg-white/80' : 'border-neutral-800 bg-neutral-950/60';
  const panelBg = isLightMode ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-900 border-neutral-800';
  const panelInner = isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800/80';
  const textMuted = isLightMode ? 'text-neutral-500' : 'text-neutral-400';

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${rootBg}`}>
      <DynamicAtmosphericBackground themeStyleSet={themeStyleSet} />

      {/* Main leftrail */}
      <LeftIconRail 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab as MainTab);
          setSelectedFile(null);
        }}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        onTogglePlugins={() => setIsPluginManagerOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Master header */}
        <TopHeaderBar 
          activeMode={activeMode}
          onModeChange={setActiveMode}
          syncStatus={syncStatus}
          syncTime={syncTime}
          onManualRefresh={() => refreshVault(activeVault)}
          onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        />

        {/* Categories Strip */}
        <VaultNavStrip 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeVault={activeVault}
          onVaultChange={(vid) => {
            setActiveVault(vid);
            setSelectedFile(null);
          }}
          vaults={vaultList}
          onAddVaultClick={() => setIsAddVaultOpen(true)}
        />


        {/* MBB quick actions */}
        <MbbQuickActionZippy 
          onAddSamples={handleAddSamples}
          onPurgeAll={handlePurgeAll}
          onExportZip={handleExportZip}
          onDeployAgv={handleDeployAgv}
        />

        {/* Main tabs client view area */}
        <main className="flex-1 overflow-auto p-6 relative">
          {/* UI Guard lock overlay over content when active */}
          {uiGuardEnabled && isUiGuardLocked && activeTab === 'vaults' && (
            <UiGuardOverlay 
              isOpen={isUiGuardLocked}
              correctPin={uiGuardPin}
              onUnlock={() => setIsUiGuardLocked(false)}
              onBypass={() => {
                setUiGuardEnabled(false);
                setIsUiGuardLocked(false);
              }}
              onExternalOpen={() => {
                alert('Triggered Mock: shell.openPath for external editing of vault_settings.yaml');
              }}
            />
          )}

          {activeTab === 'vaults' && (
            <div className={`h-full flex flex-col border overflow-hidden ${panelBg}`}>
              {/* View Switcher bar */}
              <div className="flex justify-between items-center bg-neutral-900/40 border-b border-neutral-800 pr-4">
                <ViewSwitcherBar 
                  activeLayout={viewLayout}
                  onLayoutChange={setViewLayout}
                  noteCount={(vaultFiles[activeVault] || []).length}
                />
                <button
                  onClick={handleCreateNewLitanyNote}
                  className="px-3 py-1 bg-purple-900/50 hover:bg-purple-800 border border-purple-500/30 rounded-lg text-[10px] font-mono text-purple-200 transition-all flex items-center space-x-1"
                >
                  <span>🌸 + New Litany Note</span>
                </button>
              </div>

              {/* Central Viewport */}
              <div className="flex-1 overflow-y-auto">
                <MainContentViewport 
                  layout={viewLayout}
                  files={vaultFiles[activeVault] || []}
                  onSelectFile={handleSelectFile}
                  starredFiles={starredFiles}
                  onToggleStar={handleToggleStar}
                />
              </div>
            </div>
          )}

          {/* DRAFTING STUDIO */}
          {activeTab === 'drafting' && (
            <div className="h-full flex space-x-6">
              <div className={`flex-1 flex flex-col border overflow-hidden ${panelBg}`}>
                 <div className={`border-b p-4 shrink-0 flex flex-col space-y-3 ${panelInner}`}>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-bold flex items-center">
                       <FileText size={16} className={`mr-2 text-${accentColor}`} /> Chapter 12: The Goblin Market
                     </span>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                     <div className={`border border-emerald-500/50 rounded-xl p-3 flex flex-col relative overflow-hidden ${panelInner}`}>
                       <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1 flex items-center"><Sparkles size={10} className="mr-1"/> Micromanager Goal</span>
                       <span className="text-xs leading-relaxed">Decline the merchant's cursed mint offer and secure the exit route.</span>
                     </div>
                     <div className={`border border-indigo-500/50 rounded-xl p-3 flex flex-col relative overflow-hidden ${panelInner}`}>
                       <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-1 flex items-center"><Users size={10} className="mr-1"/> Required Cast</span>
                       <div className="text-xs font-mono flex flex-wrap gap-1 mt-1">
                         <span className="bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-500/30">Hero</span>
                         <span className="bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-500/30">Goblin Merchant</span>
                       </div>
                     </div>
                     <div className={`border border-amber-500/50 rounded-xl p-3 flex flex-col relative overflow-hidden ${panelInner}`}>
                       <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1 flex items-center"><Layers size={10} className="mr-1"/> Active Room / Stage</span>
                       <div className="text-xs font-mono mt-1">
                         <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">The Lower Market Tents</span>
                       </div>
                     </div>
                   </div>
                 </div>
                 <textarea 
                   className="flex-1 w-full bg-transparent p-8 font-serif text-lg leading-loose resize-none focus:outline-none text-neutral-200"
                   defaultValue="The air in the market was thick with the scent of ozone and crushed mint. He hesitated at the threshold, scanning the shifting crowds. A goblin merchant with obsidian eyes beckoned him closer."
                 />
              </div>
            </div>
          )}

          {/* TELEMETRY INPUTS */}
          {activeTab === 'inputs' && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto w-full">
              <div className={`border border-sky-500/30 shadow-xl w-full p-6 relative overflow-hidden ${panelBg}`}>
                 <h3 className="text-xl font-bold text-sky-400 mb-2 flex items-center"><Activity className="mr-2"/> Blackbox Microlog</h3>
                 <p className={`text-xs mb-6 ${textMuted}`}>Rapidly ingest thoughts, telemetry, or raw JSON.</p>
                 <textarea 
                   className={`w-full border rounded-xl p-4 focus:border-sky-500 outline-none h-32 resize-none mb-4 font-mono text-sm ${panelInner} text-neutral-200`} 
                   placeholder="Enter raw thought or data snippet..."
                   id="blackbox-input"
                 />
                 <div className="flex justify-between items-center">
                   <button 
                     onClick={() => {
                       const inputEl = document.getElementById('blackbox-input') as HTMLTextAreaElement;
                       if (!inputEl.value.trim()) return;
                       const list = document.getElementById('ingestions-list');
                       if (list) {
                         const newItem = document.createElement('div');
                         newItem.className = `p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm ${textMuted} border-l-2 border-l-sky-500 mb-3 animate-in fade-in slide-in-from-top-2`;
                         newItem.innerHTML = `"${inputEl.value}" <span class="text-xs text-neutral-600 ml-2">(Just now)</span>`;
                         list.prepend(newItem);
                       }
                       inputEl.value = '';
                     }} 
                     className="px-6 py-2 bg-sky-500/20 text-sky-400 font-bold rounded-xl transition-colors hover:bg-sky-500/30"
                   >
                     Ingest Data
                   </button>
                 </div>
              </div>
              
              <div className="w-full space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-widest pl-2 ${textMuted}`}>Recent Ingestions</h4>
                <div id="ingestions-list" className="space-y-3">
                  <div className={`p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm border-l-2 border-l-sky-500 ${textMuted}`}>
                    "Need to research local-first AI models." <span className="text-xs text-neutral-600 ml-2">(2 mins ago)</span>
                  </div>
                </div>
              </div>
              <MotivationHelperWidget />
            </div>
          )}

          {/* CRM PROCESSED */}
          {activeTab === 'processed' && (
            <div className={`h-full border overflow-hidden flex flex-col p-6 ${panelBg}`}>
               <div className="flex items-start justify-between mb-4 border-b border-neutral-800/40 pb-4 shrink-0">
                 <div>
                   <h3 className="text-lg font-bold text-sky-400 flex items-center"><Users className="mr-2"/> CRM & Node Manager</h3>
                   <p className={`text-xs mt-1 ${textMuted}`}>Click any character node to edit their attributes, bio notes, and custom touch slugs.</p>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-6 flex-1 overflow-auto pr-2 content-start">
                 {characters.map(char => (
                   <div 
                     key={char.name} 
                     onClick={() => setEditingCharacter({ ...char })}
                     className={`border border-${char.color}-500/30 rounded-xl p-4 flex flex-col cursor-pointer transition-all hover:scale-[1.02] hover:border-${char.color}-500 ${panelInner}`}
                   >
                     <div className="flex items-center space-x-3 mb-4">
                       <div className={`w-10 h-10 rounded-full bg-${char.color}-500/20 text-${char.color}-500 flex items-center justify-center`}>
                         <User size={20} />
                       </div>
                       <div>
                         <div className="font-bold">{char.name}</div>
                         <div className={`text-xs ${textMuted}`}>{char.role}</div>
                       </div>
                     </div>
                     
                     <div className="flex flex-wrap gap-1 mb-4">
                       {char.slugs.map(s => (
                         <span key={s} className="bg-neutral-900 border border-neutral-800 text-[10px] px-1.5 py-0.5 rounded font-mono text-amber-300">
                           {s}
                         </span>
                       ))}
                     </div>

                     <p className={`text-xs line-clamp-2 ${textMuted} italic mb-4 font-serif`}>
                       {char.notes || "No lore notes logged yet."}
                     </p>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* ALL VIEW / ONE-CLICK HUB */}
          {activeTab === 'all' && (
            <div className={`h-full border overflow-hidden flex flex-col p-6 ${panelBg}`}>
              <div className="flex items-start justify-between mb-4 border-b border-neutral-800/40 pb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-sky-400 flex items-center">
                    <Grid className="mr-2" size={18} />
                    <span>All Actions &amp; 1-Click Somatic/Import Hub</span>
                  </h3>
                  <p className={`text-xs mt-1 ${textMuted}`}>
                    Quick access to all AnyMD local tools, somatic calculators, import pipelines, and community resources.
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-auto space-y-6 pr-2">
                {/* 1. SOMATIC & ROUTINES */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    🚪 Somatic &amp; Spatial Routines
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🚪 Spatial Routine Director
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Run Morning Wake, Leaving House, or Bedtime step-by-step routines with TTS guides.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsSpatialRoutineOpen(true)}
                        className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 font-mono text-[10px] rounded transition-all w-full text-center"
                      >
                        Launch Routine Builder ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🍳 Fasting &amp; Nourishment
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Passively calculate metabolic rest intervals and access Dr. Fung HAES science.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('inputs');
                          setTimeout(() => {
                            const el = document.getElementById('nourishment-fasting-widget');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 font-mono text-[10px] rounded transition-all w-full text-center"
                      >
                        Open Fasting Widget ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🌸 Motivation Helper
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          AuDHD task planner, time management guides, and Grounded Reframe logs.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('inputs');
                          setTimeout(() => {
                            const el = document.getElementById('motivation-helper-widget');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 font-mono text-[10px] rounded transition-all w-full text-center"
                      >
                        Open Motivation Widget ➔
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. IMPORTERS & PIPELINES */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    📥 Ingestion &amp; Import pipelines
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          📥 Universal Import Studio
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Open the primary import dashboard for all media types and local folders.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsUnifiedImportOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Open Import Studio ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          📦 Restore ZIP Backup
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Upload and extract entire vault zip bundles directly back into local storage.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsVaultRestoreOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Restore Vault Backup ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          📚 Calibre Local Library
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Sync book ratings, reviews, and reading history from Calibre local vault formats.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsCalibreImportOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Import Calibre DB ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🏛️ Anna's Archive
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Search by ISBN-13 or MARC21 to index book lists directly to local markdown logs.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAnnasArchiveOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Import ISBN Details ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🃏 TCG Card Photo Scanner
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Import Pokemon, MtG, or Yu-Gi-Oh card listings from camera or image assets.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsCardScannerOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Launch Card Scanner ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          📸 Home Insurance Scanner
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Bulk import photo logs of rooms and item receipts to create catalog directories.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsHomeInsuranceScannerOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Launch Asset Scanner ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🎬 VOD &amp; Stream Importer
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Index Twitch/YouTube stream links and metadata with offline markdown cards.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsVodImporterOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Launch VOD Importer ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🌐 NovelUpdates Scraper
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Pull Danmei, webnovel chapters, and author logs from web pages.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsNovelUpdatesOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Launch Webnovel Scraper ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          📋 PA Grocery List
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Manage grocery items and wishlist sync pipelines.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsPASourcingOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Open Grocery Sourcing ➔
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🔌 Web Clipper Bookmarklet
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Configure drag-and-drop web page scraper bookmarklet tool.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsBookmarkletOpen(true)}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-[10px] rounded transition-all w-full text-center hover:scale-[1.01]"
                      >
                        Configure Bookmarklet ➔
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. VAULT MANAGER (INTEGRATED SETTINGS) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    ⚙️ Vault Manager &amp; Workspace Settings
                  </h4>
                  <div className={`p-6 rounded-xl border space-y-4 ${panelInner}`}>
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
                      <span className="font-bold text-slate-200 text-sm">Active Vaults Registry</span>
                      <button
                        onClick={() => setIsAddVaultOpen(true)}
                        className="px-3 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 font-mono text-[10px] rounded transition-all hover:scale-[1.02]"
                      >
                        + Create/Link New Vault
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {vaultList.map((v) => {
                        const currentSource = vaultLoadSource[v.id] || 'local_storage';
                        return (
                          <div key={v.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-900 gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-100">{v.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono block">
                                ID: {v.id} | Category: {v.category}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex flex-col">
                                <label className="text-[9px] text-neutral-500 font-mono uppercase">Connection Source</label>
                                <select
                                  value={currentSource}
                                  onChange={(e) => {
                                    const src = e.target.value as any;
                                    setVaultLoadSource(prev => ({ ...prev, [v.id]: src }));
                                    if (src === 'local_picker') {
                                      loadVaultFolder(v.id, 'local_picker');
                                    }
                                  }}
                                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 outline-none text-neutral-300"
                                >
                                  <option value="local_storage">Local Sandbox Storage</option>
                                  <option value="local_picker">Direct File System Folder</option>
                                  <option value="n8n_cloud">n8n Local Webhook Sync</option>
                                </select>
                              </div>

                              {v.id !== 'anymd-main' && v.id !== 'signalstack-discovery' && v.id !== 'storycraft-lore' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove vault workspace "${v.name}"?`)) {
                                      setVaultList(prev => prev.filter(item => item.id !== v.id));
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 font-mono text-[10px] mt-3"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. COMMUNITY & REPO */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    🌐 Community &amp; Public Repository
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="https://github.com/t3hkitty/anymd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-4 rounded-xl border flex flex-col justify-between hover:border-pink-500 hover:scale-[1.01] transition-all cursor-pointer ${panelInner}`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          🌸 visit Public GitHub Repo
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Access the open-source repository for anymd, download releases, and view updates.
                        </p>
                      </div>
                      <div className="text-pink-400 font-mono text-[10px] font-bold">
                        github.com/t3hkitty/anymd ➔
                      </div>
                    </a>

                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${panelInner}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
                          👥 Open Community Hub
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>
                          Explore community templates, custom sidecars, and share forum threads.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCommunityInline(!showCommunityInline)}
                        className="px-3 py-1.5 bg-pink-950 hover:bg-pink-900 border border-pink-800 text-pink-300 font-mono text-[10px] rounded transition-all w-full text-center"
                      >
                        {showCommunityInline ? 'Close Community Hub' : 'Open Community Hub'} ➔
                      </button>
                    </div>
                  </div>

                  {showCommunityInline && (
                    <div className="mt-4 p-4 border border-pink-500/20 rounded-xl bg-neutral-950/40">
                      <CommunityHubView
                        books={[]}
                        onImportSidecarTemplate={(templateMarkdown, title) => {
                          alert(`Imported template "${title}" successfully into sandbox buffer!`);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isLightMode={isLightMode}
        onLightModeChange={setIsLightMode}
        accentColor={accentColor}
        onAccentColorChange={setAccentColor}
        themeStyleSet={themeStyleSet}
        onThemeStyleSetChange={setThemeStyleSet}
        geminiApiKey={geminiApiKey}
        onGeminiApiKeyChange={setGeminiApiKey}
        n8nEndpoint={n8nEndpoint}
        onN8nEndpointChange={setN8nEndpoint}
        webhookType={webhookType}
        onWebhookTypeChange={setWebhookType}
        anymdWebhookEndpoint={anymdWebhookEndpoint}
        onAnymdWebhookEndpointChange={setAnymdWebhookEndpoint}
        uiGuardEnabled={uiGuardEnabled}
        onUiGuardEnabledChange={(val) => {
          setUiGuardEnabled(val);
          if (val) setIsUiGuardLocked(true);
        }}
        uiGuardPin={uiGuardPin}
        onUiGuardPinChange={setUiGuardPin}
        mobileLocalhostEnabled={mobileLocalhostEnabled}
        onMobileLocalhostEnabledChange={setMobileLocalhostEnabled}
        vaultLoadSource={vaultLoadSource}
        onVaultLoadSourceChange={(vid, src) => {
          setVaultLoadSource(prev => ({ ...prev, [vid]: src as any }));
          if (src === 'local_picker') {
            loadVaultFolder(vid, 'local_picker');
          }
        }}
        pluginState={pluginState}
        onTogglePlugin={(id) => {
          setPluginState(prev => {
            const next = {
              ...prev,
              enabledPlugins: {
                ...prev.enabledPlugins,
                [id]: !prev.enabledPlugins[id]
              }
            };
            savePluginState(next);
            return next;
          });
        }}
      />

      {/* Plugin Manager Modal */}
      <PluginManagerModal 
        isOpen={isPluginManagerOpen}
        pluginState={pluginState}
        onClose={() => setIsPluginManagerOpen(false)}
        onTogglePlugin={(id) => {
          setPluginState(prev => {
            const next = {
              ...prev,
              enabledPlugins: {
                ...prev.enabledPlugins,
                [id]: !prev.enabledPlugins[id]
              }
            };
            savePluginState(next);
            return next;
          });
        }}
        onUpdateRelLinkRoot={(newRoot) => {
          setPluginState(prev => {
            const next = { ...prev, relLinkRoot: newRoot };
            savePluginState(next);
            return next;
          });
        }}
        onUpdateLocalAccessMode={(mode) => {
          setPluginState(prev => {
            const next = { ...prev, localAccessMode: mode };
            savePluginState(next);
            return next;
          });
        }}
        onUpdateConfigStorageLocation={(loc) => {
          setPluginState(prev => {
            const next = { ...prev, configStorageLocation: loc };
            savePluginState(next);
            return next;
          });
        }}
      />

      {/* Add Vault Modal */}
      <AddVaultModal 
        isOpen={isAddVaultOpen}
        onClose={() => setIsAddVaultOpen(false)}
        onAddVault={handleAddVault}
      />

      {/* Somatic & Ingestion Modals */}
      <SpatialRoutineDirectorModal 
        isOpen={isSpatialRoutineOpen} 
        onClose={() => setIsSpatialRoutineOpen(false)} 
      />
      <UnifiedImportStudioModal 
        isOpen={isUnifiedImportOpen} 
        onClose={() => setIsUnifiedImportOpen(false)} 
        onImportBooks={() => alert('Universal Import processed successfully!')}
      />
      <CardScannerModal 
        isOpen={isCardScannerOpen} 
        onClose={() => setIsCardScannerOpen(false)} 
        onAutoGenerateVaultItems={() => alert('TCG items imported!')}
      />
      <HomeInsuranceScannerModal 
        isOpen={isHomeInsuranceScannerOpen} 
        onClose={() => setIsHomeInsuranceScannerOpen(false)} 
        onAutoGenerateVaultItems={() => alert('Photo assets cataloged!')}
      />
      <VodImporterModal 
        isOpen={isVodImporterOpen} 
        onClose={() => setIsVodImporterOpen(false)} 
        onImportVod={() => alert('VOD item indexed!')}
      />
      <NovelUpdatesModal 
        isOpen={isNovelUpdatesOpen} 
        book={{
          id: 'dummy-book',
          title: selectedFile || 'NovelUpdates metadata',
          author: 'Unknown Author',
          sidecarMarkdown: `---\ntitle: ${selectedFile || 'NovelUpdates metadata'}\ntags: []\n---\n`
        } as any}
        onClose={() => setIsNovelUpdatesOpen(false)} 
        onUpdateBookSidecar={() => {}}
      />
      <AnnasArchiveImporterModal 
        isOpen={isAnnasArchiveOpen} 
        activeBook={{
          id: 'dummy-book',
          title: selectedFile || 'Anna\'s Archive metadata',
          author: 'Unknown Author',
          sidecarMarkdown: `---\ntitle: ${selectedFile || 'Anna\'s Archive metadata'}\ntags: []\n---\n`
        } as any}
        onClose={() => setIsAnnasArchiveOpen(false)} 
        onInjectIsbnMetadata={() => {}}
      />
      <PASourcingModal 
        isOpen={isPASourcingOpen} 
        books={[]}
        mediaItems={[]}
        webdavConfig={{}}
        onClose={() => setIsPASourcingOpen(false)} 
      />
      <BookmarkletModal 
        isOpen={isBookmarkletOpen} 
        onClose={() => setIsBookmarkletOpen(false)} 
      />
      <CalibreImportModal 
        isOpen={isCalibreImportOpen} 
        relLinkRoot=""
        onClose={() => setIsCalibreImportOpen(false)} 
        onImportCalibreBooks={() => alert('Calibre library imported successfully!')}
      />
      <VaultBackupRestoreModal 
        isOpen={isVaultRestoreOpen} 
        onClose={() => setIsVaultRestoreOpen(false)} 
        onRestoreBooks={() => alert('Vault backup restored successfully!')}
        allBooks={[]}
      />


      {/* File Preview overlay */}
      {selectedFile && (() => {
        // Parse frontmatter tags and status for Kawaii Decorator
        const tagsMatch = selectedFileMetadata.match(/tags:\s*\[(.*?)\]/i);
        const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.replace(/[\[\]"']/g, '').trim()) : [];
        const statusMatch = selectedFileMetadata.match(/status:\s*(.*)$/m);
        const status = statusMatch ? statusMatch[1].trim() : 'ready';
        const typeMatch = selectedFileMetadata.match(/type:\s*(.*)$/m);
        const type = typeMatch ? typeMatch[1].trim() : 'reading_note';

        const rendered = renderReadingMode(selectedFileContent);

        return (
          <div className="absolute inset-0 z-50 bg-[#0A0A10]/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-6xl h-full flex flex-col shadow-2xl overflow-hidden border border-[#2E1A47] bg-[#1E1E2E]">
              {/* Header */}
              <header className="p-4 border-b border-[#2E1A47] bg-[#0E0E1B] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FileText className="text-[#E6E6FA] animate-pulse" size={20} />
                  <div>
                    <h3 className="font-bold font-mono text-xs text-[#E6E6FA]">{selectedFile}</h3>
                    <div className="flex gap-1.5 mt-1">
                      {/* Kawaii Badge status indicators */}
                      {(() => {
                        const badge = getKawaiiBadge(status, type);
                        return (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${badge.style}`}>
                            <span>{badge.emoji}</span>
                            <span>{badge.label}</span>
                          </span>
                        );
                      })()}
                      {tags.map(t => {
                        const tagBadge = getKawaiiBadge('', t);
                        return (
                          <span key={t} className={`px-2 py-0.5 rounded text-[10px] font-mono border ${tagBadge.style}`}>
                            {tagBadge.emoji} #{t}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Edit / Read Mode Toggles */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditingMode(false)}
                    className={`px-3 py-1 font-mono text-xs rounded transition-all border ${
                      !isEditingMode
                        ? 'bg-[#2E1A47] text-[#E6E6FA] border-[#2E1A47]'
                        : 'border-[#2E1A47] text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    📖 Reading Mode
                  </button>
                  <button
                    onClick={() => setIsEditingMode(true)}
                    className={`px-3 py-1 font-mono text-xs rounded transition-all border ${
                      isEditingMode
                        ? 'bg-[#2E1A47] text-[#E6E6FA] border-[#2E1A47]'
                        : 'border-[#2E1A47] text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    ✍️ Edit Mode
                  </button>
                  <button 
                    onClick={() => { setSelectedFile(null); setSelectedFileContent(''); setIsEditingMode(false); }} 
                    className="p-1.5 hover:bg-rose-950/40 text-rose-400 rounded transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </header>

              {/* Main Content Area */}
              <div className="flex-1 flex overflow-hidden">
                {isEditingMode ? (
                  /* EDIT MODE */
                  <div className="flex-1 flex flex-col p-6 space-y-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Metadata Editor */}
                      <div className="flex flex-col space-y-2 border border-[#2E1A47] p-4 rounded bg-[#0E0E1B]">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#E6E6FA] block">YAML Frontmatter</label>
                        <textarea
                          id="edit-metadata-area"
                          className="flex-1 w-full bg-neutral-950 p-3 font-mono text-[11px] text-[#E6E6FA] rounded border border-neutral-800 focus:border-[#2E1A47] focus:outline-none resize-none"
                          defaultValue={selectedFileMetadata}
                        />
                      </div>
                      {/* Body Editor */}
                      <div className="md:col-span-2 flex flex-col space-y-2 border border-[#2E1A47] p-4 rounded bg-[#0E0E1B]">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#E6E6FA] block">Markdown Body</label>
                        <textarea
                          id="edit-content-area"
                          className="flex-1 w-full bg-neutral-950 p-3 font-mono text-[11px] text-[#E6E6FA] rounded border border-neutral-800 focus:border-[#2E1A47] focus:outline-none resize-none"
                          defaultValue={selectedFileContent}
                        />
                      </div>
                    </div>

                    {/* Editor Toolbar */}
                    <div className="flex justify-between items-center bg-[#0E0E1B] p-3 border border-[#2E1A47] rounded">
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSweepNote}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[#E6E6FA] font-mono text-[10px] rounded transition-all"
                          title="Format metadata and clean note"
                        >
                          🍙 Roomba Sweep
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const meta = (document.getElementById('edit-metadata-area') as HTMLTextAreaElement)?.value || '';
                            const body = (document.getElementById('edit-content-area') as HTMLTextAreaElement)?.value || '';
                            handleSaveFileContent(meta, body);
                          }}
                          className="px-4 py-1.5 bg-[#2E1A47] hover:bg-indigo-900 text-[#E6E6FA] font-mono text-[10px] rounded border border-[#2E1A47] transition-all"
                        >
                          💾 Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* READING/LEARNING MODE */
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar Table of Contents */}
                    {rendered.toc.length > 0 && (
                      <aside className="w-64 border-r border-[#2E1A47] bg-[#0E0E1B] p-4 overflow-y-auto hidden md:block">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#E6E6FA] mb-3 border-b border-neutral-800 pb-1.5">Table of Contents</h4>
                        <ul className="space-y-1">
                          {rendered.toc.map((item, idx) => (
                            <li key={idx} style={{ paddingLeft: `${(item.level - 1) * 8}px` }}>
                              <a
                                href={`#${item.id}`}
                                className="text-[11px] font-mono text-neutral-400 hover:text-[#E6E6FA] transition-colors truncate block"
                              >
                                {item.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </aside>
                    )}

                    {/* Reading Canvas */}
                    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-6">
                      <h1 className="text-3xl font-extrabold text-[#E6E6FA] mb-6 border-b border-[#2E1A47] pb-4">
                        {selectedFile.replace('.md', '').replace(/_/g, ' ')}
                      </h1>
                      
                      {/* Rendered HTML */}
                      <div 
                        className="reading-mode-content prose prose-invert font-sans text-sm text-neutral-200 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: rendered.html }}
                      />

                      {/* Interactive Litany Action Bar */}
                      <div className="pt-6 border-t border-[#2E1A47] flex justify-between items-center">
                        <span className="text-[10px] font-mono text-neutral-500">
                          Reading via plugin-reading-mode
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSendToWebhook}
                            className="px-3 py-1.5 bg-[#2E1A47] hover:bg-indigo-900 border border-[#2E1A47] text-[#E6E6FA] font-mono text-[10px] rounded transition-all flex items-center space-x-1.5"
                          >
                            <span>🔮 Dispatch to n8n Webhook</span>
                          </button>
                          <button
                            onClick={() => setIsShareOpen(true)}
                            className="px-3 py-1.5 bg-[#2E1A47] hover:bg-indigo-900 border border-[#2E1A47] text-[#E6E6FA] font-mono text-[10px] rounded transition-all"
                          >
                            Publish to Community
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Community Share Modal */}
      <CommunityShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        fileName={selectedFile || ''}
        fileContent={selectedFileContent}
        onShareSuccess={() => alert('Published! Contributor info cached.')}
      />

      <GeminiSparkPluginModal isOpen={isGeminiSparkOpen} onClose={() => setIsGeminiSparkOpen(false)} />
    </div>
  );
};
