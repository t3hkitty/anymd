import React, { useState, useEffect, useRef } from 'react';
import { 
  Archive, Upload, Download, RefreshCw, CheckCircle2, 
  AlertCircle, Lock, Unlock, HardDrive, Shield, FileText 
} from 'lucide-react';
import { exportVaultToEncryptedZip } from '../export/zipVaultExporter';
import { importVaultFromEncryptedZip } from '../export/zipVaultImporter';
import { defaultHostInstance } from '../../contracts/libr-contract';

export const AnymdWebdavBackupPlugin: React.FC = () => {
  const [vpsUrl, setVpsUrl] = useState(() => localStorage.getItem('anymd_webdav_url') || 'https://webdav.koofr.net');
  const [vpsUsername, setVpsUsername] = useState(() => localStorage.getItem('anymd_webdav_username') || '');
  const [vpsPassword, setVpsPassword] = useState(() => localStorage.getItem('anymd_webdav_password') || '');
  const [remotePath, setRemotePath] = useState(() => localStorage.getItem('anymd_webdav_path') || '/AnyMD_Backup');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [encryptionPin, setEncryptionPin] = useState<string>('1234');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.setItem('anymd_webdav_url', vpsUrl);
    localStorage.setItem('anymd_webdav_username', vpsUsername);
    localStorage.setItem('anymd_webdav_password', vpsPassword);
    localStorage.setItem('anymd_webdav_path', remotePath);
  }, [vpsUrl, vpsUsername, vpsPassword, remotePath]);

  const handleTestConnection = async () => {
    setSyncStatus('📡 Checking credentials over secure WebDAV link...');
    try {
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa(vpsUsername + ':' + vpsPassword));
      headers.set('Depth', '1');

      const response = await fetch(vpsUrl + remotePath, {
        method: 'PROPFIND',
        headers: headers
      });

      if (response.ok || response.status === 207) {
        setSyncStatus('🟢 WebDAV link verified successfully! Connection established.');
        defaultHostInstance.log({
          level: 'info',
          source: 'webdav-backup',
          stage: 'fetch',
          message: 'WebDAV connection verified successfully'
        });
      } else {
        setSyncStatus(`❌ Connection failed with Status Code: ${response.status}`);
      }
    } catch (e: any) {
      setSyncStatus(`❌ Network Exception: ${e.message}`);
    }
  };

  // 1. Create and export an encrypted local backup snapshot
  const handleBackupNow = async () => {
    setIsProcessing(true);
    setSyncStatus('📤 Gathering local notes & creating encrypted ZIP snapshot...');
    try {
      const files: { name: string; content: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('anymd_file_') || key.startsWith('anymd_vault_') || key === 'anymd_active_vault')) {
          files.push({
            name: key.replace(/^anymd_file_[^_]+_/, ''),
            content: localStorage.getItem(key) || ''
          });
        }
      }

      const zipBlob = await exportVaultToEncryptedZip(files, encryptionPin.trim() || '1234');
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anymd-vault-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setSyncStatus(`🟢 Exported encrypted backup (${files.length} notes & config records).`);
      defaultHostInstance.log({
        level: 'info',
        source: 'vault-backup',
        stage: 'sync',
        message: `Compiled and downloaded encrypted backup ZIP with ${files.length} files`
      });
    } catch (err: any) {
      setSyncStatus(`❌ Backup export failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Restore local storage notes from an uploaded encrypted ZIP backup
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setSyncStatus(`📥 Decrypting and restoring backup from "${file.name}"...`);
    try {
      const buffer = await file.arrayBuffer();
      const pin = encryptionPin.trim() || '1234';
      const restoredFiles = await importVaultFromEncryptedZip(buffer, pin);

      if (restoredFiles.length === 0) {
        setSyncStatus('❌ No files found in archive or invalid PIN.');
        return;
      }

      const activeVault = localStorage.getItem('anymd_active_vault') || 'anymd-main';
      let count = 0;
      for (const item of restoredFiles) {
        if (item.name && item.name.endsWith('.md')) {
          localStorage.setItem(`anymd_file_${activeVault}_${item.name}`, item.content);
          count++;
        }
      }

      setSyncStatus(`🟢 Successfully restored ${count} notes into active vault "${activeVault}"!`);
      defaultHostInstance.log({
        level: 'info',
        source: 'vault-restore',
        stage: 'sync',
        message: `Restored ${count} markdown notes from backup into "${activeVault}"`
      });
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setSyncStatus(`❌ Restore error: Incorrect PIN or invalid ZIP archive (${err.message}).`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border-2 border-black bg-[#fffdf5] font-mono text-xs max-w-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-2xl">
      <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🐾</span>
          <h3 className="text-sm font-bold uppercase tracking-wider">Vault Storage, Backup &amp; Restore</h3>
        </div>
        <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-black font-bold">
          AES-256
        </span>
      </div>

      <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
        Export zero-cloud encrypted backup snapshots or restore existing vault archives directly to on-device local storage.
      </p>

      <div className="flex flex-col gap-2.5">
        {/* Encryption PIN */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-1">AES-256 ENCRYPTION / UNLOCK PIN</label>
          <input
            type="password"
            value={encryptionPin}
            onChange={(e) => setEncryptionPin(e.target.value)}
            className="w-full p-2 border-2 border-black bg-white focus:outline-none focus:bg-yellow-50 rounded"
            placeholder="Default: 1234"
          />
        </div>

        {/* Action Buttons: Both Backup & Restore */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleBackupNow}
            disabled={isProcessing}
            className="py-2.5 px-3 border-2 border-black bg-emerald-100 hover:bg-emerald-200 active:translate-y-[2px] font-bold flex items-center justify-center gap-1.5 transition-all rounded shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Create Backup 📦</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".zip"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="py-2.5 px-3 border-2 border-black bg-sky-100 hover:bg-sky-200 active:translate-y-[2px] font-bold flex items-center justify-center gap-1.5 transition-all rounded shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Backup 📥</span>
          </button>
        </div>

        {/* WebDAV Settings Dropdown / Accordion */}
        <details className="mt-2 border-t-2 border-black pt-2">
          <summary className="cursor-pointer font-bold text-[10px] text-gray-700 uppercase">
            Optional WebDAV Cloud Mirror Settings (Nextcloud / Koofr / pCloud)
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">WEBDAV SERVER ENDPOINT</label>
              <input
                type="text"
                value={vpsUrl}
                onChange={(e) => setVpsUrl(e.target.value)}
                className="w-full p-1.5 border border-black bg-white focus:outline-none text-[11px] rounded"
                placeholder="https://webdav.koofr.net"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">USERNAME / EMAIL</label>
                <input
                  type="text"
                  value={vpsUsername}
                  onChange={(e) => setVpsUsername(e.target.value)}
                  className="w-full p-1.5 border border-black bg-white focus:outline-none text-[11px] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">APP PASSWORD</label>
                <input
                  type="password"
                  value={vpsPassword}
                  onChange={(e) => setVpsPassword(e.target.value)}
                  className="w-full p-1.5 border border-black bg-white focus:outline-none text-[11px] rounded"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              className="py-1.5 border border-black bg-indigo-100 font-bold hover:bg-indigo-200 text-[10px] rounded"
            >
              Test WebDAV Connection 📡
            </button>
          </div>
        </details>

        {syncStatus && (
          <div className="p-2 border-2 border-black bg-slate-50 text-[10px] font-bold text-indigo-800 break-words rounded">
            {syncStatus}
          </div>
        )}
      </div>
    </div>
  );
};
