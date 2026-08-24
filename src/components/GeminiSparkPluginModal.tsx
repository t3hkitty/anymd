import React, { useState } from 'react';
import { X, Bot, Sparkles, Copy, Check, Terminal, ExternalLink, Zap } from 'lucide-react';
import { generateMcpServerCode } from '../plugins/geminiSparkPlugin';

interface GeminiSparkPluginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiSparkPluginModal: React.FC<GeminiSparkPluginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [vaultPath, setVaultPath] = useState('C:\\Users\\lorik\\.gemini\\antigravity\\scratch\\anymd\\Sidecars');

  if (!isOpen) return null;

  const serverCode = generateMcpServerCode({
    vaultPath,
    port: 3333,
    apiKey: 'meow-spark-secret'
  });

  const mcpConfig = JSON.stringify({
    mcpServers: {
      "anymd-spark": {
        "command": "node",
        "args": [
          "C:\\Users\\lorik\\.gemini\\antigravity\\scratch\\anymd\\anymd-mcp.js"
        ]
      }
    }
  }, null, 2);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(serverCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(mcpConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">🐾 MyBlackBox & MCP Flight Bridge ✈️</h3>
              <p className="text-xs text-slate-400">Connect MyBlackBox Flight Recorder Vault to Gemini's 24/7 Proactive AI Agent</p>
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
          
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 font-mono text-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span className="font-extrabold text-sm">How MyBlackBox (Flight Recorder) connects to Gemini Spark</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Like a black box flight data recorder surviving aviation journeys, MyBlackBox safely logs your daily logs and sidecars locally. Gemini Spark can run background tasks 24/7 to read and write your `.companion.md` logs by exposing your folder to Spark using the Model Context Protocol (MCP) flight bridge.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Local Sidecar Path</label>
            <input
              type="text"
              value={vaultPath}
              onChange={(e) => setVaultPath(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
              placeholder="e.g. C:\path\to\myblackbox\Sidecars"
            />
          </div>

          {/* Downloads & Links Section */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>💾 Downloads & Portal Links</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-slate-100 block">Vivaldi / Chrome Extension Zip:</strong>
                <a
                  href="https://github.com/t3hkitty/library-companion-md/archive/refs/heads/main.zip"
                  className="text-indigo-400 hover:text-indigo-300 underline font-bold flex items-center gap-1 text-[11px]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Download GitHub Source ZIP</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-[10px] text-slate-400 mt-1">
                  Extract ZIP and load the <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300">public/companion-sidepanel-extension</code> directory in Vivaldi's <code className="bg-slate-950 px-1 py-0.5 rounded">chrome://extensions</code> page.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <strong className="text-slate-100 block">Live Web App Portal:</strong>
                <a
                  href="https://artkitty.net/anymddb/"
                  className="text-emerald-400 hover:text-emerald-300 underline font-bold flex items-center gap-1 text-[11px]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Go to artkitty.net/anymddb/</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-[10px] text-slate-400 mt-1">
                  Your primary web app dashboard for MyBlackBox and flight logs.
                </p>
              </div>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="space-y-4">
            <div className="border border-slate-850 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-850 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Save standard MCP Bridge script (`anymd-mcp.js`)</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors flex items-center space-x-1"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 overflow-x-auto text-[11px] text-slate-400 font-mono max-h-48">
                {serverCode}
              </pre>
            </div>

            <div className="border border-slate-850 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-850 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Add to Gemini Spark / MCP configuration</span>
                </span>
                <button
                  onClick={handleCopyConfig}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors flex items-center space-x-1"
                >
                  {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedConfig ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 overflow-x-auto text-[11px] text-indigo-300 font-mono">
                {mcpConfig}
              </pre>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 font-mono leading-relaxed">
            <strong>💡 Pro-tip:</strong> Run `npm install @modelcontextprotocol/sdk` in your project root before launching the bridge script to resolve dependencies!
          </div>

        </div>

      </div>
    </div>
  );
};
