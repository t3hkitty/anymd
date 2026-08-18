import React, { useState } from 'react';
import type { SovereignSslAccount } from '../plugins/localSslAuthPlugin';
import { getSavedSslAccounts, saveSslAccounts, generateSslClientCert, generateApacheMtlsHtaccess } from '../plugins/localSslAuthPlugin';
import { X, ShieldCheck, UserPlus, Copy, Check, Terminal, Lock, Cpu, Award } from 'lucide-react';

interface LocalSslAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalSslAuthModal: React.FC<LocalSslAuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [accounts, setAccounts] = useState<SovereignSslAccount[]>(getSavedSslAccounts);
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [generatedCert, setGeneratedCert] = useState<{ certPem: string; keyPem: string; fingerprint: string; serial: string } | null>(null);

  if (!isOpen) return null;

  const htaccessContent = generateApacheMtlsHtaccess();

  const handleGenerateCert = () => {
    if (!newUsername.trim()) return;
    const cert = generateSslClientCert(newUsername, newEmail || `${newUsername}@artkitty.net`);
    setGeneratedCert(cert);
  };

  const handleRegisterAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newDisplayName.trim()) return;

    const cert = generatedCert || generateSslClientCert(newUsername, newEmail || `${newUsername}@artkitty.net`);
    const newAcc: SovereignSslAccount = {
      username: newUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      displayName: newDisplayName,
      email: newEmail || `${newUsername}@artkitty.net`,
      certFingerprint: cert.fingerprint,
      serialNumber: cert.serial,
      issuerCN: 'Sovereign-Local-CA-2026',
      validDays: 365,
      createdTimestamp: new Date().toISOString().split('T')[0],
      isAdmin: accounts.length === 0
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveSslAccounts(updated);

    setNewUsername('');
    setNewDisplayName('');
    setNewEmail('');
    setGeneratedCert(null);
    setIsRegistering(false);
  };

  const handleCopyHtaccess = () => {
    navigator.clipboard.writeText(htaccessContent);
    setCopiedHtaccess(true);
    setTimeout(() => setCopiedHtaccess(false), 2000);
  };

  const handleCopyCertPem = () => {
    if (!generatedCert) return;
    navigator.clipboard.writeText(generatedCert.certPem);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Local SSL Client Certificate Auth & mTLS Engine</h3>
              <p className="text-xs text-slate-400">Zero Cloud Access &bull; X.509 Mutual TLS (mTLS) Authentication &bull; Local Browser Certificate Store</p>
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
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                <span className="font-extrabold text-emerald-200 text-sm">Mutual TLS (mTLS) SSL Client Certificate Protection</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Authenticates users via HTTPS SSL Client Certificates (.crt / .p12) installed in the browser. Zero cloud login servers required!
              </p>
            </div>

            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow-md transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register Local SSL User</span>
            </button>
          </div>

          {/* Register Local User Form */}
          {isRegistering && (
            <form onSubmit={handleRegisterAccount} className="p-5 rounded-3xl bg-slate-950 border border-emerald-500/60 space-y-4 font-mono text-xs animate-fadeIn">
              <h4 className="font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Zero-Cloud SSL Client Certificate Registration</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username (e.g. wife_piplup)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold"
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

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email (e.g. wife@artkitty.net)"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-300 text-[11px]">SSL X.509 Client Certificate Status:</span>
                <button
                  type="button"
                  onClick={handleGenerateCert}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold flex items-center space-x-1 transition-all border border-slate-700"
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{generatedCert ? 'Regenerate SSL Cert' : 'Generate X.509 SSL Cert'}</span>
                </button>
              </div>

              {generatedCert && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold">Generated Client Cert Fingerprint:</span>
                    <button
                      type="button"
                      onClick={handleCopyCertPem}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copiedCert ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCert ? 'Copied PEM!' : 'Copy PEM'}</span>
                    </button>
                  </div>
                  <code className="text-[10px] text-slate-300 block truncate">{generatedCert.fingerprint}</code>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md"
                >
                  Save Local SSL Account
                </button>
              </div>
            </form>
          )}

          {/* Registered SSL Accounts Cards */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Registered Local SSL Certificates ({accounts.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div key={acc.username} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{acc.displayName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      @{acc.username}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <p>Auth: <strong className="text-emerald-400 uppercase">HTTPS X.509 mTLS Certificate</strong></p>
                    <p className="truncate">Serial: <code className="text-slate-300">{acc.serialNumber}</code></p>
                    <p className="truncate">Fingerprint: <code className="text-slate-300">{acc.certFingerprint}</code></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Apache mTLS .htaccess Rules */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Apache Mutual TLS (mTLS) .htaccess Rule</span>
              </h4>

              <button
                onClick={handleCopyHtaccess}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
              >
                {copiedHtaccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtaccess ? 'Copied mTLS .htaccess!' : 'Copy Rules'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto">
              <pre className="text-[10px] text-emerald-300 leading-relaxed font-mono whitespace-pre-wrap">{htaccessContent}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            HTTPS Mutual TLS (mTLS) Zero-Cloud Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
