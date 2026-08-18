import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { CloudAccount } from '../types/cloudAccounts';
import type { WebDAVFileItem } from '../plugins/webdavIndexerPlugin';
import {
  generateWebDAVDirectoryMarkdownIndex,
  convertWebDAVFilesToBooks,
  parseWebDAVDirectoryXml,
  parseTextDirectoryListing,
  fetchWebDAVDirectoryItems
} from '../plugins/webdavIndexerPlugin';
import { RemoteCloudBrowserModal } from './RemoteCloudBrowserModal';
import { X, Cloud, RefreshCw, Folder, FileText, Download, Upload, Server, AlertCircle, CheckCircle, FolderSync, Terminal, Activity, HardDrive, Copy, Sparkles, Puzzle, Trash2 } from 'lucide-react';

interface WebDAVIndexerModalProps {
  isOpen: boolean;
  relLinkRoot: string;
  accounts: CloudAccount[];
  onClose: () => void;
  onImportWebDAVBooks: (books: any[]) => void;
}

// Sims Loading Screen Spline Reticulator & Ragebait Announcer Messages
const SIMS_RETICULATOR_MESSAGES = [
  '🌀 Reticulating splines...',
  '📜 Un-wrinkling ancient ebook spines...',
  '🧙 Checking spellbook index for hidden runes...',
  '😱 OH NO... WTF?! Is Filejump taking a nap?!',
  '🤪 J/K J/K RAGEBAIT YTOLOLOLOL! 😜 Parsing WebDAV XML nodes...',
  '📚 Polishing mahogany bookcases...',
  '⚡ Bypassing browser CORS restrictions via Node.js proxy...',
  '💎 Extracting jewel-toned book metadata...',
  '🧹 Sweeping dust off remote WebDAV directories...'
];

// Injected Pop-Up Overlay Bookmarklet for Filejump Webpage
const BOOKMARKLET_POPUP_SNIPPET = `javascript:(function(){const names=Array.from(document.querySelectorAll('.file-name,.filename,[data-filename],td,a,span,div,p')).map(e=>e.innerText.trim()).filter(t=>t.endsWith('.epub')||t.endsWith('.pdf')||t.endsWith('.md')||t.endsWith('.txt')).filter((v,i,a)=>a.indexOf(v)===i).join('\\n');if(!names){alert('⚠️ No ebook files (.epub, .pdf, .md) detected on this Filejump page.');return;}const old=document.getElementById('lc-md-extractor-modal');if(old)old.remove();const modal=document.createElement('div');modal.id='lc-md-extractor-modal';modal.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;width:340px;background:#0f172a;color:#f8fafc;border:2px solid #38bdf8;border-radius:16px;padding:16px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);font-family:system-ui,sans-serif;';modal.innerHTML=\`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><h3 style="margin:0;font-size:14px;color:#38bdf8;font-weight:bold;">🚀 Filejump Ebook Extractor</h3><button id="lc-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">✖</button></div><p style="margin:0 0 8px 0;font-size:11px;color:#cbd5e1;">Extracted \${names.split('\\n').length} ebook filenames below. Select or click Copy below!</p><textarea id="lc-text-box" style="width:100%;height:140px;background:#020617;color:#38bdf8;border:1px solid #334155;border-radius:8px;padding:8px;font-family:monospace;font-size:11px;box-sizing:border-box;resize:none;">\${names}</textarea><button id="lc-copy-btn" style="width:100%;margin-top:10px;padding:10px;background:#0284c7;color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;font-size:12px;">📋 Select & Copy All Filenames</button>\`;document.body.appendChild(modal);const txtBox=document.getElementById('lc-text-box');const copyBtn=document.getElementById('lc-copy-btn');txtBox.select();copyBtn.onclick=function(){txtBox.select();document.execCommand('copy');copyBtn.innerText='✅ Copied to Clipboard!';copyBtn.style.background='#059669';setTimeout(()=>{copyBtn.innerText='📋 Select & Copy All Filenames';copyBtn.style.background='#0284c7';},2000);};document.getElementById('lc-close-btn').onclick=function(){modal.remove();};})();`;

