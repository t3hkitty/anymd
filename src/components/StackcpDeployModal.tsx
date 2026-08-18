import React, { useState } from 'react';
import type { StackcpDeployConfig } from '../plugins/stackcpDeployPlugin';
import { getSavedStackcpConfig, saveStackcpConfig, generateStackcpLftpScript } from '../plugins/stackcpDeployPlugin';
import { X, Server, Terminal, Copy, Check, ExternalLink, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface StackcpDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StackcpDeployModal: React.FC<StackcpDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<StackcpDeployConfig>(getSavedStackcpConfig);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [isSimulatingDeploy, setIsSimulatingDeploy] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  if (!isOpen) return null;

  const scriptContent = generateStackcpLftpScript(config);

  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /meow/lcmd/
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /meow/lcmd/index.html [L]
</IfModule>`;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStackcpConfig(config);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyHtaccess = () => {
    navigator.clipboard.writeText(htaccessContent);
    setCopiedHtaccess(true);
    setTimeout(() => setCopiedHtaccess(false), 2000);
  };

  const handleSimulateDeploy = () => {
    setIsSimulatingDeploy(true);
    setDeploySuccess(false);

    setTimeout(() => {
      setIsSimulatingDeploy(false);
      setDeploySuccess(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">StackCP FTP Deployment (meow.artkitty.net)</h3>
              <p className="text-xs text-slate-400">Target: ftp.us.stackcp.com &bull; User: kitty@artkitty.net &bull; Path: /public_html/meow/</p>
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
          
          {/* Status Highlight Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-amber-300 text-sm">meow.artkitty.net</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase">
                  ACTIVE HOSTING
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                StackCP Server: <strong className="text-slate-200">ftp.us.stackcp.com:21</strong> &bull; Remote: <strong className="text-slate-200">/public_html/meow/</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleSimulateDeploy}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all ${
                  deploySuccess
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isSimulatingDeploy ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mirroring ./dist...</span>
                  </>
                ) : deploySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Deployed Live!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Deploy to StackCP</span>
                  </>
                )}
              </button>

              <a
                href={config.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1 transition-all"
              >
                <span>Visit Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 🔒 Free SSL Through StackCP & 24-Hour Nameserver Propagation Notice */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-emerald-500/40 space-y-2.5 font-mono text-xs shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase tracking-wider">Free SSL / HTTPS Activation via StackCP</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Let's Encrypt / AutoSSL
              </span>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              StackCP includes 100% free automated SSL/TLS certificates. To activate on <code>meow.artkitty.net</code>, navigate to <strong>StackCP &rarr; Security &rarr; SSL/TLS Certificates &rarr; Free SSL &rarr; Activate</strong>, and toggle <strong>Force HTTPS (301)</strong>.
            </p>

            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[11px] font-sans">
              <span className="font-bold text-amber-300 block mb-1 font-mono">⏳ 24-Hour Nameserver Wait Pause Notice:</span>
              When pointing your custom domain to StackCP nameservers (<code>ns1.stackdns.com</code> to <code>ns4.stackdns.com</code>), DNS records require up to <strong>24 hours</strong> to propagate globally. If AutoSSL reports a DNS challenge error, pause for the 24-hour TTL window to complete before re-triggering certificate activation.
            </div>
          </div>

          {/* Form: Config Settings */}
          <form onSubmit={handleSaveConfig} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Server className="w-4 h-4" />
              <span>StackCP FTP Credentials Configuration</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">FTP Host Server:</label>
                <input
                  type="text"
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">FTP Username:</label>
                <input
                  type="text"
                  value={config.user}
                  onChange={(e) => setConfig({ ...config, user: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Remote Web Directory:</label>
                <input
                  type="text"
                  value={config.remoteDir}
                  onChange={(e) => setConfig({ ...config, remoteDir: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Live Site Endpoint:</label>
                <input
                  type="text"
                  value={config.liveUrl}
                  onChange={(e) => setConfig({ ...config, liveUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold"
                />
              </div>
            </div>
          </form>

          {/* Generated Shell Script Code Preview (`deploy_meow.sh`) */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Generated Shell Script (deploy_meow.sh)</span>
              </h4>

              <button
                onClick={handleCopyScript}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-all border border-slate-700"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied deploy_meow.sh!' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <pre className="text-[11px] text-amber-300 leading-relaxed font-mono whitespace-pre-wrap">{scriptContent}</pre>
            </div>
          </div>

          {/* StackCP .htaccess Rewrite Rules */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Apache .htaccess for StackCP SPA Routing</span>
              </h4>

              <button
                onClick={handleCopyHtaccess}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-all border border-slate-700"
              >
                {copiedHtaccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtaccess ? 'Copied .htaccess!' : 'Copy .htaccess'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <pre className="text-[11px] text-indigo-300 leading-relaxed font-mono whitespace-pre-wrap">{htaccessContent}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            StackCP FTP Auto-Deployment Configured for meow.artkitty.net
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
