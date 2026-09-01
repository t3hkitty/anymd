/**
 * Zettelkasten ID: 20260826-1911
 * Project: @lorik/meow-mud
 * Role: Kawaii Brutalist Layered ASCII & MIDI Studio Interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStickySetting } from '../state/meowState';
import { AnsiArtGenerator, AnsiLayer, MidiNote } from './AnsiArtGenerator';
import { MeowModal } from '../components/MeowModals';
import { pushMeowToast } from '../components/MeowToast';

export const MeowAnsiArtStudio: React.FC = () => {
  const generator = useRef(new AnsiArtGenerator());
  const [layers, setLayers] = useStickySetting<AnsiLayer[]>('meow_mud_canvas_layers', [
    {
      id: 'bg-layer',
      name: '🗺️ Mud Map Base',
      visible: true,
      opacity: 1.0,
      grid: Array(25).fill(null).map(() => Array(80).fill('.')),
      colorGrid: Array(25).fill(null).map(() => Array(80).fill('text-[#94a3b8]')) // Warm desaturated gray
    },
    {
      id: 'sprites-layer',
      name: '🐱 Sprite Overlay',
      visible: true,
      opacity: 1.0,
      grid: Array(25).fill(null).map((_, y) => 
        Array(80).fill(' ').map((_, x) => {
          // Preset a cute ASCII sleeping cat in the center of the grid!
          if (y === 12 && x >= 35 && x <= 41) return [' ', ' ', '(', '^', '=', '^', ')'][x - 35];
          if (y === 13 && x >= 35 && x <= 41) return [' ', ' ', '(', ' ', '"', ' ', ')'][x - 35];
          return ' ';
        })
      ),
      colorGrid: Array(25).fill(null).map((_, y) => 
        Array(80).fill('text-slate-900').map((_, x) => {
          if (y === 12 || y === 13) return 'text-[#f43f5e] font-black'; // Rose Accent Color
          return 'text-slate-900';
        })
      )
    }
  ]);

  const [activeLayerId, setActiveLayerId] = useStickySetting<string>('meow_mud_active_layer_id', 'sprites-layer');
  const [bpm, setBpm] = useStickySetting<number>('meow_mud_midi_bpm', 125);
  const [synthVolume, setSynthVolume] = useStickySetting<number>('meow_mud_synth_volume', 50);

  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isPlayingMidi, setIsPlayingMidi] = useState(false);
  
  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];
  const flattened = generator.current.flattenLayers(layers);

  // Web Audio Synth context references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal event binders (Esc/Click outside handler triggers) [cite: 615]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFaqOpen(false);
        setIsChangelogOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCellEdit = (y: number, x: number, char: string, colorClass: string = 'text-slate-900') => {
    if (!activeLayer) return;
    const updatedLayers = layers.map(layer => {
      if (layer.id === activeLayer.id) {
        const newGrid = layer.grid.map(row => [...row]);
        const newColors = layer.colorGrid.map(row => [...row]);
        newGrid[y][x] = char.substring(0, 1) || ' ';
        newColors[y][x] = colorClass;
        return { ...layer, grid: newGrid, colorGrid: newColors };
      }
      return layer;
    });
    setLayers(updatedLayers);
  };

  const handleToggleVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    pushMeowToast('Layer visibility toggled', 'info');
  };

  const handleAddLayer = () => {
    const nextId = `layer-${Date.now()}`;
    const newLayer: AnsiLayer = {
      id: nextId,
      name: `🎨 Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1.0,
      grid: Array(25).fill(null).map(() => Array(80).fill(' ')),
      colorGrid: Array(25).fill(null).map(() => Array(80).fill('text-slate-900'))
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(nextId);
    pushMeowToast('New layer added successfully!', 'success');
  };

  const handlePlayProceduralMidi = () => {
    if (isPlayingMidi) {
      if (sequenceTimerRef.current) clearInterval(sequenceTimerRef.current);
      setIsPlayingMidi(false);
      pushMeowToast('MIDI Playback Stopped', 'info');
      return;
    }

    // Initialize Web Audio API Synth Engine
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const melody = generator.current.generateProceduralMidi(layers, bpm);
    let index = 0;
    setIsPlayingMidi(true);
    pushMeowToast('Playing Procedural ASCII Melodies...', 'success');

    const tickInterval = (60000 / bpm) / 4; // 16th notes interval
    sequenceTimerRef.current = setInterval(() => {
      if (index >= melody.length) {
        index = 0; // Loop melody forever like a proper MUD arcade loop!
      }

      const note = melody[index];
      if (note.note > 0) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // 90s square-wave/chiptune synth patch [cite: 365, 413]
        osc.type = note.instrument === 80 ? 'square' : 'sawtooth';
        
        // Convert pitch code to Hz
        const freq = 440 * Math.pow(2, (note.note - 69) / 12);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const volumeScalar = (synthVolume / 100) * (note.velocity / 127) * 0.15;
        gainNode.gain.setValueAtTime(volumeScalar, audioCtx.currentTime);
        // Exponential volume decay for pluck notes
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + note.duration / 1000);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + note.duration / 1000);
      }

      index++;
    }, tickInterval);
  };

  const handleExportMidiFile = () => {
    const melody = generator.current.generateProceduralMidi(layers, bpm);
    const base64Midi = generator.current.exportStandardMidi(melody);
    
    // Create direct browser download trigger
    const link = document.createElement('a');
    link.href = `data:audio/midi;base64,${base64Midi}`;
    link.download = `meow-mud-sequence.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    pushMeowToast('MIDI File Exported to Hard Drive! 🎹', 'success');
  };

  return (
    <div className="p-4 border-4 border-slate-900 bg-[#FFFDF5] text-slate-900 font-mono text-xs max-w-7xl shadow-[4px_4px_0_0_#1e1e2e]">
      
      {/* Tab/Control Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 border-b-2 border-slate-900 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-black tracking-wider uppercase flex items-center gap-1">
            📟 Meow MUD ANSI Studio & MIDI Composer
          </h2>
          <span className="px-2 py-0.5 bg-indigo-100 border border-slate-900 text-[10px] font-black uppercase text-indigo-900">
            90s Retro Edition
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFaqOpen(true)} 
            className="px-2 py-1 bg-indigo-200 border-2 border-slate-900 font-bold hover:bg-indigo-300 active:translate-y-0.5"
          >
            FAQ
          </button>
          <button 
            onClick={() => setIsChangelogOpen(true)} 
            className="px-2 py-1 bg-pink-200 border-2 border-slate-900 font-bold hover:bg-pink-300 active:translate-y-0.5"
          >
            Changelog
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left Column: Layers and Control Deck */}
        <div className="flex flex-col gap-4 lg:col-span-1 border-r-0 lg:border-r-2 border-slate-900 pr-0 lg:pr-4">
          
          {/* Active Layer Editor Selector */}
          <div className="p-3 bg-white border-2 border-slate-900 shadow-[2px_2px_0_0_#1e1e2e]">
            <h3 className="font-black text-xs uppercase tracking-wider mb-2 border-b border-slate-900 pb-1">
              🎨 Canvas Layer Deck
            </h3>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {layers.map((layer) => (
                <div 
                  key={layer.id}
                  className={`flex items-center justify-between p-1.5 border ${
                    activeLayerId === layer.id ? 'bg-[#E6E6FA] border-slate-950 font-black' : 'border-slate-300'
                  }`}
                >
                  <button 
                    onClick={() => setActiveLayerId(layer.id)}
                    className="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {layer.name}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleToggleVisibility(layer.id)}
                      className="text-xs hover:text-indigo-600 active:scale-90"
                      title="Toggle Visibility"
                    >
                      {layer.visible ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddLayer}
              className="w-full mt-3 py-1 bg-emerald-100 border-2 border-slate-900 font-bold hover:bg-emerald-200 active:translate-y-0.5"
            >
              ➕ Add New Layer
            </button>
          </div>

          {/* Procedural MIDI Configuration */}
          <div className="p-3 bg-white border-2 border-slate-900 shadow-[2px_2px_0_0_#1e1e2e]">
            <h3 className="font-black text-xs uppercase tracking-wider mb-2 border-b border-slate-900 pb-1">
              🎹 retro MIDI Synth Loop
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span>Tempo (BPM):</span>
                <input 
                  type="number" 
                  min="60" 
                  max="240" 
                  value={bpm} 
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-16 p-1 border-2 border-slate-900 text-center bg-slate-50 font-bold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span>Synth Volume:</span>
                  <span>{synthVolume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={synthVolume} 
                  onChange={(e) => setSynthVolume(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <button 
                  onClick={handlePlayProceduralMidi}
                  className={`w-full py-1.5 border-2 border-slate-900 font-black tracking-wide uppercase ${
                    isPlayingMidi ? 'bg-rose-200 hover:bg-rose-300' : 'bg-amber-200 hover:bg-amber-300'
                  }`}
                >
                  {isPlayingMidi ? '⏹️ Stop Synth' : '▶️ Play ASCII Loop'}
                </button>
                <button 
                  onClick={handleExportMidiFile}
                  className="w-full py-1 bg-indigo-100 border-2 border-slate-900 font-bold hover:bg-indigo-200"
                >
                  💾 Export .MID File
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns: Core ASCII Canvas Grid */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          
          {/* Canvas Render Frame */}
          <div className="p-4 bg-slate-900 border-4 border-slate-950 text-emerald-400 overflow-x-auto shadow-[4px_4px_0_0_#0f172a]">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2 flex justify-between">
              <span>🖥️ Flat VT100 Terminal View (80x25 characters)</span>
              <span>Layer Count: {layers.length}</span>
            </div>
            
            <pre className="font-mono text-[9px] leading-none select-none tracking-normal whitespace-pre">
              {flattened.characters.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((char, x) => {
                    const colorClass = flattened.colors[y][x];
                    return (
                      <span 
                        key={x} 
                        onClick={() => {
                          const charPrompt = prompt('Enter a single replacement ASCII character:', activeLayer?.grid[y]?.[x] || '');
                          if (charPrompt !== null) {
                            handleCellEdit(y, x, charPrompt || ' ', 'text-rose-400');
                          }
                        }}
                        className={`cursor-pointer hover:bg-slate-700 hover:text-white px-0.5 ${colorClass}`}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              ))}
            </pre>
          </div>

          {/* Quick Preset Deck */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-[#FFFDF5] border-2 border-slate-900">
            <span className="font-black uppercase tracking-wider text-[10px] text-slate-500">Inject preset:</span>
            <button 
              onClick={() => {
                handleCellEdit(5, 40, '⛄', 'text-[#38bdf8] font-black');
                pushMeowToast('Injected melting snowman character!', 'success');
              }}
              className="px-2 py-1 bg-rose-100 border-2 border-slate-900 hover:bg-rose-200 font-bold"
            >
              ⛄ Snowman
            </button>
            <button 
              onClick={() => {
                handleCellEdit(1, 2, '█', 'text-amber-500');
                handleCellEdit(1, 3, '█', 'text-amber-500');
                pushMeowToast('Injected solid boundary blocking walls!', 'info');
              }}
              className="px-2 py-1 bg-indigo-100 border-2 border-slate-900 hover:bg-indigo-200 font-bold"
            >
              🧱 Wall Segment
            </button>
          </div>

        </div>

      </div>

      {/* FAQ Modal */}
      {isFaqOpen && (
        <MeowModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} title="FAQ: Meow MUD Studio">
          <div className="space-y-3 font-mono text-xs">
            <p><strong>Q: What is a MUD Engine?</strong><br/>A: Multi-User Dungeons (MUDs) were text-based virtual worlds of the 80s and 90s. This utility branches out your ASCII cinematic tools into a full layered editing canvas and procedural synth sequencer [cite: 365, 415, 420]!</p>
            <p><strong>Q: How does layering function?</strong><br/>A: Layers compile bottom-up [cite: 419]. Transparent/empty text character values (` `) on top layers automatically let background grid features render through cleanly.</p>
            <p><strong>Q: How does the MIDI synthesizer work?</strong><br/>A: The engine parses active characters column-by-column, calculating an ASCII frequency sum that triggers retro 90s chiptune notes over the standard Web Audio API on tick beats [cite: 365, 413, 420].</p>
          </div>
        </MeowModal>
      )}

      {/* Changelog Modal */}
      {isChangelogOpen && (
        <MeowModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} title="Changelog: Meow MUD">
          <div className="space-y-2 font-mono text-xs">
            <p><strong>v1.0.0 (2026-08-26):</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Separated ASCII cinema stream renders and KATS cartridge packaging into a standalone, modular package.</li>
              <li>Engineered interactive 80x25 ANSI layering drawing board with cell-editing triggers.</li>
              <li>Built on-the-fly procedural chiptune playback using Web Audio square/sawtooth oscillator synth patches [cite: 365, 413].</li>
              <li>Enabled direct Base64 compiling to output standard <code>.mid</code> musical sequences [cite: 415].</li>
            </ul>
          </div>
        </MeowModal>
      )}

    </div>
  );
};