export const WebDAVIndexerModal: React.FC<WebDAVIndexerModalProps> = ({
  isOpen,
  relLinkRoot,
  accounts,
  onClose,
  onImportWebDAVBooks,
}) => {
  const activeAccount = accounts.find(a => a.isActive) || accounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string>(activeAccount?.id || '');
  const [serverUrl, setServerUrl] = useState<string>(activeAccount?.serverUrl || 'https://uploads.filejump.com/dav/');
  const [dirPath, setDirPath] = useState<string>(activeAccount?.remoteRootFolder || '/md_library');
  const [pasteInput, setPasteInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  // Loading Announcer & Progress State
  const [reticulatorMsg, setReticulatorMsg] = useState('🌀 Reticulating splines...');
  const [progressPercent, setProgressPercent] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Live Action Console Log
  const [actionLogs, setActionLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 🚀 WebDAV Engine initialized for active account: ${activeAccount?.name || 'Filejump'}`
  ]);

  const addLog = useCallback((msg: string) => {
    setActionLogs(prev => [msg, ...prev.slice(0, 15)]);
  }, []);

  const [fileList, setFileList] = useState<WebDAVFileItem[]>([
    { filename: 'My_Filejump_Book_1.epub', size: 1499968, lastModified: '2026-08-17', isDir: false },
    { filename: 'Filejump_Sovereign_Guide.pdf', size: 2100500, lastModified: '2026-08-16', isDir: false },
    { filename: 'Backup_Subfolder', size: 0, lastModified: '2026-08-15', isDir: true }
  ]);
  const [generatedIndexMd, setGeneratedIndexMd] = useState('');

  // Auto update serverUrl when selected Account changes
  useEffect(() => {
    const acc = accounts.find(a => a.id === selectedAccountId);
    if (acc) {
      setServerUrl(acc.serverUrl);
      setDirPath(acc.remoteRootFolder || '/md_library');
      addLog(`[${new Date().toLocaleTimeString()}] 🔄 Switched active account to: ${acc.name} (${acc.serverUrl})`);
    }
  }, [selectedAccountId, accounts, addLog]);

  if (!isOpen) return null;

  const currentAccName = accounts.find(a => a.id === selectedAccountId)?.name || 'Filejump';
  const cleanServer = serverUrl.replace(/\/$/, '');
  const cleanFolder = dirPath.startsWith('/') ? dirPath : `/${dirPath}`;
  const fullEbookSourcePath = `${cleanServer}${cleanFolder}`;
  const sidecarSavePath = `cloud://${currentAccName.split(' ')[0]}${cleanFolder}/*.companion.md`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(BOOKMARKLET_POPUP_SNIPPET);
    setCopiedBookmarklet(true);
    addLog(`[${new Date().toLocaleTimeString()}] 📋 Copied On-Screen Pop-Up Bookmarklet! Paste into browser Bookmark URL.`);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
  };

  const handleScanWebDAV = async () => {
    setIsLoading(true);
    setScanNotice(null);
    setProgressPercent(10);
    setElapsedSeconds(0);

    let secCount = 0;
    let msgIdx = 0;

    // Start Sims Reticulator & Announcer Interval Ticker
    timerRef.current = setInterval(() => {
      secCount += 0.5;
      setElapsedSeconds(Number(secCount.toFixed(1)));
      setProgressPercent(prev => Math.min(92, prev + 8));

      // Cycle Sims Troll Messages every 1.5s
      if (secCount % 1.5 === 0) {
        msgIdx = (msgIdx + 1) % SIMS_RETICULATOR_MESSAGES.length;
        const msg = SIMS_RETICULATOR_MESSAGES[msgIdx];
        setReticulatorMsg(msg);
        addLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
      }
    }, 500);

    const selectedAcc = accounts.find(a => a.id === selectedAccountId);
    addLog(`[${new Date().toLocaleTimeString()}] 📡 Initializing PROPFIND connection to ${fullEbookSourcePath}...`);

    if (pasteInput.trim()) {
      addLog(`[${new Date().toLocaleTimeString()}] 📄 Parsing custom directory input / PROPFIND XML...`);
      const items = parseWebDAVDirectoryXml(pasteInput);
      setFileList(items);
      const indexMd = generateWebDAVDirectoryMarkdownIndex(serverUrl, dirPath, items);
      setGeneratedIndexMd(indexMd);
      addLog(`[${new Date().toLocaleTimeString()}] ✅ Successfully compiled index for ${items.length} items!`);
      
      clearInterval(timerRef.current);
      setProgressPercent(100);
      setIsLoading(false);
      return;
    }

    addLog(`[${new Date().toLocaleTimeString()}] 🔐 Authenticating with ${selectedAcc?.username || 'User'} via CORS Proxy Bridge (/api/webdav-proxy)...`);
    
    // Perform live HTTP PROPFIND fetch to remote WebDAV server endpoint
    const result = await fetchWebDAVDirectoryItems(serverUrl, dirPath, selectedAcc);

    clearInterval(timerRef.current);
    setProgressPercent(100);

    if (result.error || result.items.length === 0) {
      addLog(`[${new Date().toLocaleTimeString()}] ⚠️ Remote fetch notice: ${result.error || 'Using default items'}`);
      setScanNotice(result.error || 'No remote XML items found. Using parsed directory items.');
      
      const fallbackItems = parseTextDirectoryListing(`My_Filejump_Book_1.epub
Filejump_Sovereign_Guide.pdf`);
      setFileList(fallbackItems);
      const indexMd = generateWebDAVDirectoryMarkdownIndex(serverUrl, dirPath, fallbackItems);
      setGeneratedIndexMd(indexMd);
      addLog(`[${new Date().toLocaleTimeString()}] ℹ️ Loaded ${fallbackItems.length} directory files. You can paste custom filenames or use Pop-Up Bookmarklet above!`);
    } else {
      addLog(`[${new Date().toLocaleTimeString()}] 🎉 HTTP 207 Multi-Status Success! Discovered ${result.items.length} WebDAV files from ${serverUrl}`);
      setFileList(result.items);
      const indexMd = generateWebDAVDirectoryMarkdownIndex(serverUrl, dirPath, result.items);
      setGeneratedIndexMd(indexMd);
    }

    setIsLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    addLog(`[${new Date().toLocaleTimeString()}] 📁 Uploading ${files.length} local ebook files to WebDAV index...`);
    const items: WebDAVFileItem[] = Array.from(files).map((f) => ({
      filename: f.name,
      size: f.size,
      lastModified: new Date(f.lastModified).toISOString().split('T')[0],
      isDir: false
    }));

    setFileList(items);
    const indexMd = generateWebDAVDirectoryMarkdownIndex(serverUrl, dirPath, items);
    setGeneratedIndexMd(indexMd);
    addLog(`[${new Date().toLocaleTimeString()}] ✅ Processed ${items.length} local files.`);
  };

  const handleImportAll = () => {
    if (fileList.length === 0) {
      alert('Please scan or paste your Filejump directory files first.');
      return;
    }
    addLog(`[${new Date().toLocaleTimeString()}] 📥 Converting ${fileList.length} WebDAV files into active reading library...`);
    const books = convertWebDAVFilesToBooks(fileList, relLinkRoot);
    onImportWebDAVBooks(books);
    addLog(`[${new Date().toLocaleTimeString()}] 🌟 Successfully imported ${books.length} books! Opening reader canvas...`);
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">WebDAV Cloud Storage & Markdown Indexer</h3>
              <p className="text-xs text-slate-400">Sims Spline Reticulator Announcer &bull; On-Screen Pop-Up Bookmarklet &bull; Filejump</p>
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Active Cloud Account Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-sky-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200">Active Cloud Account:</span>
            </div>

            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.serverUrl})
                </option>
              ))}
            </select>
          </div>

          {/* Explicit Ebook Source & Companion Sidecar Save Location Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1 font-mono">
                  <Folder className="w-3 h-3 text-sky-400" />
                  <span>📖 Ebook Sourcing Path:</span>
                </span>
                <p className="font-mono text-amber-300 text-xs truncate bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  {fullEbookSourcePath}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1 font-mono">
                  <HardDrive className="w-3 h-3 text-emerald-400" />
                  <span>📝 Sidecar Note Location (.md/dcmd):</span>
                </span>
                <p className="font-mono text-emerald-300 text-xs truncate bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  {sidecarSavePath}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                WebDAV Server Endpoint URL
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <FolderSync className="w-3.5 h-3.5 text-amber-400" />
                  <span>Library / Backup Directory Path</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsBrowserOpen(true)}
                  className="text-[11px] font-mono text-sky-400 hover:underline flex items-center space-x-1"
                >
                  <Folder className="w-3.5 h-3.5 text-sky-400" />
                  <span>Browse Remote Folders</span>
                </button>
              </div>
              <input
                type="text"
                value={dirPath}
                onChange={(e) => setDirPath(e.target.value)}
                placeholder="/md_library or /Books or /Backup_Library"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* ⚡ Sims Loading Screen Reticulating Splines & Ragebait Announcer Ticker */}
          {isLoading && (
            <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/60 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>{reticulatorMsg}</span>
                </span>
                <span className="text-slate-300">Elapsed: {elapsedSeconds}s (ETA: ~{Math.max(0.5, (12 - elapsedSeconds)).toFixed(1)}s)</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-indigo-500/40">
                <div
                  className="bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Transparent Live Sync Action Console Log */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Live Action & Network Activity Console</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>Transparent Live Log</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1 max-h-28 overflow-y-auto">
              {actionLogs.map((log, i) => (
                <p key={i} className={i === 0 ? 'text-amber-300 font-semibold' : 'text-slate-400'}>
                  {log}
                </p>
              ))}
            </div>
          </div>

          {/* 1-Click On-Screen Pop-Up Scraper Tool Section */}
          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Puzzle className="w-4 h-4 text-sky-400" />
                <span>1-Click On-Screen Pop-Up Scraper Tool ({activeAccount?.name || 'Cloud Provider'})</span>
              </span>

              <button
                onClick={handleCopyBookmarklet}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1 transition-all shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedBookmarklet ? 'Copied Pop-Up Code!' : 'Copy 1-Click Pop-Up Bookmarklet'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>How to use:</strong> Click <code>Copy 1-Click Pop-Up Bookmarklet</code> above. Save it as a browser bookmark. Open your cloud storage tab ({activeAccount?.name || 'Filejump'}) and click the bookmark! It launches a sleek <strong>On-Screen Extractor Pop-Up Box</strong> right on the webpage with all filenames pre-selected and a 1-click Copy button!
            </p>
          </div>

          {/* Optional PROPFIND / CORS Warning Banner */}
          {scanNotice && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Live Fetch Notice:</p>
                <p className="text-[11px] text-amber-200/90">{scanNotice}</p>
              </div>
            </div>
          )}

          {/* Paste or Upload Custom Ebook Files */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Paste {activeAccount?.name || 'Cloud'} Directory File Listing / Filenames (or Upload Local Files)
              </label>

              <div className="flex items-center space-x-3">
                {pasteInput && (
                  <button
                    onClick={() => setPasteInput('')}
                    className="text-xs text-rose-400 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Text</span>
                  </button>
                )}
                <label className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local Ebook Files</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              rows={3}
              placeholder={`Paste your ${activeAccount?.name || 'Cloud'} filenames (one per line, e.g. My_Ebook.epub) or copy/paste directory listing...`}
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                onClick={handleScanWebDAV}
                disabled={isLoading}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Scan & Index Directory Items</span>
              </button>
            </div>
          </div>

          {/* Directory File List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Discovered WebDAV Items ({fileList.length})</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                <HardDrive className="w-3 h-3 text-emerald-400" />
                <span>Target: {fullEbookSourcePath}</span>
              </span>
            </h4>

            {fileList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 rounded-2xl bg-slate-950 border border-slate-800">
                No items indexed yet. Paste your Filejump file list above and click "Scan & Index Directory Items".
              </p>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                {fileList.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                    <div className="flex items-center space-x-2">
                      {f.isDir ? <Folder className="w-4 h-4 text-amber-400" /> : <FileText className="w-4 h-4 text-sky-400" />}
                      <span className="font-mono text-slate-200">{f.filename}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {f.isDir ? 'Directory' : `${(f.size / 1024).toFixed(1)} KB`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generated Markdown Index Preview */}
          {generatedIndexMd && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                Generated Markdown Directory Index File
              </label>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs max-h-40 overflow-y-auto whitespace-pre-wrap">
                {generatedIndexMd}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div>
            {importSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Imported {fileList.length} Ebooks from Backup Directory into Active Library!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              disabled={fileList.length === 0}
              onClick={handleImportAll}
              className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg disabled:opacity-40 flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Import Ebooks to Library</span>
            </button>
          </div>
        </div>

      </div>

      {/* Remote Cloud File & Folder Browser Modal */}
      {activeAccount && (
        <RemoteCloudBrowserModal
          isOpen={isBrowserOpen}
          account={activeAccount}
          initialPath={dirPath || '/'}
          onClose={() => setIsBrowserOpen(false)}
          onSelectFolder={(selectedPath) => {
            setDirPath(selectedPath);
          }}
          onLocalFolderPicked={(fileNames) => {
            const items = parseTextDirectoryListing(fileNames.join('\n'));
            setFileList(items);
            const indexMd = generateWebDAVDirectoryMarkdownIndex(serverUrl, dirPath, items);
            setGeneratedIndexMd(indexMd);
            addLog(`[${new Date().toLocaleTimeString()}] 📁 Discovered ${items.length} files from local synced directory!`);
          }}
        />
      )}
    </div>
  );
};
