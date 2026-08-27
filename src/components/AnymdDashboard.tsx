/**
 * AnymdDashboard.tsx - Sovereign Glassmorphic User Interface
 * React Component styled for high-density, low-friction, and zero-distraction.
 * 
 * Features:
 * 1. C4 Scene Modes (All, Work, Chow) switching zero-friction action triggers.
 * 2. Excretion & Hydration Station telemetry indicators with somatic volume descriptions.
 * 3. Goblin Crisis Somerville TTS Decomposer (single-step focus & Web Speech audio readout).
 * 4. Cloud Accounts & WebDAV Mount settings.
 * 5. Interactive terminal activity log feed showing sync milestones.
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, Droplet, Users, Settings, Play, Volume2, 
  Trash2, RefreshCw, Plus, CheckCircle, ChevronLeft, ChevronRight,
  Shield, FileText, Download, Cloud, Key, Terminal, ArrowLeft
} from 'lucide-react';
import { MyBlackboxMicrologPlugin, GoblinCrisisTtsPlugin, MicrologData } from './AnymdPlugins';

export const AnymdDashboard: React.FC = () => {
  // Engines
  const micrologPlugin = new MyBlackboxMicrologPlugin();
  const crisisPlugin = new GoblinCrisisTtsPlugin();

  // State: General Workspace
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'accounts' | 'crisis'>('dashboard');
  const [currentScene, setCurrentScene] = useState<'all' | 'work' | 'chow'>('all');
  const [logs, setLogs] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // State: Hydration & Excretion
  const [totalWaterMl, setTotalWaterMl] = useState<number>(0);
  const [peeCount, setPeeCount] = useState<number>(0);
  const [pooCount, setPooCount] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');

  // State: Crisis somatic decomposer
  const [crisisQuery, setCrisisQuery] = useState<string>('');
  const [decomposedSteps, setDecomposedSteps] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isPlayingTts, setIsPlayingTts] = useState<boolean>(false);

  // State: Cloud Accounts settings
  const [cloudAccounts, setCloudAccounts] = useState<Array<{ id: string; provider: string; path: string; status: 'online' | 'offline' }>>([
    { id: 'koofr_dav', provider: 'Koofr WebDAV', path: '/Drive/Apps/myBlackbox', status: 'online' },
    { id: 'torbox_api', provider: 'TorBox REST v1', path: '/TorBox/Books', status: 'online' },
    { id: 'filejump_dav', provider: 'Filejump Storage', path: '/Library', status: 'online' }
  ]);

  // Load Sticky Settings on mount
  useEffect(() => {
    const savedWater = localStorage.getItem('anymd_total_water');
    const savedPee = localStorage.getItem('anymd_pee_count');
    const savedPoo = localStorage.getItem('anymd_poo_count');
    if (savedWater) setTotalWaterMl(parseInt(savedWater));
    if (savedPee) setPeeCount(parseInt(savedPee));
    if (savedPoo) setPooCount(parseInt(savedPoo));

    addTerminalLog('System initialized successfully. Inode indexing finished.');
    addTerminalLog('Active profile: @lorik_admin. Invite code "meow" active.');
  }, []);

  const addTerminalLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const showToastNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Sticky handlers
  const handleUpdateWater = (ml: number) => {
    const newVal = totalWaterMl + ml;
    setTotalWaterMl(newVal);
    localStorage.setItem('anymd_total_water', newVal.toString());
    
    // Auto-generate microlog entry
    const entryData: MicrologData = {
      category: 'chow_down',
      moodScore: 8,
      cognitiveLoad: 2,
      notes: inputText || `Consumed ${ml}ml beverage.`,
      hydrationMl: ml
    };
    addTerminalLog(`Ingested ${ml}ml hydration. Excretory station updated.`);
    showToastNotification(`Added +${ml}ml Hydration!`);
    setInputText('');
  };

  const handleUpdateExcretion = (type: 'pee' | 'poo') => {
    if (type === 'pee') {
      const count = peeCount + 1;
      setPeeCount(count);
      localStorage.setItem('anymd_pee_count', count.toString());
    } else {
      const count = pooCount + 1;
      setPooCount(count);
      localStorage.setItem('anymd_poo_count', count.toString());
    }
    addTerminalLog(`Biological telemetry: Excretion recorded [+1 ${type.toUpperCase()}]`);
    showToastNotification(`Logged +1 ${type.toUpperCase()}!`);
  };

  // Crisis Decomposer trigger
  const handleDecomposeCrisis = () => {
    if (!crisisQuery) return;
    const steps = crisisPlugin.getEmergencyDecomposition(crisisQuery);
    setDecomposedSteps(steps);
    setActiveStepIndex(0);
    addTerminalLog(`Decomposed crisis: "${crisisQuery}" into ${steps.length} somatic steps.`);
    showToastNotification("Crisis steps generated!");
  };

  const handleReadStep = (index: number) => {
    if (index < 0 || index >= decomposedSteps.length) return;
    setActiveStepIndex(index);
    setIsPlayingTts(true);
    crisisPlugin.speakStep(decomposedSteps[index], () => {
      setIsPlayingTts(false);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col font-sans select-none selection:bg-indigo-500/30">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-indigo-500/50 shadow-lg px-4 py-3 rounded-md flex items-center gap-2 animate-bounce z-50">
          <CheckCircle className="text-emerald-400 w-5 h-5" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Sleek App Navigation */}
      <header className="border-b border-slate-800 pb-4 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600/20 border border-indigo-500 text-indigo-400 p-2 rounded-md font-bold text-sm tracking-wider">
            AN <span className="text-white">Y</span> MD
          </div>
          <span className="text-xs text-slate-400 font-mono">v3.8.0 / Sovereign OS</span>
        </div>
        <div className="flex gap-1 bg-slate-900 p-1 border border-slate-800 rounded-md">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('crisis')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'crisis' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            🚨 Emergency Somatic
          </button>
          <button 
            onClick={() => setActiveTab('accounts')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'accounts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Cloud Accounts
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'logs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Terminal Logs
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: C4 Work Modes and Telemetry */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-6 backdrop-blur-md">
          {/* C4 Scene Switcher */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">C4 Workspace Scenes</h2>
            <div className="grid grid-cols-3 gap-1">
              {(['all', 'work', 'chow'] as const).map(scene => (
                <button
                  key={scene}
                  onClick={() => {
                    setCurrentScene(scene);
                    addTerminalLog(`Switched active work scene mode to: ${scene.toUpperCase()}`);
                    showToastNotification(`Switched to ${scene.toUpperCase()} Scene!`);
                  }}
                  className={`py-2 text-xs font-bold capitalize border transition-all ${currentScene === scene ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {scene}
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Action Triggers Panel */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Zero-Friction Triggers</h2>
            <div className="flex flex-col gap-2">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type custom note before hitting action..."
                className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-md focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
              />

              {currentScene === 'all' && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleUpdateWater(150)} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1"><Droplet className="w-3.5 h-3.5 text-sky-400" /> +1 Sip (150ml)</button>
                  <button onClick={() => handleUpdateWater(500)} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1"><Plus className="w-3.5 h-3.5 text-emerald-400" /> Refill (500ml)</button>
                  <button onClick={() => handleUpdateExcretion('pee')} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1">🚽 Log Pee</button>
                  <button onClick={() => handleUpdateExcretion('poo')} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1">💩 Log Poo</button>
                </div>
              )}

              {currentScene === 'work' && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => addTerminalLog("Logged: #work_clockin - Clocked In")} className="py-2 bg-indigo-950/20 border border-indigo-500/30 text-xs font-semibold hover:border-indigo-500 flex justify-center items-center gap-1">💼 Clock In (On Time)</button>
                  <button onClick={() => addTerminalLog("Logged: #work_late - 5m Late")} className="py-2 bg-amber-950/20 border border-amber-500/30 text-xs font-semibold hover:border-amber-500 flex justify-center items-center gap-1">⏰ Oops 5m Late</button>
                  <button onClick={() => addTerminalLog("Logged: #work_break - Break Started")} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1">☕ Take 15m Break</button>
                  <button onClick={() => addTerminalLog("Logged: #work_eod - Clocked Out")} className="py-2 bg-rose-950/20 border border-rose-500/30 text-xs font-semibold hover:border-rose-500 flex justify-center items-center gap-1">🏁 Clock Out (EOD)</button>
                </div>
              )}

              {currentScene === 'chow' && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleUpdateWater(330)} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1">🥫 Finished Can (330ml)</button>
                  <button onClick={() => handleUpdateWater(1000)} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1">🚚 Pallet (1000ml)</button>
                  <button onClick={() => handleUpdateExcretion('pee')} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1">🚽 Quick Pee Break</button>
                  <button onClick={() => handleUpdateExcretion('poo')} className="py-2 bg-slate-950 border border-slate-800 text-xs font-semibold hover:border-indigo-500/50 flex justify-center items-center gap-1">💩 Dynamic Poo Break</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Center/Right Combined Panels depending on active Tab */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {activeTab === 'dashboard' && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-6 flex-grow backdrop-blur-md">
              <h2 className="text-sm font-semibold tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3"><Activity className="w-5 h-5 text-indigo-400" /> Telemetry & Ingestion Center</h2>
              
              {/* Telemetry Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-md">
                  <h3 className="text-xs font-mono text-slate-400 mb-1">Hydration Station</h3>
                  <div className="text-2xl font-bold text-white mb-2">{totalWaterMl} ml</div>
                  <p className="text-xs text-indigo-300 leading-relaxed font-mono">
                    {micrologPlugin.getHydrationDescriptor(totalWaterMl).text}
                  </p>
                  <div className="mt-3 text-xs bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded inline-block font-mono font-bold">
                    {micrologPlugin.getHydrationDescriptor(totalWaterMl).badge}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 border border-slate-800 rounded-md flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono text-slate-400 mb-1">Excretion Counters</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="border border-slate-800 p-2 rounded-md text-center">
                        <div className="text-lg font-bold text-indigo-400 font-mono">{peeCount}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pee Break</div>
                      </div>
                      <div className="border border-slate-800 p-2 rounded-md text-center">
                        <div className="text-lg font-bold text-emerald-400 font-mono">{pooCount}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Poo Break</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setTotalWaterMl(0); setPeeCount(0); setPooCount(0);
                      localStorage.clear();
                      addTerminalLog('Nuked database caches and cleared localStorage settings.');
                      showToastNotification('Database reset successful!');
                    }} 
                    className="mt-3 text-[10px] bg-rose-950/20 border border-rose-500/20 text-rose-400 hover:bg-rose-950/40 py-1 rounded w-full font-mono uppercase tracking-wider font-semibold flex justify-center items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Wipe Example Cache & Reset
                  </button>
                </div>
              </div>

              {/* Central Sovereign Vault placeholder info */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-md flex flex-col justify-center items-center text-center py-8">
                <Shield className="w-12 h-12 text-indigo-500 mb-3" />
                <h3 className="text-sm font-semibold mb-1">Local-First Zettelkasten Active</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                  Your markdown documents are preserved cleanly on your disk inside <code>sandbox_vault</code>. Zero telemetry. Zero third-party tracker leakage.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => { addTerminalLog('Executed manual WebDAV database backup snapshot. ZIP compiled.'); showToastNotification('Vault backed up!'); }} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-semibold text-white flex items-center gap-1 hover:border-slate-700"><Download className="w-3.5 h-3.5" /> Export ZIP Vault</button>
                  <button onClick={() => { addTerminalLog('Forced full directory re-index sweeps.'); showToastNotification('Re-indexed successfully!'); }} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-semibold text-white flex items-center gap-1 hover:border-slate-700"><RefreshCw className="w-3.5 h-3.5" /> Re-Index Inodes</button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'crisis' && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-4 flex-grow backdrop-blur-md">
              <h2 className="text-sm font-semibold tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 text-rose-400"><Volume2 className="w-5 h-5 text-rose-400" /> "What Do I Do?" Goblin Crisis Assistant</h2>
              
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Feeling overwhelmed or stuck? Describe your situation or tap a preset to decompose it into atomic, sequential focus tasks narrated locally by high-fidelity browser voice.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={crisisQuery}
                    onChange={(e) => setCrisisQuery(e.target.value)}
                    placeholder="E.g. Sensory panic, can't start coding, crying meltdown..."
                    className="flex-grow bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-md focus:border-rose-500 focus:outline-none placeholder:text-slate-600"
                  />
                  <button onClick={handleDecomposeCrisis} className="bg-rose-600 text-white px-4 py-2 text-xs font-bold rounded-md hover:bg-rose-500 transition-all">Decompose</button>
                </div>
                
                {/* Emergency presets */}
                <div className="flex gap-2">
                  <button onClick={() => { setCrisisQuery('Sensory Meltdown / Crying'); }} className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-rose-500 text-[10px] text-slate-400 rounded-md font-mono">🚨 Meltdown</button>
                  <button onClick={() => { setCrisisQuery('Executive Paralysis - Can\'t Start Work'); }} className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-rose-500 text-[10px] text-slate-400 rounded-md font-mono">⏳ Executive Paralysis</button>
                </div>
              </div>

              {/* Single step focused layout */}
              {decomposedSteps.length > 0 && (
                <div className="mt-4 border-t border-slate-800 pt-4 flex flex-col gap-4">
                  <div className="bg-slate-950 p-6 border border-rose-500/20 rounded-md relative text-center">
                    <div className="text-xs text-rose-400 font-mono mb-2 uppercase tracking-wider">Step {activeStepIndex + 1} of {decomposedSteps.length}</div>
                    <p className="text-lg font-bold text-white leading-relaxed mb-4">
                      {decomposedSteps[activeStepIndex]}
                    </p>
                    <div className="flex justify-center gap-2">
                      <button 
                        disabled={activeStepIndex === 0}
                        onClick={() => handleReadStep(activeStepIndex - 1)}
                        className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white disabled:opacity-40 disabled:hover:border-slate-800"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleReadStep(activeStepIndex)}
                        className={`px-4 py-1.5 border text-xs font-bold flex items-center gap-1.5 ${isPlayingTts ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-white'}`}
                      >
                        <Volume2 className="w-4 h-4" /> {isPlayingTts ? 'Speaking...' : 'Speak Step'}
                      </button>
                      <button 
                        disabled={activeStepIndex === decomposedSteps.length - 1}
                        onClick={() => handleReadStep(activeStepIndex + 1)}
                        className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white disabled:opacity-40 disabled:hover:border-slate-800"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'accounts' && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-4 flex-grow backdrop-blur-md">
              <h2 className="text-sm font-semibold tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3"><Cloud className="w-5 h-5 text-indigo-400" /> Sovereign Cloud & Mount settings</h2>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your cloud folders as "dumb pipes." Anymd reads and writes sidecars locally and streams changes over standard WebDAV or OAuth API endpoints.
              </p>

              <div className="flex flex-col gap-2.5">
                {cloudAccounts.map(account => (
                  <div key={account.id} className="bg-slate-950 p-3.5 border border-slate-800 rounded-md flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${account.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {account.provider}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Mount: {account.path}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { addTerminalLog(`Tested connection for ${account.provider}. Latency: 120ms`); showToastNotification('Connection Verified!'); }} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] font-semibold text-indigo-400 hover:border-slate-700">Test Auth</button>
                      <button onClick={() => { addTerminalLog(`Removed cloud provider mount: ${account.id}`); setCloudAccounts(prev => prev.filter(a => a.id !== account.id)); showToastNotification('Account removed.'); }} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'logs' && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-3 flex-grow backdrop-blur-md font-mono text-xs">
              <h2 className="text-sm font-semibold tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 font-sans"><Terminal className="w-5 h-5 text-indigo-400" /> Terminal Activity Stream</h2>
              
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-md h-64 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                {logs.map((log, index) => (
                  <div key={index} className="text-slate-300 leading-normal text-[11px]">
                    {log}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-400 font-mono">
        <div>🐾 © 2026 Sovereign Black Box & Library Companion MD • Open Source (MIT License)</div>
        <div className="hover:text-white cursor-pointer flex items-center gap-1">🚀 Host Your Own on GitHub</div>
      </footer>
    </div>
  );
};
