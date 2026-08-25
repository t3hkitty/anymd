import React, { useState, useEffect } from 'react';
import type { CloudAccount, CloudPresetId, StorageAccessMode, ConfigStorageLocation } from '../types/cloudAccounts';
import { CLOUD_PROVIDER_PRESETS, buildRelLinkRootForAccount, saveCloudAccounts, normalizeCloudServerUrl } from '../plugins/cloudAccountManager';
import { testRealWebDAVConnection, type WebDAVTestResult } from '../plugins/webdavSyncEngine';
import { RemoteCloudBrowserModal } from './RemoteCloudBrowserModal';
import { X, Cloud, Plus, Trash2, ShieldCheck, Sparkles, Key, Lock, Unlock, HardDrive, Pencil, AlertCircle, FolderSync, Info, ExternalLink, Folder } from 'lucide-react';

interface WebDAVAccountManagerModalProps {
  isOpen: boolean;
  accounts: CloudAccount[];
  onClose: () => void;
  onUpdateAccounts: (updated: CloudAccount[]) => void;
  onSetRelLinkRoot: (newRoot: string) => void;
}

export const WebDAVAccountManagerModal: React.FC<WebDAVAccountManagerModalProps> = ({
  isOpen,
  accounts,
  onClose,
  onUpdateAccounts,
  onSetRelLinkRoot,
}) => {
  const [selectedAccountList, setSelectedAccountList] = useState<CloudAccount[]>(accounts);
  const [isEditing, setIsEditing] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResultMap, setTestResultMap] = useState<Record<string, WebDAVTestResult>>({});

  // Browser Modal State
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [browsingAccount, setBrowsingAccount] = useState<CloudAccount | null>(null);

  // Sync selectedAccountList when prop changes
  useEffect(() => {
    setSelectedAccountList(accounts);
  }, [accounts]);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('My Filejump Vault');
  const [presetId, setPresetId] = useState<CloudPresetId>('filejump');
  const [serverUrl, setServerUrl] = useState('https://uploads.filejump.com/dav/');
  const [username, setUsername] = useState('reader@example.com');
  const [tokenOrPassword, setTokenOrPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [remoteRootFolder, setRemoteRootFolder] = useState('/md_library');
  const [accessMode, setAccessMode] = useState<StorageAccessMode>('read-write');
  const [configStorageLocation, setConfigStorageLocation] = useState<ConfigStorageLocation>('remote-cloud');
  const [enableBackgroundIdleScan, setEnableBackgroundIdleScan] = useState(true);
  const [scanFolderScope, setScanFolderScope] = useState('/ebooks');
  const [localDownloadsScanOnly, setLocalDownloadsScanOnly] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (id: CloudPresetId) => {
    setPresetId(id);
    const preset = CLOUD_PROVIDER_PRESETS.find(p => p.id === id);
    if (preset) {
      setServerUrl(preset.defaultServerUrl);
      if (!editId) {
        setAccountName(`My ${preset.name.split(' ')[0]} Vault`);
      }
    }
  };

  const handleOpenAddForm = () => {
    setEditId(null);
    setAccountName('My Filejump Vault');
    setPresetId('filejump');
    setServerUrl('https://uploads.filejump.com/dav/');
    setUsername('reader@example.com');
    setTokenOrPassword('');
    setApiKey('');
    setRemoteRootFolder('/md_library');
    setAccessMode('read-write');
    setConfigStorageLocation('remote-cloud');
    setEnableBackgroundIdleScan(true);
    setScanFolderScope('/ebooks');
    setLocalDownloadsScanOnly(false);
    setIsEditing(true);
  };

  const handleEditAccount = (acc: CloudAccount) => {
    setEditId(acc.id);
    setAccountName(acc.name);
    setPresetId(acc.presetId);
    setServerUrl(acc.serverUrl);
    setUsername(acc.username);
    setTokenOrPassword(acc.tokenOrPassword);
    setApiKey(acc.apiKey || '');
    setRemoteRootFolder(acc.remoteRootFolder);
    setAccessMode(acc.accessMode);
    setConfigStorageLocation(acc.configStorageLocation);
    setEnableBackgroundIdleScan(acc.enableBackgroundIdleScan ?? true);
    setScanFolderScope(acc.scanFolderScope || '/ebooks');
    setLocalDownloadsScanOnly(acc.localDownloadsScanOnly ?? false);
    setIsEditing(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUrl = normalizeCloudServerUrl(serverUrl, presetId);

    const newAcc: CloudAccount = {
      id: editId || `acc-${Date.now()}`,
      name: accountName,
      presetId,
      serverUrl: normalizedUrl,
      username,
      tokenOrPassword,
      apiKey: apiKey ? apiKey : undefined,
      remoteRootFolder,
      isActive: editId ? (selectedAccountList.find(a => a.id === editId)?.isActive || false) : (selectedAccountList.length === 0),
      autoSyncSidecars: true,
      accessMode,
      configStorageLocation,
      enableBackgroundIdleScan,
      scanFolderScope,
      localDownloadsScanOnly
    };

    let updated: CloudAccount[];
    if (editId) {
      updated = selectedAccountList.map(a => a.id === editId ? newAcc : a);
    } else {
      updated = [newAcc, ...selectedAccountList];
    }

    setSelectedAccountList(updated);
    saveCloudAccounts(updated);
    onUpdateAccounts(updated);
    setIsEditing(false);
  };

  const handleSetActiveAccount = (id: string) => {
    const updated = selectedAccountList.map(a => ({ ...a, isActive: a.id === id }));
    setSelectedAccountList(updated);
    saveCloudAccounts(updated);
    onUpdateAccounts(updated);

    const activeAcc = updated.find(a => a.id === id);
    if (activeAcc) {
      const relRoot = buildRelLinkRootForAccount(activeAcc);
      onSetRelLinkRoot(relRoot);
    }
  };

  const handleDeleteAccount = (id: string) => {
    const updated = selectedAccountList.filter(a => a.id !== id);
    setSelectedAccountList(updated);
    saveCloudAccounts(updated);
    onUpdateAccounts(updated);
  };

  const handleTestConnection = async (acc: CloudAccount) => {
    setTestingId(acc.id);
    const result = await testRealWebDAVConnection(acc);
    setTestingId(null);
    setTestResultMap(prev => ({ ...prev, [acc.id]: result }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Cloud Storage Account Manager</h3>
              <p className="text-xs text-slate-400">Filejump &bull; Google Drive &bull; Dropbox &bull; TorBox &bull; Persistent Credentials & Key Auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {!isEditing ? (
            <>
              {/* Account List Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configured Cloud Accounts ({selectedAccountList.length})
                </span>

                <button
                  onClick={handleOpenAddForm}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Cloud Account</span>
                </button>
              </div>

              {/* Accounts List */}
              <div className="space-y-3">
                {selectedAccountList.map((acc) => {
                  const preset = CLOUD_PROVIDER_PRESETS.find(p => p.id === acc.presetId);
                  const isTesting = testingId === acc.id;
                  const testResult = testResultMap[acc.id];
                  const isRO = acc.accessMode === 'read-only';

                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        acc.isActive
                          ? 'bg-slate-950 border-sky-500/60 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{preset?.icon || '☁️'}</span>
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <h4 className="font-bold text-sm text-slate-100">{acc.name}</h4>
                              {acc.isActive && (
                                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                                  Active Storage
                                </span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border flex items-center space-x-1 ${
                                isRO ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {isRO ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                                <span>{isRO ? 'READ-ONLY (RO)' : 'READ-WRITE (RW)'}</span>
                              </span>

                              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-full font-mono">
                                Config: {acc.configStorageLocation === 'remote-cloud' ? 'Remote Cloud' : 'Local'}
                              </span>
                            </div>

                            <p className="text-xs text-amber-300 font-mono mt-1 font-semibold">{acc.serverUrl}</p>
                            
                            {acc.apiKey && (
                              <p className="text-[11px] text-indigo-400 font-mono mt-0.5 flex items-center space-x-1">
                                <Key className="w-3 h-3 text-indigo-400" />
                                <span>API Key / Token: {acc.apiKey.slice(0, 8)}••••••••</span>
                              </p>
                            )}

                            <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center space-x-1">
                              <FolderSync className="w-3 h-3 text-sky-400" />
                              <span>Library Folder:</span>
                              <code className="text-amber-300 font-bold">{acc.remoteRootFolder}</code>
                              <span className="text-slate-500">&bull; User: {acc.username || 'API Token'}</span>
                            </p>

                            {/* Real Connection & Write Test Result */}
                            {testResult && (
                              <div className={`mt-2 p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                                testResult.success && testResult.writeVerified
                                  ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200'
                                  : testResult.success
                                  ? 'bg-amber-950/80 border-amber-500/70 text-amber-200'
                                  : 'bg-rose-950/80 border-rose-500/70 text-rose-200'
                              }`}>
                                <div className="flex items-center space-x-2">
                                  {testResult.success ? (
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                  )}
                                  <span>{testResult.message}</span>
                                </div>
                                {testResult.writeVerified && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/40">
                                    PUT Write Verified
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setBrowsingAccount(acc);
                              setIsBrowserOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center space-x-1 transition-all"
                            title="Browse Remote Folders & Files"
                          >
                            <Folder className="w-3.5 h-3.5 text-sky-400" />
                            <span>Browse Remote</span>
                          </button>

                          {!acc.isActive && (
                            <button
                              onClick={() => handleSetActiveAccount(acc.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold text-xs transition-all"
                            >
                              Set Active
                            </button>
                          )}

                          <button
                            onClick={() => handleEditAccount(acc)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs"
                            title="Edit Credentials & Rename Library Folder"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleTestConnection(acc)}
                            disabled={isTesting}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1"
                            title="Perform Real HTTP WebDAV Read & PUT Write Test"
                          >
                            {isTesting ? (
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span>Test Write</span>
                          </button>

                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Edit / Add Account Form */
            <form onSubmit={handleSaveAccount} className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-sky-400 uppercase tracking-wider font-mono">
                  {editId ? 'Edit Cloud Credentials & API Keys' : 'Add New Cloud Account'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back to List
                </button>
              </div>

              {/* Provider Preset Selector Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Provider Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CLOUD_PROVIDER_PRESETS.map((p) => {
                    const isSel = presetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSel
                            ? 'bg-sky-950/60 border-sky-500/80 text-slate-100 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xl">{p.icon}</span>
                        <p className="font-bold text-xs mt-1 truncate">{p.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Google Drive Integration Guide & Input Box */}
              {presetId === 'google-drive' && (
                <div className="p-4.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/60 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 font-mono flex items-center space-x-1.5">
                      <Info className="w-4 h-4 text-emerald-400" />
                      <span>GOOGLE DRIVE AUTHENTICATION GUIDE & INSTRUCTIONS</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono hover:underline flex items-center space-x-1 font-bold"
                      >
                        <span>OAuth Playground ↗</span>
                      </a>
                      <a
                        href="https://console.cloud.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:underline font-mono flex items-center space-x-1"
                      >
                        <span>Google Console</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed space-y-1.5 font-mono">
                    <p className="text-emerald-400 font-bold">⚠️ CRITICAL AUTH NOTE:</p>
                    <p>
                      • <strong>Do NOT paste a Client ID (e.g. <code>1466322...</code>) or Client Secret directly in the API Key box below.</strong> Google Drive REST API requires a temporary <strong>OAuth Access Token</strong> starting with <strong><code>ya29.a0...</code></strong>.
                    </p>
                    <p>
                      • If you have a Client ID/Secret or want persistent zero-expiration access, use <strong>Option B (Local rclone Bridge)</strong> below.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <label className="block text-[11px] text-emerald-300 font-bold mb-1">
                        Google Drive OAuth Access Token (Must start with ya29.a0...):
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="ya29.a0Ax... (Paste OAuth Access Token here)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/60 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-2">
                      <div>
                        <p className="text-amber-300 font-bold">🔑 OPTION A: Generate OAuth Access Token (1-Click)</p>
                        <ol className="list-decimal list-inside text-[10px] text-slate-400 space-y-0.5 mt-0.5">
                          <li>Click <a href="https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline">Google OAuth Playground ↗</a>.</li>
                          <li>Select <strong>Drive API v3</strong> &rarr; Click <strong>Authorize APIs</strong>.</li>
                          <li>Click <strong>Exchange authorization code for tokens</strong>.</li>
                          <li>Copy the <code>Access Token</code> (starts with <code>ya29.a0...</code>) and paste it into the field above.</li>
                        </ol>
                      </div>

                      <div className="border-t border-slate-800 pt-1.5">
                        <p className="text-sky-300 font-bold">⚡ OPTION B: Local rclone WebDAV Proxy (Persistent / Zero Expiration)</p>
                        <p className="text-[10px] text-slate-400">
                          In your terminal, run: <code className="text-amber-300">rclone serve webdav gdrive: --addr :8080</code><br />
                          Then set <strong>Server URL</strong> to <code className="text-sky-300">http://localhost:8080/gdrive/</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dropbox Integration Guide & Input Box */}
              {presetId === 'dropbox' && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 font-mono flex items-center space-x-1.5">
                      <Info className="w-4 h-4 text-indigo-400" />
                      <span>DROPBOX API & RCLONE WEBDAV INTEGRATION</span>
                    </span>
                    <a
                      href="https://www.dropbox.com/developers/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline font-mono flex items-center space-x-1"
                    >
                      <span>Dropbox App Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connect Dropbox via <strong>Dropbox Generated Access Token</strong> or <strong>Local rclone WebDAV bridge</strong>:
                  </p>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <label className="block text-[11px] text-indigo-300 font-bold mb-1">
                        Dropbox App Access Token / API Key:
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sl.B... (Paste Dropbox OAuth Access Token)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-indigo-500/50 text-xs text-amber-300 focus:outline-none"
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug pt-1">
                      💡 <strong>How to get Dropbox API Key:</strong> Go to Dropbox App Console &rarr; Create App &rarr; Click "Generate Access Token" &rarr; Paste token above. Or run <code className="text-amber-300">rclone serve webdav dropbox: --addr :8080</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* TorBox Specific API Key & REST Authentication Guide */}
              {presetId === 'torbox' && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-3 shadow-lg font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>TORBOX REST API v1 AUTHENTICATION</span>
                    </span>
                    <a
                      href="https://torbox.app/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] hover:underline flex items-center space-x-1 font-bold font-mono"
                    >
                      <span>TorBox Settings ↗</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed font-sans">
                    TorBox authenticates through a <strong>Secret API Token</strong> passed via <code>Authorization: Bearer &lt;token&gt;</code>. This allows Library Companion MD to directly query active torrent downloads, debrid web files, and Usenet items.
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-amber-300 font-bold mb-1">
                        TorBox API Key / Token:
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste TorBox API Token from torbox.app/settings"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/60 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                      <p className="text-amber-300 font-bold">⚡ How to obtain your TorBox API Token:</p>
                      <ol className="list-decimal list-inside space-y-0.5">
                        <li>Log in to <a href="https://torbox.app/settings" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">TorBox Settings</a>.</li>
                        <li>Scroll down to the <strong>API</strong> section.</li>
                        <li>Click <strong>Copy API Token</strong> and paste it into the box above.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Access Mode (RW vs RO) & Config Scope Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    {accessMode === 'read-only' ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Storage Access Mode</span>
                  </label>
                  <select
                    value={accessMode}
                    onChange={(e) => setAccessMode(e.target.value as StorageAccessMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="read-write">🔓 Read-Write (RW) - Two-Way Sidecar Sync & PUT Writes</option>
                    <option value="read-only">🔒 Read-Only (RO) - Prevent Remote Mutations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Config File Storage Scope</span>
                  </label>
                  <select
                    value={configStorageLocation}
                    onChange={(e) => setConfigStorageLocation(e.target.value as ConfigStorageLocation)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="local">💻 Local Storage (.lc-md/config.json)</option>
                    <option value="remote-cloud">☁️ Remote Cloud Storage (cloud://.lc-md/config.json)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Account Name Label
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <FolderSync className="w-3.5 h-3.5 text-amber-400" />
                    <span>Library & Backup Target Folder Path</span>
                  </label>
                  <input
                    type="text"
                    value={remoteRootFolder}
                    onChange={(e) => setRemoteRootFolder(e.target.value)}
                    placeholder="/md_library or /Books or /Obsidian_Vault"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Server WebDAV Endpoint / Bridge URL
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const preset = CLOUD_PROVIDER_PRESETS.find(p => p.id === presetId);
                      if (preset) setServerUrl(preset.defaultServerUrl);
                    }}
                    className="text-[11px] font-mono text-sky-400 hover:underline flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Auto-Fill Default URL</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://uploads.filejump.com/dav/ or http://127.0.0.1:8080/gdrive"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/60 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              {presetId !== 'torbox' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Username / Client ID
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="[REDACTED_EMAIL] or Client ID"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      App Password / Secret Token
                    </label>
                    <input
                      type="password"
                      value={tokenOrPassword}
                      onChange={(e) => setTokenOrPassword(e.target.value)}
                      placeholder="Password or Secret Token"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Opt-In Background Idle Drive & Download Scanner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Background Idle Drive &amp; Local File Scanner</span>
                  </span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableBackgroundIdleScan}
                      onChange={(e) => setEnableBackgroundIdleScan(e.target.checked)}
                      className="rounded border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <span className="text-slate-300 text-xs font-sans">Enable Idle Suggestions</span>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  When enabled, Anymd will scan this storage when your device is resting to discover files matching your sidecars.
                </p>

                {enableBackgroundIdleScan && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        🔒 Locked Scan Folder Scope:
                      </label>
                      <input
                        type="text"
                        value={scanFolderScope}
                        onChange={(e) => setScanFolderScope(e.target.value)}
                        placeholder="/ebooks or /downloads"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-sky-300 font-mono"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localDownloadsScanOnly}
                          onChange={(e) => setLocalDownloadsScanOnly(e.target.checked)}
                          className="rounded border-slate-700 text-sky-500 focus:ring-0"
                        />
                        <span className="text-slate-300 text-[11px] font-sans">💻 Local Downloads Folder Only</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Account & API Keys
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
          >
            Done
          </button>
        </div>

      </div>

      {/* Remote Cloud File & Folder Browser Modal */}
      {browsingAccount && (
        <RemoteCloudBrowserModal
          isOpen={isBrowserOpen}
          account={browsingAccount}
          initialPath={browsingAccount.remoteRootFolder || '/'}
          onClose={() => setIsBrowserOpen(false)}
          onSelectFolder={(selectedPath) => {
            setRemoteRootFolder(selectedPath);
            handleEditAccount(browsingAccount);
          }}
        />
      )}
    </div>
  );
};
