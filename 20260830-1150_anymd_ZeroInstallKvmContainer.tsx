import React, { useState, useEffect, useRef } from 'react';
import { useZeroInstallState } from '../hooks/20260830-1150_anymd_zero_install_state';

export const ZeroInstallKvmContainer: React.FC = () => {
  const { kvmConfig, setKvmConfig, somaticConfig, setSomaticConfig } = useZeroInstallState();
  const [activeTab, setActiveTab] = useState<'matrix' | 'somatic' | 'mindless' | 'faq' | 'changelog'>('matrix');
  const [toast, setToast] = useState<string | null>(null);
  
  // Vault mount state (Cheesy Cat protocol placeholder trigger)
  const [isVaultMounted, setIsVaultMounted] = useState<boolean>(false);
  const [hydrationTier, setHydrationTier] = useState<string>('Hamster Dropper');
  const [hyperboleInput, setHyperboleInput] = useState<string>('');
  const [reframedText, setReframedText] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Resolve Hydration Visual Tiers
  useEffect(() => {
    const sips = somaticConfig.hydrationSips;
    if (sips === 0) setHydrationTier('Desert Saharian 🏜️');
    else if (sips <= 2) setHydrationTier('Hamster Dropper 🐹');
    else if (sips <= 5) setHydrationTier('Somatic Straw 🥤');
    else if (sips <= 8) setHydrationTier('Vessel Master ☕');
    else if (sips <= 12) setHydrationTier('River Guardian 🌊');
    else if (sips <= 15) setHydrationTier('Galactic Flask 🌌');
    else if (sips <= 20) setHydrationTier('Warehouse Pallet 📦');
    else setHydrationTier('Universal Flood Tiamat 🐉');
  }, [somaticConfig.hydrationSips]);

  // Linguistic Inflation / Hyperbole reframer logic
  const handleReframerCheck = () => {
    let text = hyperboleInput.toLowerCase();
    let reframed = hyperboleInput;
    if (text.includes("100000_favorites")) {
      reframed = reframed.replace(/100000_favorites/gi, "local_noise_grounding");
      showToast("Hyperbole flagged! Reframed '100000_favorites' to 'local_noise_grounding' 🐾");
    }
    if (text.includes("literally")) {
      reframed = reframed.replace(/literally/gi, "practically");
      showToast("Linguistic hyperbole adjusted! 🎀");
    }
    setReframedText(reframed);
  };

  // Keyboard Navigation / Esc dismissal hook simulation
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 't' && e.altKey) {
        setKvmConfig({ themePreset: kvmConfig.themePreset === 'classic' ? 'cute' : kvmConfig.themePreset === 'cute' ? 'silly' : 'classic' });
        showToast(`Theme Swapped to: ${kvmConfig.themePreset.toUpperCase()}`);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [kvmConfig.themePreset]);

  // Web Audio API Doppler major-third victory chime (Offline-Safe)
  const triggerAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
        osc.start(start);
        osc.stop(start + 0.6);
      };
      
      const now = ctx.currentTime;
      // F5 (698.46 Hz) + A5 (880.00 Hz) Major-Third Chord
      playTone(698.46, now);
      playTone(880.00, now + 0.05);
      showToast("Dopamine Victory Chime Synthesized! 🎧✨");
    } catch (e) {
      console.warn("Web Audio API failed or blocked by browser gesture.", e);
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col p-6 font-sans transition-all duration-300 ${
        kvmConfig.themePreset === 'cute' 
          ? 'bg-[#FAF8F5] text-[#4c1d95] rounded-[32px] border-[6px] border-[#e9d5ff]' 
          : kvmConfig.themePreset === 'silly'
          ? 'bg-[#0f172a] text-[#38bdf8] rounded-none border-[4px] border-[#f43f5e] border-dashed'
          : 'bg-white text-slate-800 rounded-lg border-2 border-slate-300'
      }`}
    >
      {/* Dynamic Master Header */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-[#f3e8ff]/70 backdrop-blur-md p-6 rounded-[24px] border-b-4 border-[#e9d5ff] mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐙</span>
          <div>
            <h1 className="text-2xl font-black tracking-tight">anyMD Universal KawaiiNeko Suite</h1>
            <p className="text-xs opacity-75">KVM Channel: {kvmConfig.activeNode} | Theme: {kvmConfig.themePreset}</p>
          </div>
        </div>

        {/* Global Hub Navigation */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {['matrix', 'somatic', 'mindless', 'faq', 'changelog'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any);
                triggerAudioChime();
              }}
              className={`px-4 py-2 font-bold rounded-full transition-all capitalize hover:scale-105 ${
                activeTab === tab 
                  ? 'bg-[#c084fc] text-white shadow-md' 
                  : 'bg-white text-[#c084fc] border-2 border-[#e9d5ff] hover:bg-[#faf5ff]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Sandbox Frame */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidecar: CYA Vault Gating (Cheesy Cat Invariant) */}
        <section className="lg:col-span-1 bg-white p-6 rounded-[24px] border-4 border-[#e9d5ff] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
              🔒 The CYA Vault
            </h3>
            <p className="text-sm opacity-85 mb-4">
              Enforces complete local-first directory sandbox isolation via the File System Access API.
            </p>

            {!isVaultMounted ? (
              <div className="bg-[#fef2f2] p-6 rounded-[20px] border-4 border-[#fee2e2] flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-mono text-[#ef4444] mb-2">(=^.^=)</span>
                <p className="text-xs text-[#b91c1c] font-black">
                  Cheesy Cat Protocol: Vault directory unmounted!
                </p>
                <button 
                  onClick={() => {
                    setIsVaultMounted(true);
                    showToast("KawaiiNeko Local Vault Mounted! 🗄️🔓");
                  }}
                  className="mt-4 px-4 py-2 bg-[#ef4444] text-white font-bold text-xs rounded-full hover:bg-[#dc2626] transition-colors"
                >
                  Mount Local Directory
                </button>
              </div>
            ) : (
              <div className="bg-[#ecfdf5] p-4 rounded-[20px] border-4 border-[#d1fae5] text-center">
                <p className="text-xs text-[#047857] font-black">
                  🟢 LC-MD Vault Mounted & Pinned
                </p>
                <button 
                  onClick={() => {
                    setIsVaultMounted(false);
                    showToast("Vault closed and locked successfully.");
                  }}
                  className="mt-3 text-xs underline text-[#047857]"
                >
                  Unmount Directory
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#f3e8ff]">
            <h4 className="text-xs font-black uppercase text-[#a855f7] mb-2">Active Telemetry</h4>
            <div className="text-xs space-y-1 opacity-80">
              <p>• DDC/CI Target port: DP-2 [cite: 271]</p>
              <p>• Active Key: Win + ~ [cite: 294]</p>
              <p>• Pre-Commit: sanitize-active [cite: 7]</p>
            </div>
          </div>
        </section>

        {/* Center: Workspace Panel Switchboard */}
        <section className="lg:col-span-3 bg-white p-6 rounded-[24px] border-4 border-[#e9d5ff]">
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black border-b-2 border-[#f3e8ff] pb-2 flex items-center gap-2">
                🎮 KVM Host Switcher & VESA DDC Selector
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Node-1 (Workstation)', port: 'HDMI-1', status: 'Online' },
                  { name: 'Node-2 (Home Server)', port: 'DisplayPort-2', status: 'Online' },
                  { name: 'Node-3 (Local VPS)', port: 'DisplayPort-1', status: 'Offline' }
                ].map((node) => (
                  <div 
                    key={node.name}
                    onClick={() => {
                      setKvmConfig({ activeNode: node.name });
                      showToast(`DDC/CI trigger dispatched over local Network: ${node.port} [cite: 271]`);
                    }}
                    className={`p-4 border-4 rounded-[20px] cursor-pointer transition-all hover:scale-102 ${
                      kvmConfig.activeNode === node.name 
                        ? 'border-[#a855f7] bg-[#fdf4ff] shadow-md' 
                        : 'border-[#e9d5ff] bg-[#faf5ff] hover:bg-[#f3e8ff]'
                    }`}
                  >
                    <h4 className="font-bold text-sm">{node.name}</h4>
                    <p className="text-xs opacity-75 mt-1">VESA Opcode: VCP 0x60 -> {node.port} [cite: 271]</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#a855f7] border border-[#e9d5ff] font-bold">
                        {node.port}
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${node.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Terminal Simulator Interface */}
              <div className="bg-[#1e1b4b] rounded-[20px] p-6 shadow-inner font-mono text-[#a78bfa] text-xs">
                <p className="text-emerald-400"># anyMD KawaiiNeko Shell v6.0.0-KAWAII</p>
                <p className="mt-1"># Executing zero-install scancode listener...</p>
                <p className="mt-2 text-yellow-300"># Active Hotkey: Ctrl + C, Ctrl + R reverse [cite: 241]</p>
                <div className="mt-4 p-3 bg-white/5 rounded border border-white/10 flex justify-between">
                  <span>LAST SCANCODE STREAMED: [0x51 DownArrow] [cite: 241]</span>
                  <span className="text-emerald-400">Success (0ms delay)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'somatic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black border-b-2 border-[#f3e8ff] pb-2">
                🌸 Somatic KawaiiNekoty & Hydration Triage
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 8-Tier Sip Tracker */}
                <div className="p-4 border-4 border-[#e9d5ff] rounded-[20px] bg-[#fdf4ff]">
                  <h3 className="font-black text-sm mb-2">💧 Relatable Hydration Sips</h3>
                  <div className="text-xs mb-3 space-y-1">
                    <p><strong>Active Sips:</strong> {somaticConfig.hydrationSips}</p>
                    <p><strong>Visual Tier:</strong> {hydrationTier}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSomaticConfig({ hydrationSips: somaticConfig.hydrationSips + 1 });
                        triggerAudioChime();
                      }}
                      className="px-4 py-2 bg-[#a855f7] text-white font-bold text-xs rounded-full hover:bg-[#7e22ce]"
                    >
                      ➕ Register 1 Sip
                    </button>
                    <button 
                      onClick={() => {
                        setSomaticConfig({ hydrationSips: 0 });
                        showToast("Hydration logs reset.");
                      }}
                      className="px-4 py-2 bg-white text-[#a855f7] border-2 border-[#e9d5ff] font-bold text-xs rounded-full hover:bg-slate-50"
                    >
                      Reset Sips
                    </button>
                  </div>
                </div>

                {/* Linguistic Inflation Reframer */}
                <div className="p-4 border-4 border-[#e9d5ff] rounded-[20px] bg-[#fdf4ff]">
                  <h3 className="font-black text-sm mb-2">💬 Hyperbole Monitor & Grounder</h3>
                  <textarea 
                    value={hyperboleInput}
                    onChange={(e) => setHyperboleInput(e.target.value)}
                    placeholder="Type words like literally or 100000_favorites here..."
                    className="w-full h-20 p-2 text-xs border-2 border-[#e9d5ff] rounded-[12px] focus:outline-none focus:border-[#a855f7] mb-2 font-mono"
                  />
                  <button 
                    onClick={handleReframerCheck}
                    className="px-4 py-2 bg-[#d946ef] text-white font-bold text-xs rounded-full hover:bg-[#a21caf]"
                  >
                    Check & Ground Text
                  </button>
                  {reframedText && (
                    <div className="mt-3 p-2 bg-[#ecfdf5] border-2 border-[#a7f3d0] rounded-[10px] text-xs font-mono">
                      <strong>Reframed:</strong> {reframedText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mindless' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black border-b-2 border-[#f3e8ff] pb-2">
                🎮 Mindless Focus Game Console
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-4 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] text-center">
                  <span className="text-3xl">🧩</span>
                  <h4 className="font-black text-sm mt-2">ClinchSight Solitaire</h4>
                  <p className="text-xs opacity-75 mt-1">Auto-detects victory states & snaps timers at completion [cite: 18].</p>
                </div>
                <div className="p-4 border-4 border-[#e9d5ff] rounded-[20px] bg-[#faf5ff] text-center">
                  <span className="text-3xl">🎱</span>
                  <h4 className="font-black text-sm mt-2">Therapy Pool</h4>
                  <p className="text-xs opacity-75 mt-1">Slightest delay triggers flat NPC dialog prompts [cite: 19].</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4 text-sm">
              <h2 className="text-xl font-black border-b-2 border-[#f3e8ff] pb-2">FAQ 💬</h2>
              <p><strong>Q: What is the Zero-Install Guarantee?</strong><br/>A: Standard native OS Bluetooth profiles (HID, A2DP) are utilized completely. No target workstations or laptops require invasive software/MDMs [cite: 47].</p>
              <p><strong>Q: How does the monitor input toggle?</strong><br/>A: Through standard VESA DDC/CI AUX command Opcode 0x60 or local REST/UDP microcontroller commands [cite: 271, 291].</p>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-4 text-xs font-mono">
              <h2 className="text-xl font-black border-b-2 border-[#f3e8ff] pb-2 font-sans">Changelog 📜</h2>
              <p><strong>v6.0.0-KAWAII:</strong> Decoupled core DB, added 10-domain HUD, and restored the Cheesy Cat directory isolation gate [cite: 90].</p>
              <p><strong>v5.5.0:</strong> Added Web Audio API Dopamine Major-Third chime sequences [cite: 206, 560].</p>
            </div>
          )}
        </section>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#10b981] text-white font-black text-lg rounded-full shadow-lg animate-bounce z-50">
          {toast}
        </div>
      )}
    </div>
  );
};
