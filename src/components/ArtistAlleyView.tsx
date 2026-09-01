import React, { useState, useRef } from 'react';
import { Palette, Play, Square, Music, Sparkles, Sliders, Volume2, Cat, Image as ImageIcon } from 'lucide-react';

export const ArtistAlleyView: React.FC = () => {
  // Canvas State
  const [color, setColor] = useState<string>('#EC4899');
  const [pixels, setPixels] = useState<string[]>(Array(256).fill('#1E1E2E'));
  
  // CRT Shader State
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [chromaticAberration, setChromaticAberration] = useState<boolean>(true);
  const [crtCurvature, setCrtCurvature] = useState<number>(50);

  // Monospace ASCII Cat Generator State
  const [asciiStyle, setAsciiStyle] = useState<'sleeping' | 'happy' | 'wizard'>('happy');
  const [asciiOutput, setAsciiOutput] = useState<string>(`
   /\_/\  
  ( o.o ) 
   > ^ <  
  KAWAII NEKO V3.8
  `);

  // Procedural MIDI Audio Engine State
  const [isPlayingMidi, setIsPlayingMidi] = useState<boolean>(false);
  const [tempoBpm, setTempoBpm] = useState<number>(120);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handlePixelClick = (index: number) => {
    const updated = [...pixels];
    updated[index] = color;
    setPixels(updated);
  };

  const handleGenerateCat = (style: 'sleeping' | 'happy' | 'wizard') => {
    setAsciiStyle(style);
    if (style === 'sleeping') {
      setAsciiOutput(`
   |\---/|
   | o_o |
   \_ z _/
  Z z z ...
      `);
    } else if (style === 'wizard') {
      setAsciiOutput(`
    /\___/\
   (  o.o  )
   /  ^  \  ★
  (  | |  ) ✨
  (_/   \_)
      `);
    } else {
      setAsciiOutput(`
   /\_/\  
  ( o.o ) 
   > ^ <  
  KAWAII NEKO V3.8
      `);
    }
  };

  const handleToggleMidiAudio = () => {
    if (isPlayingMidi) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlayingMidi(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Play simple procedural MIDI synth melody
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        let noteIdx = 0;

        const playNextNote = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(notes[noteIdx % notes.length], ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);

          noteIdx++;
          if (isPlayingMidi) {
            setTimeout(playNextNote, (60 / tempoBpm) * 500);
          }
        };

        setIsPlayingMidi(true);
        playNextNote();
      } catch (err) {
        console.error("Audio Context initialization failed", err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 text-slate-100 p-4 font-sans select-none overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 border border-purple-500/30 p-3 rounded-2xl mb-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 border border-purple-500 text-purple-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide flex items-center gap-2">
              Artist Alley Studio 🎨
              <span className="text-[10px] bg-purple-950 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                SFM256 &amp; ANSI Shader Engine
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">ANSI / SFM256 pixel canvas, GLSL CRT shader &amp; procedural MIDI audio</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
        {/* Panel 1: ANSI / SFM256 Pixel Art Canvas */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> 16x16 Pixel Canvas
            </span>
            <div className="flex items-center gap-2">
              {['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#1E1E2E'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border border-slate-700 transition-transform ${color === c ? 'scale-125 border-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-16 gap-0.5 bg-slate-950 p-2 border border-slate-800 rounded-xl aspect-square justify-center">
            {pixels.map((pColor, i) => (
              <div
                key={i}
                onClick={() => handlePixelClick(i)}
                className="w-full h-full aspect-square cursor-pointer hover:opacity-80 rounded-[1px]"
                style={{ backgroundColor: pColor }}
              />
            ))}
          </div>
        </div>

        {/* Panel 2: GLSL CRT Shader & CRT Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> GLSL CRT Shader Controls
            </span>
          </div>

          <div className="flex flex-col gap-3 bg-slate-950 p-3.5 border border-slate-850 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Scanlines Overlay</span>
              <button
                onClick={() => setScanlines(!scanlines)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border ${scanlines ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                {scanlines ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Chromatic Aberration</span>
              <button
                onClick={() => setChromaticAberration(!chromaticAberration)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border ${chromaticAberration ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                {chromaticAberration ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-850">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>CRT Screen Curvature</span>
                <span>{crtCurvature}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={crtCurvature}
                onChange={e => setCrtCurvature(parseInt(e.target.value))}
                className="accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* CRT Shader Live Viewport Simulation */}
          <div className={`flex-grow bg-slate-950 border border-purple-500/30 rounded-xl p-4 relative overflow-hidden flex items-center justify-center ${scanlines ? 'bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]' : ''}`}>
            <div className={`font-mono text-center transition-all ${chromaticAberration ? 'text-pink-400 drop-shadow-[2px_0px_0px_rgba(0,255,255,0.7)]' : 'text-purple-300'}`}>
              <div className="text-xs font-bold mb-1">[ CRT SHADER ACTIVE ]</div>
              <div className="text-[10px] text-slate-400">SFM256 Matrix VCP 0x60</div>
            </div>
          </div>
        </div>

        {/* Panel 3: ASCII Cat Header Generator & Procedural MIDI Engine */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cat className="w-4 h-4" /> Monospace ASCII Cat Generator
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleGenerateCat('happy')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${asciiStyle === 'happy' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
            >
              🌸 Happy
            </button>
            <button
              onClick={() => handleGenerateCat('sleeping')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${asciiStyle === 'sleeping' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
            >
              💤 Sleepy
            </button>
            <button
              onClick={() => handleGenerateCat('wizard')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${asciiStyle === 'wizard' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
            >
              🧙 Wizard
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
            {asciiOutput}
          </pre>

          {/* Procedural MIDI Audio Engine */}
          <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-400" /> Procedural MIDI Engine
              </span>
              <button
                onClick={handleToggleMidiAudio}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1 transition-all ${
                  isPlayingMidi
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                    : 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                }`}
                style={{ boxShadow: '2px 2px 0px #000' }}
              >
                {isPlayingMidi ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingMidi ? 'Stop Synth' : 'Play MIDI'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Tempo BPM</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={tempoBpm}
                  onChange={e => setTempoBpm(parseInt(e.target.value))}
                  className="accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-amber-300">{tempoBpm}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
