import React, { useState } from 'react';
import { X, Github, CheckCircle2, AlertCircle, RefreshCw, Key, FolderGit2, ShieldCheck, Cpu } from 'lucide-react';
import { GitHubVaultConfig, GitHubVaultService, saveGitHubVaults, getSavedGitHubVaults } from '../plugins/githubVaultPlugin';

interface GitHubVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVaultLinked?: (vaultConfig: GitHubVaultConfig, fileCount: number) => void;
}

export const GitHubVaultModal: React.FC<GitHubVaultModalProps> = ({
  isOpen,
  onClose,
  onVaultLinked,
}) => {
  const [authMode, setAuthMode] = useState<'pat' | 'device'>('pat');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [subfolder, setSubfolder] = useState('');
  const [pat, setPat] = useState('');
  
  // Device flow state
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string | null>(null);
  const [deviceFlowLoading, setDeviceFlowLoading] = useState(false);

  // Status & Verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [cloning, setCloning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!owner.trim() || !repo.trim()) {
      setErrorMsg('Please specify both Repository Owner and Repository Name.');
      return;
    }
    setErrorMsg(null);
    setVerifyStatus(null);
    setVerifying(true);

    const tempConfig: GitHubVaultConfig = {
      id: `gh-${owner.trim()}-${repo.trim()}`,
      name: `${owner.trim()}/${repo.trim()}`,
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      subfolder: subfolder.trim(),
      pat: pat.trim(),
      isPrivate: pat.trim().length > 0,
    };

    const service = new GitHubVaultService(tempConfig);
    const result = await service.verifyConnection();
    setVerifying(false);
    setVerifyStatus({ ok: result.ok, message: result.message });
    if (result.ok && result.defaultBranch && !branch.trim()) {
      setBranch(result.defaultBranch);
    }
  };

  const handleTriggerDeviceFlow = async () => {
    setDeviceFlowLoading(true);
    setErrorMsg(null);
    // Simulate GitHub Device Code OAuth flow registration for client-side pairing
    setTimeout(() => {
      setUserCode('NEKO-8829');
      setVerificationUri('https://github.com/login/device');
      setDeviceFlowLoading(false);
    }, 1000);
  };

  const handleCloneAndMount = async () => {
    if (!owner.trim() || !repo.trim()) {
      setErrorMsg('Please specify Owner and Repository Name.');
      return;
    }

    setCloning(true);
    setErrorMsg(null);

    const vaultId = `gh-${owner.trim()}-${repo.trim()}`;
    const vaultConfig: GitHubVaultConfig = {
      id: vaultId,
      name: `${owner.trim()}/${repo.trim()}`,
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      subfolder: subfolder.trim(),
      pat: pat.trim(),
      isPrivate: pat.trim().length > 0,
      lastSyncedAt: new Date().toISOString(),
      status: 'synced',
    };

    try {
      const service = new GitHubVaultService(vaultConfig);
      const fileTree = await service.fetchRemoteFileTree();

      // Persist config to saved vaults list
      const existing = getSavedGitHubVaults();
      const updated = [vaultConfig, ...existing.filter((v) => v.id !== vaultId)];
      saveGitHubVaults(updated);

      setCloning(false);
      if (onVaultLinked) {
        onVaultLinked(vaultConfig, fileTree.length);
      }
      onClose();
    } catch (err: any) {
      setCloning(false);
      setErrorMsg(err.message || 'Failed to clone file tree from GitHub.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono text-xs text-slate-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Github className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold text-white tracking-wide">🐙 Link GitHub Repo Vault</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-6 flex flex-col space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Authentication Mode Switcher */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              1. Authentication Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthMode('pat')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold ${
                  authMode === 'pat'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" /> Direct PAT Input
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('device')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold ${
                  authMode === 'device'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> Device Flow / Public
              </button>
            </div>
          </div>

          {/* Mode 1: PAT Input */}
          {authMode === 'pat' && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Personal Access Token (PAT)
              </label>
              <input
                type="password"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx or github_pat_..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Requires <code className="text-indigo-400">repo</code> or <code className="text-indigo-400">contents:write</code> scope for atomic sync.
              </p>
            </div>
          )}

          {/* Mode 2: Device Code Flow */}
          {authMode === 'device' && (
            <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-300">GitHub Device Code OAuth Flow</span>
              {!userCode ? (
                <button
                  type="button"
                  onClick={handleTriggerDeviceFlow}
                  disabled={deviceFlowLoading}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {deviceFlowLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Generate GitHub User Code
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-slate-900 border border-indigo-500/40 rounded-xl text-center">
                    <span className="text-slate-400 text-[10px] block">YOUR PAIRING CODE</span>
                    <span className="text-lg font-bold text-indigo-400 font-mono tracking-widest">{userCode}</span>
                  </div>
                  <a
                    href={verificationUri || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-center font-bold rounded-xl border border-indigo-500/30"
                  >
                    Open GitHub Device Auth Page ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Repository Coordinates */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              2. Repository Target
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Owner / Org</span>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. lorik"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Repository Name</span>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g. my-obsidian-vault"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Branch</span>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Subfolder Root (Optional)</span>
              <input
                type="text"
                value={subfolder}
                onChange={(e) => setSubfolder(e.target.value)}
                placeholder="e.g. notes or leave blank"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
              Test Connection & Scope
            </button>

            {verifyStatus && (
              <div
                className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                  verifyStatus.ok
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                {verifyStatus.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{verifyStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCloneAndMount}
            disabled={cloning}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {cloning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <FolderGit2 className="w-4 h-4" /> Clone & Mount Vault
          </button>
        </footer>
      </div>
    </div>
  );
};
