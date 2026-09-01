import React, { useState, useEffect, useRef } from 'react';
import { useKvmeowOctopusState, KvmTarget } from '../hooks/20260830-1145_anymd_kvmeow_state';

// High-Density Kawaii Brutalist Palette Styles based on v3.0 specs
const THEMES = {
  classic: {
    bg: 'bg-[#FAF8F5]',
    cardBg: 'bg-white',
    border: 'border-[#1e293b]',
    text: 'text-[#0f172a]',
    pillActive: 'bg-[#3b82f6] text-white',
    pillInactive: 'bg-[#f1f5f9] text-[#3b82f6] hover:bg-[#e2e8f0]',
    shadow: 'shadow-[4px_4px_0px_#0f172a]'
  },
  cute: {
    bg: 'bg-[#FFF5F7]',
    cardBg: 'bg-white',
    border: 'border-[#FFB7C5]',
    text: 'text-[#611A24]',
    pillActive: 'bg-[#FF69B4] text-white',
    pillInactive: 'bg-[#FFF0F2] text-[#FF69B4] hover:bg-[#FFD1D9]',
    shadow: 'shadow-[4px_4px_0px_#FFB7C5]'
  },
  silly: {
    bg: 'bg-[#F2FCF7]',
    cardBg: 'bg-white',
    border: 'border-[#A8E6CF]',
    text: 'text-[#143D2A]',
    pillActive: 'bg-[#10B981] text-white',
    pillInactive: 'bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]',
    shadow: 'shadow-[4px_4px_0px_#A8E6CF]'
  }
};

const TARGET_HOSTS: KvmTarget[] = [
  { id: 'target-a', name: 'Workstation Laptop', type: 'workstation', ddcPort: '0x01', activeSsh: 'MacBook Pro' },
  { id: 'target-b', name: 'Dev RackNerd VPS', type: 'vps', ddcPort: '0x03', activeSsh: 'Ubuntu 1GB Node' },
  { id: 'target-c', name: 'Local Android Box', type: 'mobile', ddcPort: '0x05', activeSsh: 'Pixel Fold' }
];

