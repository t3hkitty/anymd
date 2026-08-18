import React, { useState } from 'react';
import type { GoogleUserProfile, GoogleAuthConfig } from '../plugins/googleAuthPlugin';
import { getSavedGoogleAuthConfig, saveGoogleAuthConfig, MOCK_GOOGLE_FAMILY_MEMBERS } from '../plugins/googleAuthPlugin';
import { X, Server, ShieldCheck, Key, Check, Globe, Copy, Sparkles } from 'lucide-react';

interface GoogleAuthDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthDeployModal: React.FC<GoogleAuthDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [authConfig, setAuthConfig] = useState<GoogleAuthConfig>(getSavedGoogleAuthConfig);
  const [currentUser, setCurrentUser] = useState<GoogleUserProfile | null>(MOCK_GOOGLE_FAMILY_MEMBERS[0]);
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleAuthConfig(authConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const sampleHtaccess = `# Midphase cPanel Apache .htaccess for Sovereign Library Companion MD
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
Header set Access-Control-Allow-Origin "*"
`;

  const handleCopyHtaccess = () => {
    navigator.clipboard.writeText(sampleHtaccess);
    setCopiedHtaccess(true);
    setTimeout(() => setCopiedHtaccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-600 text-white font-bold shadow-lg shadow-sky-600/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">Midphase Server Hosting & Google Auth Setup</h3>
              <p className="text-xs text-slate-400">Deploy LC-MD to Midphase Server for Family Access & Store Accounts via Google Auth</p>
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          
          {/* Active User Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/40 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full border border-sky-400 object-cover"
              />
              <div>
                <span className="font-bold text-slate-100 block">{currentUser?.name} ({currentUser?.email})</span>
                <span className="text-emerald-400 text-[11px] flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Google Auth Verified &bull; {currentUser?.familyRole}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Switch Profile:</span>
              <select
                value={currentUser?.googleId}
                onChange={(e) => {
                  const found = MOCK_GOOGLE_FAMILY_MEMBERS.find(m => m.googleId === e.target.value);
                  if (found) setCurrentUser(found);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 font-bold"
              >
                {MOCK_GOOGLE_FAMILY_MEMBERS.map(m => (
                  <option key={m.googleId} value={m.googleId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Google OAuth Configurator Form */}
          <form onSubmit={handleSaveConfig} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Key className="w-4 h-4 text-amber-400" />
                <span>1. Google OAuth 2.0 Credentials</span>
              </span>
              <span className="text-[11px] text-slate-400">Google Identity API</span>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block font-bold">Google Client ID (Google Cloud Console):</label>
              <input
                type="text"
                value={authConfig.clientId}
                onChange={(e) => setAuthConfig({ ...authConfig, clientId: e.target.value })}
                placeholder="123456789-abc.apps.googleusercontent.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-sky-300 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block font-bold">Allowed Family Email Whitelist (Comma Separated):</label>
              <input
                type="text"
                value={authConfig.allowedEmails.join(', ')}
                onChange={(e) => setAuthConfig({ ...authConfig, allowedEmails: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="family.member1@gmail.com, family.member2@gmail.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-300 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block font-bold">Midphase Domain URL:</label>
              <input
                type="url"
                value={authConfig.midphaseDomain}
                onChange={(e) => setAuthConfig({ ...authConfig, midphaseDomain: e.target.value })}
                placeholder="https://library.yourdomain.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-indigo-300 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Accounts auto-sync to Google Drive & WebDAV</span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Sparkles className="w-4 h-4" />}
                <span>{savedSuccess ? 'Settings Saved!' : 'Save Google Auth Settings'}</span>
              </button>
            </div>
          </form>

          {/* Midphase Hosting Deployment Guide */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-indigo-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>2. Midphase Server Deployment Instructions</span>
              </span>
              <span className="text-[11px] text-slate-400">cPanel / FTP / Apache</span>
            </div>

            <ol className="space-y-3 text-slate-300 list-decimal pl-4 leading-relaxed">
              <li>
                <strong>Configure Google OAuth Origins</strong>: Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">Google Cloud Console</a> &rarr; Credentials &rarr; OAuth 2.0 Client ID. Add <code className="text-amber-300">{authConfig.midphaseDomain}</code> under <em>Authorized JavaScript origins</em> and <em>Authorized redirect URIs</em>.
              </li>
              <li>
                <strong>Build Bundle</strong>: Run <code className="text-emerald-400">npm run build</code> in project folder to compile output into the <code className="text-amber-300">dist/</code> directory.
              </li>
              <li>
                <strong>Upload to Midphase</strong>: Open Midphase cPanel File Manager (or FileZilla FTP / WebDAV), navigate to <code className="text-indigo-300">public_html/</code>, and upload all files from <code className="text-amber-300">dist/</code>.
              </li>
              <li>
                <strong>Apache `.htaccess` Rewrite Rules</strong>: Create a <code className="text-amber-300">.htaccess</code> file inside <code className="text-indigo-300">public_html/</code> to support SPA routing:
              </li>
            </ol>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <pre className="text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">{sampleHtaccess}</pre>
              <button
                onClick={handleCopyHtaccess}
                className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center space-x-1 transition-all"
              >
                {copiedHtaccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtaccess ? 'Copied!' : 'Copy .htaccess'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Family Whitelist: <strong>{authConfig.allowedEmails.length} Google Accounts</strong></span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
