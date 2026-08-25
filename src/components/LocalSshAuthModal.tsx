import React, { useState } from 'react';
import type { MeowUserAccount } from '../plugins/localSshAuthPlugin';
import { getSavedMeowAccounts, saveMeowAccounts, generateSshKeypair, generateSshAuthorizedKeys } from '../plugins/localSshAuthPlugin';
import { X, Key, ShieldCheck, UserPlus, Copy, Check, Terminal, Lock, Cpu } from 'lucide-react';

interface LocalSshAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalSshAuthModal: React.FC<LocalSshAuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [accounts, setAccounts] = useState<MeowUserAccount[]>(getSavedMeowAccounts);
  const [copiedKeys, setCopiedKeys] = useState(false);
  const [copiedTunnel, setCopiedTunnel] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<{ publicKey: string; privateKeySnippet: string; fingerprint: string } | null>(null);

  if (!isOpen) return null;

  const authorizedKeysContent = generateSshAuthorizedKeys(accounts);
  const sshTunnelScript = `ssh -N -L 8080:localhost:80 ${accounts[0]?.username || 'lorik'}@midphase.artkitty.net -p 22`;

  const handleGenerateKey = () => {
    if (!newUsername.trim()) return;
    const pair = generateSshKeypair(newUsername);
    setGeneratedKey(pair);
  };

  const handleRegisterAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newDisplayName.trim()) return;

    const pair = generatedKey || generateSshKeypair(newUsername);
    const newAcc: MeowUserAccount = {
      username: newUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      displayName: newDisplayName,
      sshPublicKey: pair.publicKey,
      sshPrivateKeyFingerprint: pair.fingerprint,
      authMethod: 'ssh_key',
      createdTimestamp: new Date().toISOString().split('T')[0],
      isAdmin: accounts.length === 0,
      allowedSidecarPaths: ['/vault/all']
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveMeowAccounts(updated);

    setNewUsername('');
    setNewDisplayName('');
    setGeneratedKey(null);
    setIsRegistering(false);
  };

  const handleCopyAuthorizedKeys = () => {
    navigator.clipboard.writeText(authorizedKeysContent);
    setCopiedKeys(true);
    setTimeout(() => setCopiedKeys(false), 2000);
  };

  const handleCopyTunnel = () => {
    navigator.clipboard.writeText(sshTunnelScript);
    setCopiedTunnel(true);
    setTimeout(() => setCopiedTunnel(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Local SSH Authentication & Zero-Cloud Account Engine</h3>
              <p className="text-xs text-slate-400">Zero Cloud Access &bull; ED25519 SSH Key Vault &bull; Local Registration & ~/.ssh/authorized_keys</p>
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Zero Cloud Protection Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950 border border-indigo-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                <span className="font-extrabold text-indigo-200 text-sm">100% Zero-Cloud Data Meowty</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Accounts & sidecars remain local to your hardware. Authenticate family members via SSH ED25519 key pairs without transmitting user data to any external cloud provider.
              </p>
            </div>

            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 shadow-md transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register Local User</span>
            </button>
          </div>

          {/* Register Local User Form */}
          {isRegistering && (
            <form onSubmit={handleRegisterAccount} className="p-5 rounded-3xl bg-slate-950 border border-indigo-500/60 space-y-4 font-mono text-xs animate-fadeIn">
              <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Zero-Cloud Local Account Registration</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username (e.g. wife_piplup)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                  required
                />

                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Display Name (e.g. Wife Dawn & Piplup)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-300 text-[11px]">SSH ED25519 Key Pair Status:</span>
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center space-x-1 transition-all border border-slate-700"
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>{generatedKey ? 'Regenerate ED25519 Key' : 'Generate ED25519 Key'}</span>
                </button>
              </div>

              {generatedKey && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold block">Generated Public Key:</span>
                  <code className="text-[10px] text-slate-300 block truncate">{generatedKey.publicKey}</code>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Save Local Account
                </button>
              </div>
            </form>
          )}

          {/* Registered Accounts Cards */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Registered Local Meow Accounts ({accounts.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div key={acc.username} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{acc.displayName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                      @{acc.username}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <p>Auth: <strong className="text-emerald-400 uppercase">SSH ED25519 Key</strong></p>
                    <p className="truncate">Key: <code className="text-slate-300">{acc.sshPrivateKeyFingerprint}</code></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Snippets: authorized_keys & SSH Tunneling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            
            {/* authorized_keys */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>~/.ssh/authorized_keys File</span>
                </h4>

                <button
                  onClick={handleCopyAuthorizedKeys}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
                >
                  {copiedKeys ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKeys ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto">
                <pre className="text-[10px] text-amber-300 leading-relaxed font-mono whitespace-pre-wrap">{authorizedKeysContent}</pre>
              </div>
            </div>

            {/* SSH Tunnel Command */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>Local SSH Tunnel Command</span>
                </h4>

                <button
                  onClick={handleCopyTunnel}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
                >
                  {copiedTunnel ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTunnel ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <pre className="text-[10px] text-indigo-300 leading-relaxed font-mono whitespace-pre-wrap">{sshTunnelScript}</pre>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Local SSH Authentication & Account Meowty Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