export const BluetoothOctopusDashboard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { config, setConfig } = useKvmeowOctopusState();
  const [activeTab, setActiveTab] = useState<'octopus' | 'security-bank' | 'stress-telemetry' | 'faq' | 'changelog'>('octopus');
  const [toast, setToast] = useState<string | null>(null);

  // Simulated live logs from the 8 tentacles
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    '🐙 Bluetooth Octopus initialized...',
    '⚙️ HOGP (HID over GATT) channel bound successfully.',
    '📻 A2DP Sink virtual mixer online.'
  ]);

  // Simulated live stress stats (Hesitation Jitter & Backspace count)
  const [stressMetrics, setStressMetrics] = useState({
    jitter: 85,
    backspaceSpikes: 2,
    cadenceState: 'Nominal'
  });

  // Active notification excerpt state
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    sender: string;
    body: string;
    fullBody: string;
    isExpanded: boolean;
  }>({
    id: 'notif-1',
    sender: 'Jason (Slack)',
    body: 'The staging database migration finished with two warnings...',
    fullBody: 'The staging database migration finished with two warnings: (1) Deprecated collation on user table index, (2) Execution duration exceeded 2.5s. Taps on GDrive are complete and ready for Tuesday.',
    isExpanded: false
  });

  // Esc & Click Outside Listeners (RSD-safe)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addLog = (msg: string) => {
    setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // KVM Host switching helper
  const handleHostSwitch = (hostId: string) => {
    const host = TARGET_HOSTS.find(h => h.id === hostId);
    if (!host) return;
    setConfig({ activeTargetId: hostId });
    addLog(`KVM focus hopped to: ${host.name}. Executed DDC/CI monitor VCP Opcode 0x60 -> ${host.ddcPort}`);
    triggerToast(`KVM focus Switched to ${host.name}! 🔌`);
  };

  // HID Arrow D-Pad click simulation
  const dispatchScancode = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ENTER' | 'ESC' | 'TAB') => {
    const scancodeMap = {
      UP: '0x52',
      DOWN: '0x51',
      LEFT: '0x50',
      RIGHT: '0x4F',
      ENTER: '0x28',
      ESC: '0x29',
      TAB: '0x2B'
    };
    const currentHost = TARGET_HOSTS.find(h => h.id === config.activeTargetId);
    addLog(`Transmitted HID scancode ${scancodeMap[direction]} (${direction}) to ${currentHost?.name}`);
  };

  // Simulate typing stress variance
  const runStressSimulation = (intensity: 'calm' | 'frustrated') => {
    if (intensity === 'frustrated') {
      setStressMetrics({
        jitter: 180,
        backspaceSpikes: 14,
        cadenceState: 'Degraded - Frustration Detected'
      });
      addLog('⚠️ Keystroke Jitter exceeded alert threshold! Triggering passive neural TTS check-in...');
      triggerToast('Stress telemetry spike alert! ⚠️');
    } else {
      setStressMetrics({
        jitter: 65,
        backspaceSpikes: 1,
        cadenceState: 'Nominal'
      });
      addLog('Stress metrics relaxed back to safe parameters.');
      triggerToast('State relaxed. 🌸');
    }
  };

  if (!isOpen) return null;

  const currentTheme = THEMES[config.activeTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#c084fc]/30 backdrop-blur-md p-4 transition-opacity duration-300">
      {/* Maximum Rounded Plumpitude Container */}
      <div 
        ref={modalRef}
        className={`relative w-full max-w-6xl overflow-hidden ${currentTheme.bg} ${currentTheme.border} border-4 ${currentTheme.shadow} flex flex-col transition-all`}
        style={{ borderRadius: '32px' }}
      >
        {/* Soft Chibi Title bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#f3e8ff] p-5 border-b-4 border-[#e9d5ff]">
          <div>
            <h2 className="text-2xl font-black text-[#7e22ce] tracking-tight flex items-center gap-3">
              🐙 kvmeowboard Bluetooth Octopus
              <span className="text-sm px-3 py-1 bg-[#d8b4fe] text-[#7e22ce] font-bold rounded-full">
                Active: {TARGET_HOSTS.find(h => h.id === config.activeTargetId)?.name}
              </span>
            </h2>
            <p className="text-xs text-[#7e22ce]/80 mt-1">Zero-Install Software Multi-Computer KVM, Audio Mixer, & Defensive Recorder</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {['octopus', 'security-bank', 'stress-telemetry', 'faq', 'changelog'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-bold rounded-full transition-colors text-sm capitalize ${activeTab === tab ? 'bg-[#c084fc] text-white' : 'bg-white text-[#c084fc] hover:bg-[#e9d5ff]'}`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
            <button 
              onClick={onClose}
              className="ml-2 px-5 py-2 bg-[#d946ef] text-white font-black rounded-full shadow-sm hover:bg-[#a21caf] hover:scale-105 transition-all text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Global theme and audio control bar */}
        <div className="bg-white/80 px-6 py-3 border-b-2 border-[#f3e8ff] flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xs">Aesthetic Shell:</span>
            {['classic', 'cute', 'silly'].map((t) => (
              <button
                key={t}
                onClick={() => setConfig({ activeTheme: t as any })}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${config.activeTheme === t ? 'bg-[#9333ea] text-white' : 'bg-[#f3e8ff] text-[#9333ea] hover:bg-[#e9d5ff]'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Audio Mix:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={config.audioSinkVolume}
                onChange={(e) => setConfig({ audioSinkVolume: parseInt(e.target.value) })}
                className="w-24 accent-[#9333ea]"
              />
              <span className="text-xs font-mono">{config.audioSinkVolume}%</span>
            </div>
            <button
              onClick={() => {
                setConfig({ keystrokeLoggingEnabled: !config.keystrokeLoggingEnabled });
                triggerToast(config.keystrokeLoggingEnabled ? "Contemporaneous logging paused 🛑" : "On-device security logging active! 🛡️");
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${config.keystrokeLoggingEnabled ? 'border-[#34d399] text-[#065f46] bg-[#ecfdf5]' : 'border-red-400 text-red-700 bg-red-50'}`}
            >
              {config.keystrokeLoggingEnabled ? '🛡️ Defensive Logging ON' : '😴 Stealth Mode'}
            </button>
          </div>
        </div>

        {/* Core Layout Window */}
        <div className="p-6 text-[#4c1d95] bg-white min-h-[500px] max-h-[600px] overflow-y-auto relative flex flex-col">
          
          {activeTab === 'octopus' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: The 8-Tentacles status cards */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="font-black text-lg border-b-2 border-[#e9d5ff] pb-1">The 8 Bluetooth Octopus "Tentacles"</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Tentacle 1 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl">⌨️</div>
                    <div>
                      <h4 className="font-black text-sm">1. 4-Way KVM & Modifiers</h4>
                      <p className="text-xs opacity-80 mt-1">Transmitting raw keyboard HID codes (HOGP) directly to workstation targets.</p>
                      <div className="flex gap-1 mt-2">
                        {['Ctrl', 'Alt', 'Esc', 'Tab'].map(m => (
                          <button key={m} onClick={() => addLog(`Transmitted physical modifier: ${m}`)} className="text-[10px] font-mono px-2 py-0.5 bg-white border border-[#e9d5ff] rounded hover:bg-[#e9d5ff]">{m}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tentacle 2 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl">📻</div>
                    <div>
                      <h4 className="font-black text-sm">2. Audio Multiplexer</h4>
                      <p className="text-xs opacity-80 mt-1">Computer audio routed through A2DP Sink. mixed with local TTS audiobook loops.</p>
                      <p className="text-[10px] font-mono text-[#7e22ce] mt-1">Status: Active Mix ({config.audioSinkVolume}%)</p>
                    </div>
                  </div>

                  {/* Tentacle 3 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl">🔔</div>
                    <div>
                      <h4 className="font-black text-sm">3. Zero-Agent Notifications</h4>
                      <p className="text-xs opacity-80 mt-1">Apple ANCS snatches macOS packets directly over GATT. No background daemon required.</p>
                      <div className="bg-white p-2 rounded-lg border border-[#e9d5ff] mt-2 text-[10px]">
                        <span className="font-bold text-[#b45309]">[{activeNotification.sender}]</span> {activeNotification.isExpanded ? activeNotification.fullBody : activeNotification.body}
                        <button 
                          onClick={() => setActiveNotification(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
                          className="text-[#9333ea] hover:underline font-bold block mt-1"
                        >
                          {activeNotification.isExpanded ? 'Collapse' : 'Tap for full read ➜'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tentacle 4 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl">📸</div>
                    <div>
                      <h4 className="font-black text-sm">4. Single-Shot OCR Remio</h4>
                      <p className="text-xs opacity-80 mt-1">Tapping input triggers display projection. LiteRT NPU OCR grabs chat thread context.</p>
                      <button onClick={() => { addLog('Fired MediaProjection capture! Generated context block YYYYMMDD-HHMM_chat_thread.md'); triggerToast('CCTV Screenshot Snapped! 📸'); }} className="mt-2 text-[10px] px-3 py-1 bg-white border-2 border-[#c084fc] rounded-full font-bold hover:bg-[#e9d5ff] transition-all">Trigger Single-Shot Capture</button>
                    </div>
                  </div>

                  {/* Tentacle 5 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl">🎭</div>
                    <div>
                      <h4 className="font-black text-sm">5. Macro & Unicode Engine</h4>
                      <p className="text-xs opacity-80 mt-1">Zero-mismatch Kaomoji. Injects Option+Hex scancodes safely to target OS paste buffer.</p>
                      <div className="flex gap-1 mt-2">
                        {['¯\\_(ツ)_/¯', '(╯°□°)╯︵ ┻━┻', '(=^.ω.^=)'].map(k => (
                          <button key={k} onClick={() => { addLog(`Injected Kaomoji macro: ${k}`); triggerToast('Macro sent over HID!'); }} className="text-[10px] font-mono px-2 py-0.5 bg-white border border-[#e9d5ff] rounded hover:bg-[#e9d5ff]">{k}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tentacle 6 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl"> Beep! </div>
                    <div>
                      <h4 className="font-black text-sm">6. Binary OPP Image Bridge</h4>
                      <p className="text-xs opacity-80 mt-1">Beams heavy GIF/Media files via Bluetooth OBEX L2CAP, then triggers synthetic Ctrl+V.</p>
                      <button onClick={() => addLog('Streaming binary image over BLE L2CAP Credit-Based Channel...')} className="text-[10px] font-bold text-[#c084fc] hover:underline block mt-1">Upload & Paste Local Asset ➜</button>
                    </div>
                  </div>

                  {/* Tentacle 7 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl">🎙️</div>
                    <div>
                      <h4 className="font-black text-sm">7. Universal Voice Dictation</h4>
                      <p className="text-xs opacity-80 mt-1">Speak into earbud; local Whisper transcribes on-device NPU and types text at 200+ WPM.</p>
                      <button onClick={() => addLog('Whisper local transcription listener active... Speak now.')} className="text-[10px] font-bold text-[#c084fc] hover:underline block mt-1">Start Dictation 🎙️</button>
                    </div>
                  </div>

                  {/* Tentacle 8 */}
                  <div className="p-4 border-2 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] flex items-start gap-3">
                    <div className="text-2xl">📓</div>
                    <div>
                      <h4 className="font-black text-sm">8. Air-Gapped Defensive Logging</h4>
                      <p className="text-xs opacity-80 mt-1">Contemporaneous markdown log files with tone tags, saved locally to keep workplace records protected.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Virtual arrow controller pad & live status terminal */}
              <div className="flex flex-col gap-6">
                {/* Visual D-Pad Navigator */}
                <div className="p-5 border-4 border-[#e9d5ff] rounded-[24px] bg-[#faf5ff] flex flex-col items-center shadow-inner">
                  <h4 className="font-black text-xs uppercase tracking-wider text-[#7e22ce] mb-3">CLI Terminal D-Pad</h4>
                  <div className="grid grid-cols-3 gap-2 w-36 h-36">
                    <div></div>
                    <button onClick={() => dispatchScancode('UP')} className="w-10 h-10 bg-white border-2 border-[#c084fc] rounded-xl font-bold flex items-center justify-center hover:bg-[#e9d5ff] active:scale-95 shadow">▲</button>
                    <div></div>
                    <button onClick={() => dispatchScancode('LEFT')} className="w-10 h-10 bg-white border-2 border-[#c084fc] rounded-xl font-bold flex items-center justify-center hover:bg-[#e9d5ff] active:scale-95 shadow">◀</button>
                    <button onClick={() => dispatchScancode('ENTER')} className="w-10 h-10 bg-[#c084fc] text-white rounded-xl font-bold flex items-center justify-center hover:bg-[#a855f7] active:scale-95 shadow">OK</button>
                    <button onClick={() => dispatchScancode('RIGHT')} className="w-10 h-10 bg-white border-2 border-[#c084fc] rounded-xl font-bold flex items-center justify-center hover:bg-[#e9d5ff] active:scale-95 shadow">▶</button>
                    <div></div>
                    <button onClick={() => dispatchScancode('DOWN')} className="w-10 h-10 bg-white border-2 border-[#c084fc] rounded-xl font-bold flex items-center justify-center hover:bg-[#e9d5ff] active:scale-95 shadow">▼</button>
                    <div></div>
                  </div>
                  <div className="flex gap-2 mt-4 w-full justify-center">
                    <button onClick={() => dispatchScancode('ESC')} className="px-3 py-1 bg-white border border-gray-300 text-xs font-bold rounded-lg shadow active:scale-95">ESC</button>
                    <button onClick={() => dispatchScancode('TAB')} className="px-3 py-1 bg-white border border-gray-300 text-xs font-bold rounded-lg shadow active:scale-95">TAB</button>
                  </div>
                </div>

                {/* Real-time event log monitor */}
                <div className="flex-1 flex flex-col border-2 border-[#e9d5ff] rounded-[24px] overflow-hidden shadow">
                  <div className="bg-[#f3e8ff] px-4 py-2 border-b border-[#e9d5ff] font-bold text-xs">Live Telemetry Terminal</div>
                  <div className="bg-[#1e1b4b] p-4 font-mono text-[10px] text-[#a78bfa] overflow-y-auto flex-1 h-44">
                    {telemetryLogs.map((log, idx) => (
                      <div key={idx} className="mb-1 leading-tight">{log}</div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'security-bank' && (
            <div className="space-y-6">
              <div className="p-4 border-l-4 border-amber-400 bg-amber-50 text-amber-900 text-sm rounded-r-xl">
                <strong>On-Demand Video Switch (DDC/CI):</strong> Selecting target servers triggers direct Display Data Channel commands over AUX lines, toggling physical input port connections on your main screen seamlessly.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TARGET_HOSTS.map((target) => (
                  <div 
                    key={target.id}
                    onClick={() => handleHostSwitch(target.id)}
                    className={`cursor-pointer p-6 border-4 rounded-[28px] transition-all flex flex-col justify-between h-48 hover:scale-105 ${config.activeTargetId === target.id ? 'border-[#a855f7] bg-[#FAF5FF] shadow-[6px_6px_0px_#a855f7]' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-3xl">{target.type === 'workstation' ? '💻' : target.type === 'vps' ? '🛡️' : '📱'}</span>
                        {config.activeTargetId === target.id && (
                          <span className="text-xs px-2 py-0.5 bg-[#34d399] text-[#065f46] font-bold rounded-full animate-pulse">KVM FOCUS</span>
                        )}
                      </div>
                      <h4 className="font-black text-lg mt-3">{target.name}</h4>
                      <p className="text-xs opacity-75 mt-1">Host Bridge: {target.activeSsh}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono font-bold mt-2">
                      <span>VCP: {target.ddcPort}</span>
                      <span className="text-[#a855f7]">Tap to Hop Focus ➜</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stress-telemetry' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-black text-xl">Passive Stress Telemetry (Air-Gapped)</h3>
                <p className="text-sm">kvmeowboard monitors keypress intervals to calculate the <strong>Hesitation Jitter</strong> of your typing bursts and flags correction spikes. This analysis happens entirely on local hardware silicon.</p>
                
                <div className="p-4 border-2 border-dashed border-[#e9d5ff] rounded-2xl space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">Keystroke Cadence Jitter:</span>
                      <span className="font-mono text-sm">{stressMetrics.jitter} ms</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-[#a855f7] h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stressMetrics.jitter / 200) * 100)}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Alert threshold: {config.hesitationJitterAlertThreshold}ms</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">Backspace Correction Velocity:</span>
                      <span className="font-mono text-sm">{stressMetrics.backspaceSpikes} spikes/min</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-red-400 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stressMetrics.backspaceSpikes / 15) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#faf5ff] p-3 rounded-lg border border-[#e9d5ff] text-xs font-bold mt-2">
                    <span>Cadence State:</span>
                    <span className={`px-2 py-0.5 rounded-full ${stressMetrics.jitter > config.hesitationJitterAlertThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{stressMetrics.cadenceState}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => runStressSimulation('frustrated')} className="px-4 py-2 bg-red-400 text-white font-bold rounded-full hover:bg-red-500 transition-colors text-sm">Simulate Frustration Spike</button>
                  <button onClick={() => runStressSimulation('calm')} className="px-4 py-2 bg-green-400 text-white font-bold rounded-full hover:bg-green-500 transition-colors text-sm">Reset to Nominal</button>
                </div>
              </div>

              {/* Stress telemetry visual grid simulation */}
              <div className="border-4 border-[#e9d5ff] rounded-[32px] p-5 flex flex-col justify-between bg-gray-50">
                <h4 className="font-black text-xs uppercase tracking-wider text-gray-400 text-center mb-4">Input Rhythm Spectrogram</h4>
                <div className="flex-1 flex items-end gap-1 h-44 px-4 pb-2 border-b-2 border-gray-200">
                  {/* Simulated vertical chart bars */}
                  {[30, 45, 25, 80, 15, 60, 95, 30, 40, stressMetrics.jitter / 2].map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-1 rounded-t transition-all duration-500 ${idx === 9 && stressMetrics.jitter > config.hesitationJitterAlertThreshold ? 'bg-red-400' : 'bg-[#c084fc]'}`}
                      style={{ height: `${val}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono px-2">
                  <span>-10m</span>
                  <span>-5m</span>
                  <span>Active Buffer (Live)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4 text-sm max-w-3xl">
              <h3 className="font-black text-xl mb-4">Frequently Asked Questions 💬</h3>
              <p><strong>Q: Is G:\My Drive\myapks safe from spaces in file paths?</strong><br/>A: Yes, our v2 compilation script encapsulates your paths in absolute double-quotes to prevent Windows terminal splits.</p>
              <p><strong>Q: Does the A2DP audio mix cause lag?</strong><br/>A: No, standard Bluetooth profiles provide sub-25ms latency, keeping speech synthesis checks properly ducked with background meeting audios.</p>
              <p><strong>Q: What happens to logged keystrokes?</strong><br/>A: Keystroke logs are stored as plain text markdown files strictly in your air-gapped phone storage. They never trigger network requests or telemetry transmissions.</p>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-4 text-sm max-w-3xl">
              <h3 className="font-black text-xl mb-4">System Changelog 📜</h3>
              <div className="border-l-2 border-[#e9d5ff] pl-4 space-y-4">
                <div>
                  <h4 className="font-bold">v4.0.0-KAWAII (2026-08-30)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                    <li>Integrated Bluetooth Octopus 8-tentacle matrix views.</li>
                    <li>Added VESA DDC/CI monitor source switching commands (VCP 0x60).</li>
                    <li>Added passive keystroke cadence hesitation metrics.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bouncing Toast alert */}
        {toast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#10b981] text-white font-black text-md rounded-full shadow-[0_10px_20px_rgba(16,185,129,0.3)] animate-bounce z-50">
            {toast}
          </div>
        )}

      </div>
    </div>
  );
};
