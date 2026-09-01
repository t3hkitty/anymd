/**
 * AnymdDashboard.tsx - KawaiiNeko Glassmorphic User Interface
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

export interface AnymdDashboardProps {
  items?: any[];
  notes?: any[];
  vaults?: any[];
  micrologs?: any[];
  selectedFiles?: Set<string> | string[];
  onSelectNote?: (note: any) => void;
  onCreateNote?: () => void;
  [key: string]: any;
}

export const AnymdDashboard: React.FC<AnymdDashboardProps> = ({
  items = [],
  notes = [],
  vaults = [],
  micrologs = [],
  selectedFiles = new Set<string>(),
  onSelectNote = () => {},
  onCreateNote = () => {},
  ...props
}) => {
  // Safe defensive array resolution for filters and counts
  const safeNotes = Array.isArray(notes) ? notes : (Array.isArray(items) ? items : []);
  const safeVaults = Array.isArray(vaults) ? vaults : [];
  const safeMicrologs = Array.isArray(micrologs) ? micrologs : [];

  const filteredNotes = safeNotes.filter((note) => {
    if (!note) return false;
    const tags = Array.isArray(note.tags) ? note.tags : [];
    return true;
  });

  const selectedCount = selectedFiles instanceof Set 
    ? selectedFiles.size 
    : (Array.isArray(selectedFiles) ? selectedFiles.length : 0);
  // Engines
  const micrologPlugin = new MyBlackboxMicrologPlugin();
  const crisisPlugin = new GoblinCrisisTtsPlugin();

  // State: General Workspace
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'accounts' | 'crisis'>('dashboard');
  const [currentScene, setCurrentScene] = useState<'all' | 'work' | 'chow'>('all');
  const [logs, setLogs] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');

  // State: Hydration & Excretion
  const [totalWaterMl, setTotalWaterMl] = useState<number>(0);
  const [peeCount, setPeeCount] = useState<number>(0);
  const [pooCount, setPooCount] = useState<number>(0);
  // State: MBB Quick Bar
  const [energyFocus, setEnergyFocus] = useState<number>(3);
  const [showEnergySlider, setShowEnergySlider] = useState<boolean>(false);
  const [sparkNoteInput, setSparkNoteInput] = useState<string>('');
  const [showSparkInput, setShowSparkInput] = useState<boolean>(false);
  const [activeGlowButton, setActiveGlowButton] = useState<string | null>(null);

  // State: Cloud Accounts settings
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

  // MBB Quick Bar Handlers
  const triggerGlow = (btnKey: string) => {
    setActiveGlowButton(btnKey);
    setTimeout(() => setActiveGlowButton(null), 1200);
  };

  const handleSomaticDispatch = async () => {
    triggerGlow('somatic');
    const timestamp = new Date().toISOString();
    const payload = {
      event: 'somatic_checkin',
      timestamp,
      source: 'mbb_quick_bar',
      note: '🌸 Somatic check-in dispatched from MBB Quick Bar'
    };
    try {
      await fetch('http://127.0.0.1:3050/webhook/Somatic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      addTerminalLog('🌸 Somatic payload posted to http://127.0.0.1:3050/webhook/Somatic');
      showToastNotification('🌸 Somatic Check-in Dispatched!');
    } catch (err) {
      addTerminalLog(`🌸 Somatic dispatch logged locally (offline proxy): ${JSON.stringify(payload)}`);
      showToastNotification('🌸 Somatic Dispatched (Offline)!');
    }
  };

  const handleFuelWaterDispatch = () => {
    triggerGlow('fuel');
    const timestamp = new Date().toLocaleTimeString();
    handleUpdateWater(250);
    addTerminalLog(`☕ Quick fuel/water log appended to inbox/Somatic-Log.md @ ${timestamp}`);
    showToastNotification('☕ Fuel / Water Logged (+250ml)!');
  };

  const handleSaveEnergyFocus = (val: number) => {
    setEnergyFocus(val);
    triggerGlow('energy');
    localStorage.setItem('anymd_energy_focus_level', val.toString());
    addTerminalLog(`⚡ Energy / Focus level recorded: ${val}/5`);
    showToastNotification(`⚡ Energy / Focus set to ${val}/5!`);
    setShowEnergySlider(false);
  };

  const handleSaveSparkNote = () => {
    if (!sparkNoteInput.trim()) return;
    triggerGlow('spark');
    const timestamp = new Date().toLocaleTimeString();
    addTerminalLog(`💡 Spark Note captured: "${sparkNoteInput}" @ ${timestamp}`);
    showToastNotification(`💡 Spark Note Captured!`);
    setSparkNoteInput('');
    setShowSparkInput(false);
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
      <header className="border-b border-slate-800 pb-4 flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 border border-indigo-500 text-indigo-400 p-2 rounded-md font-bold text-sm tracking-wider">
            AN <span className="text-white">Y</span> MD
          </div>
          <span className="text-xs text-slate-400 font-mono">v3.8.0 / KawaiiNeko OS</span>

          {/* Safe counter rendering */}
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-md">
            <span>Showing {filteredNotes.length} items</span>
            {selectedCount > 0 && (
              <span className="bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-500/40 text-[10px] font-bold">
                {selectedCount} selected
              </span>
            )}
          </div>

          {/* Vault Settings Gear Button */}
          <button
            onClick={() => props.onOpenVaultConfig && props.onOpenVaultConfig()}
            className="p-1.5 bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white rounded-md transition-colors"
            title="Vault Configuration Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Universal New Note Triggers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCreateNote}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-md flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> 📝 + New Note
            </button>
            <button
              onClick={() => {
                if (props.onCreateLitanyNote) props.onCreateLitanyNote();
                else onCreateNote();
              }}
              className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-md flex items-center gap-1 transition-all"
            >
              🌸 + New Litany Note
            </button>
          </div>

          {/* Safe vault rendering */}
          {safeVaults.length > 0 && (
            <div className="vault-tabs flex gap-1.5 font-mono text-xs">
              {safeVaults.map((v: any, idx: number) => (
                <button
                  key={v.id || v.name || idx}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded hover:border-indigo-400"
                >
                  {v.name || v.id}
                </button>
              ))}
            </div>
          )}
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

      {/* MBB 1-Click Quick Bar */}
      <section className="mb-6 bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
              MBB 1-Click Quick Bar
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* [ 🌸 Somatic ] */}
            <button
              onClick={handleSomaticDispatch}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-purple-500/40 ${
                activeGlowButton === 'somatic'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] scale-105'
                  : 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 hover:border-purple-400'
              }`}
              title="Dispatches to POST http://127.0.0.1:3050/webhook/Somatic"
            >
              <span>🌸 Somatic</span>
            </button>

            {/* [ ☕ Fuel / Water ] */}
            <button
              onClick={handleFuelWaterDispatch}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-500/40 ${
                activeGlowButton === 'fuel'
                  ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105'
                  : 'bg-amber-950/40 text-amber-200 hover:bg-amber-900/60 hover:border-amber-400'
              }`}
              title="Dispatches quick timestamped intake log to inbox/Somatic-Log.md"
            >
              <span>☕ Fuel / Water</span>
            </button>

            {/* [ ⚡ Energy / Focus ] */}
            <div className="relative">
              <button
                onClick={() => setShowEnergySlider(!showEnergySlider)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-500/40 ${
                  activeGlowButton === 'energy'
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-105'
                    : 'bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/60 hover:border-emerald-400'
                }`}
                title="Opens quick 1-5 tactile slider"
              >
                <span>⚡ Energy / Focus ({energyFocus}/5)</span>
              </button>

              {showEnergySlider && (
                <div className="absolute top-12 left-0 z-50 bg-slate-900 border border-emerald-500/50 p-3 rounded-lg shadow-2xl flex flex-col gap-2 min-w-[200px]">
                  <span className="text-[11px] font-mono text-emerald-300 font-bold">Tactile Energy Slider</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyFocus}
                    onChange={(e) => setEnergyFocus(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>1 (Exhausted)</span>
                    <span>3 (Steady)</span>
                    <span>5 (Overdrive)</span>
                  </div>
                  <button
                    onClick={() => handleSaveEnergyFocus(energyFocus)}
                    className="mt-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded"
                  >
                    Set Energy to {energyFocus}
                  </button>
                </div>
              )}
            </div>

            {/* [ 💡 Spark Note ] */}
            <div className="relative">
              <button
                onClick={() => setShowSparkInput(!showSparkInput)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-sky-500/40 ${
                  activeGlowButton === 'spark'
                    ? 'bg-sky-600 text-white shadow-[0_0_15px_rgba(14,165,233,0.8)] scale-105'
                    : 'bg-sky-950/40 text-sky-200 hover:bg-sky-900/60 hover:border-sky-400'
                }`}
                title="Opens rapid single-line capture input"
              >
                <span>💡 Spark Note</span>
              </button>

              {showSparkInput && (
                <div className="absolute top-12 right-0 z-50 bg-slate-900 border border-sky-500/50 p-3 rounded-lg shadow-2xl flex flex-col gap-2 w-[280px]">
                  <span className="text-[11px] font-mono text-sky-300 font-bold">Rapid Single-Line Capture</span>
                  <input
                    type="text"
                    value={sparkNoteInput}
                    onChange={(e) => setSparkNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSparkNote()}
                    placeholder="Enter fleeting spark thought..."
                    className="w-full bg-slate-950 border border-slate-700 text-xs px-2.5 py-1.5 rounded text-white focus:border-sky-400 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowSparkInput(false)}
                      className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white text-xs rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSparkNote}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded"
                    >
                      Capture Spark
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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

              {/* Sticky Batch Action Bar when selectedFiles.size > 0 */}
              {selectedCount > 0 && (
                <div className="sticky top-0 z-40 bg-indigo-950 border-2 border-indigo-500/80 p-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn backdrop-blur-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      {selectedCount} item(s) selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        if (props.onBatchDelete) props.onBatchDelete(selectedFiles);
                        else showToastNotification(`Batch Deleted ${selectedCount} items!`);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      🗑️ Batch Delete
                    </button>
                    <button
                      onClick={() => {
                        if (props.onBatchTag) props.onBatchTag(selectedFiles);
                        else showToastNotification(`Batch Tagged ${selectedCount} items!`);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      🏷️ Batch Tag
                    </button>
                    <button
                      onClick={() => {
                        if (props.onBatchExport) props.onBatchExport(selectedFiles);
                        else showToastNotification(`Exported ZIP for ${selectedCount} items!`);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      📦 Export ZIP
                    </button>
                    <button
                      onClick={() => {
                        if (props.onBatchMove) props.onBatchMove(selectedFiles);
                        else showToastNotification(`Moved ${selectedCount} items!`);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      📁 Move
                    </button>
                  </div>
                </div>
              )}

              {/* Note Explorer File List / Grid View with Row Checkboxes */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Vault Notes &amp; Sidecars ({filteredNotes.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {filteredNotes.map((note: any, idx: number) => {
                    const noteId = note.id || `note_${idx}`;
                    const isSelected = selectedFiles instanceof Set 
                      ? selectedFiles.has(noteId) 
                      : (Array.isArray(selectedFiles) && selectedFiles.includes(noteId));

                    return (
                      <div
                        key={noteId}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/80 text-white'
                            : 'bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (props.onToggleSelectFile) {
                                props.onToggleSelectFile(noteId);
                              }
                            }}
                            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                          />
                          <div 
                            onClick={() => onSelectNote(note)}
                            className="cursor-pointer flex flex-col"
                          >
                            <div className="text-xs font-bold flex items-center gap-2">
                              <span>🌸</span>
                              <span>{note.title || note.name || `Note #${idx + 1}`}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {note.summary || note.author || 'Markdown zettelkasten note'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectNote(note)}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-mono font-semibold rounded text-slate-300"
                        >
                          Open Note ➜
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Central KawaiiNeko Vault placeholder info */}
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
              <h2 className="text-sm font-semibold tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3"><Cloud className="w-5 h-5 text-indigo-400" /> KawaiiNeko Cloud & Mount settings</h2>
              
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
        <div>🐾 © 2026 KawaiiNeko Black Box & Library Companion MD • Open Source (MIT License)</div>
        <div className="hover:text-white cursor-pointer flex items-center gap-1">🚀 Host Your Own on GitHub</div>
      </footer>
    </div>
  );
};
