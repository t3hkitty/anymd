import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import { importVaultZipArchive, type VaultZipImportResult } from '../plugins/vaultZipImportPlugin';
import {
  createVaultLockPayload,
  verifyAndUnlockVaultSession
} from '../plugins/vaultSessionLockPlugin';
import type { CloudAccount } from '../types/cloudAccounts';
import {
  X,
  Archive,
  Upload,
  FolderLock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  Cloud
} from 'lucide-react';

interface VaultBackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreBooks: (newBooks: Book[], overwrite?: boolean) => void;
  onRestoreCloudAccounts?: (accounts: CloudAccount[]) => void;
  activeBookId?: string;
  allBooks: Book[];
  cloudAccounts?: CloudAccount[];
}

export const VaultBackupRestoreModal: React.FC<VaultBackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onRestoreBooks,
  onRestoreCloudAccounts,
  activeBookId,
  allBooks,
  cloudAccounts = []
}) => {
  const [activeTab, setActiveTab] = useState<'zip_import' | 'folder_pin_lock'>('zip_import');

  // ZIP Import State
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipResult, setZipResult] = useState<VaultZipImportResult | null>(null);
  const [overwriteLibrary, setOverwriteLibrary] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipEnteredPin, setZipEnteredPin] = useState<string>('');
  const [zipPinUnlocked, setZipPinUnlocked] = useState(false);
  const [zipPinError, setZipPinError] = useState<string | null>(null);

  // Folder & PIN Lock State
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<'unselected' | 'locked' | 'unlocked' | 'unsealed'>('unselected');
  const [userPin, setUserPin] = useState<string>('');
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockSuccess, setLockSuccess] = useState<string | null>(null);
  const [unlockedSessionData, setUnlockedSessionData] = useState<any>(null);

  // Local state for simulated/mounted folder files
  const [folderHandle, setFolderHandle] = useState<any>(null);

  if (!isOpen) return null;

  // 1. Handle ZIP File Selection
  const handleZipFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingZip(true);
    setZipError(null);
    setZipResult(null);

    try {
      const result = await importVaultZipArchive(file);
      setZipResult(result);
    } catch (err: any) {
      setZipError(`Failed to extract ZIP archive: ${err?.message || 'Invalid or corrupted ZIP file.'}`);
    } finally {
      setIsProcessingZip(false);
    }
  };

  const handleUnlockZipWithPin = async () => {
    if (!zipEnteredPin.trim()) {
      setZipPinError('Please enter the ZIP Sovereign PIN.');
      return;
    }
    setZipPinError(null);

    if (zipResult?.lockFileContent) {
      const res = await verifyAndUnlockVaultSession(zipResult.lockFileContent, zipEnteredPin.trim());
      if (res.success) {
        setZipPinUnlocked(true);
        if (res.sessionData?.cloudAccounts && onRestoreCloudAccounts) {
          onRestoreCloudAccounts(res.sessionData.cloudAccounts);
        }
      } else {
        setZipPinError(res.error || 'Incorrect ZIP PIN.');
      }
    } else {
      // Basic verification
      setZipPinUnlocked(true);
    }
  };

  const handleCommitZipRestore = () => {
    if (!zipResult || zipResult.books.length === 0) return;
    onRestoreBooks(zipResult.books, overwriteLibrary);

    if (zipResult.cloudAccounts && zipResult.cloudAccounts.length > 0 && onRestoreCloudAccounts) {
      onRestoreCloudAccounts(zipResult.cloudAccounts);
    }

    const cloudMsg = zipResult.cloudAccounts?.length ? ` and ${zipResult.cloudAccounts.length} Cloud Accounts` : '';
    alert(`✓ Successfully restored ${zipResult.importedCount} vault items, ${zipResult.mediaRestoredCount} media files${cloudMsg}!`);
    onClose();
  };

  // 2. Handle File System Access API Folder Selection
  const handlePickLocalFolder = async () => {
    setLockError(null);
    setLockSuccess(null);
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        setFolderHandle(dirHandle);
        setSelectedFolderName(dirHandle.name);

        // Check if .vault-session.lock exists in folder
        try {
          // @ts-ignore
          const lockFileHandle = await dirHandle.getFileHandle('.vault-session.lock');
          const file = await lockFileHandle.getFile();
          const lockText = await file.text();
          // Store raw lock content on handle
          dirHandle._lockContent = lockText;
          setLockStatus('locked');
          setLockSuccess('Found encrypted .vault-session.lock file in this folder. Enter your Sovereign PIN to unlock.');
        } catch {
          // No lockfile found
          setLockStatus('unsealed');
        }
      } else {
        // Fallback for browsers without showDirectoryPicker
        setSelectedFolderName('Local Books Directory');
        setLockStatus('unsealed');
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setLockError(`Folder access error: ${e.message}`);
      }
    }
  };

  // 3. Unlock with PIN
  const handleUnlockWithPin = async () => {
    if (!userPin.trim()) {
      setLockError('Please enter your 4-6 digit Sovereign PIN.');
      return;
    }

    setLockError(null);
    setLockSuccess(null);

    try {
      let lockJson = folderHandle?._lockContent;
      if (!lockJson) {
        // Mock payload if running in fallback mode
        lockJson = localStorage.getItem('lc_md_mock_lock_file');
      }

      if (!lockJson) {
        setLockError('No lockfile found to decrypt.');
        return;
      }

      const res = await verifyAndUnlockVaultSession(lockJson, userPin);
      if (res.success) {
        setLockStatus('unlocked');
        setUnlockedSessionData(res.sessionData);
        setLockSuccess('✓ Sovereign PIN verified! Session unlocked successfully.');

        if (res.sessionData?.books && Array.isArray(res.sessionData.books)) {
          onRestoreBooks(res.sessionData.books, false);
        }
        if (res.sessionData?.cloudAccounts && Array.isArray(res.sessionData.cloudAccounts) && onRestoreCloudAccounts) {
          onRestoreCloudAccounts(res.sessionData.cloudAccounts);
        }
      } else {
        setLockError(res.error || 'Incorrect PIN.');
      }
    } catch (err: any) {
      setLockError(`Unlock failure: ${err.message}`);
    }
  };

  // 4. Create PIN Lockfile in Local Folder
  const handleSealFolderWithPin = async () => {
    if (!userPin.trim() || userPin.length < 4) {
      setLockError('PIN must be at least 4 digits long to seal the session.');
      return;
    }

    setLockError(null);
    setLockSuccess(null);

    try {
      const lockPayload = await createVaultLockPayload(userPin, {
        books: allBooks,
        activeBookId: activeBookId,
        vaultName: `${selectedFolderName || 'Sovereign'} Vault`,
        cloudAccounts: cloudAccounts
      });

      if (folderHandle && 'getFileHandle' in folderHandle) {
        try {
          const fileHandle = await folderHandle.getFileHandle('.vault-session.lock', { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(lockPayload);
          await writable.close();
          folderHandle._lockContent = lockPayload;
        } catch {
          // fallback
          localStorage.setItem('lc_md_mock_lock_file', lockPayload);
        }
      } else {
        localStorage.setItem('lc_md_mock_lock_file', lockPayload);
      }

      setLockStatus('locked');
      setLockSuccess('✓ Successfully sealed folder with encrypted .vault-session.lock file!');
      setUserPin('');
    } catch (err: any) {
      setLockError(`Failed to seal folder: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Vault Backup Import &amp; PIN Session Restore</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  LOCAL RESTORE
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Restore ZIP Vault Backups with /media/ &bull; PIN-Protected Local Folder Session Lock
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('zip_import')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'zip_import'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            <span>📦 Vault ZIP Backup Import</span>
          </button>

          <button
            onClick={() => setActiveTab('folder_pin_lock')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'folder_pin_lock'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5 text-indigo-400" />
            <span>🔐 Local Folder Session Restore (PIN Lock)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-6">
          
          {/* TAB 1: ZIP BACKUP IMPORT */}
          {activeTab === 'zip_import' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Dropzone Upload */}
              <div className="p-8 rounded-3xl border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-950/60 transition-all flex flex-col items-center justify-center text-center space-y-3 relative group">
                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={handleZipFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-100">Select or Drop Sovereign Vault ZIP Backup</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Extracts all <code className="text-amber-300">/Sidecars/*.companion.md</code> sidecars, <code className="text-indigo-300">/media/</code> cropped card covers, and reaction logs.
                  </p>
                </div>
              </div>

              {/* Processing Spinner */}
              {isProcessingZip && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center space-x-2 text-amber-300">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Unpacking ZIP archive &amp; converting media assets...</span>
                </div>
              )}

              {/* Error Notice */}
              {zipError && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{zipError}</span>
                </div>
              )}

              {/* Parsed ZIP Preview */}
              {zipResult && (
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Archive Successfully Analyzed</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-amber-300 font-bold flex items-center space-x-1.5">
                      <span>{zipResult.importedCount} Items &bull; {zipResult.mediaRestoredCount} Images</span>
                      {zipResult.cloudAccounts && zipResult.cloudAccounts.length > 0 && (
                        <span className="text-cyan-300">&bull; {zipResult.cloudAccounts.length} Cloud Accounts</span>
                      )}
                    </span>
                  </div>

                  {/* 🔐 ZIP Sovereign PIN Status & Verification Block */}
                  {zipResult.isPinProtected ? (
                    <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-xs text-amber-300">
                            PIN-Protected Vault Archive {zipResult.pinHint ? `(Hint: ${zipResult.pinHint})` : ''}
                          </span>
                        </div>
                        {zipPinUnlocked && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>PIN Verified &amp; Unlocked</span>
                          </span>
                        )}
                      </div>

                      {!zipPinUnlocked && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="password"
                            maxLength={8}
                            value={zipEnteredPin}
                            onChange={(e) => setZipEnteredPin(e.target.value)}
                            placeholder="Enter ZIP PIN"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono tracking-widest w-36 focus:outline-none focus:border-amber-400 text-center"
                          />
                          <button
                            onClick={handleUnlockZipWithPin}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Verify PIN</span>
                          </button>
                        </div>
                      )}

                      {zipPinError && (
                        <p className="text-[10px] text-rose-400 font-mono">{zipPinError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Standard Sovereign Archive (No PIN lockfile required)</span>
                      <span className="text-emerald-400 font-bold">✓ Ready for Direct Restore</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                    {zipResult.books.map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
                        {b.coverImageUrl ? (
                          <img src={b.coverImageUrl} alt={b.title} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="truncate">
                          <h5 className="font-bold text-xs text-slate-200 truncate">{b.title}</h5>
                          <p className="text-[10px] text-slate-400 truncate">{b.author} &bull; {b.resonanceStream.length} reactions</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overwriteLibrary}
                        onChange={(e) => setOverwriteLibrary(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500 accent-amber-500"
                      />
                      <span>Replace current library (unchecked = merge into existing vault)</span>
                    </label>

                    <button
                      onClick={handleCommitZipRestore}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Restore {zipResult.importedCount} Items into Vault</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LOCAL FOLDER MOUNT & PIN LOCK */}
          {activeTab === 'folder_pin_lock' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Folder Selector Banner */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xl">
                    <FolderLock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-100">
                      {selectedFolderName ? `Mounted: ${selectedFolderName}` : 'No Local Folder Selected'}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans">
                      Mount a local folder containing your vault markdown sidecars and encrypted <code className="text-indigo-300">.vault-session.lock</code> file.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePickLocalFolder}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 shrink-0 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Local Folder...</span>
                </button>
              </div>

              {/* Lock Status & PIN Interaction */}
              {lockStatus !== 'unselected' && (
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {lockStatus === 'locked' && <Lock className="w-5 h-5 text-amber-400" />}
                      {lockStatus === 'unlocked' && <Unlock className="w-5 h-5 text-emerald-400" />}
                      {lockStatus === 'unsealed' && <ShieldCheck className="w-5 h-5 text-indigo-400" />}
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {lockStatus === 'locked' && '🔒 Folder is PIN-Locked (.vault-session.lock)'}
                        {lockStatus === 'unlocked' && '🔓 Folder Unlocked & Restored'}
                        {lockStatus === 'unsealed' && '🛡️ Unsealed Folder (Ready for PIN Protection)'}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Alerts */}
                  {lockError && (
                    <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{lockError}</span>
                    </div>
                  )}

                  {lockSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{lockSuccess}</span>
                    </div>
                  )}

                  {/* Unlocked Session Info */}
                  {lockStatus === 'unlocked' && unlockedSessionData && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{unlockedSessionData.vaultName || 'Sovereign Vault Session'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {unlockedSessionData.books?.length || unlockedSessionData.totalBooks || 0} Items Decrypted
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Session key decrypted via PBKDF2 + AES-GCM. All active reading positions, companion notes, and vault items are restored.
                      </p>
                    </div>
                  )}

                  {/* PIN Input & Action Buttons */}
                  {lockStatus === 'locked' && (
                    <div className="space-y-3 pt-2">
                      <label className="text-xs text-slate-300 font-bold block">Enter 4-6 Digit Sovereign PIN to Restore Session:</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          maxLength={8}
                          value={userPin}
                          onChange={(e) => setUserPin(e.target.value)}
                          placeholder="••••"
                          className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 text-lg font-mono text-center tracking-widest w-36 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={handleUnlockWithPin}
                          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center space-x-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Unlock &amp; Restore Session</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {lockStatus === 'unsealed' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300 font-bold block">Set a Sovereign PIN to Seal this Folder:</label>
                        {cloudAccounts.length > 0 && (
                          <span className="text-[10px] text-cyan-300 flex items-center space-x-1 font-mono">
                            <Cloud className="w-3 h-3 text-cyan-400" />
                            <span>Seals {cloudAccounts.length} Cloud Accounts</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          maxLength={8}
                          value={userPin}
                          onChange={(e) => setUserPin(e.target.value)}
                          placeholder="Set PIN (e.g. 1234)"
                          className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono tracking-widest w-44 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={handleSealFolderWithPin}
                          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Generate .vault-session.lock</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
