import React, { useState, useEffect, useRef } from 'react';
import type { CloudAccount } from '../types/cloudAccounts';
import type { RemoteNodeItem } from '../plugins/remoteCloudBrowserPlugin';
import { fetchRemoteFolderContents } from '../plugins/remoteCloudBrowserPlugin';
import {
  X,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  HardDrive,
  Search,
  ArrowLeft,
  AlertTriangle,
  Upload
} from 'lucide-react';

interface RemoteCloudBrowserModalProps {
  isOpen: boolean;
  account: CloudAccount;
  initialPath?: string;
  onClose: () => void;
  onSelectFolder: (folderPath: string) => void;
  onLocalFolderPicked?: (fileNames: string[]) => void;
}

export const RemoteCloudBrowserModal: React.FC<RemoteCloudBrowserModalProps> = ({
  isOpen,
  account,
  initialPath = '/',
  onClose,
  onSelectFolder,
  onLocalFolderPicked
}) => {
  const [currentPath, setCurrentPath] = useState<string>(initialPath || '/');
  const [items, setItems] = useState<RemoteNodeItem[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const localDirInputRef = useRef<HTMLInputElement | null>(null);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetchRemoteFolderContents(account, path);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setItems(res.items);
      setCurrentPath(res.currentPath);
    }
  };

  useEffect(() => {
    if (isOpen && account) {
      const startPath = initialPath && !initialPath.startsWith('id:') ? initialPath : '/';
      setCurrentPath(startPath);
      loadDirectory(startPath);
    }
  }, [isOpen, account, initialPath]);

  if (!isOpen || !account) return null;

  const handleOpenSubfolder = (node: RemoteNodeItem) => {
    if (node.isDir) {
      setHistory(prev => [...prev, currentPath]);
      loadDirectory(node.path);
    }
  };

  const handleGoBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, h.length - 1));
      loadDirectory(prev);
    } else {
      loadDirectory('/');
    }
  };

  const handleLocalFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileNames = Array.from(files).map(f => f.name);
    if (onLocalFolderPicked) {
      onLocalFolderPicked(fileNames);
      onClose();
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const folders = filteredItems.filter(i => i.isDir);
  const files = filteredItems.filter(i => !i.isDir);

  const getBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: 'Root (/)', path: '/' }];
    if (currentPath.startsWith('id:')) return [{ name: 'Root (/)', path: '/' }, { name: `Folder (${currentPath})`, path: currentPath }];

    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ name: 'Root (/)', path: '/' }];
    let acc = '';
    parts.forEach(p => {
      acc += `/${p}`;
      crumbs.push({ name: p, path: acc });
    });
    return crumbs;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Remote Cloud File &amp; Folder Browser</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold">
                  {account.name}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {account.serverUrl} &bull; Live Remote Directory Inspection
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadDirectory(currentPath)}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Refresh Remote Folder"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Path Navigation & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            {history.length > 0 && (
              <button
                onClick={handleGoBack}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 font-bold mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {getBreadcrumbs().map((crumb, idx, arr) => (
              <React.Fragment key={crumb.path}>
                <button
                  onClick={() => loadDirectory(crumb.path)}
                  className={`hover:underline transition-colors ${
                    idx === arr.length - 1 ? 'font-bold text-sky-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {crumb.name}
                </button>
                {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          {/* Search Filter Box */}
          <div className="relative w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter remote files..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono space-y-3 shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Remote Directory Inspection Notice:</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans">{errorMsg}</p>

              {/* Troubleshooting & Fallback Action Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/30">
                <button
                  onClick={() => loadDirectory('/')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center space-x-1 transition-all"
                >
                  <span>🔄 Reset to Root Directory (/)</span>
                </button>

                <input
                  type="file"
                  ref={localDirInputRef}
                  onChange={handleLocalFolderChange}
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                />

                <button
                  onClick={() => localDirInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📁 Pick Local Synced Folder Instead</span>
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Fetching remote directory tree from {account.name}...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Directory Listing Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Type</th>
                      <th className="p-3">Name</th>
                      <th className="p-3 text-right">Size</th>
                      <th className="p-3 text-right">Modified</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    
                    {/* Folders First */}
                    {folders.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleOpenSubfolder(item)}
                        className="hover:bg-slate-900/60 cursor-pointer transition-colors group"
                      >
                        <td className="p-3 w-10 text-center text-amber-400 text-base">📁</td>
                        <td className="p-3 font-bold text-slate-100 group-hover:text-sky-300">
                          {item.name}
                        </td>
                        <td className="p-3 text-right text-slate-500">-</td>
                        <td className="p-3 text-right text-slate-500">{item.lastModified}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
                            Open Folder &rarr;
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Files Next */}
                    {files.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 w-10 text-center text-slate-400">
                          {item.name.endsWith('.epub') ? '📖' : item.name.endsWith('.pdf') ? '📕' : item.name.endsWith('.md') ? '📝' : '📄'}
                        </td>
                        <td className="p-3 text-slate-200">
                          {item.name}
                        </td>
                        <td className="p-3 text-right text-slate-400">
                          {(item.size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="p-3 text-right text-slate-500">{item.lastModified}</td>
                        <td className="p-3 text-center text-slate-600">-</td>
                      </tr>
                    ))}

                    {/* Empty State */}
                    {filteredItems.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500 font-mono space-y-2">
                          <p>No items found in this remote folder ({currentPath}).</p>
                          <p className="text-[11px] text-slate-600">Tip: Click 'Root (/)' above or select a different folder path.</p>
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 font-mono text-xs text-slate-400">
            <span>Current Path:</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold">
              {currentPath}
            </code>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelectFolder(currentPath);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Select This Folder as Target Path</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
