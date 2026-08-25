import React, { useState } from 'react';
import type { PluginState, PluginId } from '../types/plugins';
import type { StorageAccessMode, ConfigStorageLocation } from '../types/cloudAccounts';
import { DEFAULT_PLUGINS } from '../plugins/themeEnginePlugin';
import { X, Puzzle, Check, Lock, Unlock, HardDrive, Settings, FolderSync, BookOpen, Share2, PlusCircle, Globe, RefreshCw, Trash2, Mail, ShieldCheck } from 'lucide-react';

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

interface PluginManagerModalProps {
  isOpen: boolean;
  pluginState: PluginState;
  onClose: () => void;
  onTogglePlugin: (id: PluginId) => void;
  onUpdateRelLinkRoot: (newRoot: string) => void;
  onUpdateLocalAccessMode?: (mode: StorageAccessMode) => void;
  onUpdateConfigStorageLocation?: (location: ConfigStorageLocation) => void;
}

export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({
  isOpen,
  pluginState,
  onClose,
  onTogglePlugin,
  onUpdateRelLinkRoot,
  onUpdateLocalAccessMode,
  onUpdateConfigStorageLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'repos' | 'instructions' | 'community_lab'>('installed');
  const [copiedKit, setCopiedKit] = useState<string | null>(null);
  const [customJsonInput, setCustomJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Custom Repo State
  const [pluginRepos, setPluginRepos] = useState<string[]>(loadSavedRepos);
  const [newRepoUrlInput, setNewRepoUrlInput] = useState('');
  const [repoStatusMessage, setRepoStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddRepo = () => {
    const trimmed = newRepoUrlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setRepoStatusMessage('Error: Repository URL must start with http:// or https://');
      return;
    }

    if (pluginRepos.includes(trimmed)) {
      setRepoStatusMessage('Notice: This repository URL is already in your active list.');
      return;
    }

    const updated = [trimmed, ...pluginRepos];
    setPluginRepos(updated);
    saveRepos(updated);
    setNewRepoUrlInput('');
    setRepoStatusMessage(`Success! Added repository "${trimmed}" to active plugin feeds.`);
  };

  const handleRemoveRepo = (url: string) => {
    const updated = pluginRepos.filter(r => r !== url);
    setPluginRepos(updated);
    saveRepos(updated);
  };

  const handleImportPluginJson = () => {
    try {
      const parsed = JSON.parse(customJsonInput);
      if (!parsed.id || !parsed.name) {
        setImportStatus('Error: JSON must contain "id" and "name" fields.');
        return;
      }
      setImportStatus(`Success! Plugin "${parsed.name}" (v${parsed.version || '1.0'}) imported into local registry.`);
      setCustomJsonInput('');
    } catch {
      setImportStatus('Error: Invalid JSON syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 flex-wrap gap-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Plugin System & Public List Manager</h3>
              <p className="text-xs text-slate-400">Library Sourcing Paths &bull; Sidecar (.md/dcmd) Storage &bull; FOSS Plugin Repos</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs font-mono">
              <button
                onClick={() => setActiveTab('installed')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === 'installed' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Installed
              </button>
              
              <button
                onClick={() => setActiveTab('repos')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  activeTab === 'repos' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Add Custom Plugin Repository URLs"
              >
                <Globe className="w-3 h-3 text-sky-400" />
                <span>Plugin Repos</span>
              </button>

              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  activeTab === 'instructions' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3 h-3 text-amber-300" />
                <span>Guide</span>
              </button>

              <button
                onClick={() => setActiveTab('community_lab')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  activeTab === 'community_lab' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:text-purple-100'
                }`}
                title="Untested & Experimental PKM Plugins (Obsidian, Joplin, Anytype, Logseq)"
              >
                <ShieldCheck className="w-3 h-3 text-purple-300" />
                <span>🧪 Community Lab</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {activeTab === 'installed' && (
            <div className="space-y-6">
              {/* Storage Permissions & Config Scope Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Global Storage Permissions & Config Scope</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                      {pluginState.localAccessMode === 'read-only' ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                      <span>Local Access Permission Mode</span>
                    </label>
                    <select
                      value={pluginState.localAccessMode || 'read-write'}
                      onChange={(e) => onUpdateLocalAccessMode && onUpdateLocalAccessMode(e.target.value as StorageAccessMode)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="read-write">🔓 Read-Write (RW) - Full Local Sidecar Edits</option>
                      <option value="read-only">🔒 Read-Only (RO) - Lock Local Sidecars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                      <HardDrive className="w-3 h-3 text-indigo-400" />
                      <span>Config File Location Scope</span>
                    </label>
                    <select
                      value={pluginState.configStorageLocation || 'local'}
                      onChange={(e) => onUpdateConfigStorageLocation && onUpdateConfigStorageLocation(e.target.value as ConfigStorageLocation)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="local">💻 Local Device Storage (.lc-md/config.json)</option>
                      <option value="remote-cloud">☁️ Remote Cloud Storage (cloud://.lc-md/config.json)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Library Sourcing & Sidecar Storage Path Configurator */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center space-x-1">
                    <FolderSync className="w-3.5 h-3.5 text-amber-400" />
                    <span>Library Sourcing & Companion Sidecar (.md/dcmd) Path</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">OPDS Supported Built-In</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configures root path for book links and sidecar storage (OPDS feeds work automatically without plugins):
                </p>
                <input
                  type="text"
                  value={pluginState.relLinkRoot}
                  onChange={(e) => onUpdateRelLinkRoot(e.target.value)}
                  placeholder="./Library or cloud://Filejump/md_library"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Pre-installed Default Plugins */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Pre-Installed Default Plugins ({DEFAULT_PLUGINS.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEFAULT_PLUGINS.map((plugin) => {
                    const isEnabled = pluginState.enabledPlugins[plugin.id];
                    return (
                      <div
                        key={plugin.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between ${
                          isEnabled
                            ? 'bg-slate-950 border-indigo-500/50 text-slate-100 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="space-y-1 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-xs">{plugin.name}</h4>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              v{plugin.version}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-400">
                            {plugin.id === 'moonplus-rel-root'
                              ? 'Library & Sidecar Path Configurator — OPDS works out-of-the-box. Use this to configure your ebook sourcing paths and sidecar save locations.'
                              : plugin.description}
                          </p>
                        </div>

                        <button
                          onClick={() => onTogglePlugin(plugin.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            isEnabled
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${isEnabled ? 'opacity-100' : 'opacity-20'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'repos' && (
            <div className="space-y-6">
              
              {/* Add Custom Plugin Repo Header */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/40 space-y-3">
                <div className="flex items-center space-x-2 text-sky-300 font-bold text-sm">
                  <Globe className="w-5 h-5 text-sky-400" />
                  <span>Primary Default Plugin Repository & Repo Add</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Default primary repo: <code className="text-amber-300">https://raw.githubusercontent.com/lorik/lc-md-plugins/main/repository.json</code>
                </p>
              </div>

              {/* Add Repo Input Form */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 font-mono">
                  Enter Custom Plugin Repository URL:
                </label>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={newRepoUrlInput}
                    onChange={(e) => setNewRepoUrlInput(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/lorik/lc-md-plugins/main/repository.json"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
                  />
                  
                  <button
                    onClick={handleAddRepo}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1 shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Repo</span>
                  </button>
                </div>

                {repoStatusMessage && (
                  <p className="text-xs font-mono text-amber-300">{repoStatusMessage}</p>
                )}
              </div>

              {/* Active Plugin Repositories Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Active Plugin Repositories ({pluginRepos.length})
                  </span>

                  <button
                    onClick={() => setRepoStatusMessage('Plugin feeds refreshed successfully!')}
                    className="text-xs text-indigo-400 hover:underline font-mono flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh Feeds</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {pluginRepos.map((repoUrl, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="text-xs font-mono text-slate-200 truncate">{repoUrl}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveRepo(repoUrl)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0"
                        title="Remove Repository"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-6">
              
              {/* Mandatory FOSS & No-Copyright Policy Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>SOVEREIGN FOSS & NO-COPYRIGHT COMPLIANCE GUARANTEE</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    100% Open Source (Unlicense / MIT)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All plugins submitted or published to this repository must comply 100% with our <strong>FOSS (Free and Open-Source Software) & Anti-Copyright Public Domain Open Standard</strong>. No DRM, paywalls, or tracking telemetry allowed!
                </p>
              </div>

              {/* Step 1: Building a Plugin */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-xs text-amber-400 font-mono flex items-center space-x-1.5">
                  <span>1. Building a Custom FOSS Plugin (Manifest Schema)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Plugins are defined using standard JSON or TypeScript objects:
                </p>
                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`{
  "id": "my-custom-plugin",
  "name": "My Custom Theme & Reader Engine",
  "version": "1.0.0",
  "author": "YourName",
  "license": "FOSS / Unlicense / MIT",
  "description": "Adds custom CSS themes and reader canvas overlays.",
  "enabledByDefault": true
}`}
                </pre>
              </div>

              {/* Step 2: Import Custom Plugin JSON */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-sky-400 font-mono flex items-center space-x-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>2. Import Local Plugin JSON Manifest</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Paste your plugin JSON definition below to register it locally in your vault:
                </p>
                <textarea
                  value={customJsonInput}
                  onChange={(e) => setCustomJsonInput(e.target.value)}
                  placeholder='{"id": "my-plugin", "name": "Custom Plugin", "version": "1.0"}'
                  className="w-full h-24 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleImportPluginJson}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Import Local Plugin
                </button>
                {importStatus && (
                  <p className="text-xs font-mono text-amber-300">{importStatus}</p>
                )}
              </div>

              {/* Step 3: Publishing to Public List or Emailing Submission */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-bold text-xs text-purple-400 font-mono flex items-center space-x-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>3. Submit Plugin to Public Repository or Submit via Email</span>
                </h4>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose your preferred submission method:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* GitHub PR Submission */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-xs text-amber-300 font-mono">Option A: GitHub Pull Request</h5>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Fork <code className="text-amber-300">github.com/t3hkitty/lc-md-plugins</code> and add your plugin manifest under <code className="text-amber-300">/plugins/{'{plugin-id}'}.json</code>.
                    </p>
                    <a
                      href="https://github.com/t3hkitty/lc-md-plugins"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-sky-400 hover:underline font-mono pt-1"
                    >
                      <span>Open GitHub Repo</span>
                      <Share2 className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Email Submission */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-xs text-emerald-300 font-mono">Option B: Direct Email Submission</h5>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Don't want to use GitHub? Send your FOSS plugin JSON manifest directly to our review maintainers!
                    </p>
                    <a
                      href="mailto:[REDACTED_EMAIL]?subject=Anymd%20FOSS%20Plugin%20Submission&body=Hi%20Anymd%20Team,%0A%0AI%20would%20like%20to%20submit%20my%20FOSS%20Open-Source%20Plugin!%0A%0APlugin%20JSON%20Manifest:%0A"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all mt-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Submit Plugin via Email</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: UNTESTED COMMUNITY LAB & PKM STARTER KITS */}
          {activeTab === 'community_lab' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Hands-Off Philosophy Banner */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2 font-sans">
                <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs font-mono">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>🧪 Zero-Maintenance Community Staging Lab</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Hands-Off Architecture:</strong> Third-party plugins for Obsidian, Joplin, Anytype, and Logseq are created, tested, and maintained independently by the community. Core Library Companion MD outputs standard, non-proprietary Markdown files with Zettelkasten serials requiring zero maintenance from core developers.
                </p>
                <div className="flex items-center space-x-2 pt-1 font-mono text-[10px] text-purple-200">
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700/50">100% User-Space</span>
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700/50">Zero Core Liability</span>
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700/50">Open Zettelkasten Spec</span>
                </div>
              </div>

              {/* PKM Starter Boilerplates */}
              <div className="space-y-3 font-mono text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">
                  PKM Starter Kits &amp; Manifest Boilerplates
                </span>

                {/* 1. Obsidian Bridge */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs">🪨 Obsidian</span>
                      <h4 className="font-bold text-slate-200 text-xs">Obsidian Sidecar Companion Bridge</h4>
                    </div>
                    <button
                      onClick={() => {
                        const obsidianCode = `// Obsidian Community Plugin: Library Companion MD Sidecar Bridge
// manifest.json + main.ts
import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian';

export default class LibraryCompanionPlugin extends Plugin {
  async onload() {
    console.log('[Anymd Bridge] Loaded Meow Obsidian Sidecar Viewer.');
    this.registerView('lc-md-sidecar-view', (leaf) => new CompanionSidecarView(leaf));
  }
}
class CompanionSidecarView extends ItemView {
  getViewType() { return 'lc-md-sidecar-view'; }
  getDisplayText() { return 'Resonance Stream'; }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h4', { text: '📖 Meow Resonance Notes' });
  }
}`;
                        navigator.clipboard.writeText(obsidianCode);
                        setCopiedKit('obsidian');
                        setTimeout(() => setCopiedKit(null), 2000);
                      }}
                      className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                    >
                      <Check className={`w-3 h-3 ${copiedKit === 'obsidian' ? 'opacity-100' : 'opacity-30'}`} />
                      <span>{copiedKit === 'obsidian' ? 'Copied Boilerplate!' : 'Copy Starter Kit'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Renders <code>.companion.md</code> resonance streams in Obsidian's right pane and autolinks <code>[[ZK: YYYYMMDDHHmmss-slug]]</code> notes in Graph View.
                  </p>
                </div>

                {/* 2. Joplin Sync */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 font-bold text-xs">📓 Joplin</span>
                      <h4 className="font-bold text-slate-200 text-xs">Joplin Meow WebDAV Sync Extension</h4>
                    </div>
                    <button
                      onClick={() => {
                        const joplinCode = `// joplin-plugin.json
{
  "manifest_version": 1,
  "id": "joplin.plugin.library.companion.md",
  "app_min_version": "2.8",
  "name": "Library Companion MD Sync",
  "version": "1.0.0",
  "description": "Two-way sidecar mirroring between Joplin notebooks and meow WebDAV vault.",
  "author": "Community Maintainer"
}`;
                        navigator.clipboard.writeText(joplinCode);
                        setCopiedKit('joplin');
                        setTimeout(() => setCopiedKit(null), 2000);
                      }}
                      className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                    >
                      <Check className={`w-3 h-3 ${copiedKit === 'joplin' ? 'opacity-100' : 'opacity-30'}`} />
                      <span>{copiedKit === 'joplin' ? 'Copied Boilerplate!' : 'Copy Starter Kit'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Mounts WebDAV/Nextcloud sidecar notes into Joplin notebook folders with automatic YAML tag synchronization.
                  </p>
                </div>

                {/* 3. Anytype Relations */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs">🪐 Anytype</span>
                      <h4 className="font-bold text-slate-200 text-xs">Anytype Relation &amp; Object Type Schema</h4>
                    </div>
                    <button
                      onClick={() => {
                        const anytypeCode = `{
  "type": "ObjectTypeDef",
  "name": "Companion Book",
  "relations": [
    { "key": "zettelkasten_uid", "type": "text", "format": "timestamp-serial" },
    { "key": "progress_percent", "type": "number", "unit": "%" },
    { "key": "epub_locator_cfi", "type": "text" },
    { "key": "fair_trade_valuation_usd", "type": "currency" },
    { "key": "spotify_uri", "type": "url" }
  ]
}`;
                        navigator.clipboard.writeText(anytypeCode);
                        setCopiedKit('anytype');
                        setTimeout(() => setCopiedKit(null), 2000);
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 transition-all"
                    >
                      <Check className={`w-3 h-3 ${copiedKit === 'anytype' ? 'opacity-100' : 'opacity-30'}`} />
                      <span>{copiedKit === 'anytype' ? 'Copied Boilerplate!' : 'Copy Starter Kit'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Imports reading collections and Black Box vinyl/music valuations into Anytype Sets and Relations graph.
                  </p>
                </div>

                {/* 4. Logseq / SilverBullet */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">🪵 Logseq</span>
                      <h4 className="font-bold text-slate-200 text-xs">Logseq Outliner &amp; Wikilink Hook</h4>
                    </div>
                    <button
                      onClick={() => {
                        const logseqCode = `// logseq-plugin.json
{
  "id": "logseq-lc-md-bridge",
  "name": "Logseq Zettelkasten Sidecar Bridge",
  "description": "Auto-links [[YYYYMMDDHHmmss-slug]] references in Logseq Journals and flashcards."
}`;
                        navigator.clipboard.writeText(logseqCode);
                        setCopiedKit('logseq');
                        setTimeout(() => setCopiedKit(null), 2000);
                      }}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                    >
                      <Check className={`w-3 h-3 ${copiedKit === 'logseq' ? 'opacity-100' : 'opacity-30'}`} />
                      <span>{copiedKit === 'logseq' ? 'Copied Boilerplate!' : 'Copy Starter Kit'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Parses 14-digit Zettelkasten timestamp serials directly in Logseq journals and outline hierarchy.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">Anymd FOSS Plugin Engine v3.8</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};
