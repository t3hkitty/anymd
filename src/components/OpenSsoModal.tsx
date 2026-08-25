import React, { useState } from 'react';
import type { UserProfile } from '../plugins/profileManagementPlugin';
import { getActiveProfile, updateExistingProfile } from '../plugins/profileManagementPlugin';
import { SUPPORTED_OPEN_SSO_PROVIDERS, registerWebAuthnPasskey, type SsoProviderType } from '../plugins/openSsoPlugin';
import {
  X,
  KeyRound,
  Fingerprint,
  ShieldCheck,
  Lock,
  Info,
  Server,
  Code2
} from 'lucide-react';

interface OpenSsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (profile: UserProfile) => void;
}

export const OpenSsoModal: React.FC<OpenSsoModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated
}) => {
  const [selectedProvider, setSelectedProvider] = useState<SsoProviderType>('webauthn_passkey');
  const [passkeyStatus, setPasskeyStatus] = useState<string | null>(null);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [activeProfile, setActiveProfile] = useState<UserProfile>(getActiveProfile);

  if (!isOpen) return null;

  const handleEnrollPasskey = async () => {
    setIsPasskeyLoading(true);
    setPasskeyStatus('Waiting for TouchID / FaceID / Windows Hello authentication...');

    const result = await registerWebAuthnPasskey(activeProfile.username);
    setIsPasskeyLoading(false);

    if (result.success) {
      setPasskeyStatus(`✓ Passkey enrolled successfully! Bound to ${activeProfile.username}.`);
      const updated: UserProfile = {
        ...activeProfile,
        sslFingerprint: `FIDO2-WEBAUTHN:${result.credentialId?.substring(0, 16)}...`
      };
      updateExistingProfile(updated);
      setActiveProfile(updated);
      if (onAuthenticated) onAuthenticated(updated);
    } else {
      setPasskeyStatus(`Passkey enrollment error: ${result.error}`);
    }
  };

  const handleGithubRedirect = () => {
    // Generate GitHub OAuth authorize URL
    const clientId = 'Iv1.YOUR_GITHUB_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
    
    // In demo environment, simulate instant GitHub OAuth binding
    const updated: UserProfile = {
      ...activeProfile,
      bio: activeProfile.bio ? `${activeProfile.bio} • GitHub OAuth Connected` : 'GitHub OAuth Connected',
      customLinks: {
        ...activeProfile.customLinks,
        storeUrl: 'https://github.com/t3hkitty'
      },
      sslFingerprint: `GITHUB-OAUTH:@t3hkitty`
    };
    updateExistingProfile(updated);
    setActiveProfile(updated);
    if (onAuthenticated) onAuthenticated(updated);

    alert(`Simulated GitHub OAuth Authentication for @t3hkitty! Account bound successfully. (OAuth URL: ${githubAuthUrl})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500 text-slate-950 font-bold shadow-lg shadow-indigo-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>OpenSSO, Passkeys & Piggyback Identity Providers</span>
              </h3>
              <p className="text-xs text-slate-400">Zero-Cloud SSO Alternatives &bull; WebAuthn TouchID/FaceID &bull; GitHub OAuth &bull; Authelia OIDC</p>
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
          
          {/* Explanation Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/50 border border-indigo-500/40 space-y-2 font-mono text-xs shadow-xl">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold text-indigo-200 text-sm">How to "Piggyback" Without Setting Up SMTP:</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              If you don't want to configure SMTP or send verification emails, you can piggyback on <strong>Hardware Passkeys (WebAuthn)</strong> or <strong>GitHub OAuth</strong>. Passkeys use your device's native Touch ID, Face ID, or Windows Hello for instant, 100% cryptographic logins with zero servers needed!
            </p>
          </div>

          {/* SSO Provider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_OPEN_SSO_PROVIDERS.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              return (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-400/80 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {provider.id === 'webauthn_passkey' && <Fingerprint className="w-5 h-5 text-emerald-400" />}
                        {provider.id === 'github_oauth' && <Code2 className="w-5 h-5 text-white" />}
                        {provider.id === 'authentik_authelia' && <Server className="w-5 h-5 text-purple-400" />}
                        {provider.id === 'invite_code' && <Lock className="w-5 h-5 text-amber-400" />}
                        <h4 className="font-bold text-slate-100 text-sm">{provider.name}</h4>
                      </div>
                    </div>

                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 text-[10px] font-mono font-bold">
                      {provider.badge}
                    </span>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{provider.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Setup: <strong className="text-slate-200">{provider.setupComplexity}</strong></span>
                    <span className={`font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {isSelected ? '● Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Area based on Selected SSO */}
          {selectedProvider === 'webauthn_passkey' && (
            <div className="p-5 rounded-3xl bg-slate-950 border border-emerald-500/40 space-y-4 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span>Hardware Passkey Enrollment (Touch ID / Face ID / Windows Hello)</span>
                </h4>
                <span className="text-[10px] text-slate-500">Zero Server &bull; Zero Passwords</span>
              </div>

              <p className="text-xs text-slate-300 font-sans">
                Enroll a biometric hardware passkey for user <strong className="text-amber-300">@{activeProfile.username}</strong>. Future logins will only require a single fingerprint or face scan.
              </p>

              {passkeyStatus && (
                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{passkeyStatus}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleEnrollPasskey}
                  disabled={isPasskeyLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md transition-all flex items-center space-x-2 text-xs"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isPasskeyLoading ? 'Authenticating Sensor...' : 'Enroll Hardware Passkey Now'}</span>
                </button>
              </div>
            </div>
          )}

          {selectedProvider === 'github_oauth' && (
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Code2 className="w-4 h-4 text-white" />
                  <span>Piggyback on GitHub OAuth (Zero Maintenance)</span>
                </h4>
                <span className="text-[10px] text-slate-500">OAuth 2.0 / OpenID</span>
              </div>

              <p className="text-xs text-slate-300 font-sans">
                Allow anyone with a GitHub account to log in with 1 click. Create a free OAuth App in your GitHub account (Settings &rarr; Developer settings &rarr; OAuth Apps) with redirect URL <code>https://meow.artkitty.net/anymd/</code>.
              </p>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGithubRedirect}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold shadow-md transition-all flex items-center space-x-2 text-xs"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Authenticate with GitHub (@t3hkitty)</span>
                </button>
              </div>
            </div>
          )}

          {selectedProvider === 'authentik_authelia' && (
            <div className="p-5 rounded-3xl bg-slate-950 border border-purple-500/40 space-y-3 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Self-Hosted Authelia / Authentik (OpenSSO OIDC Hub)</span>
                </h4>
                <span className="text-[10px] text-slate-500">Self-Hosted Docker OIDC</span>
              </div>

              <p className="text-xs text-slate-300 font-sans">
                Authelia & Authentik are the premier open-source OpenSSO replacements. Run a single Docker container on your homelab or VPS to provide single sign-on across all your apps (Black Box, Library, Nextcloud, Plex, Gitea).
              </p>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                <span className="text-slate-400 block font-bold">OIDC Endpoints (auth.artkitty.net):</span>
                <code className="text-purple-300 block">Issuer: https://auth.artkitty.net</code>
                <code className="text-purple-300 block">Authorize: https://auth.artkitty.net/api/oidc/authorization</code>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Active: <strong className="text-indigo-300">@{activeProfile.username}</strong> ({activeProfile.displayName})
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
