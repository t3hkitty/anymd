import React, { useState } from 'react';
import { X, Key, Shield, HelpCircle, HardDrive, Cpu, Palette, Sliders, Plus, Trash2, Globe } from 'lucide-react';
import type { PluginState, PluginId } from '../types/plugins';
import { DEFAULT_PLUGINS } from '../plugins/themeEnginePlugin';

const REPOS_STORAGE_KEY = 'lc_md_plugin_repos_v3';
const DEFAULT_REPOS = [
  'https://raw.githubusercontent.com/t3hkitty/anymd-plugins/main/repository.json',
  'https://raw.githubusercontent.com/anymd/public-plugins/main/repository.json',
  'https://plugins.anymd.app/registry.json'
];

function loadSavedRepos(): string[] {
  try {
    const raw = localStorage.getItem(REPOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load plugin repos:', err);
  }
  return DEFAULT_REPOS;
}

function saveRepos(repos: string[]): void {
  try {
    localStorage.setItem(REPOS_STORAGE_KEY, JSON.stringify(repos));
  } catch (err) {
    console.warn('Failed to save plugin repos:', err);
  }
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;

  // General Settings
  isLightMode: boolean;
  onLightModeChange: (val: boolean) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  themeStyleSet: string;
  onThemeStyleSetChange: (theme: string) => void;

  // AI & Integrations Settings
  geminiApiKey: string;
  onGeminiApiKeyChange: (key: string) => void;
  n8nEndpoint: string;
  onN8nEndpointChange: (url: string) => void;
  webhookType: 'anymd' | 'n8n';
  onWebhookTypeChange: (type: 'anymd' | 'n8n') => void;
  anymdWebhookEndpoint: string;
  onAnymdWebhookEndpointChange: (url: string) => void;

  // Vault Security Settings
  uiGuardEnabled: boolean;
  onUiGuardEnabledChange: (val: boolean) => void;
  uiGuardPin: string;
  onUiGuardPinChange: (pin: string) => void;

  // Sync / Storage Settings
  mobileLocalhostEnabled: boolean;
  onMobileLocalhostEnabledChange: (val: boolean) => void;
  vaultLoadSource: Record<string, string>;
  onVaultLoadSourceChange: (vaultId: string, source: string) => void;

  // Plugin System Props
  pluginState: PluginState;
  onTogglePlugin: (id: PluginId) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,

  isLightMode,
  onLightModeChange,
  accentColor,
  onAccentColorChange,
  themeStyleSet,
  onThemeStyleSetChange,

  geminiApiKey,
  onGeminiApiKeyChange,
  n8nEndpoint,
  onN8nEndpointChange,
  webhookType,
  onWebhookTypeChange,
  anymdWebhookEndpoint,
  onAnymdWebhookEndpointChange,

  uiGuardEnabled,
  onUiGuardEnabledChange,
  uiGuardPin,
  onUiGuardPinChange,

  mobileLocalhostEnabled,
  onMobileLocalhostEnabledChange,
  vaultLoadSource,
  onVaultLoadSourceChange,

  pluginState,
  onTogglePlugin,
}) => {
  const [pluginRepos, setPluginRepos] = useState<string[]>(loadSavedRepos);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddRepo = () => {
    const trimmed = newRepoUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setStatusMsg('Error: Must start with http:// or https://');
      return;
    }
    if (pluginRepos.includes(trimmed)) {
      setStatusMsg('Already exists.');
      return;
    }
    const updated = [trimmed, ...pluginRepos];
    setPluginRepos(updated);
    saveRepos(updated);
    setNewRepoUrl('');
    setStatusMsg('Success! Repository added.');
  };

  const handleRemoveRepo = (url: string) => {
    const updated = pluginRepos.filter(r => r !== url);
    setPluginRepos(updated);
    saveRepos(updated);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-neutral-950 border-l border-neutral-800 shadow-2xl z-50 flex flex-col font-mono text-xs text-neutral-300">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
        <h2 className="font-bold text-sm tracking-wide text-neutral-100 flex items-center space-x-2">
          <span>⚙️ anymd settings drawer</span>
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* General */}
        <section className="space-y-3">
          <h3 className="text-sky-400 font-bold border-b border-neutral-900 pb-1 flex items-center space-x-1.5">
            <Palette size={14} />
            <span>General & Aesthetics</span>
          </h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Light Mode</span>
              <input
                type="checkbox"
                checked={isLightMode}
                onChange={(e) => onLightModeChange(e.target.checked)}
                className="rounded border-neutral-800 bg-neutral-900 text-sky-500"
              />
            </label>
            <div>
              <span className="block mb-1">Theme Set</span>
              <select
                value={themeStyleSet}
                onChange={(e) => onThemeStyleSetChange(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
              >
                <option value="classic">Classic PKM Dark</option>
                <option value="dawn">Dawn Pastel Dream</option>
                <option value="piplup">Piplup Sea Breeze</option>
                <option value="cyberpunk">Cyber Neon</option>
              </select>
            </div>
            <div>
              <span className="block mb-1">Accent Color</span>
              <select
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
              >
                <option value="sky-500">Sky Blue</option>
                <option value="emerald-500">Emerald Green</option>
                <option value="indigo-500">Indigo Violet</option>
                <option value="amber-500">Amber Gold</option>
              </select>
            </div>
          </div>
        </section>

        {/* Plugins */}
        <section className="space-y-3">
          <h3 className="text-sky-400 font-bold border-b border-neutral-900 pb-1 flex items-center space-x-1.5">
            <Sliders size={14} />
            <span>Plugins ({DEFAULT_PLUGINS.length})</span>
          </h3>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {DEFAULT_PLUGINS.map((plugin) => (
              <label key={plugin.id} className="flex items-center justify-between cursor-pointer py-0.5">
                <span title={plugin.description} className="truncate pr-2">{plugin.name}</span>
                <input
                  type="checkbox"
                  checked={!!pluginState.enabledPlugins[plugin.id]}
                  onChange={() => onTogglePlugin(plugin.id)}
                  className="rounded border-neutral-800 bg-neutral-900 text-sky-500 shrink-0"
                />
              </label>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-900 space-y-2">
            <span className="block text-sky-400 font-bold flex items-center space-x-1">
              <Globe size={12} />
              <span>Plugin Repositories ({pluginRepos.length})</span>
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {pluginRepos.map((repo) => (
                <div key={repo} className="flex items-center justify-between bg-neutral-950 p-1 rounded border border-neutral-900">
                  <span className="truncate pr-2 text-[10px] text-neutral-400" title={repo}>{repo}</span>
                  <button onClick={() => handleRemoveRepo(repo)} className="text-red-400 hover:text-red-300 cursor-pointer shrink-0">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-1 pt-1">
              <input
                type="text"
                value={newRepoUrl}
                onChange={(e) => { setNewRepoUrl(e.target.value); setStatusMsg(null); }}
                placeholder="Add custom repository JSON URL..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none text-[10px]"
              />
              <button onClick={handleAddRepo} className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded cursor-pointer shrink-0">
                <Plus size={12} />
              </button>
            </div>
            {statusMsg && <span className="block text-[10px] text-amber-300">{statusMsg}</span>}
          </div>
        </section>

        {/* AI & Integrations */}
        <section className="space-y-3">
          <h3 className="text-sky-400 font-bold border-b border-neutral-900 pb-1 flex items-center space-x-1.5">
            <Cpu size={14} />
            <span>AI & Integrations</span>
          </h3>
          <div className="space-y-2">
            <div>
              <span className="block mb-1">Gemini API Key</span>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => onGeminiApiKeyChange(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
              />
            </div>
            <div>
              <span className="block mb-1">Webhook Dispatch Target</span>
              <select
                value={webhookType}
                onChange={(e) => onWebhookTypeChange(e.target.value as 'anymd' | 'n8n')}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
              >
                <option value="anymd">anymd Local Webhook (Port 3050)</option>
                <option value="n8n">n8n Webhook</option>
              </select>
            </div>
            {webhookType === 'anymd' ? (
              <div>
                <span className="block mb-1">anymd Webhook Endpoint URL</span>
                <input
                  type="text"
                  value={anymdWebhookEndpoint}
                  onChange={(e) => onAnymdWebhookEndpointChange(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block font-mono">
                  Use http://localhost:3050 for local, or http://&lt;lan-ip&gt;:3050 for mobile client access.
                </span>
              </div>
            ) : (
              <div>
                <span className="block mb-1">n8n Endpoint URL</span>
                <input
                  type="text"
                  value={n8nEndpoint}
                  onChange={(e) => onN8nEndpointChange(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                />
              </div>
            )}
          </div>
        </section>

        {/* Vault Security */}
        <section className="space-y-3">
          <h3 className="text-sky-400 font-bold border-b border-neutral-900 pb-1 flex items-center space-x-1.5">
            <Shield size={14} />
            <span>Vault Security (UI Guard)</span>
          </h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Enable Soft UI Guard Lock</span>
              <input
                type="checkbox"
                checked={uiGuardEnabled}
                onChange={(e) => onUiGuardEnabledChange(e.target.checked)}
                className="rounded border-neutral-800 bg-neutral-900 text-sky-500"
              />
            </label>
            <div>
              <span className="block mb-1">Numeric Guard PIN (4-6 digits)</span>
              <input
                type="text"
                value={uiGuardPin}
                onChange={(e) => onUiGuardPinChange(e.target.value)}
                maxLength={6}
                placeholder="1234"
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Sync & Storage */}
        <section className="space-y-3">
          <h3 className="text-sky-400 font-bold border-b border-neutral-900 pb-1 flex items-center space-x-1.5">
            <HardDrive size={14} />
            <span>Sync & Storage</span>
          </h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Mobile Localhost Relay</span>
              <input
                type="checkbox"
                checked={mobileLocalhostEnabled}
                onChange={(e) => onMobileLocalhostEnabledChange(e.target.checked)}
                className="rounded border-neutral-800 bg-neutral-900 text-sky-500"
              />
            </label>
            <div>
              <span className="block mb-1">Anymd Primary Source</span>
              <select
                value={vaultLoadSource['anymd-main'] || 'local_storage'}
                onChange={(e) => onVaultLoadSourceChange('anymd-main', e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
              >
                <option value="local_storage">Local Sandbox Storage</option>
                <option value="local_picker">Direct File System Folder</option>
                <option value="n8n_cloud">n8n Cloud Webhook</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
