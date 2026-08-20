import React, { useState } from 'react';
import { Database, Edit3, Users, Activity, PieChart, Layers, FileText, X, Plus, Settings, Cloud, Palette, User, Puzzle, ShieldOff, PenTool, Sparkles, FolderOpen, HardDrive, Server, Zap, RefreshCw, Star } from 'lucide-react';
import { GeminiSparkPluginModal } from './GeminiSparkPluginModal';
import { DynamicAtmosphericBackground } from '@lorik/shared-kawaii-ui';

type MainTab = 'vaults' | 'drafting' | 'inputs' | 'processed' | 'settings';
type VaultId = 'lcmd-main' | 'signalstack-discovery' | 'storycraft-lore';

interface VaultFile {
  name: string;
  snippet: string;
  lastModified: string;
  handle: FileSystemFileHandle;
}

const getAsciiThumbnail = (filename: string): string => {
  const name = filename.toLowerCase();
  if (name.includes('heart') || name.includes('pulse') || name.includes('health') || name.includes('fit')) {
    return `
   /\\  /\\
  /  \\/  \\
  \\      /   [PULSE]
   \\    /
    \\  /
     \\/
    `;
  }
  if (name.includes('traffic') || name.includes('car') || name.includes('delay') || name.includes('alarm')) {
    return `
     ______
    /|_||_\\\`.__
   (   _    _ _\\ [RADAR]
    \`-(_)--(_)-'
    `;
  }
  if (name.includes('spotify') || name.includes('music') || name.includes('song') || name.includes('skip')) {
    return `
     |\\  
     | \\ 
     |__\\    [MUSIC]
    (●.●)
    /|🐾|\\
    `;
  }
  if (name.includes('lore') || name.includes('story') || name.includes('magic') || name.includes('character') || name.includes('book')) {
    return `
      ______ ______
    _/      Y      \\_
   //  lore  | book  \\\\
  ((   n    | n     ))
   \\\\_______|_______//
    `;
  }
  if (name.includes('telemetry') || name.includes('log') || name.includes('webhook') || name.includes('server')) {
    return `
     .-----------------.
    /  .-.   .-.   .-.  \\
   |  |   | |   | |   |  |
   |   '-'   '-'   '-'   | [SERVER]
    \\                   /
     '-----------------'
    `;
  }
  return `
     /\\_/\\
    ( o.o )
     > ^ <   [NODE]
    `;
};

