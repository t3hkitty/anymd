import React, { useState, useEffect } from 'react';
import {
  loadRunningLitany,
  saveRunningLitany,
  loadWatchdogSettings,
  saveWatchdogSettings,
  loadAuDhdMorningSettings,
  type LitanyPulseEntry,
  type WatchdogSettings,
  type AuDhdMorningSettings
} from '../plugins/runningLitanyWatchdogPlugin';
import { TtsDirectorAudio } from '../plugins/routineDirectorPlugin';
import { CURRENT_BLACK_BOX_SPEC, generateBlackBoxManifestMarkdown } from '../plugins/blackBoxPlugin';
import {
  Activity,
  Shield,
  Zap,
  Volume2,
  Car,
  Radio,
  Box,
  Copy,
  Check,
  Terminal,
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface MyBlackBoxViewProps {
  onBackToLibrary: () => void;
  onOpenJournalInReader?: (journalBookId: string) => void;
  onSyncPulsesToBookshelf?: (pulses: LitanyPulseEntry[]) => void;
}

export const MyBlackBoxView: React.FC<MyBlackBoxViewProps> = ({
  onBackToLibrary,
  onOpenJournalInReader,
  onSyncPulsesToBookshelf
}) => {
  const [activeTab, setActiveTab] = useState<'wyd' | 'litany' | 'watchdog' | 'morning' | 'spec'>('wyd');

  // 1. WYD Timer Engine State
  const [wydIntervalMinutes, setWydIntervalMinutes] = useState<number>(15);
  const [wydRemainingSeconds, setWydRemainingSeconds] = useState<number>(15 * 60);
  const [wydIsRunning, setWydIsRunning] = useState<boolean>(true);
  const [soundEnabled] = useState<boolean>(true);
  const [quickActivityTag, setQuickActivityTag] = useState<'coding' | 'reading' | 'tcg' | 'deep_work' | 'writing' | 'break'>('deep_work');
  const [wydInputText, setWydInputText] = useState<string>('');

  // 2. Running Litany Pulses
  const [litanyEntries, setLitanyEntries] = useState<LitanyPulseEntry[]>(() => loadRunningLitany());
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);

  // 3. Watchdog State
  const [watchdogSettings, setWatchdogSettings] = useState<WatchdogSettings>(() => loadWatchdogSettings());
  const [idleSeconds, setIdleSeconds] = useState<number>(0);

  // 4. Morning State
  const [morningSettings, setMorningSettings] = useState<AuDhdMorningSettings>(() => loadAuDhdMorningSettings());

  // Load from local storage
  useEffect(() => {
    setLitanyEntries(loadRunningLitany());
    setWatchdogSettings(loadWatchdogSettings());
    setMorningSettings(loadAuDhdMorningSettings());
  }, []);

  // WYD Countdown interval
  useEffect(() => {
    if (!wydIsRunning) return;
    const interval = setInterval(() => {
      setWydRemainingSeconds(prev => {
        if (prev > 1) return prev - 1;
        
        // Trigger alert on expire
        if (soundEnabled) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch (e) {}
        }
        return wydIntervalMinutes * 60;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [wydIsRunning, wydIntervalMinutes, soundEnabled]);

  // Idle Watchdog Simulation Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setIdleSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handlePostWydPulse = () => {
    if (!wydInputText.trim()) return;
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const hex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let activityType: LitanyPulseEntry['activityType'] = 'drafting';
    let emojiBurst = ['⚡', '⬛'];
    if (quickActivityTag === 'coding') { activityType = 'system'; emojiBurst = ['💻', '⚡']; }
    else if (quickActivityTag === 'reading') { activityType = 'reading'; emojiBurst = ['📖', '✨']; }
    else if (quickActivityTag === 'tcg') { activityType = 'collecting'; emojiBurst = ['🎴', '🔥']; }
    else if (quickActivityTag === 'break') { activityType = 'resting'; emojiBurst = ['☕', '🌿']; }

    const newPulse: LitanyPulseEntry = {
      id: `litany-${Date.now()}`,
      timestamp: d.toISOString(),
      formattedTime,
      activityType,
      intensity: 4,
      headline: wydInputText.trim(),
      bodySnippet: `Logged via MyBlackBox WYD Accountability Interval (${wydIntervalMinutes}m)`,
      zettelSerial: `ZK-${dateStr}-WYD-${hex}`,
      tags: [quickActivityTag, 'wyd-pulse', 'blackbox'],
      emojiBurst
    };

    const updated = [newPulse, ...litanyEntries];
    setLitanyEntries(updated);
    saveRunningLitany(updated);
    onSyncPulsesToBookshelf?.(updated);
    setWydInputText('');
    setIdleSeconds(0);
    setWydRemainingSeconds(wydIntervalMinutes * 60);
  };

  const handleCopyLog = () => {
    const lines = litanyEntries.map(p => `- **[${p.formattedTime}]** \`[${p.activityType.toUpperCase()}]\` **${p.headline}** (${p.zettelSerial})`).join('\n');
    const md = `# ⬛ MyBlackBox Daily Pulse Ledger - ${new Date().toLocaleDateString()}\n\n${lines || '*No pulses logged today.*'}\n`;
    navigator.clipboard.writeText(md);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const manifestMd = generateBlackBoxManifestMarkdown(CURRENT_BLACK_BOX_SPEC);

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestMd);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const totalCalculatedWakeLeadTime = 
    morningSettings.prepBufferMinutes + 
    morningSettings.transitionTaxMinutes + 
    morningSettings.estimatedCommuteMinutes + 
    morningSettings.trafficIncidentDelayMinutes;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col font-sans animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-zinc-950 via-slate-900 to-emerald-950 border-b border-emerald-500/40 flex items-center justify-between shadow-xl flex-wrap gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-zinc-950 text-emerald-400 font-bold border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
            <Box className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight flex items-center space-x-2 text-white">
              <span>⬛ Sovereign MyBlackBox Dashboard</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                100% ISOLATED
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              WYD Focus Timers &bull; Real-Time Activity Pulses &bull; AuDHD Traffic Alarms &bull; Zero Cloud Egress
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-2">
          <button
            onClick={() => {
              const dateStr = new Date().toISOString().split('T')[0];
              onOpenJournalInReader?.(`journal-${dateStr}`);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
            title="Open Today's BlackBox Daily Journal in Sovereign Reader Canvas"
          >
            <span>📓</span>
            <span>Open in Reader Canvas</span>
          </button>

          <button
            onClick={onBackToLibrary}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <span>📚 Return to Grand Library</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-6 pt-3 bg-slate-900/90 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('wyd')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'wyd'
              ? 'border-emerald-400 text-emerald-300 bg-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>⏱️ WYD Accountability Timer</span>
        </button>

        <button
          onClick={() => setActiveTab('litany')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'litany'
              ? 'border-amber-400 text-amber-300 bg-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>⚡ Running Litany Stream ({litanyEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('watchdog')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'watchdog'
              ? 'border-rose-400 text-rose-300 bg-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-rose-400" />
          <span>🛡️ Inactivity Watchdog</span>
        </button>

        <button
          onClick={() => setActiveTab('morning')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'morning'
              ? 'border-sky-400 text-sky-300 bg-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Car className="w-3.5 h-3.5 text-sky-400" />
          <span>☀️ AuDHD Morning &amp; Traffic</span>
        </button>

        <button
          onClick={() => setActiveTab('spec')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'spec'
              ? 'border-purple-400 text-purple-300 bg-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>⬛ Architecture Manifest</span>
        </button>
      </div>

      {/* Main View Container */}
      <div className="p-6 flex-1 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">

        {/* TAB 1: WYD TIMERS & CHECK-IN */}
        {activeTab === 'wyd' && (
          <div className="space-y-6">
            
            {/* Live Timer Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider block">
                    Active Focus Cycle
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">What Are You Doing? (WYD)</h3>
                </div>

                {/* Big Clock Display */}
                <div className="flex items-center space-x-4 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Next Pulse</span>
                    <span className="text-4xl font-extrabold font-mono text-emerald-400 tracking-wider">
                      {formatTimer(wydRemainingSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
                    <button
                      onClick={() => setWydIsRunning(!wydIsRunning)}
                      className={`p-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                        wydIsRunning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      {wydIsRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => setWydRemainingSeconds(wydIntervalMinutes * 60)}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interval Preset Chips */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Interval Length:</span>
                {[15, 20, 25, 30, 45, 60].map(min => (
                  <button
                    key={min}
                    onClick={() => {
                      setWydIntervalMinutes(min);
                      setWydRemainingSeconds(min * 60);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      wydIntervalMinutes === min
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {min}m {min === 25 ? '(Pomodoro)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Check-in Logger Box */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Log Current WYD Pulse (Real-Time Microlog)</span>
              </span>

              {/* Quick Tags */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                {[
                  { id: 'deep_work', label: '⚡ Deep Work' },
                  { id: 'coding', label: '💻 Coding / Building' },
                  { id: 'reading', label: '📖 Reading / Sourcing' },
                  { id: 'tcg', label: '🎴 TCG Box Break' },
                  { id: 'writing', label: '✍️ Writing / Drafting' },
                  { id: 'break', label: '☕ Recovery / Break' }
                ].map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setQuickActivityTag(tag.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      quickActivityTag === tag.id
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="What are you working on right now? (e.g. Cataloging Kindle chapter 12, sorting break pulls)..."
                  value={wydInputText}
                  onChange={(e) => setWydInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handlePostWydPulse(); }}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />

                <button
                  onClick={handlePostWydPulse}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs font-mono shadow-lg transition-all shrink-0 flex items-center space-x-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Log Pulse</span>
                </button>
              </div>
            </div>

            {/* Today's Pulse Stream */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Today's BlackBox Pulse Ledger ({litanyEntries.length} entries)
                </h4>
                <button
                  onClick={handleCopyLog}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center space-x-1 border border-slate-700"
                >
                  {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLog ? 'Copied Log!' : 'Copy Daily Ledger'}</span>
                </button>
              </div>

              {litanyEntries.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                  No pulses logged yet today. Type in the box above to log your first WYD check-in!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {litanyEntries.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                            {p.formattedTime}
                          </span>
                          <span className="text-slate-500 text-[10px]">{p.zettelSerial}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-indigo-300 text-[10px] uppercase font-bold">
                            {p.activityType}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-100">{p.headline}</p>
                        {p.bodySnippet && <p className="text-xs text-slate-400 font-sans">{p.bodySnippet}</p>}
                      </div>

                      <div className="flex items-center space-x-1 text-lg">
                        {p.emojiBurst.map((em, i) => <span key={i}>{em}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: RUNNING LITANY FULL STREAM */}
        {activeTab === 'litany' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-mono">Full Running Litany Activity Ledger</h3>
              <button
                onClick={handleCopyLog}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center space-x-1 border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Ledger</span>
              </button>
            </div>

            <div className="space-y-3">
              {litanyEntries.map(pulse => (
                <div key={pulse.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300 font-bold">[{pulse.formattedTime}] {pulse.zettelSerial}</span>
                    <span>{pulse.emojiBurst.join(' ')}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{pulse.headline}</h4>
                  {pulse.bodySnippet && <p className="text-xs text-slate-400">{pulse.bodySnippet}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INACTIVITY WATCHDOG */}
        {activeTab === 'watchdog' && (
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase block">Focus Inactivity Watchdog</span>
                  <h3 className="text-lg font-bold text-white">Current Idle Status: {idleSeconds}s ({Math.floor(idleSeconds / 60)}m {idleSeconds % 60}s)</h3>
                </div>

                <button
                  onClick={() => TtsDirectorAudio.speakCue(watchdogSettings.ttsVoicePrompt, undefined, 0.95)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Watchdog Audio Check-in</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2">
                <div>
                  <label className="text-slate-400 block mb-1">State / Task Mode:</label>
                  <select
                    value={watchdogSettings.currentActivityStatus}
                    onChange={(e) => {
                      const updated = { ...watchdogSettings, currentActivityStatus: e.target.value as any };
                      setWatchdogSettings(updated);
                      saveWatchdogSettings(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300"
                  >
                    <option value="Active">Active (Watchdog Armed)</option>
                    <option value="Deep Focus">Deep Focus (Watchdog Armed)</option>
                    <option value="Resting">Resting (Watchdog Armed)</option>
                    <option value="Sleeping">Sleeping (Watchdog Muted)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">TTS Check-in Phrase:</label>
                  <input
                    type="text"
                    value={watchdogSettings.ttsVoicePrompt}
                    onChange={(e) => {
                      const updated = { ...watchdogSettings, ttsVoicePrompt: e.target.value };
                      setWatchdogSettings(updated);
                      saveWatchdogSettings(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDHD MORNING MANAGER */}
        {activeTab === 'morning' && (
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-slate-900 border border-sky-500/40 space-y-4">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase block">
                AuDHD Morning Buffer &amp; Real-Time Traffic Lead-Time
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Prep Buffer</span>
                  <span className="text-xl font-bold text-amber-300">{morningSettings.prepBufferMinutes}m</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Transition Tax</span>
                  <span className="text-xl font-bold text-indigo-300">+{morningSettings.transitionTaxMinutes}m</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Base Commute</span>
                  <span className="text-xl font-bold text-slate-300">{morningSettings.estimatedCommuteMinutes}m</span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40">
                  <span className="text-xs text-rose-300 block">Traffic Delay</span>
                  <span className="text-xl font-bold text-rose-400">+{morningSettings.trafficIncidentDelayMinutes}m</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 flex items-center justify-between text-xs font-mono">
                <span className="text-sky-300 font-bold text-sm">
                  Total Wake Lead-Time Required: {totalCalculatedWakeLeadTime} minutes
                </span>
                <button
                  onClick={() => TtsDirectorAudio.speakCue(morningSettings.ttsAlarmGreeting || "Wake up sovereign operator!", undefined, 1.0)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Wake Alarm</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ARCHITECTURE MANIFEST */}
        {activeTab === 'spec' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-mono">Sovereign Isolation Spec &amp; Dataflow</h3>
              <button
                onClick={handleCopyManifest}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center space-x-1 border border-slate-700"
              >
                {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedManifest ? 'Copied Manifest!' : 'Copy Manifest'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
                {manifestMd}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
