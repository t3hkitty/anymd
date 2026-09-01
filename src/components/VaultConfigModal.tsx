import React, { useState, useEffect } from 'react';
import { Settings, Folder, Palette, Check, X, HardDrive, Shield } from 'lucide-react';

export interface VaultConfig {
  id: string;
  name: string;
  mode: 'WORK' | 'PLAY' | 'PERSONAL' | 'STUDENT';
  folderHandle?: FileSystemDirectoryHandle | null;
  folderPath?: string;
  themeColor: string;
  chromaticInheritance: boolean;
}

export interface VaultConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaults?: VaultConfig[];
  activeVaultId?: string;
  onSaveVaultConfig?: (config: VaultConfig) => void;
}

const MODE_DEFAULTS: Record<VaultConfig['mode'], { color: string; label: string; icon: string }> = {
  WORK: { color: '#3B82F6', label: 'WORK', icon: '💼' },
  PLAY: { color: '#EC4899', label: 'PLAY', icon: '🎮' },
  PERSONAL: { color: '#10B981', label: 'PERSONAL', icon: '🌸' },
  STUDENT: { color: '#8B5CF6', label: 'STUDENT', icon: '🎓' }
};

export const VaultConfigModal: React.FC<VaultConfigModalProps> = ({
  isOpen,
  onClose,
  vaults = [],
  activeVaultId = 'default_vault',
  onSaveVaultConfig
}) => {
  const [selectedMode, setSelectedMode] = useState<VaultConfig['mode']>('PERSONAL');
  const [vaultName, setVaultName] = useState<string>('My Kawaii Vault');
  const [directoryPath, setDirectoryPath] = useState<string>('');
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [themeColor, setThemeColor] = useState<string>('#EC4899');
  const [chromaticInheritance, setChromaticInheritance] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem(`anymd_vault_config_${activeVaultId}`);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setSelectedMode(parsed.mode || 'PERSONAL');
        setVaultName(parsed.name || 'My Kawaii Vault');
        setDirectoryPath(parsed.folderPath || '');
        setThemeColor(parsed.themeColor || MODE_DEFAULTS[parsed.mode as VaultConfig['mode']]?.color || '#EC4899');
        setChromaticInheritance(parsed.chromaticInheritance ?? true);
      } catch (e) {
        console.error("Failed to parse saved vault config", e);
      }
    }
  }, [activeVaultId, isOpen]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: VaultConfig['mode']) => {
    setSelectedMode(mode);
    setThemeColor(MODE_DEFAULTS[mode].color);
  };

  const handlePickDirectory = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
        setDirectoryHandle(handle);
        setDirectoryPath(handle.name);
        setToast(`Bound folder: ${handle.name}`);
        setTimeout(() => setToast(null), 3000);
      } else {
        alert('File System Access API (showDirectoryPicker) is not supported in this browser environment. Using fallback dynamic config variable.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error selecting directory handle:', err);
      }
    }
  };

  const handleSave = () => {
    const config: VaultConfig = {
      id: activeVaultId,
      name: vaultName,
      mode: selectedMode,
      folderHandle: directoryHandle,
      folderPath: directoryPath,
      themeColor,
      chromaticInheritance
    };

    localStorage.setItem(`anymd_vault_config_${activeVaultId}`, JSON.stringify({
      id: config.id,
      name: config.name,
      mode: config.mode,
      folderPath: config.folderPath,
      themeColor: config.themeColor,
      chromaticInheritance: config.chromaticInheritance
    }));

    if (onSaveVaultConfig) {
      onSaveVaultConfig(config);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl p-6 flex flex-col gap-5 text-slate-100 animate-fadeIn"
        style={{ borderRadius: '32px', boxShadow: '4px 4px 0px #000' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide flex items-center gap-2">
                Vault Configuration 🐾
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Local directory handle binding &amp; chromatic inheritance
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Vault Mode Preset
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['WORK', 'PLAY', 'PERSONAL', 'STUDENT'] as VaultConfig['mode'][]).map((mode) => {
              const info = MODE_DEFAULTS[mode];
              const isSelected = selectedMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSelectMode(mode)}
                  className={`py-2 px-1 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                  style={{
                    boxShadow: isSelected ? `2px 2px 0px ${info.color}` : 'none'
                  }}
                >
                  <span className="text-sm">{info.icon}</span>
                  <span>[{info.label}]</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vault Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Vault Label / Identifier
          </label>
          <input
            type="text"
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs px-3.5 py-2.5 rounded-2xl focus:border-indigo-500 focus:outline-none text-white font-medium"
            placeholder="E.g. Personal Story Vault"
          />
        </div>

        {/* Local Directory Binding via File System Access API */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center justify-between">
            <span>Local Directory Handle (FSA API)</span>
            <span className="text-[10px] text-emerald-400 font-mono">Zero-Cloud Flat File</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={directoryPath || 'No directory bound (browser RAM mode)'}
              className="bg-slate-950 border border-slate-800 text-xs px-3.5 py-2.5 rounded-2xl flex-grow font-mono text-slate-300 select-all"
            />
            <button
              type="button"
              onClick={handlePickDirectory}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-2xl text-indigo-300 flex items-center gap-1.5 transition-all shadow-sm"
              style={{ boxShadow: '2px 2px 0px #000' }}
            >
              <Folder className="w-4 h-4" />
              <span>Bind Directory</span>
            </button>
          </div>
        </div>

        {/* Visual Theme & Chromatic Inheritance */}
        <div className="flex flex-col gap-3 bg-slate-950/60 p-3.5 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Chromatic Inheritance</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={chromaticInheritance}
                onChange={(e) => setChromaticInheritance(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 font-mono">Accent Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-7 h-7 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-300">{themeColor}</span>
            </div>
          </div>
        </div>

        {toast && (
          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-center">
            {toast}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-2xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md"
            style={{ boxShadow: '2px 2px 0px #000' }}
          >
            <Check className="w-4 h-4" />
            <span>Save Vault Config</span>
          </button>
        </div>
      </div>
    </div>
  );
};