export const VaultWorkspaceLayout: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>(() => (localStorage.getItem('anymd_active_tab') as MainTab) || 'vaults');
  const [activeVault, setActiveVault] = useState<VaultId>(() => (localStorage.getItem('anymd_active_vault') as VaultId) || 'lcmd-main');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGeminiSparkOpen, setIsGeminiSparkOpen] = useState(false);
  const [themeStyleSet, setThemeStyleSet] = useState(() => localStorage.getItem('anymd_theme_style_set') || 'classic');

  // File system and vault state
  const [vaultFolders, setVaultFolders] = useState<Record<VaultId, FileSystemDirectoryHandle | null>>({
    'lcmd-main': null,
    'signalstack-discovery': null,
    'storycraft-lore': null
  });
  const [vaultFiles, setVaultFiles] = useState<Record<VaultId, VaultFile[]>>({
    'lcmd-main': [],
    'signalstack-discovery': [],
    'storycraft-lore': []
  });
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [selectedFileMetadata, setSelectedFileMetadata] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [starredFiles, setStarredFiles] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('anymd_starred_files') || '{}');
    } catch {
      return {};
    }
  });

  // CRM Character states
  interface CharacterNode {
    name: string;
    role: string;
    rel: string;
    color: string;
    mentions: number;
    slugs: string[];
    notes: string;
  }
  const [characters, setCharacters] = useState<CharacterNode[]>(() => {
    try {
      const saved = localStorage.getItem('anymd_characters');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { name: "Lorik", role: "Protagonist", rel: "Self", color: "indigo", mentions: 24, slugs: ["[MC]", "[MC:eyes]"], notes: "Main character. Survived the first blackbox test." },
      { name: "Goblin Merchant", role: "NPC", rel: "Neutral", color: "emerald", mentions: 12, slugs: ["[NPC:merchant]", "[NPC:eyes]"], notes: "Sells cursed mint and other sidecar assets." },
      { name: "The Algorithm", role: "Antagonist", rel: "Hostile", color: "red", mentions: 45, slugs: ["[BOSS]", "[BOSS:telemetry]"], notes: "Spams requests. Rate limiter watches them." }
    ];
  });
  const [editingCharacter, setEditingCharacter] = useState<CharacterNode | null>(null);

  React.useEffect(() => {
    localStorage.setItem('anymd_characters', JSON.stringify(characters));
  }, [characters]);

  const loadVaultFolder = async (vaultId: VaultId) => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const files: VaultFile[] = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
          const file = await entry.getFile();
          const text = await file.text();
          const snippet = text.slice(0, 100).replace(/[\r\n\t]+/g, ' ') + (text.length > 100 ? '...' : '');
          const lastModified = new Date(file.lastModified).toLocaleDateString() + ' ' + new Date(file.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          files.push({
            name: entry.name,
            snippet,
            lastModified,
            handle: entry
          });
        }
      }
      setVaultFolders(prev => ({ ...prev, [vaultId]: dirHandle }));
      setVaultFiles(prev => ({ ...prev, [vaultId]: files }));
    } catch (err) {
      console.warn('Directory picker cancelled or unsupported.', err);
    }
  };

  const refreshVault = async (vaultId: VaultId) => {
    const dirHandle = vaultFolders[vaultId];
    if (!dirHandle) return;
    setIsRefreshing(true);
    try {
      const files: VaultFile[] = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
          const file = await entry.getFile();
          const text = await file.text();
          const snippet = text.slice(0, 100).replace(/[\r\n\t]+/g, ' ') + (text.length > 100 ? '...' : '');
          const lastModified = new Date(file.lastModified).toLocaleDateString() + ' ' + new Date(file.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          files.push({
            name: entry.name,
            snippet,
            lastModified,
            handle: entry
          });
        }
      }
      setVaultFiles(prev => ({ ...prev, [vaultId]: files }));
    } catch (err) {
      console.error('Failed to refresh folder:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleSelectFile = async (file: VaultFile) => {
    try {
      const fileData = await file.handle.getFile();
      const text = await fileData.text();
      setSelectedFile(file.name);
      
      const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (fmMatch) {
        setSelectedFileMetadata(fmMatch[1].trim());
        setSelectedFileContent(text.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim());
      } else {
        setSelectedFileMetadata(`title: ${file.name}\ntags: [unclassified]`);
        setSelectedFileContent(text);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  // Theming State
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('anymd_light_mode') === 'true');
  const [bgPattern, setBgPattern] = useState(() => localStorage.getItem('anymd_bg_pattern') || 'bg-neutral-900');
  const [frameStyle, setFrameStyle] = useState(() => localStorage.getItem('anymd_frame_style') || 'rounded-2xl');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('anymd_accent_color') || 'indigo-500');

  // Persistence hooks
  React.useEffect(() => {
    localStorage.setItem('anymd_active_tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    localStorage.setItem('anymd_active_vault', activeVault);
  }, [activeVault]);

  React.useEffect(() => {
    localStorage.setItem('anymd_theme_style_set', themeStyleSet);
  }, [themeStyleSet]);

  React.useEffect(() => {
    localStorage.setItem('anymd_light_mode', String(isLightMode));
  }, [isLightMode]);

  React.useEffect(() => {
    localStorage.setItem('anymd_bg_pattern', bgPattern);
  }, [bgPattern]);

  React.useEffect(() => {
    localStorage.setItem('anymd_frame_style', frameStyle);
  }, [frameStyle]);

  React.useEffect(() => {
    localStorage.setItem('anymd_accent_color', accentColor);
  }, [accentColor]);

  React.useEffect(() => {
    localStorage.setItem('anymd_starred_files', JSON.stringify(starredFiles));
  }, [starredFiles]);

  // Easter Egg
  const kaomojis = ['(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧', '(๑•̀ㅂ•́)و✧', 'ʕ•ᴥ•ʔ', '(づ｡◕‿‿◕｡)づ', '(*^ω^)', '(✯◡✯)', '(=^･ω･^=)'];
  const [kaomoji, setKaomoji] = useState(kaomojis[0]);

  // Derived theme classes
  const rootBg = isLightMode ? 'bg-neutral-100/40 text-neutral-900' : 'bg-transparent text-neutral-100';
  const sidebarBg = isLightMode ? 'bg-neutral-200 border-neutral-300' : 'bg-neutral-950 border-neutral-800';
  const headerBg = isLightMode ? 'border-neutral-300' : 'border-neutral-800';
  const panelBg = isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800';
  const panelInner = isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800';
  const textMuted = isLightMode ? 'text-neutral-500' : 'text-neutral-400';

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${rootBg}`}>
      <DynamicAtmosphericBackground themeStyleSet={themeStyleSet} />
      
      {/* --- FILE PREVIEW OVERLAY MODAL --- */}
      {selectedFile && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-12 animate-in fade-in zoom-in-95 duration-200">
          <div className={`w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden border ${isLightMode ? 'bg-white border-neutral-300' : 'bg-neutral-950 border-neutral-700'} ${frameStyle}`}>
            <header className={`p-4 border-b flex justify-between items-center ${isLightMode ? 'border-neutral-200 bg-neutral-100' : 'border-neutral-800 bg-neutral-900'}`}>
              <div className="flex items-center">
                <FileText className={`text-${accentColor} mr-3`} size={20} />
                <h3 className="font-bold font-mono">{selectedFile}</h3>
              </div>
              <button onClick={() => { setSelectedFile(null); setSelectedFileContent(''); }} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </header>
            <div className={`flex-1 p-8 overflow-auto font-serif text-lg leading-loose ${isLightMode ? 'text-neutral-800' : 'text-neutral-300'}`}>
              <h1 className="text-3xl font-bold mb-6 border-b border-neutral-500/30 pb-4"># {selectedFile.replace('.md', '').replace(/_/g, ' ')}</h1>
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed mb-8">
                {selectedFileContent}
              </div>
              <div className={`mt-8 p-4 rounded-xl font-mono text-xs border-l-4 ${isLightMode ? 'bg-neutral-100 border-neutral-400' : 'bg-neutral-900 border-neutral-600'}`}>
                <pre>{`---
${selectedFileMetadata}
---`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Root Framework Switcher */}
      <div className={`w-20 flex flex-col items-center py-6 border-r space-y-6 z-10 shadow-2xl shrink-0 relative transition-colors ${sidebarBg}`}>
        <button className={`absolute top-2 right-2 p-1 bg-${accentColor}/20 text-${accentColor} rounded-full hover:bg-${accentColor}/40 transition-colors`} title="Quick Add Root Element">
          <Plus size={12} />
        </button>
        
        <div className="flex-1 space-y-6 flex flex-col items-center w-full">
          <button 
            onClick={() => { setActiveTab('vaults'); setSelectedFile(null); }}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'vaults' ? `bg-${accentColor}/20 text-${accentColor}` : `${textMuted} hover:opacity-70`}`}
            title="Vault Databases"
          >
            <Database size={28} />
          </button>
          
          <button 
            onClick={() => { setActiveTab('drafting'); setSelectedFile(null); }}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'drafting' ? `bg-${accentColor}/20 text-${accentColor}` : `${textMuted} hover:opacity-70`}`}
            title="StoryCraft Drafting Studio"
          >
            <PenTool size={28} />
          </button>

          <button 
            onClick={() => { setActiveTab('inputs'); setSelectedFile(null); }}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'inputs' ? `bg-${accentColor}/20 text-${accentColor}` : `${textMuted} hover:opacity-70`}`}
            title="Blackbox Inputs"
          >
            <Edit3 size={28} />
          </button>
          <button 
            onClick={() => { setActiveTab('processed'); setSelectedFile(null); }}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'processed' ? `bg-${accentColor}/20 text-${accentColor}` : `${textMuted} hover:opacity-70`}`}
            title="Processed Data & CRM"
          >
            <PieChart size={28} />
          </button>
        </div>

        <button 
          onClick={() => { setActiveTab('settings'); setSelectedFile(null); }}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? (isLightMode ? 'bg-neutral-800 text-white' : 'bg-neutral-800 text-white') : `${textMuted} hover:opacity-70`} mb-4`}
          title="Global Settings & Plugins"
        >
          <Settings size={28} />
        </button>

        {/* Kaomoji Easter Egg */}
        <div 
          className="text-[10px] text-neutral-500 cursor-pointer hover:text-pink-400 transition-colors font-mono select-none tracking-tighter"
          onClick={() => setKaomoji(kaomojis[Math.floor(Math.random() * kaomojis.length)])}
          title="Kawaii Easter Egg!"
        >
          <div className="rotate-90 origin-center whitespace-nowrap translate-y-4">{kaomoji}</div>
        </div>
      </div>

      {/* 2. Primary Workspace Area */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors`}>
        
        {/* Dynamic Context Header */}
        <header className={`h-16 shrink-0 border-b flex items-center justify-between px-6 transition-colors ${headerBg}`}>
          <div className="flex items-center space-x-6">
            <div className={`flex items-center border rounded-xl px-3 py-1.5 shadow-inner ${panelInner}`}>
               <Layers className={textMuted + " mr-2"} size={16} />
               <select 
                 className={`bg-transparent text-sm font-bold outline-none cursor-pointer appearance-none pr-4 ${isLightMode ? 'text-neutral-800' : 'text-neutral-200'}`}
                 value={activeVault}
                 onChange={(e) => setActiveVault(e.target.value as VaultId)}
               >
                 <option value="lcmd-main">LC-MD Primary</option>
                 <option value="signalstack-discovery">SignalStack Discovery</option>
                 <option value="storycraft-lore">StoryCraft Lore</option>
               </select>
            </div>
            
            <div className={`h-6 w-px mx-2 ${isLightMode ? 'bg-neutral-300' : 'bg-neutral-800'}`}></div>
            
            {activeTab === 'vaults' && <h2 className={`text-lg font-bold text-${accentColor} flex items-center`}><Database className="mr-2" size={20}/> Vault Grid View</h2>}
            {activeTab === 'drafting' && <h2 className={`text-lg font-bold text-${accentColor} flex items-center`}><PenTool className="mr-2" size={20}/> StoryCraft Studio</h2>}
            {activeTab === 'inputs' && <h2 className={`text-lg font-bold text-${accentColor} flex items-center`}><Activity className="mr-2" size={20}/> Telemetry & Blackbox GUIs</h2>}
            {activeTab === 'processed' && <h2 className={`text-lg font-bold text-${accentColor} flex items-center`}><Users className="mr-2" size={20}/> Relationship & Node Manager</h2>}
            {activeTab === 'settings' && <h2 className={`text-lg font-bold text-${accentColor} flex items-center`}><Settings className="mr-2" size={20}/> Unified Settings & Plugin Hub</h2>}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Dynamic Theme Picker Dropdown */}
            <div className={`flex items-center border rounded-xl px-2.5 py-1.5 shadow-inner text-xs ${panelInner}`}>
              <Palette className={textMuted + " mr-2"} size={14} />
              <select
                className="bg-transparent font-semibold outline-none cursor-pointer text-slate-300"
                value={themeStyleSet}
                onChange={(e) => setThemeStyleSet(e.target.value)}
              >
                <option value="classic" className="bg-slate-950 text-slate-300">Classic Theme</option>
                <option value="cute" className="bg-slate-950 text-pink-300">🌸 Cute Theme</option>
                <option value="silly" className="bg-slate-950 text-emerald-300">🤪 Silly Theme</option>
              </select>
            </div>

            <button onClick={() => alert('Opening context creation modal...')} className={`px-3 py-1.5 bg-${accentColor}/20 text-${accentColor} rounded-lg hover:bg-${accentColor}/40 transition-colors flex items-center text-xs font-bold uppercase tracking-wider`}>
              <Plus size={14} className="mr-1" /> {activeTab === 'settings' ? 'Add Plugin' : 'Quick Add Context'}
            </button>
          </div>
        </header>

        {/* 3. Modular View Injector */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            
            {/* --- VAULTS TAB --- */}
            {activeTab === 'vaults' && (
              <div className={`h-full flex flex-col border shadow-inner overflow-hidden transition-all ${panelBg} ${frameStyle}`}>
                
                {/* Top Vaults Folder Row */}
                <div className={`p-4 border-b grid grid-cols-3 gap-4 ${panelInner}`}>
                  {(['lcmd-main', 'signalstack-discovery', 'storycraft-lore'] as VaultId[]).map(vid => {
                    const isSelected = activeVault === vid;
                    const isLoaded = !!vaultFolders[vid];
                    const folderName = vaultFolders[vid]?.name;
                    
                    return (
                      <div 
                        key={vid}
                        onClick={() => setActiveVault(vid)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col relative overflow-hidden ${
                          isSelected 
                            ? `border-${accentColor} bg-${accentColor}/5 shadow-md shadow-${accentColor}/10 scale-[1.02]` 
                            : `border-neutral-800 bg-neutral-950/40 hover:bg-neutral-900/50`
                        }`}
                      >
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <span className={`w-2 h-2 rounded-full ${isLoaded ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                          <span className="text-[9px] font-mono text-neutral-500">{isLoaded ? 'Loaded' : 'Not Loaded'}</span>
                        </div>

                        <div className="font-bold text-xs truncate flex items-center">
                          {vid === 'lcmd-main' && '🐱 LC-MD Primary'}
                          {vid === 'signalstack-discovery' && '📡 SignalStack'}
                          {vid === 'storycraft-lore' && '✍️ StoryCraft Lore'}
                        </div>
                        
                        <div className={`text-[10px] font-mono mt-1.5 truncate ${textMuted}`}>
                          📁 {isLoaded ? `${folderName}/` : 'Not configured'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!vaultFolders[activeVault] ? (
                  <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                    <pre className="text-amber-400 font-mono text-base mb-6 leading-normal select-none whitespace-pre">
                      {activeVault === 'lcmd-main' && `
   /\\_/\\
  ( o.o )   ~ nyaa! Load my Primary Vault folder!
   > ^ <
                      `}
                      {activeVault === 'signalstack-discovery' && `
  |\\__/,|   (~))
  |_ _  |.--.)   ~ beep boop! Load my Telemetry folder!
  ( T   )   )
  (((^_((^___)
                      `}
                      {activeVault === 'storycraft-lore' && `
   /\\_/\\
  (=^•^=)   ~ load my Story Bible & Lore folder!
  (")_(")
                      `}
                    </pre>
                    <h3 className="font-bold text-lg mb-2">
                      {activeVault === 'lcmd-main' && '🐱 LC-MD Primary Vault'}
                      {activeVault === 'signalstack-discovery' && '📡 SignalStack Auto-Logger'}
                      {activeVault === 'storycraft-lore' && '✍️ StoryCraft Studio Lore'}
                    </h3>
                    <p className={`text-xs max-w-sm mb-6 ${textMuted}`}>
                      {activeVault === 'lcmd-main' && 'Manage your main Zettelkasten logs, read lists, and book companion markdown sidecars.'}
                      {activeVault === 'signalstack-discovery' && 'Track automated heart rate logs, spotify skips, and n8n webhook ingestions.'}
                      {activeVault === 'storycraft-lore' && 'Draft your characters bible profiles, worldbuilding lore, and outline stages.'}
                    </p>
                    <button
                      onClick={() => loadVaultFolder(activeVault)}
                      className={`px-5 py-2.5 bg-${accentColor} hover:scale-105 transition-all text-white font-bold rounded-xl flex items-center text-sm shadow-lg cursor-pointer`}
                    >
                      <FolderOpen size={16} className="mr-2"/> Mount Local Folder
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Gmail-style toolbar */}
                    <div className={`p-2 border-b flex justify-between items-center text-xs ${panelInner} flex-wrap gap-2`}>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0" />
                        
                        <button 
                          onClick={() => refreshVault(activeVault)}
                          className={`p-2 rounded hover:bg-neutral-800 transition-colors flex items-center justify-center ${isRefreshing ? 'animate-spin text-amber-300' : ''}`}
                          title="Refresh folder content"
                        >
                          <RefreshCw size={14} />
                        </button>
                        
                        <div className={`h-4 w-px ${isLightMode ? 'bg-neutral-300' : 'bg-neutral-800'}`}></div>

                        <span className={`${textMuted} font-mono text-[10px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800`}>
                          📁 {vaultFolders[activeVault]?.name || 'local'}/
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`${textMuted} font-mono`}>Nodes: {vaultFiles[activeVault].length}</span>
                        <button 
                          onClick={() => {
                            if (confirm('Disconnect local folder from this vault?')) {
                              setVaultFolders(prev => ({ ...prev, [activeVault]: null }));
                          setVaultFiles(prev => ({ ...prev, [activeVault]: [] }));
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/35 hover:bg-rose-500/30 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>

                    {/* Conditionally render List vs Discovery Cards Grid */}
                    {activeVault === 'signalstack-discovery' ? (
                      <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-4">
                        {vaultFiles[activeVault].length === 0 ? (
                          <div className={`col-span-2 p-8 text-center text-xs ${textMuted}`}>
                            No `.md`, `.json`, or `.txt` files found in this directory.
                          </div>
                        ) : (
                          vaultFiles[activeVault].map((file, i) => {
                            const isStarred = starredFiles[file.name] || false;
                            const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                            const asciiThumb = getAsciiThumbnail(file.name);
                            
                            return (
                              <div 
                                key={i} 
                                onClick={() => handleSelectFile(file)}
                                className={`border border-neutral-800/80 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:scale-[1.02] hover:border-${accentColor}/50 shadow-md ${panelInner}`}
                              >
                                {/* Card Header Thumbnail */}
                                <div className="h-28 bg-gradient-to-br from-slate-950 via-neutral-900 to-slate-950 border-b border-neutral-800/40 flex items-center justify-center relative overflow-hidden select-none">
                                  <pre className="text-amber-300/80 font-mono text-[9px] leading-tight select-none">
                                    {asciiThumb}
                                  </pre>
                                  <span className={`absolute top-2 left-2 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    ext === 'MD' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                    ext === 'JSON' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 
                                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  }`}>
                                    {ext}
                                  </span>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setStarredFiles(prev => ({ ...prev, [file.name]: !isStarred }));
                                    }}
                                    className={`absolute top-2 right-2 transition-colors hover:text-amber-400 ${isStarred ? 'text-amber-400' : 'text-neutral-500'}`}
                                  >
                                    <Star size={14} fill={isStarred ? 'currentColor' : 'none'} />
                                  </button>
                                </div>

                                {/* Card Body */}
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                  <div className="space-y-1">
                                    <div className="font-bold text-slate-100 truncate text-xs">{file.name}</div>
                                    <p className={`${textMuted} font-mono text-[9px] line-clamp-2 leading-relaxed`}>
                                      {file.snippet}
                                    </p>
                                  </div>
                                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-neutral-800/20 text-[9px] font-mono">
                                    <span className={textMuted}>{file.lastModified}</span>
                                    <input 
                                      type="checkbox" 
                                      onClick={(e) => e.stopPropagation()} 
                                      className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0" 
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ) : (
                      /* Gmail-style rows */
                      <div className="flex-1 overflow-auto p-2 divide-y divide-neutral-800/40">
                        {vaultFiles[activeVault].length === 0 ? (
                          <div className={`p-8 text-center text-xs ${textMuted}`}>
                            No `.md`, `.json`, or `.txt` files found in this directory.
                          </div>
                        ) : (
                          vaultFiles[activeVault].map((file, i) => {
                            const isStarred = starredFiles[file.name] || false;
                            const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                            
                            return (
                              <div 
                                key={i} 
                                onClick={() => handleSelectFile(file)}
                                className={`flex items-center gap-3 px-3 py-2 text-xs transition-colors cursor-pointer group ${isLightMode ? 'bg-white hover:bg-neutral-50 border-neutral-200' : 'bg-neutral-950/20 hover:bg-neutral-900/50'}`}
                              >
                                {/* Checkbox */}
                                <input 
                                  type="checkbox" 
                                  onClick={(e) => e.stopPropagation()} 
                                  className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0" 
                                />
                                
                                {/* Star icon */}
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setStarredFiles(prev => ({ ...prev, [file.name]: !isStarred }));
                                  }}
                                  className={`transition-colors hover:text-amber-400 ${isStarred ? 'text-amber-400' : 'text-neutral-500'}`}
                                >
                                  <Star size={13} fill={isStarred ? 'currentColor' : 'none'} />
                                </button>

                                {/* File type badge */}
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  ext === 'MD' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                  ext === 'JSON' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 
                                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                  {ext}
                                </span>

                                {/* Filename & Snippet */}
                                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                  <span className="font-bold text-slate-100 truncate max-w-[180px]">{file.name}</span>
                                  <span className={`${textMuted} truncate flex-1 font-mono text-[10px]`}>{file.snippet}</span>
                                </div>

                                {/* Timestamp / Action */}
                                <span className={`${textMuted} text-[10px] shrink-0 font-mono`}>{file.lastModified}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* --- STORYCRAFT DRAFTING TAB --- */}
            {activeTab === 'drafting' && (
              <div className="h-full flex space-x-6">
                <div className={`flex-1 flex flex-col border shadow-inner overflow-hidden ${panelBg} ${frameStyle}`}>
                   <div className={`border-b p-4 shrink-0 flex flex-col space-y-3 ${panelInner}`}>
                     <div className="flex items-center justify-between mb-2">
                       <span className={`text-sm font-bold flex items-center`}>
                         <FileText size={16} className={`mr-2 text-${accentColor}`} /> Chapter 12: The Goblin Market
                       </span>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                       <div className={`border border-emerald-500/50 rounded-xl p-3 flex flex-col relative overflow-hidden ${isLightMode ? 'bg-white' : 'bg-neutral-900'}`}>
                         <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1 flex items-center"><Sparkles size={10} className="mr-1"/> Micromanager Goal</span>
                         <span className={`text-xs leading-relaxed ${isLightMode ? 'text-neutral-700' : 'text-neutral-300'}`}>Decline the merchant's cursed mint offer and secure the exit route.</span>
                       </div>
                       <div className={`border border-indigo-500/50 rounded-xl p-3 flex flex-col relative overflow-hidden ${isLightMode ? 'bg-white' : 'bg-neutral-900'}`}>
                         <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-1 flex items-center"><Users size={10} className="mr-1"/> Required Cast</span>
                         <div className="text-xs font-mono flex flex-wrap gap-1 mt-1">
                           <span className="bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-500/30">Hero</span>
                           <span className="bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-500/30">Goblin Merchant</span>
                         </div>
                       </div>
                       <div className={`border border-amber-500/50 rounded-xl p-3 flex flex-col relative overflow-hidden ${isLightMode ? 'bg-white' : 'bg-neutral-900'}`}>
                         <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1 flex items-center"><Layers size={10} className="mr-1"/> Active Room / Stage</span>
                         <div className="text-xs font-mono mt-1">
                           <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">The Lower Market Tents</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   <textarea 
                     className="flex-1 w-full bg-transparent p-8 font-serif text-lg leading-loose resize-none focus:outline-none"
                     defaultValue="The air in the market was thick with the scent of ozone and crushed mint. He hesitated at the threshold, scanning the shifting crowds. A goblin merchant with obsidian eyes beckoned him closer."
                   />
                </div>
              </div>
            )}

            {/* --- BLACKBOX INPUTS TAB --- */}
            {activeTab === 'inputs' && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto w-full">
                <div className={`border border-${accentColor}/50 shadow-xl w-full p-6 relative overflow-hidden ${panelBg} ${frameStyle}`}>
                   <div className={`absolute top-0 left-0 w-full h-1 bg-${accentColor}`}></div>
                   <h3 className={`text-xl font-bold text-${accentColor} mb-2 flex items-center`}><Activity className="mr-2"/> Blackbox Microlog</h3>
                   <p className={`text-xs mb-6 ${textMuted}`}>Rapidly ingest thoughts, telemetry, or raw JSON. (This is now fully reactive—try typing and ingesting!)</p>
                   <textarea 
                     className={`w-full border rounded-xl p-4 focus:border-${accentColor} outline-none h-32 resize-none mb-4 font-mono text-sm ${panelInner}`} 
                     placeholder="Enter raw thought or data snippet..."
                     id="blackbox-input"
                   />
                   <div className="flex justify-between items-center">
                     <button 
                       onClick={() => {
                         const inputEl = document.getElementById('blackbox-input') as HTMLTextAreaElement;
                         if (!inputEl.value.trim()) return;
                         
                         // Create new DOM node for the list to prove reactivity without needing a massive state refactor
                         const list = document.getElementById('ingestions-list');
                         if (list) {
                           const newItem = document.createElement('div');
                           newItem.className = `p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm ${textMuted} border-l-2 border-l-${accentColor} mb-3 animate-in fade-in slide-in-from-top-2`;
                           newItem.innerHTML = `"${inputEl.value}" <span class="text-xs text-neutral-600 ml-2">(Just now)</span>`;
                           list.prepend(newItem);
                         }
                         inputEl.value = '';
                       }} 
                       className={`px-6 py-2 bg-${accentColor}/20 text-${accentColor} font-bold rounded-xl transition-colors hover:bg-${accentColor}/30`}
                     >
                       Ingest Data
                     </button>
                   </div>
                </div>
                
                <div className="w-full space-y-3">
                  <h4 className={`text-xs font-bold uppercase tracking-widest pl-2 ${textMuted}`}>Recent Ingestions</h4>
                  <div id="ingestions-list" className="space-y-3">
                    <div className={`p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm border-l-2 border-l-${accentColor} ${textMuted}`}>
                      "Need to research local-first AI models." <span className="text-xs text-neutral-600 ml-2">(2 mins ago)</span>
                    </div>
                    <div className={`p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm border-l-2 border-l-${accentColor} ${textMuted}`}>
                      "Grocery: Cursed Mint" <span className="text-xs text-neutral-600 ml-2">(1 hr ago)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- CRM PROCESSED TAB --- */}
            {activeTab === 'processed' && (
              <div className={`h-full border shadow-inner overflow-hidden flex flex-col p-6 ${panelBg} ${frameStyle}`}>
                 <div className="flex items-start justify-between mb-4 border-b border-neutral-800/40 pb-4 shrink-0">
                   <div>
                     <h3 className={`text-lg font-bold text-${accentColor} flex items-center`}><Users className="mr-2"/> CRM & Node Manager</h3>
                     <p className={`text-xs mt-1 ${textMuted}`}>Click any character node to edit their attributes, bio notes, and custom touch slugs.</p>
                   </div>
                   <pre className="text-amber-500 font-mono text-[9px] leading-normal select-none pr-4">
{`   _   _
  ( \\_/ )
   ) _ (   ~ tracking character nodes!
  (  *  )
   \\___/`}
                   </pre>
                 </div>

                 <div className="grid grid-cols-3 gap-6 flex-1 overflow-auto pr-2 content-start">
                   {characters.map(char => (
                     <div 
                       key={char.name} 
                       onClick={() => setEditingCharacter({ ...char })}
                       className={`border border-${char.color}-500/30 rounded-xl p-4 flex flex-col cursor-pointer transition-all hover:scale-[1.02] hover:border-${char.color}-500 ${panelInner}`}
                     >
                       <div className="flex items-center space-x-3 mb-4">
                         <div className={`w-10 h-10 rounded-full bg-${char.color}-500/20 text-${char.color}-500 flex items-center justify-center`}>
                           <User size={20} />
                         </div>
                         <div>
                           <div className="font-bold">{char.name}</div>
                           <div className={`text-xs ${textMuted}`}>{char.role}</div>
                         </div>
                       </div>
                       
                       {/* Slugs Row */}
                       <div className="flex flex-wrap gap-1 mb-4">
                         {char.slugs.map(s => (
                           <span key={s} className="bg-neutral-900 border border-neutral-800 text-[10px] px-1.5 py-0.5 rounded font-mono text-amber-300">
                             {s}
                           </span>
                         ))}
                       </div>

                       <p className={`text-xs line-clamp-2 ${textMuted} italic mb-4 font-serif`}>
                         {char.notes || "No lore notes logged yet."}
                       </p>

                       <div className="mt-auto space-y-2 text-xs border-t border-neutral-800/40 pt-2 font-mono">
                         <div className="flex justify-between"><span className={textMuted}>Relationship</span><span className={`font-bold text-${char.color}-400`}>{char.rel}</span></div>
                         <div className="flex justify-between"><span className={textMuted}>Mentions</span><span className="font-bold">{char.mentions}</span></div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* --- NEW SETTINGS TAB --- */}
            {activeTab === 'settings' && (
              <div className="h-full w-full max-w-5xl mx-auto space-y-8 overflow-y-auto pr-4 pb-12">
                
                {/* Theming & Appearance (FULLY WIRED) */}
                <section className={`p-6 border shadow-xl ${panelBg} ${frameStyle}`}>
                  <h3 className={`text-lg font-bold mb-6 flex items-center text-${accentColor}`}><Palette className="mr-2" size={20}/> UI & Theming Engine</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setIsLightMode(false)} className={`p-4 rounded-xl border font-bold flex justify-between items-center transition-colors ${!isLightMode ? 'bg-neutral-800 border-neutral-600 text-white shadow-inner' : 'bg-neutral-100 border-neutral-300 text-neutral-500'}`}>
                      Dark Mode {(!isLightMode) && <div className={`w-4 h-4 rounded-full bg-${accentColor} shadow-[0_0_8px_currentColor]`}></div>}
                    </button>
                    <button onClick={() => setIsLightMode(true)} className={`p-4 rounded-xl border font-bold flex justify-between items-center transition-colors ${isLightMode ? 'bg-white border-neutral-300 text-neutral-900 shadow-inner' : 'bg-neutral-900 border-neutral-700 text-neutral-500'}`}>
                      Light Mode {(isLightMode) && <div className={`w-4 h-4 rounded-full bg-${accentColor}`}></div>}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-2">
                    <div className="space-y-3">
                      <span className={`text-[10px] uppercase tracking-widest font-bold block ${textMuted}`}>Generic Backgrounds (Dark Mode Only)</span>
                      <div className="flex space-x-2">
                        <button onClick={() => setBgPattern('bg-neutral-900 bg-[url("/grid-pattern.svg")]')} className={`flex-1 py-2 border text-xs rounded-lg ${bgPattern.includes('grid') ? `border-${accentColor} text-${accentColor} shadow-inner` : `${panelInner} ${textMuted}`}`}>Grid Paper</button>
                        <button onClick={() => setBgPattern('bg-[#111] bg-[url("/noise.png")]')} className={`flex-1 py-2 border text-xs rounded-lg ${bgPattern.includes('noise') ? `border-${accentColor} text-${accentColor} shadow-inner` : `${panelInner} ${textMuted}`}`}>Static Noise</button>
                        <button onClick={() => setBgPattern('bg-neutral-900')} className={`flex-1 py-2 border text-xs rounded-lg ${bgPattern === 'bg-neutral-900' ? `border-${accentColor} text-${accentColor} shadow-inner` : `${panelInner} ${textMuted}`}`}>Blank</button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className={`text-[10px] uppercase tracking-widest font-bold block ${textMuted}`}>Panel Frames</span>
                      <div className="flex space-x-2">
                        <button onClick={() => setFrameStyle('border-double border-4')} className={`flex-1 py-2 border text-xs ${frameStyle.includes('double') ? `border-${accentColor} text-${accentColor}` : `${panelInner} ${textMuted}`}`}>Pixel Border</button>
                        <button onClick={() => setFrameStyle('rounded-2xl')} className={`flex-1 py-2 border rounded-2xl text-xs ${frameStyle === 'rounded-2xl' ? `border-${accentColor} text-${accentColor}` : `${panelInner} ${textMuted}`}`}>Rounded</button>
                        <button onClick={() => setFrameStyle('rounded-none')} className={`flex-1 py-2 border rounded-none text-xs ${frameStyle === 'rounded-none' ? `border-${accentColor} text-${accentColor}` : `${panelInner} ${textMuted}`}`}>Sharp</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-6 flex items-center space-x-4 p-4 border rounded-xl ${panelInner}`}>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${textMuted}`}>Global Accent:</span>
                    {['indigo-500', 'emerald-500', 'fuchsia-500', 'amber-500', 'cyan-500'].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setAccentColor(color)}
                        className={`w-6 h-6 rounded-full bg-${color} cursor-pointer hover:scale-110 transition-transform ${accentColor === color ? 'ring-2 ring-offset-2 ring-offset-neutral-900 ring-white' : ''}`} 
                      />
                    ))}
                  </div>
                </section>

                {/* File Manager */}
                <section className={`p-6 border shadow-xl ${panelBg} ${frameStyle}`}>
                   <h3 className={`text-lg font-bold mb-6 flex items-center justify-between text-${accentColor}`}>
                     <span className="flex items-center"><FolderOpen className="mr-2" size={20}/> File & Provider Manager</span>
                     <div className="flex space-x-2">
                        <button 
                          onClick={() => loadVaultFolder(activeVault)} 
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold flex items-center ${panelInner} hover:opacity-80 cursor-pointer`}
                        >
                          <HardDrive size={14} className="mr-2"/> Load Local Folder
                        </button>
                     </div>
                   </h3>
                   <div className={`p-4 rounded-xl border flex justify-between items-center group relative overflow-hidden ${panelInner}`}>
                     <div className={`absolute top-0 left-0 w-1 h-full bg-${accentColor}`}></div>
                     <div className="ml-2">
                       <div className="font-bold flex items-center">
                         <HardDrive size={14} className={`mr-2 text-${accentColor}`}/> 
                         {activeVault === 'lcmd-main' && '🐱 LC-MD Primary'}
                         {activeVault === 'signalstack-discovery' && '📡 SignalStack Auto-Logger'}
                         {activeVault === 'storycraft-lore' && '✍️ StoryCraft Studio'}
                       </div>
                       <div className={`text-xs font-mono mt-1 ${textMuted}`}>
                         {vaultFolders[activeVault] ? `Folder: ${vaultFolders[activeVault]!.name}/` : 'No local directory mounted'}
                       </div>
                     </div>
                     <div className={`px-3 py-1 rounded bg-${accentColor}/20 text-${accentColor} text-xs font-bold`}>
                       {vaultFolders[activeVault] ? 'Active Primary' : 'Not Configured'}
                     </div>
                   </div>
                 </section>

                {/* Grouped Plugin Manager */}
                <section className={`p-6 border shadow-xl ${panelBg} ${frameStyle}`}>
                  <h3 className={`text-lg font-bold mb-6 flex items-center justify-between text-${accentColor}`}>
                    <span className="flex items-center"><Puzzle className="mr-2" size={20}/> Plugin Ecosystem</span>
                  </h3>
                  
                  <div className={`mb-6 p-4 rounded-xl border flex items-start space-x-4 ${isLightMode ? 'bg-red-50 border-red-200' : 'bg-red-950/20 border-red-900/50'}`}>
                    <ShieldOff size={24} className="text-red-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-red-500">OAuth & SSL Crap Disabled</h4>
                      <p className={`text-xs mt-1 ${isLightMode ? 'text-red-700' : 'text-neutral-400'}`}>Community tools are restricted to local execution.</p>
                    </div>
                  </div>

                  {/* 1. Views / Themes */}
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 mt-6 ${textMuted}`}>Views & Themes (Markdown Display)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border relative overflow-hidden ${panelInner}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full bg-${accentColor}`}></div>
                      <div className="flex justify-between items-start mb-2 ml-2">
                        <span className={`font-bold text-${accentColor}`}>Kawaii ASCII Animator</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <p className={`text-xs ml-2 ${textMuted}`}>Universal plugin that intercepts text blocks to render live ASCII storyboards.</p>
                    </div>
                  </div>

                  {/* 2. Sources */}
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 mt-6 ${textMuted}`}>Sources</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${panelInner}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold">NovelUpdates Scraper</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <p className={`text-xs ${textMuted}`}>Pulls metadata directly via unauthenticated local proxy.</p>
                    </div>
                  </div>

                  {/* 3. Real-Time Data */}
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 mt-6 ${textMuted}`}>Real-Time Data (Editing & Tracking)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${panelInner}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold">SignalStack Webhook Reader</span>
                        <input type="checkbox" className="toggle" />
                      </div>
                      <p className={`text-xs ${textMuted}`}>Listens for generic local port triggers.</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${panelInner}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <Zap size={14} className="text-amber-500" />
                          <span>Gemini Spark MCP Bridge</span>
                        </span>
                        <button
                          onClick={() => setIsGeminiSparkOpen(true)}
                          className={`px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/35 transition-colors text-[10px] font-bold uppercase`}
                        >
                          Configure
                        </button>
                      </div>
                      <p className={`text-xs ${textMuted}`}>Expose local sidecar logs to Gemini's 24/7 background agent.</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${panelInner}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold">Storycraft Telemetry</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <p className={`text-xs ${textMuted}`}>Live word-count and pacing analytics for the Drafting UI.</p>
                    </div>
                  </div>

                  {/* 4. Publishing & Sharing (Community Tools) */}
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 mt-6 ${textMuted}`}>Publishing & Sharing (Community)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${panelInner}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold">HTML Vault Publishing</span>
                        <input type="checkbox" className="toggle" />
                      </div>
                      <p className={`text-xs ${textMuted}`}>Compiles the entire Vault into static offline HTML.</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${panelInner}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold">GitHub Sync (No PII)</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <p className={`text-xs ${textMuted}`}>Pushes vault structure to GitHub while scrubbing personal identifiers.</p>
                    </div>
                  </div>

                </section>

              </div>
            )}
          </div>
        </main>
      </div>

      <GeminiSparkPluginModal
        isOpen={isGeminiSparkOpen}
        onClose={() => setIsGeminiSparkOpen(false)}
      />

      {/* --- CRM CHARACTER EDIT MODAL --- */}
      {editingCharacter && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-12 animate-in fade-in zoom-in-95 duration-200">
          <div className={`w-full max-w-xl flex flex-col shadow-2xl overflow-hidden border ${isLightMode ? 'bg-white border-neutral-300' : 'bg-slate-900 border-slate-700/80'} ${frameStyle}`}>
            <header className={`p-4 border-b flex justify-between items-center bg-slate-900/90 border-slate-800`}>
              <div className="flex items-center">
                <User className={`text-${accentColor} mr-3`} size={20} />
                <h3 className="font-bold">Edit Character Node: {editingCharacter.name}</h3>
              </div>
              <button onClick={() => setEditingCharacter(null)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </header>
            <div className="p-6 space-y-4 text-xs font-mono text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editingCharacter.name}
                    onChange={(e) => setEditingCharacter({ ...editingCharacter, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Role / Archetype</label>
                  <input 
                    type="text" 
                    value={editingCharacter.role}
                    onChange={(e) => setEditingCharacter({ ...editingCharacter, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Relationship</label>
                  <input 
                    type="text" 
                    value={editingCharacter.rel}
                    onChange={(e) => setEditingCharacter({ ...editingCharacter, rel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Mentions Count</label>
                  <input 
                    type="number" 
                    value={editingCharacter.mentions}
                    onChange={(e) => setEditingCharacter({ ...editingCharacter, mentions: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Person Slugs (Comma Separated)</label>
                <input 
                  type="text" 
                  value={editingCharacter.slugs.join(', ')}
                  onChange={(e) => setEditingCharacter({ ...editingCharacter, slugs: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Notes & Lore Biography</label>
                <textarea 
                  value={editingCharacter.notes}
                  onChange={(e) => setEditingCharacter({ ...editingCharacter, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none h-20 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  onClick={() => setEditingCharacter(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setCharacters(prev => prev.map(c => c.name === editingCharacter.name ? editingCharacter : c));
                    setEditingCharacter(null);
                  }}
                  className={`px-4 py-2 bg-${accentColor} text-white font-bold rounded-lg hover:opacity-90 transition-colors`}
                >
                  Save Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
