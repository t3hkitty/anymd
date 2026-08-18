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
import {
  X,
  Activity,
  Shield,
  Zap,
  Volume2,
  Car,
  Radio
} from 'lucide-react';

interface RunningLitanyWatchdogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunningLitanyWatchdogModal: React.FC<RunningLitanyWatchdogModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'litany' | 'watchdog' | 'audhd-morning'>('litany');
  
  // 1. Running Litany State
  const [litanyEntries, setLitanyEntries] = useState<LitanyPulseEntry[]>([]);
  const [newHeadline, setNewHeadline] = useState('');
  const [newSnippet, setNewSnippet] = useState('');
  const [newActivityType, setNewActivityType] = useState<LitanyPulseEntry['activityType']>('drafting');
  const [newIntensity, setNewIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);

  // 2. Watchdog State
  const [watchdogSettings, setWatchdogSettings] = useState<WatchdogSettings>(loadWatchdogSettings());
  const [idleSeconds, setIdleSeconds] = useState<number>(0);

  // 3. AuDHD Morning State
  const [morningSettings, setMorningSettings] = useState<AuDhdMorningSettings>(loadAuDhdMorningSettings());

  useEffect(() => {
    if (isOpen) {
      setLitanyEntries(loadRunningLitany());
      setWatchdogSettings(loadWatchdogSettings());
      setMorningSettings(loadAuDhdMorningSettings());
    }
  }, [isOpen]);

  // Idle Watchdog Simulation Timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setIdleSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePostLitany = () => {
    if (!newHeadline.trim()) return;
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const hex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPulse: LitanyPulseEntry = {
      id: `litany-${Date.now()}`,
      timestamp: d.toISOString(),
      formattedTime,
      activityType: newActivityType,
      intensity: newIntensity,
      headline: newHeadline,
      bodySnippet: newSnippet,
      zettelSerial: `ZK-${dateStr}-LITANY-${hex}`,
      tags: [newActivityType, 'real-time-pulse'],
      emojiBurst: newActivityType === 'drafting' ? ['🎋', '✍️', '⚡'] : newActivityType === 'routine' ? ['☀️', '🍌', '🧘'] : ['⬛', '🛡️']
    };

    const updated = [newPulse, ...litanyEntries];
    setLitanyEntries(updated);
    saveRunningLitany(updated);
    setNewHeadline('');
    setNewSnippet('');
    setIdleSeconds(0); // reset watchdog
  };

  const handleTriggerWatchdogCheckin = () => {
    TtsDirectorAudio.speakCue(watchdogSettings.ttsVoicePrompt, undefined, 0.95);
  };

  const handleTriggerMorningAlarm = () => {
    TtsDirectorAudio.speakCue(
      morningSettings.ttsAlarmGreeting || "Wake up sovereign operator! Total prep buffer and traffic delay calculated.",
      undefined,
      1.0
    );
  };

  const totalCalculatedWakeLeadTime = 
    morningSettings.prepBufferMinutes + 
    morningSettings.transitionTaxMinutes + 
    morningSettings.estimatedCommuteMinutes + 
    morningSettings.trafficIncidentDelayMinutes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-800 to-amber-500 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg flex items-center space-x-2">
                <span>Blackbox, Running Litany &amp; Watchdog</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  REAL-TIME PULSE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Running Litany Activity Pulse &bull; Inactivity Watchdog (2m+) &bull; AuDHD Traffic &amp; Morning Alarm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('litany')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'litany'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Running Litany (Activity Stream)</span>
          </button>

          <button
            onClick={() => setActiveTab('watchdog')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'watchdog'
                ? 'border-rose-400 text-rose-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>🛡️ Inactivity Watchdog &amp; Idle Check</span>
          </button>

          <button
            onClick={() => setActiveTab('audhd-morning')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'audhd-morning'
                ? 'border-sky-400 text-sky-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-sky-400" />
            <span>☀️ AuDHD Morning &amp; Traffic Manager</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-6">
          
          {/* TAB 1: RUNNING LITANY (STREAM) */}
          {activeTab === 'litany' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Litany Pulse Creator */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Emit Running Litany Pulse (Real-Time Blackbox Event)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs"
                  >
                    <option value="drafting">✍️ Drafting &amp; Writing</option>
                    <option value="reading">📖 Sovereign Reading</option>
                    <option value="routine">🚪 Spatial Routine</option>
                    <option value="collecting">🃏 TCG / Collectibles</option>
                    <option value="resting">🛌 Resting / Recovery</option>
                    <option value="system">⬛ Blackbox System</option>
                  </select>

                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(parseInt(e.target.value) as any)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value={1}>Intensity: Level 1 (Gentle Flow)</option>
                    <option value={2}>Intensity: Level 2 (Moderate Focus)</option>
                    <option value={3}>Intensity: Level 3 (Solid Progress)</option>
                    <option value={4}>Intensity: Level 4 (High Velocity)</option>
                    <option value={5}>Intensity: Level 5 (Hyperfocus Peak)</option>
                  </select>

                  <button
                    onClick={handlePostLitany}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center space-x-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Emit Pulse to Blackbox</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Headline: What are you focused on right now?..."
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                />

                <textarea
                  rows={2}
                  placeholder="Optional detail or context snippet..."
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono"
                />
              </div>

              {/* Litany Pulse Feed */}
              <div className="space-y-3">
                {litanyEntries.map((pulse) => (
                  <div
                    key={pulse.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-amber-300 font-bold">
                          {pulse.formattedTime}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{pulse.zettelSerial}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {pulse.emojiBurst.map((em, i) => (
                          <span key={i} className="text-sm">{em}</span>
                        ))}
                      </div>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-100">{pulse.headline}</h4>
                    {pulse.bodySnippet && (
                      <p className="text-slate-400 text-xs font-sans">{pulse.bodySnippet}</p>
                    )}

                    <div className="flex items-center space-x-1 pt-1">
                      {pulse.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[9px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: INACTIVITY WATCHDOG */}
          {activeTab === 'watchdog' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-2 font-sans">
                <span className="font-bold text-rose-300 text-xs font-mono flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <span>INACTIVITY WATCHDOG &amp; GENTLE FOCUS PULSE CHECK</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Monitors idle time during deep work blocks. If 2+ minutes elapse without activity (and Task != Sleeping), the watchdog provides a low-friction gentle audio prompt via TTS Director.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs block">Current Idle Monitor Status:</span>
                    <span className="text-amber-300 font-extrabold text-sm">
                      {idleSeconds} seconds elapsed ({Math.floor(idleSeconds / 60)}m {idleSeconds % 60}s)
                    </span>
                  </div>

                  <button
                    onClick={handleTriggerWatchdogCheckin}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-600/30"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Watchdog Audio Prompt</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">Current State / Task:</label>
                    <select
                      value={watchdogSettings.currentActivityStatus}
                      onChange={(e) => {
                        const updated = { ...watchdogSettings, currentActivityStatus: e.target.value as any };
                        setWatchdogSettings(updated);
                        saveWatchdogSettings(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs"
                    >
                      <option value="Active">Active (Watchdog Armed)</option>
                      <option value="Deep Focus">Deep Focus (Watchdog Armed)</option>
                      <option value="Resting">Resting (Watchdog Armed)</option>
                      <option value="Sleeping">Sleeping (Watchdog Muted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">TTS Check-in Message:</label>
                    <input
                      type="text"
                      value={watchdogSettings.ttsVoicePrompt}
                      onChange={(e) => {
                        const updated = { ...watchdogSettings, ttsVoicePrompt: e.target.value };
                        setWatchdogSettings(updated);
                        saveWatchdogSettings(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDHD MORNING & TRAFFIC MANAGER */}
          {activeTab === 'audhd-morning' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-sky-950/30 border border-sky-500/30 space-y-2 font-sans">
                <span className="font-bold text-sky-300 text-xs font-mono flex items-center space-x-1.5">
                  <Car className="w-4 h-4 text-sky-400" />
                  <span>AuDHD MORNING MANAGER &amp; TRAFFIC LEAD-TIME CALCULATOR</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Incorporates executive function transition taxes, prep buffers, and real-time traffic delays into an integrated wake alarm sequence.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Prep Buffer</span>
                    <span className="text-amber-300 font-bold text-sm">{morningSettings.prepBufferMinutes} min</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Transition Tax</span>
                    <span className="text-indigo-300 font-bold text-sm">+{morningSettings.transitionTaxMinutes} min</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Base Commute</span>
                    <span className="text-slate-300 font-bold text-sm">{morningSettings.estimatedCommuteMinutes} min</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
                    <span className="text-[10px] text-rose-300 block">Traffic Delay</span>
                    <span className="text-rose-400 font-bold text-sm">+{morningSettings.trafficIncidentDelayMinutes} min</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-500/40 flex items-center justify-between text-xs font-mono">
                  <span className="text-sky-300 font-bold">Total Wake Lead-Time Needed: {totalCalculatedWakeLeadTime} minutes</span>
                  <button
                    onClick={handleTriggerMorningAlarm}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test TTS Wake Alarm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
