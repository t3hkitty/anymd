import React, { useState, useEffect } from 'react';
import { Settings, Folder, Palette, Check, X, HardDrive, Cloud, Server, Shield, RefreshCw } from 'lucide-react';
import { StorageSyncMode, FolderRoleMapping, RcloneCloudSyncDriver } from '../core/rclone_cloud_sync';

export interface VaultConfig {
  id: string;
  name: string;
  mode: 'WORK' | 'PLAY' | 'PERSONAL' | 'STUDENT';
  folderHandle?: FileSystemDirectoryHandle | null;
  folderPath?: string;
  themeColor: string;
  chromaticInheritance: boolean;
  // Storage & rclone sync configuration
  storageMode: StorageSyncMode;
  rcdEndpoint: string;
  remoteName: string;
  roleMappings: FolderRoleMapping[];
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

const DEFAULT_ROLE_MAPPINGS: FolderRoleMapping[] = [
  { role: 'vault', remoteName: 'gdrive-cold', subpath: 'AnyMD_Vault' },
  { role: 'backup', remoteName: 'gdrive-cold', subpath: 'AnyMD_Backup' },
  { role: 'library', remoteName: 'gdrive-cold', subpath: 'AnyMD_Library' }
];

export const VaultConfigModal: React.FC<VaultConfigModalProps> = ({
  isOpen,
  onClose,
  activeVaultId = 'default_vault',
  onSaveVaultConfig
}) => {
  const [selectedMode, setSelectedMode] = useState<VaultConfig['mode']>('PERSONAL');
  const [vaultName, setVaultName] = useState<string>('My Kawaii Vault');
  const [directoryPath, setDirectoryPath] = useState<string>('');
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [themeColor, setThemeColor] = useState<string>('#EC4899');
  const [chromaticInheritance, setChromaticInheritance] = useState<boolean>(true);

  // Storage & rclone states
  const [storageMode, setStorageMode] = useState<StorageSyncMode>('local_only');
  const [rcdEndpoint, setRcdEndpoint] = useState<string>('http://127.0.0.1:5572');
  const [remoteName, setRemoteName] = useState<string>('gdrive-cold');
  const [roleMappings, setRoleMappings] = useState<FolderRoleMapping[]>(DEFAULT_ROLE_MAPPINGS);
  const [endpointStatus, setEndpointStatus] = useState<string>('Local Zero-Cloud Ready');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
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
        setStorageMode(parsed.storageMode || 'local_only');
        setRcdEndpoint(parsed.rcdEndpoint || 'http://127.0.0.1:5572');
        setRemoteName(parsed.remoteName || 'gdrive-cold');
        if (Array.isArray(parsed.roleMappings) && parsed.roleMappings.length > 0) {
          setRoleMappings(parsed.roleMappings);
        }
      } catch (e) {
        // Silent catch for resilience
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
        setToast(`🌸 Bound zero-cloud local folder: ${handle.name}`);
        setTimeout(() => setToast(null), 3000);
      } else {
        alert('File System Access API (showDirectoryPicker) not supported. Using local sandbox fallback.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Silent catch
      }
    }
  };

  const handleCheckRcloneEndpoint = async () => {
    if (storageMode === 'local_only') {
      setEndpointStatus('Local-First Mode (Built-in rclone disabled / 0 cloud dependence)');
      return;
    }
    setIsVerifying(true);
    setEndpointStatus('Testing connection...');
    const driver = new RcloneCloudSyncDriver({
      storageMode,
      rcdEndpoint
    });
    const health = await driver.checkHealth();
    setIsVerifying(false);
    if (health.online) {
      setEndpointStatus(`✨ Online & Connected: ${health.version || 'rclone daemon ready'}`);
    } else {
      setEndpointStatus('⏳ Unreachable. Seamless fallback to local flat-file mode active.');
    }
  };

  const updateRoleMapping = (index: number, key: keyof FolderRoleMapping, value: string) => {
    setRoleMappings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleSave = () => {
    const config: VaultConfig = {
      id: activeVaultId,
      name: vaultName,
      mode: selectedMode,
      folderHandle: directoryHandle,
      folderPath: directoryPath,
      themeColor,
      chromaticInheritance,
      storageMode,
      rcdEndpoint,
      remoteName,
      roleMappings
    };

    localStorage.setItem(`anymd_vault_config_${activeVaultId}`, JSON.stringify({
      id: config.id,
      name: config.name,
      mode: config.mode,
      folderPath: config.folderPath,
      themeColor: config.themeColor,
      chromaticInheritance: config.chromaticInheritance,
      storageMode: config.storageMode,
      rcdEndpoint: config.rcdEndpoint,
      remoteName: config.remoteName,
      roleMappings: config.roleMappings
    }));

    if (onSaveVaultConfig) {
      onSaveVaultConfig(config);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl p-6 flex flex-col gap-4 text-slate-100 animate-fadeIn overflow-y-auto"
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
                Local-first directory binding &amp; toggleable non-FUSE rclone sync
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
        <div className="flex flex-col gap-1.5">
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
            className="bg-slate-950 border border-slate-800 text-xs px-3.5 py-2 rounded-2xl focus:border-indigo-500 focus:outline-none text-white font-medium"
            placeholder="E.g. Meow Story Vault"
          />
        </div>

        {/* Local Directory Binding via File System Access API */}
        <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3.5 border border-slate-800 rounded-2xl">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-emerald-400" />
              <span>Local Vault Folder (Zero-Cloud Baseline)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">✨ No Laptop/VPS Needed</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={directoryPath || 'meow-vault (Local Sandbox / Android Storage)'}
              className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-2xl flex-grow font-mono text-slate-300"
            />
            <button
              type="button"
              onClick={handlePickDirectory}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-2xl text-indigo-300 flex items-center gap-1.5 transition-all shadow-sm"
              style={{ boxShadow: '2px 2px 0px #000' }}
            >
              <Folder className="w-4 h-4" />
              <span>Choose Folder</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Default mode works 100% offline. Reads, writes, and searches flat .md notes &amp; .anymd sidecars locally.
          </p>
        </div>

        {/* 3-Option Storage & Sync Mode Toggle */}
        <div className="flex flex-col gap-2 bg-slate-950/60 p-3.5 border border-slate-800 rounded-2xl">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span>Sync &amp; Storage Architecture</span>
            </span>
            <span className="text-[10px] text-sky-400 font-mono">Non-FUSE</span>
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStorageMode('local_only')}
              className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                storageMode === 'local_only'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
              }`}
              style={{ boxShadow: storageMode === 'local_only' ? '2px 2px 0px #10B981' : 'none' }}
            >
              <span className="text-xs font-black flex items-center gap-1">
                <span>📁</span> Local Folder Only
              </span>
              <span className="text-[9px] font-mono text-slate-400 leading-tight">
                Built-in rclone disabled. Zero cloud dependency.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStorageMode('builtin_rclone')}
              className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                storageMode === 'builtin_rclone'
                  ? 'border-sky-500 bg-sky-950/40 text-sky-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
              }`}
              style={{ boxShadow: storageMode === 'builtin_rclone' ? '2px 2px 0px #0EA5E9' : 'none' }}
            >
              <span className="text-xs font-black flex items-center gap-1">
                <span>⚡</span> Built-In rclone
              </span>
              <span className="text-[9px] font-mono text-slate-400 leading-tight">
                Loopback rcd (127.0.0.1:5572, 8 transfers, 32Mi buffer).
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStorageMode('external_rclone')}
              className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                storageMode === 'external_rclone'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
              }`}
              style={{ boxShadow: storageMode === 'external_rclone' ? '2px 2px 0px #A855F7' : 'none' }}
            >
              <span className="text-xs font-black flex items-center gap-1">
                <span>🌐</span> External / Hosted
              </span>
              <span className="text-[9px] font-mono text-slate-400 leading-tight">
                Connects to Termux, LAN host, or standalone CLI sync.
              </span>
            </button>
          </div>

          {/* Rclone Configuration Sub-Panel (Visible when rclone is enabled) */}
          {storageMode !== 'local_only' && (
            <div className="mt-2 space-y-2.5 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">rclone rcd URL</span>
                  <input
                    type="text"
                    value={rcdEndpoint}
                    onChange={(e) => setRcdEndpoint(e.target.value)}
                    placeholder="http://127.0.0.1:5572"
                    className="w-full bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-1.5 rounded-xl font-mono text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">Remote Name</span>
                  <input
                    type="text"
                    value={remoteName}
                    onChange={(e) => setRemoteName(e.target.value)}
                    placeholder="gdrive-cold"
                    className="w-full bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-1.5 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              {/* Folder-Role Mapping */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 block">
                  Folder-Role Mapping (Non-FUSE / No Drive Letter Mounts)
                </span>
                <div className="space-y-1">
                  {roleMappings.map((mapping, idx) => (
                    <div key={mapping.role} className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                      <span className="w-16 font-bold text-sky-400 uppercase">[{mapping.role}]</span>
                      <input
                        type="text"
                        value={mapping.remoteName}
                        onChange={(e) => updateRoleMapping(idx, 'remoteName', e.target.value)}
                        placeholder="remote"
                        className="w-24 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300"
                        title="Remote Target Name"
                      />
                      <span>:</span>
                      <input
                        type="text"
                        value={mapping.subpath}
                        onChange={(e) => updateRoleMapping(idx, 'subpath', e.target.value)}
                        placeholder="subpath"
                        className="flex-1 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300"
                        title="Subfolder destination"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoint verification check */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[280px]">
                  {endpointStatus}
                </span>
                <button
                  type="button"
                  onClick={handleCheckRcloneEndpoint}
                  disabled={isVerifying}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold rounded-xl text-sky-300 flex items-center gap-1 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>Verify Endpoint</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Visual Theme & Chromatic Inheritance */}
        <div className="flex flex-col gap-2 bg-slate-950/60 p-3.5 border border-slate-800 rounded-2xl">
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
          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 p-2 rounded-xl text-center">
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
