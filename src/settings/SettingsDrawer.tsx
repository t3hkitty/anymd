import React from 'react';
import { X, Key, Shield, HelpCircle, HardDrive, Cpu, Palette, Sliders } from 'lucide-react';
import type { PluginState, PluginId } from '../types/plugins';
import { DEFAULT_PLUGINS } from '../plugins/themeEnginePlugin';

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
  if (!isOpen) return null;

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
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
              <span className="block mb-1">n8n Endpoint URL</span>
              <input
                type="text"
                value={n8nEndpoint}
                onChange={(e) => onN8nEndpointChange(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
              />
            </div>
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
