import React, { useState } from 'react';
import type { RsyncConfig, RsyncSyncDirection, RsyncTargetType } from '../types/rsync';
import {
  DEFAULT_RSYNC_CONFIG,
  generateRsyncCommand,
  generateRsyncBashScript,
  generateRsyncPowerShellScript,
  buildRsyncManifest
} from '../plugins/rsyncEngine';
import { X, RefreshCw, Copy, Check, Download, Terminal, Server, ArrowLeftRight, FileCode } from 'lucide-react';

interface RsyncSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RsyncSyncModal: React.FC<RsyncSyncModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<RsyncConfig>(DEFAULT_RSYNC_CONFIG);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const rsyncCmd = generateRsyncCommand(config);
  const bashScript = generateRsyncBashScript(config);
  const psScript = generateRsyncPowerShellScript(config);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(rsyncCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadScript = (type: 'bash' | 'powershell') => {
    const text = type === 'bash' ? bashScript : psScript;
    const filename = type === 'bash' ? 'lc-md-sync.sh' : 'lc-md-sync.ps1';
    const mime = 'text/plain;charset=utf-8';

    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportManifest = () => {
    const manifest = buildRsyncManifest(config);
    const jsonStr = JSON.stringify(manifest, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rsync-manifest.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Rsync Sync & Command Generator</h3>
              <p className="text-xs text-slate-400">Import/Export Settings &bull; SSH NAS &bull; Bash (.sh) & PowerShell (.ps1) Scripts</p>
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
          
          {/* Sync Direction & Target Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Sync Direction</span>
              </label>
              <select
                value={config.direction}
                onChange={(e) => setConfig(prev => ({ ...prev, direction: e.target.value as RsyncSyncDirection }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="export-push">📤 Export Push (Local &rarr; Remote SSH NAS)</option>
                <option value="import-pull">📥 Import Pull (Remote SSH NAS &rarr; Local)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Target Connection Type</span>
              </label>
              <select
                value={config.targetType}
                onChange={(e) => setConfig(prev => ({ ...prev, targetType: e.target.value as RsyncTargetType }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ssh-nas">🔑 Remote SSH NAS (user@nas:/books)</option>
                <option value="local-folder">📁 Local / Mounted Drive Target</option>
                <option value="rclone-cloud">☁️ Rclone WebDAV Proxy Bridge</option>
              </select>
            </div>
          </div>

          {/* SSH Configuration Fields */}
          {config.targetType === 'ssh-nas' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                SSH Remote Host Configuration
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">SSH Host / IP</label>
                  <input
                    type="text"
                    value={config.remoteSshHost}
                    onChange={(e) => setConfig(prev => ({ ...prev, remoteSshHost: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">SSH User</label>
                  <input
                    type="text"
                    value={config.remoteSshUser}
                    onChange={(e) => setConfig(prev => ({ ...prev, remoteSshUser: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">SSH Port</label>
                  <input
                    type="number"
                    value={config.remoteSshPort}
                    onChange={(e) => setConfig(prev => ({ ...prev, remoteSshPort: parseInt(e.target.value, 10) || 22 }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Remote Remote Directory Path</label>
                <input
                  type="text"
                  value={config.remotePath}
                  onChange={(e) => setConfig(prev => ({ ...prev, remotePath: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Filter & Options Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeSidecarsOnly}
                onChange={(e) => setConfig(prev => ({ ...prev, includeSidecarsOnly: e.target.checked }))}
              />
              <span>Sidecars Only (*.md)</span>
            </label>

            <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.deleteExtraneousFiles}
                onChange={(e) => setConfig(prev => ({ ...prev, deleteExtraneousFiles: e.target.checked }))}
              />
              <span className="text-amber-400">Delete Remote (--delete)</span>
            </label>

            <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.dryRunMode}
                onChange={(e) => setConfig(prev => ({ ...prev, dryRunMode: e.target.checked }))}
              />
              <span className="text-sky-300">Dry Run (--dry-run)</span>
            </label>
          </div>

          {/* Generated Command Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>Generated Rsync CLI Command</span>
              </span>
              <button
                onClick={handleCopyCmd}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Command</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
              {rsyncCmd}
            </pre>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={handleExportManifest}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-semibold flex items-center space-x-1"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export rsync-manifest.json</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownloadScript('bash')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sh Script</span>
            </button>

            <button
              onClick={() => handleDownloadScript('powershell')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ps1 Script</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
