import React, { useState, useEffect, useRef } from 'react';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

interface QueueItem {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'done';
}

export const IdleProcessorSettingsWidget: React.FC = () => {
  // Config state
  const [powerMode, setPowerMode] = useState<'ECO' | 'BALANCED' | 'TURBO' | 'OVERKILL'>('BALANCED');
  const [allocatedCores, setAllocatedCores] = useState<number>(4);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [queueCount, setQueueCount] = useState<number>(42);
  const [processingTimeLeft, setProcessingTimeLeft] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<string>('');

  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const maxCoresAvailable = navigator.hardwareConcurrency || 8;

  // Correlate mode with theoretical core allocations
  const handlePowerSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cores = parseInt(e.target.value);
    setAllocatedCores(cores);
    
    const percentage = cores / maxCoresAvailable;
    if (percentage <= 0.25) {
      setPowerMode('ECO');
    } else if (percentage <= 0.5) {
      setPowerMode('BALANCED');
    } else if (percentage <= 0.8) {
      setPowerMode('TURBO');
    } else {
      setPowerMode('OVERKILL');
    }
  };

  // Immediate "Start Now" Trigger
  const handleIgniteProcessing = () => {
    if (queueCount === 0) return;
    setIsProcessing(true);
    
    // Calculate theoretical duration based on selected CPU horsepower
    // More cores = faster execution speed
    const baseSecondsPerItem = 8; // base index time for OCR + VLM
    const physicalDurationSeconds = Math.ceil((queueCount * baseSecondsPerItem) / (allocatedCores * 0.8));
    setProcessingTimeLeft(physicalDurationSeconds);

    // Simulated task rotation loop
    const filesToProcess = [
      "bujo_20260822_laundry_socks.png",
      "crm_henry_t_seduction_log.png",
      "cycle_ovulation_temperature_chart.png",
      "target_zipper_folio_notes.png"
    ];
    let fileIdx = 0;
    setCurrentFile(filesToProcess[0]);

    if ('speechSynthesis' in window) {
      const modeSpoken = powerMode === 'OVERKILL' ? "OVERKILL INSANE MODE" : `${powerMode} mode`;
      const utterance = new SpeechSynthesisUtterance(
        `Ignition! Manually launching background database sweep using ${allocatedCores} processor cores in ${modeSpoken}. Estimated run-time is ${Math.ceil(physicalDurationSeconds / 60)} minutes. Stay cool and grab a sip of water!`
      );
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    if (processingTimerRef.current) clearInterval(processingTimerRef.current);
    
    processingTimerRef.current = setInterval(() => {
      setProcessingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(processingTimerRef.current!);
          setIsProcessing(false);
          setQueueCount(0);
          setCurrentFile('');
          
          if ('speechSynthesis' in window) {
            const successUtterance = new SpeechSynthesisUtterance("Background sweep completed! All bullet journal entries, intimacy logs, and images have been fully OCR'd and described locally. Your database is 100% indexed!");
            window.speechSynthesis.speak(successUtterance);
          }
          return 0;
        }

        // Periodically swap file names in the display to look busy
        if (prev % 5 === 0) {
          fileIdx = (fileIdx + 1) % filesToProcess.length;
          setCurrentFile(filesToProcess[fileIdx]);
          // Slightly decrement pending count to show raw tactile progress
          setQueueCount(q => Math.max(0, q - 1));
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleStopProcessing = () => {
    setIsProcessing(false);
    if (processingTimerRef.current) clearInterval(processingTimerRef.current);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Processing paused. Returning cores to normal operation. Core temperatures stabilizing."));
    }
  };

  // Format MM:SS for the processing countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (processingTimerRef.current) clearInterval(processingTimerRef.current);
    };
  }, []);

  return (
    <WidgetPanel 
      title="⚡ Sovereign Core Processor" 
      badge="⚙️ POWER PANEL"
      className="border-4 border-black shadow-[4px_4px_0_#000] bg-white p-3 rounded-none max-w-md relative"
    >
      <div className="flex flex-col gap-3">
        
        {/* RETRO HARDWARE DIAGNOSTIC TERMINAL */}
        <div className="bg-black border-2 border-black p-2.5 font-mono text-[10px] text-green-400 leading-tight">
          <p className="text-gray-500 font-bold"># myBlackbox Engine Hardware Monitor</p>
          <p>🟢 ENGINE STATUS: {isProcessing ? "🚀 OVERCLOCKED_RUNNING" : "💤 SLEEP_WAIT_IDLE"}</p>
          <p>🔢 BACKLOG QUEUE: {queueCount} unindexed assets</p>
          <p>🧵 ALLOCATED CORES: {allocatedCores} / {maxCoresAvailable} hardware threads</p>
          <p className="text-yellow-300 font-black">
            🔥 COGNITIVE PROFILE: {powerMode} MODE
          </p>
          {isProcessing && (
            <div className="mt-2 text-pink-400 border-t border-dashed border-gray-700 pt-1">
              <p className="animate-pulse font-black text-xs">⚠️ ACTIVE SWEEP IN PROGRESS...</p>
              <p className="truncate">📄 Processing: {currentFile}</p>
            </div>
          )}
        </div>

        {/* POWER MODE EXPLANATIONS */}
        <div className="bg-yellow-50 border-2 border-black p-2 text-[11px] font-bold leading-normal text-yellow-950">
          {powerMode === 'ECO' && "🌱 Eco: Quietly processes 1 item at a time only when you are completely away. Safe for battery life."}
          {powerMode === 'BALANCED' && "⚖️ Balanced: Standard background threads. Perfect for keeping the fans quiet during typical work phases."}
          {powerMode === 'TURBO' && "⚡ Turbo: Consumes extra cores to aggressively rip through handwriting scans and images. Fan noise may increase!"}
          {powerMode === 'OVERKILL' && "💀 OVERKILL (Troll Mode): Maximizes all CPU cores to ignite 100% on-device AI processing. Backlog will be absolutely vaporized!"}
        </div>

        {/* THE CORE ALLOCATION SLIDER */}
        <div className="flex flex-col gap-1 border-t-2 border-black pt-2">
          <div className="flex justify-between items-center text-xs font-black uppercase text-gray-700">
            <span>Allocate Processing Horsepower:</span>
            <span className="bg-purple-200 border border-black px-1.5 text-[10px] font-black">
              {allocatedCores} Cores Selected
            </span>
          </div>
          <input 
            type="range"
            min="1"
            max={maxCoresAvailable}
            value={allocatedCores}
            onChange={handlePowerSliderChange}
            disabled={isProcessing}
            className="w-full accent-black cursor-pointer my-1 border border-black h-3 bg-gray-100"
          />
        </div>

        {/* ACTIVE TIMER & PROGRESS PROGRESS BAR */}
        {isProcessing && (
          <div className="bg-pink-100 border-2 border-black p-3 text-center transition-all animate-pulse">
            <h4 className="font-black text-[10px] uppercase tracking-wider text-pink-700">⚙️ Manual Ignition Active</h4>
            <div className="text-3xl font-black tracking-widest text-black font-mono my-1">
              {formatTime(processingTimeLeft)}
            </div>
            <span className="text-[9px] font-bold text-gray-500 block leading-tight">
              Estimated physical sweep time remaining
            </span>
          </div>
        )}

        {/* TRIGGER BUTTONS */}
        <div className="flex gap-2">
          {!isProcessing ? (
            <button 
              onClick={handleIgniteProcessing}
              disabled={queueCount === 0}
              className={`flex-1 border-4 border-black font-black uppercase text-sm p-2.5 shadow-[3px_3px_0_#000] active:translate-y-[1px] active:shadow-none transition-transform ${
                queueCount === 0 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                  : "bg-emerald-300 hover:bg-emerald-400 text-black"
              }`}
            >
              ⚡ Ignite Processing Now
            </button>
          ) : (
            <button 
              onClick={handleStopProcessing}
              className="flex-1 bg-red-400 hover:bg-red-500 border-4 border-black font-black uppercase text-sm p-2.5 text-white shadow-[3px_3px_0_#000] active:translate-y-[1px] active:shadow-none transition-transform"
            >
              🛑 Pause Processor
            </button>
          )}
        </div>

      </div>
    </WidgetPanel>
  );
};