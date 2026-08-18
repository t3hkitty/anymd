import React, { useState, useEffect } from 'react';
import {
  loadSpatialRoutines,
  saveSpatialRoutines,
  generateIndividualTaskMarkdownPlans,
  TtsDirectorAudio,
  type SpatialRoutine,
  type RoutineStep,
  type TaskMicroActionPlan
} from '../plugins/routineDirectorPlugin';
import {
  X,
  Play,
  Square,
  CheckCircle,
  Volume2,
  Sparkles,
  Copy,
  Compass,
  Zap,
  Download,
  Droplet,
  FileText
} from 'lucide-react';

interface SpatialRoutineDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpatialRoutineDirectorModal: React.FC<SpatialRoutineDirectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [routines, setRoutines] = useState<SpatialRoutine[]>([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('routine-leaving-house');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isPlayingTts, setIsPlayingTts] = useState<boolean>(false);
  const [ttsRate, setTtsRate] = useState<number>(0.95);
  const [activeTab, setActiveTab] = useState<'routines' | 'no-bad-days' | 'tts-director'>('routines');

  // "No Bad Days" State
  const [rawUnfinishedTasks, setRawUnfinishedTasks] = useState<string>(
    'Organize desktop files and clear staging cache\nReview tomorrow morning calendar & prep buffer\nComplete chapter beat notes\nWater plants and check pet fountain'
  );
  const [generatedPlans, setGeneratedPlans] = useState<TaskMicroActionPlan[]>([]);
  const [copiedTaskSerial, setCopiedTaskSerial] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loaded = loadSpatialRoutines();
      setRoutines(loaded);
    } else {
      TtsDirectorAudio.stop();
      setIsPlayingTts(false);
      setActiveStepIndex(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRoutine = routines.find(r => r.id === selectedRoutineId) || routines[0];

  const handleToggleStep = (stepId: string) => {
    const updated = routines.map(r => {
      if (r.id !== selectedRoutineId) return r;
      return {
        ...r,
        steps: r.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
      };
    });
    setRoutines(updated);
    saveSpatialRoutines(updated);
  };

  const handlePlayStepTts = (step: RoutineStep, index: number) => {
    setActiveStepIndex(index);
    setIsPlayingTts(true);
    TtsDirectorAudio.speakCue(
      step.ttsCue,
      () => {
        setIsPlayingTts(false);
      },
      ttsRate
    );
  };

  const handlePlayEntireRoutine = () => {
    if (!currentRoutine || currentRoutine.steps.length === 0) return;
    let stepIdx = 0;

    const playNext = () => {
      if (stepIdx >= currentRoutine.steps.length) {
        setIsPlayingTts(false);
        setActiveStepIndex(null);
        TtsDirectorAudio.speakCue('Spatial routine completed. You are centered and ready.', undefined, ttsRate);
        return;
      }
      const step = currentRoutine.steps[stepIdx];
      setActiveStepIndex(stepIdx);
      setIsPlayingTts(true);
      TtsDirectorAudio.speakCue(
        `Step ${stepIdx + 1}: ${step.title}. ${step.ttsCue}`,
        () => {
          stepIdx++;
          setTimeout(playNext, 1200);
        },
        ttsRate
      );
    };

    playNext();
  };

  const handleStopTts = () => {
    TtsDirectorAudio.stop();
    setIsPlayingTts(false);
    setActiveStepIndex(null);
  };

  const handleGenerateNoBadDays = () => {
    const lines = rawUnfinishedTasks.split('\n');
    const plans = generateIndividualTaskMarkdownPlans(lines);
    setGeneratedPlans(plans);
  };

  const handleCopySinglePlan = (plan: TaskMicroActionPlan) => {
    navigator.clipboard.writeText(plan.markdownContent);
    setCopiedTaskSerial(plan.zettelSerial);
    setTimeout(() => setCopiedTaskSerial(null), 3000);
  };

  const handleDownloadSinglePlan = (plan: TaskMicroActionPlan) => {
    const blob = new Blob([plan.markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.zettelSerial}_${plan.taskTitle.slice(0, 20).replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerQuickHydrationBreak = () => {
    TtsDirectorAudio.speakCue('Hydration break active. Drink 300ml of cold water, un-clench your jaw, and take two deep breaths.', undefined, 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white shadow-lg shadow-blue-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg flex items-center space-x-2">
                <span>Spatial-Chained Routine Registry &amp; TTS Director</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                  DUAL-CHANNEL EXECUTION
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Visual Cards &bull; Podcast-Style Audio Cadence &bull; "No Bad Days" Day-Closing Deconstructor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTriggerQuickHydrationBreak}
              className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center space-x-1.5 transition-all"
              title="1-Click Bio / Hydration Break"
            >
              <Droplet className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Hydration Break</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/50 font-mono text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('routines')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'routines'
                ? 'border-blue-400 text-blue-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>🚪 Spatial Routines (4 Protocols)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('no-bad-days');
              if (generatedPlans.length === 0) handleGenerateNoBadDays();
            }}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'no-bad-days'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>🛡️ "No Bad Days" Day-Closing Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('tts-director')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'tts-director'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>🎙️ Podcast Broadcast Cadence</span>
          </button>
        </div>

        {/* Content Workspace */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-6">
          
          {/* TAB 1: SPATIAL ROUTINES */}
          {activeTab === 'routines' && currentRoutine && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Routine Selector Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {routines.map(r => {
                  const isSelected = r.id === selectedRoutineId;
                  const completedCount = r.steps.filter(s => s.completed).length;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRoutineId(r.id);
                        handleStopTts();
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-blue-400 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{r.icon}</span>
                        <span className="text-[10px] font-mono text-slate-400">{completedCount}/{r.steps.length}</span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs mt-1 line-clamp-1">{r.name}</h4>
                      <p className="text-[10px] text-slate-400">{r.targetTime}</p>
                    </button>
                  );
                })}
              </div>

              {/* Active Routine Header Banner & Broadcast Controls */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">{currentRoutine.icon}</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100">{currentRoutine.name}</h3>
                    <p className="text-slate-400 text-xs font-mono">{currentRoutine.badge} &bull; Target: {currentRoutine.targetTime}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isPlayingTts ? (
                    <button
                      onClick={handleStopTts}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-600/30 transition-all"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop TTS Audio</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePlayEntireRoutine}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>🎙️ Broadcast Full Routine</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Spatial Step Cards */}
              <div className="space-y-3">
                {currentRoutine.steps.map((step, idx) => {
                  const isActive = activeStepIndex === idx;
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-blue-950/40 border-blue-400 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400 animate-pulse'
                          : step.completed
                          ? 'bg-slate-950/50 border-slate-800/80 opacity-70'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleToggleStep(step.id)}
                          className="mt-0.5 p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          <CheckCircle className={`w-5 h-5 ${step.completed ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-600'}`} />
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">{step.icon}</span>
                            <span className="font-extrabold text-xs text-slate-100">{step.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                              📍 {step.spatialZone}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs font-sans">{step.description}</p>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-blue-300/90 font-mono flex items-center space-x-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>TTS Audio Cue: <em>"{step.ttsCue}"</em></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handlePlayStepTts(step, idx)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 font-bold text-[11px] flex items-center space-x-1 transition-all"
                          title="Play step TTS audio"
                        >
                          <Volume2 className="w-3 h-3 text-blue-400" />
                          <span>Play Cue</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: "NO BAD DAYS" DAY-CLOSING SCRIPT */}
          {activeTab === 'no-bad-days' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-amber-950/30 border border-amber-500/30 space-y-2 font-sans">
                <div className="flex items-center space-x-2 text-amber-300 font-mono font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>🛡️ "NO BAD DAYS" DAY-CLOSING PROTOCOL (INDIVIDUAL .MD PLANS)</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Pull uncompleted "Round Toits", review tomorrow's buffer, and generate individual Markdown (.md) files detailing step-by-step micro-actions (Goblin Tools style), alignment criteria, and success metrics.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-bold block">Uncompleted Tasks / Round-Toits (1 per line):</label>
                <textarea
                  rows={4}
                  value={rawUnfinishedTasks}
                  onChange={(e) => setRawUnfinishedTasks(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                  placeholder="Paste uncompleted items here..."
                />
                <button
                  onClick={handleGenerateNoBadDays}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-md flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Generate Individual .MD Micro-Action Files ({rawUnfinishedTasks.split('\n').filter(t => t.trim()).length} Plans)</span>
                </button>
              </div>

              {/* Individual Task Plans Grid */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-amber-300 block">Decomposed Task Action Plans:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedPlans.map((plan) => (
                    <div key={plan.zettelSerial} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-amber-400 font-bold">{plan.zettelSerial}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] text-emerald-400 font-bold">
                            ~{plan.estimatedMinutes}m micro-action
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-100 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{plan.taskTitle}</span>
                        </h4>
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                          <p><strong>🎯 Success Metric:</strong> {plan.successMetrics}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => handleCopySinglePlan(plan)}
                          className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-[11px] font-bold flex items-center justify-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedTaskSerial === plan.zettelSerial ? '✓ Copied!' : 'Copy .MD'}</span>
                        </button>

                        <button
                          onClick={() => handleDownloadSinglePlan(plan)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center space-x-1"
                          title="Download Markdown file"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TTS PODCAST BROADCAST CADENCE */}
          {activeTab === 'tts-director' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 font-sans">
                <div className="flex items-center space-x-2 text-indigo-300 font-mono font-bold text-xs">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>🎙️ PODCAST-STYLE BROADCAST CADENCE SETTINGS</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Calibrated speech pacing with synthetic D5/A5 chime tones for soothing transitions and low dopamine demand.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-bold block">Pacing &amp; Speech Rate: ({ttsRate}x)</label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={ttsRate}
                    onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Recommended: 0.90x - 0.95x for relaxed radio/podcast delivery</span>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => TtsDirectorAudio.speakCue('This is the TTS Director broadcast test. Micro-steps are ready when you are.', undefined, ttsRate)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Broadcast Voice</span>
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
