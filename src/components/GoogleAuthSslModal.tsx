import React, { useState } from 'react';
import type { GoogleAuthSslConfig } from '../plugins/googleAuthSslPlugin';
import { getSavedGoogleAuthSslConfig, saveGoogleAuthSslConfig, generateGoogleCloudConsoleConfig, generateHttpsEnforcementHtaccess } from '../plugins/googleAuthSslPlugin';
import { X, Lock, ShieldCheck, Copy, Check, Terminal, Globe, Key, Sparkles } from 'lucide-react';

interface GoogleAuthSslModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthSslModal: React.FC<GoogleAuthSslModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<GoogleAuthSslConfig>(getSavedGoogleAuthSslConfig);
  const [copiedConsole, setCopiedConsole] = useState(false);
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');

  if (!isOpen) return null;

  const consoleConfigContent = generateGoogleCloudConsoleConfig(config);
  const htaccessContent = generateHttpsEnforcementHtaccess(config);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleAuthSslConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddEmail = () => {
    if (!newEmailInput.trim() || config.allowedEmails.includes(newEmailInput.trim())) return;
    setConfig({ ...config, allowedEmails: [...config.allowedEmails, newEmailInput.trim()] });
    setNewEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setConfig({ ...config, allowedEmails: config.allowedEmails.filter(e => e !== email) });
  };

  const handleCopyConsole = () => {
    navigator.clipboard.writeText(consoleConfigContent);
    setCopiedConsole(true);
    setTimeout(() => setCopiedConsole(false), 2000);
  };

  const handleCopyHtaccess = () => {
    navigator.clipboard.writeText(htaccessContent);
    setCopiedHtaccess(true);
    setTimeout(() => setCopiedHtaccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Google Auth OAuth 2.0 & HTTPS SSL Engine</h3>
              <p className="text-xs text-slate-400">Google Auth HTTPS Requirement &bull; Family Email Whitelist &bull; Auto HTTP &rarr; HTTPS Redirect</p>
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
          
          {/* SSL Requirement Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4.5 h-4.5 text-sky-400" />
                <span className="font-extrabold text-sky-200 text-sm">Google Auth Enforces HTTPS SSL Encryption</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                Google OAuth 2.0 requires HTTPS for all production domains (<code className="text-sky-300">https://meow.artkitty.net/lcmd/</code>). StackCP Auto-SSL & Let's Encrypt certificates protect user sessions.
              </p>
            </div>

            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center space-x-1.5 shadow-md transition-all shrink-0"
            >
              <span>Google Cloud Console</span>
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <h4 className="font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Key className="w-4 h-4" />
                <span>Google OAuth 2.0 Credentials (HTTPS Enforced)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Google OAuth Client ID:</label>
                  <input
                    type="text"
                    value={config.googleClientId}
                    onChange={(e) => setConfig({ ...config, googleClientId: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sky-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Google OAuth Client Secret:</label>
                  <input
                    type="password"
                    value={config.googleClientSecret}
                    onChange={(e) => setConfig({ ...config, googleClientSecret: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              {/* Allowed Family Accounts Whitelist */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] text-slate-400 block font-bold">Allowed Family Accounts Whitelist:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="Add family Google email (e.g. wife@artkitty.net)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                  >
                    + Add Email
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {config.allowedEmails.map(email => (
                    <span key={email} className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 flex items-center space-x-1.5">
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-slate-400 hover:text-red-400 font-bold ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 ${
                    savedSuccess
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  <span>{savedSuccess ? 'Settings Saved!' : 'Save Credentials'}</span>
                </button>
              </div>
            </div>

          </form>

          {/* Snippets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            
            {/* Google Cloud Console Setup */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Google Cloud Console URIs</span>
                </h4>

                <button
                  onClick={handleCopyConsole}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
                >
                  {copiedConsole ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedConsole ? 'Copied URIs!' : 'Copy URIs'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto">
                <pre className="text-[10px] text-sky-300 leading-relaxed font-mono whitespace-pre-wrap">{consoleConfigContent}</pre>
              </div>
            </div>

            {/* Apache HTTPS Enforcement .htaccess */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Apache HTTPS SSL .htaccess Rule</span>
                </h4>

                <button
                  onClick={handleCopyHtaccess}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
                >
                  {copiedHtaccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtaccess ? 'Copied Rules!' : 'Copy Rules'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto">
                <pre className="text-[10px] text-indigo-300 leading-relaxed font-mono whitespace-pre-wrap">{htaccessContent}</pre>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Google Auth OAuth 2.0 & HTTPS SSL Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
