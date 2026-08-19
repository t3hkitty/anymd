import React, { useState } from 'react';
import { Database, Edit3, Users, Activity, PieChart, Layers, FileText, X, Plus, Settings, Cloud, Palette, User, Puzzle, ShieldOff, PenTool, Sparkles, FolderOpen, HardDrive, Server } from 'lucide-react';

type MainTab = 'vaults' | 'drafting' | 'inputs' | 'processed' | 'settings';
type VaultId = 'lcmd-main' | 'signalstack-discovery' | 'storycraft-lore';

export const VaultWorkspaceLayout: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('vaults');
  const [activeVault, setActiveVault] = useState<VaultId>('lcmd-main');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Theming State
  const [isLightMode, setIsLightMode] = useState(false);
  const [bgPattern, setBgPattern] = useState('bg-neutral-900');
  const [frameStyle, setFrameStyle] = useState('rounded-2xl');
  const [accentColor, setAccentColor] = useState('indigo-500');

  // Easter Egg
  const kaomojis = ['(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧', '(๑•̀ㅂ•́)و✧', 'ʕ•ᴥ•ʔ', '(づ｡◕‿‿◕｡)づ', '(*^ω^)', '(✯◡✯)', '(=^･ω･^=)'];
  const [kaomoji, setKaomoji] = useState(kaomojis[0]);

  // Derived theme classes
  const rootBg = isLightMode ? 'bg-neutral-100 text-neutral-900' : `${bgPattern} text-neutral-100`;
  const sidebarBg = isLightMode ? 'bg-neutral-200 border-neutral-300' : 'bg-neutral-950 border-neutral-800';
  const headerBg = isLightMode ? 'border-neutral-300' : 'border-neutral-800';
  const panelBg = isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800';
  const panelInner = isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800';
  const textMuted = isLightMode ? 'text-neutral-500' : 'text-neutral-400';

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${rootBg}`}>
      
      {/* --- FILE PREVIEW OVERLAY MODAL --- */}
      {selectedFile && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-12 animate-in fade-in zoom-in-95 duration-200">
          <div className={`w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden border ${isLightMode ? 'bg-white border-neutral-300' : 'bg-neutral-950 border-neutral-700'} ${frameStyle}`}>
            <header className={`p-4 border-b flex justify-between items-center ${isLightMode ? 'border-neutral-200 bg-neutral-100' : 'border-neutral-800 bg-neutral-900'}`}>
              <div className="flex items-center">
                <FileText className={`text-${accentColor} mr-3`} size={20} />
                <h3 className="font-bold font-mono">{selectedFile}</h3>
              </div>
              <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </header>
            <div className={`flex-1 p-8 overflow-auto font-serif text-lg leading-loose ${isLightMode ? 'text-neutral-800' : 'text-neutral-300'}`}>
              <h1 className="text-3xl font-bold mb-6 border-b border-neutral-500/30 pb-4"># {selectedFile.replace('.md', '').replace(/_/g, ' ')}</h1>
              <p className="mb-4">This is a functional preview of the <code>.companion.md</code> sidecar data.</p>
              <p className="mb-4">The air in the market was thick with the scent of ozone and crushed mint. He hesitated at the threshold, scanning the shifting crowds. A goblin merchant with obsidian eyes beckoned him closer.</p>
              <div className={`mt-8 p-4 rounded-xl font-mono text-sm border-l-4 ${isLightMode ? 'bg-neutral-100 border-neutral-400' : 'bg-neutral-900 border-neutral-600'}`}>
                {`---
