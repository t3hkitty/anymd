import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';
import { Webhook, FolderPlus, Copy, Check, Radio, Lock, Unlock, AlertTriangle, RefreshCcw, Type } from 'lucide-react';

export function VaultWebhookGeneratorWidget() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [ngrokUrl, setNgrokUrl] = useState('https://your-ngrok-url.app');
  const [webhookName, setWebhookName] = useState('My Automation');
  const [folder, setFolder] = useState('Inbox');
  const [filename, setFilename] = useState('');
  
  const [prependText, setPrependText] = useState(`**My Automation**`);
  const [appendText, setAppendText] = useState('');

  // Auto-update prepend text if the user hasn't heavily modified it
  useEffect(() => {
    if (!prependText || prependText === `**${webhookName.slice(0, -1)}**` || prependText === `**${webhookName}**`) {
      setPrependText(`**${webhookName}**`);
    }
  }, [webhookName]);

  const encodedPrepend = encodeURIComponent(prependText);
  const encodedAppend = encodeURIComponent(appendText);
  const encodedFilename = filename ? `&filename=${encodeURIComponent(filename)}` : '';
  const webhookUrl = `${ngrokUrl}/webhook/sandbox_vault/${folder.toLowerCase()}?prepend=${encodedPrepend}&append=${encodedAppend}${encodedFilename}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setIsUnlocked(false);
    setWebhookName('My Automation');
    setFolder('Inbox');
    setFilename('');
    setPrependText('**My Automation**');
    setAppendText('');
    setCopied(false);
  };

  return (
    <WidgetPanel title="Vault Webhook Generator" icon={<Webhook className="w-4 h-4 text-emerald-400" />}>
      <div className="flex flex-col gap-4 text-sm text-slate-300">
        <p>
          Generate a Discord-style Webhook URL that allows external apps to post markdown files directly into this vault.
        </p>
        
        {!isUnlocked ? (
          <div className="bg-rose-950/40 border border-rose-900 rounded-lg p-4 flex flex-col items-center text-center gap-3">
            <Lock className="w-8 h-8 text-rose-500 mb-1" />
            <h4 className="font-bold text-rose-400">Developer TOS & Security</h4>
            <p className="text-xs text-rose-300/80 max-w-sm">
              Generating a public webhook URL exposes this specific Vault folder to external networks. 
              By unlocking this, you agree that <strong>anyone with the link</strong> can write files directly to your system.
              <br/><br/>
              <em>Built-in Failsafe:</em> Access will be automatically paused for 5 minutes if activity exceeds 30 requests per minute to prevent botting or spam loops.
            </p>
            <button 
              onClick={() => setIsUnlocked(true)}
              className="mt-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-4 rounded-md transition-colors flex items-center gap-2 text-xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              I Agree, Unlock Webhooks
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Webhook Name</label>
                <div className="flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-emerald-400" />
                  <input 
                    type="text" 
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 flex-1 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. Fitbit Sync"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Vault Folder</label>
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-indigo-400" />
                  <input 
                    type="text" 
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 flex-1 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. Inbox, Daily Notes"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Specific Filename (Append Mode)</label>
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-400" />
                <input 
                  type="text" 
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded p-1.5 flex-1 focus:border-indigo-500 focus:outline-none text-xs"
                  placeholder="e.g. Fitbit-Log.md (Leave blank for new files)"
                />
              </div>
              <p className="text-[10px] text-slate-500 italic">If provided, incoming payloads will be appended as newlines to the bottom of this exact file instead of creating a new timestamped file.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Format Modifier (Prepend & Append)</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Type className="w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={prependText}
                    onChange={(e) => setPrependText(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 flex-1 focus:border-indigo-500 focus:outline-none text-xs"
                    placeholder="Prepend markdown..."
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Type className="w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={appendText}
                    onChange={(e) => setAppendText(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 flex-1 focus:border-indigo-500 focus:outline-none text-xs"
                    placeholder="Append markdown..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-2 mt-2">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Live Webhook URL (Keep Secret)
              </label>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs text-amber-300 break-all select-all whitespace-normal max-h-24 overflow-y-auto">{webhookUrl}</code>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  title="Copy Webhook URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-slate-700/50 pt-3">
              <button 
                onClick={handleReset}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors font-bold px-2 py-1 rounded hover:bg-amber-400/10"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Reset & Create Another
              </button>
              
              <button 
                onClick={() => setIsUnlocked(false)}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3" /> Lock Webhooks
              </button>
            </div>

          </div>
        )}
      </div>
    </WidgetPanel>
  );
}