title: ${selectedFile}
tags: [lore, goblin]
status: draft
---`}
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
          
          <div className="flex items-center space-x-2">
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
                <div className={`p-3 border-b flex justify-between items-center text-xs ${panelInner}`}>
                  <div className="flex space-x-2">
                     <button className={`px-3 py-1 rounded transition-colors ${isLightMode ? 'bg-neutral-200 hover:bg-neutral-300' : 'bg-neutral-800 hover:bg-neutral-700'}`}>Filter</button>
                     <button className={`px-3 py-1 rounded transition-colors ${isLightMode ? 'bg-neutral-200 hover:bg-neutral-300' : 'bg-neutral-800 hover:bg-neutral-700'}`}>Sort</button>
                  </div>
                  <span className={`${textMuted} font-mono`}>Total Nodes: 1,204</span>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-2">
                  {['lore_goblin_market.md', 'character_hero_arc.md', 'plot_act_1_climax.md', 'telemetry_log_04.json', 'worldbuilding_magic_system.md'].map((file, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedFile(file)}
                      className={`grid grid-cols-12 gap-4 p-3 border rounded-xl items-center text-sm transition-colors cursor-pointer group ${isLightMode ? 'bg-white hover:bg-neutral-50 border-neutral-200' : 'bg-neutral-950/50 hover:bg-neutral-800 border-neutral-800'}`}
                    >
                      <div className={`col-span-1 font-mono text-xs ${textMuted}`}>00{i+1}</div>
                      <div className="col-span-3 font-bold truncate">{file}</div>
                      <div className={`col-span-4 truncate text-xs ${textMuted}`}>Extracted metadata and relational context...</div>
                      <div className={`col-span-2 text-${accentColor} text-xs truncate`}>#draft #wip</div>
                      <div className="col-span-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); alert('Quick adding tag...'); }} className={`text-${accentColor} hover:opacity-70 bg-${accentColor}/20 px-2 py-1 rounded flex items-center ml-auto text-xs`}>
                          <Plus size={12} className="mr-1"/> Add Tag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                 <h3 className={`text-lg font-bold text-${accentColor} mb-4 flex items-center`}><Users className="mr-2"/> CRM & Node Manager</h3>
                 <div className="grid grid-cols-3 gap-6 flex-1 overflow-auto pr-2 content-start">
                   {[
                     { name: "Lorik", role: "Protagonist", rel: "Self", color: "indigo" },
                     { name: "Goblin Merchant", role: "NPC", rel: "Neutral", color: "emerald" },
                     { name: "The Algorithm", role: "Antagonist", rel: "Hostile", color: "red" }
                   ].map(char => (
                     <div key={char.name} className={`border border-${char.color}-500/30 rounded-xl p-4 flex flex-col cursor-pointer ${panelInner}`}>
                       <div className="flex items-center space-x-3 mb-4">
                         <div className={`w-10 h-10 rounded-full bg-${char.color}-500/20 text-${char.color}-500 flex items-center justify-center`}>
                           <User size={20} />
                         </div>
                         <div>
                           <div className="font-bold">{char.name}</div>
                           <div className={`text-xs ${textMuted}`}>{char.role}</div>
                         </div>
                       </div>
                       <div className="mt-auto space-y-2 text-xs">
                         <div className="flex justify-between"><span className={textMuted}>Relationship</span><span className="font-bold">{char.rel}</span></div>
                         <div className="flex justify-between"><span className={textMuted}>Mentions</span><span className="font-mono">24</span></div>
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
                         onClick={async () => {
                           try {
                             const dirHandle = await window.showDirectoryPicker();
                             alert(`Successfully loaded: ${dirHandle.name}\n\n(VaultIOWorker will now index this directory in the real implementation)`);
                           } catch (err) {
                             console.warn('Directory picker cancelled or unsupported.', err);
                           }
                         }} 
                         className={`px-3 py-1.5 border rounded-lg text-xs font-bold flex items-center ${panelInner} hover:opacity-80`}
                       >
                         <HardDrive size={14} className="mr-2"/> Load Local Folder
                       </button>
                    </div>
                  </h3>
                  <div className={`p-4 rounded-xl border flex justify-between items-center group relative overflow-hidden ${panelInner}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full bg-${accentColor}`}></div>
                    <div className="ml-2">
                      <div className="font-bold flex items-center"><HardDrive size={14} className={`mr-2 text-${accentColor}`}/> Sovereign Local Disk</div>
                      <div className={`text-xs font-mono mt-1 ${textMuted}`}>C:/Users/lorik/Documents/vaults/</div>
                    </div>
                    <div className={`px-3 py-1 rounded bg-${accentColor}/20 text-${accentColor} text-xs font-bold`}>Active Primary</div>
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
    </div>
  );
};
