import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Music,
  Headphones,
  Sparkles,
  Download,
  Upload,
  FileText,
  Smile,
  Zap,
  Tag,
  Radio,
  Sliders,
  Flame,
  List
} from 'lucide-react';
import {
  MusicTrackMetadata,
  LyricLine,
  MondegreenEntry,
  LyricDisplayTier,
  AudioPlaybackSpeed
} from '../types/musicVault';

interface MusicVaultPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample initial tracks in the vault
const INITIAL_TRACKS: MusicTrackMetadata[] = [
  {
    id: 'TRK-2004-AMID-001',
    title: 'American Idiot',
    artist: 'Green Day',
    album: 'American Idiot',
    trackNumber: 1,
    year: 2004,
    genre: ['Punk Rock', 'Alternative Rock'],
    durationSeconds: 174,
    bpm: 186,
    musicalKey: 'Ab Major',
    audioUrl: '', // Web Audio synthesized synth track fallback if no file
    hasMondegreens: true,
    mondegreenCount: 4,
    playCount: 42,
    energyLevel: 'Hyperfocus High',
    tags: ['#workout', '#rage-focus', '#concept-album'],
    lrcContent: `[00:00.00] (High-octane power chords start) =^.^=
[00:06.00] (Bass and drums drop in)
[00:13.50] Don't wanna be an American idiot
[00:17.20] One nation controlled by the media
[00:21.00] Information age of hysteria
[00:24.60] It's calling out to idiot America
[00:30.00] Welcome to a new kind of tension
[00:33.80] All across the alien nation
[00:37.40] Where everything isn't meant to be okay
[00:44.10] Television dreams of tomorrow
[00:47.80] We're not the ones who're meant to follow
[00:51.50] For that's enough to argue`
  },
  {
    id: 'TRK-1981-JOUR-001',
    title: "Don't Stop Believin'",
    artist: 'Journey',
    album: 'Escape',
    trackNumber: 1,
    year: 1981,
    genre: ['Classic Rock', 'Arena Rock'],
    durationSeconds: 251,
    bpm: 119,
    musicalKey: 'E Major',
    audioUrl: '',
    hasMondegreens: true,
    mondegreenCount: 3,
    playCount: 29,
    energyLevel: 'Steady Cadence',
    tags: ['#classic', '#anthem', '#dopamine'],
    lrcContent: `[00:00.00] (Piano intro groove) ♪♫
[00:17.00] Just a small-town girl
[00:21.50] Livin' in a lonely world
[00:25.80] She took the midnight train goin' anywhere
[00:34.00] Just a city boy
[00:38.20] Born and raised in south Detroit
[00:42.50] He took the midnight train goin' anywhere`
  },
  {
    id: 'TRK-1976-QUEE-001',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    trackNumber: 11,
    year: 1975,
    genre: ['Progressive Rock', 'Opera Rock'],
    durationSeconds: 354,
    bpm: 72,
    musicalKey: 'Bb Major',
    audioUrl: '',
    hasMondegreens: true,
    mondegreenCount: 5,
    playCount: 63,
    energyLevel: 'Sprint Rage',
    tags: ['#epic', '#opera', '#multi-track'],
    lrcContent: `[00:00.00] Is this the real life? Is this just fantasy?
[00:07.50] Caught in a landslide, no escape from reality
[00:15.00] Open your eyes, look up to the skies and see
[00:25.00] I'm just a poor boy, I need no sympathy
[00:30.50] Because I'm easy come, easy go, little high, little low
[00:38.00] Any way the wind blows doesn't really matter to me, to me`
  }
];

const SAMPLE_MONDEGREENS: Record<string, MondegreenEntry[]> = {
  'TRK-2004-AMID-001': [
    {
      id: 'MND-001',
      startTimeSec: 17.2,
      endTimeSec: 21.0,
      canonical: 'One nation controlled by the media',
      mondegreen: 'One nation controlled by the meatier',
      wwsgdHumor: 'One nation controlled by the kitty-uh =^.^=',
      humorScore: 9.4,
      personalMemoryAnchor: 'Heard during late-night pizza coding binge in 2008.'
    },
    {
      id: 'MND-002',
      startTimeSec: 30.0,
      endTimeSec: 33.8,
      canonical: 'Welcome to a new kind of tension',
      mondegreen: 'Welcome to a new kind of pension',
      wwsgdHumor: 'Welcome to a new can of tuna fish',
      humorScore: 8.8,
      personalMemoryAnchor: 'Sounded like punk rock 401k retirement planning.'
    }
  ],
  'TRK-1981-JOUR-001': [
    {
      id: 'MND-003',
      startTimeSec: 38.2,
      endTimeSec: 42.5,
      canonical: 'Born and raised in south Detroit',
      mondegreen: 'Born and raised in South Dakota',
      wwsgdHumor: 'Born and raised in fluffy cat beds',
      humorScore: 9.0,
      personalMemoryAnchor: 'Geographical confusion in high school choir.'
    }
  ],
  'TRK-1976-QUEE-001': [
    {
      id: 'MND-004',
      startTimeSec: 25.0,
      endTimeSec: 30.5,
      canonical: "I'm just a poor boy, I need no sympathy",
      mondegreen: "I'm just a po' boy, with lots of celery",
      wwsgdHumor: "I'm just a fur boy, I demand more treats please",
      humorScore: 9.6,
      personalMemoryAnchor: 'New Orleans sandwich confusion during road trip.'
    }
  ]
};

export const MusicVaultPlayerModal: React.FC<MusicVaultPlayerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tracks, setTracks] = useState<MusicTrackMetadata[]>(INITIAL_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(174);
  const [playbackSpeed, setPlaybackSpeed] = useState<AudioPlaybackSpeed>(1.0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Mondegreen and lyric display mode
  const [lyricTier, setLyricTier] = useState<LyricDisplayTier>('dual');
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

  // A-B Looper
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLoopActive, setIsLoopActive] = useState<boolean>(false);

  // ASCII Spectrum Visualizer state
  const [spectrumBands, setSpectrumBands] = useState<number[]>([3, 5, 8, 6, 4, 7, 3, 2]);

  // Audio Context & Timer refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(performance.now());
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const userScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeTrack = tracks[currentTrackIndex] || tracks[0];

  // Parse LRC into structured lines with mondegreens
  useEffect(() => {
    if (!activeTrack) return;
    setDuration(activeTrack.durationSeconds);
    setCurrentTime(0);
    setActiveLineIndex(-1);

    const lrc = activeTrack.lrcContent || '';
    const lines: LyricLine[] = [];
    const mondegreens = SAMPLE_MONDEGREENS[activeTrack.id] || [];

    const rawLines = lrc.split('\n');
    let idx = 0;

    for (const raw of rawLines) {
      const match = raw.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const frac = parseFloat('0.' + match[3]);
        const timeSec = mins * 60 + secs + frac;
        const text = match[4].trim();

        // Match possible mondegreen
        const matchingMnd = mondegreens.find(
          m => Math.abs(m.startTimeSec - timeSec) < 2.5 || (timeSec >= m.startTimeSec && timeSec <= m.endTimeSec)
        );

        lines.push({
          index: idx,
          startTimeSec: timeSec,
          canonicalText: text,
          mondegreenText: matchingMnd?.mondegreen,
          wwsgdText: matchingMnd?.wwsgdHumor
        });
        idx++;
      }
    }

    // Compute end times
    for (let i = 0; i < lines.length; i++) {
      if (i < lines.length - 1) {
        lines[i].endTimeSec = lines[i + 1].startTimeSec;
      } else {
        lines[i].endTimeSec = activeTrack.durationSeconds;
      }
    }

    setParsedLyrics(lines);
  }, [currentTrackIndex, activeTrack]);

  // Audio Playback simulation / ticker
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastTickTimeRef.current = performance.now();

    const tick = (now: number) => {
      const deltaSec = ((now - lastTickTimeRef.current) / 1000) * playbackSpeed;
      lastTickTimeRef.current = now;

      setCurrentTime(prevTime => {
        let newTime = prevTime + deltaSec;

        // Check A-B Loop
        if (isLoopActive && loopA !== null && loopB !== null && loopB > loopA) {
          if (newTime >= loopB) {
            newTime = loopA;
          }
        }

        if (newTime >= duration) {
          setIsPlaying(false);
          return 0;
        }
        return newTime;
      });

      // Update ASCII visualizer bands pseudo-randomly for aesthetic audio feedback
      setSpectrumBands([
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1,
        Math.floor(Math.random() * 8) + 1
      ]);

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, duration, isLoopActive, loopA, loopB]);

  // Sync active lyric line to current time
  useEffect(() => {
    if (parsedLyrics.length === 0) return;

    let foundIdx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      const line = parsedLyrics[i];
      if (currentTime >= line.startTimeSec && (line.endTimeSec === undefined || currentTime < line.endTimeSec)) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== activeLineIndex && foundIdx !== -1) {
      setActiveLineIndex(foundIdx);

      // Auto-scroll into center if user is not actively scrolling
      if (!userScrollingRef.current && lyricsContainerRef.current) {
        const el = document.getElementById(`lyric-line-${foundIdx}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, parsedLyrics, activeLineIndex]);

  const handleUserScroll = () => {
    userScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      userScrollingRef.current = false;
    }, 4000); // 4-second override pause
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
  };

  const handleMicroSeek = (deltaSec: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(duration, prev + deltaSec)));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSetLoopA = () => {
    setLoopA(currentTime);
  };

  const handleSetLoopB = () => {
    if (loopA !== null && currentTime > loopA) {
      setLoopB(currentTime);
      setIsLoopActive(true);
    }
  };

  const handleClearLoop = () => {
    setLoopA(null);
    setLoopB(null);
    setIsLoopActive(false);
  };

  const exportSidecarMarkdown = () => {
    const sidecarContent = `---
id: "${activeTrack.id}"
title: "${activeTrack.title}"
artist: "${activeTrack.artist}"
album: "${activeTrack.album}"
track_number: ${activeTrack.trackNumber || 1}
year: ${activeTrack.year || 2026}
genre: ${JSON.stringify(activeTrack.genre)}
duration_seconds: ${activeTrack.durationSeconds}
bpm: ${activeTrack.bpm || 120}
musical_key: "${activeTrack.musicalKey || 'C Major'}"
energy_level: "${activeTrack.energyLevel || 'Steady Cadence'}"
play_count: ${activeTrack.playCount + 1}
last_played: "${new Date().toISOString()}"
tags: ${JSON.stringify(activeTrack.tags || [])}
---

# 🎵 ${activeTrack.title} — ${activeTrack.artist}

## 🔗 Master Album & Lore
* Concept Album: [[Album:${activeTrack.album.replace(/\s+/g, '-')}]]
* Energy Profile: ${activeTrack.energyLevel} (${activeTrack.bpm} BPM)

## 📝 Synchronized Lyrics (.lrc)
\`\`\`text
${activeTrack.lrcContent || ''}
\`\`\`
`;

    const blob = new Blob([sidecarContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTrack.title.replace(/[^a-zA-Z0-9]/g, '_')}.music.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4">
      <div
        className="w-full max-w-4xl bg-[#FFFDD0] text-[#18181B] border-2 border-black flex flex-col max-h-[92vh] overflow-hidden"
        style={{
          boxShadow: '4px 4px 0px #000000',
          borderRadius: '0px'
        }}
      >
        {/* Top Header Bar */}
        <div className="bg-[#FFE4E1] border-b-2 border-black px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-mono font-bold bg-[#FFD700] px-2 py-0.5 border border-black text-xs">
              =^.^= AUDIO DECK
            </span>
            <span className="text-xs font-mono font-bold text-gray-800">
              [20260825-1053] Music Vault & Mondegreen Engine
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-400 border border-black bg-white transition-colors cursor-pointer"
            title="Close Music Deck"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Track Info & Playlist (4 cols) */}
          <div className="md:col-span-4 border-r-2 border-black p-3 bg-[#FFFDF5] flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Active Track Banner */}
              <div className="border-2 border-black bg-white p-2 mb-3 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-1 border border-black">
                    {activeTrack.id}
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-1 border border-black">
                    ⚡ {activeTrack.bpm} BPM
                  </span>
                </div>
                <h2 className="text-base font-bold font-mono truncate">{activeTrack.title}</h2>
                <p className="text-xs font-mono text-gray-700 truncate">{activeTrack.artist}</p>
                <p className="text-[11px] font-mono text-gray-500 truncate italic">
                  Album: {activeTrack.album} ({activeTrack.year})
                </p>

                {/* Energy & Key Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[9px] font-mono px-1 bg-amber-100 text-amber-900 border border-black">
                    🔑 {activeTrack.musicalKey}
                  </span>
                  <span className="text-[9px] font-mono px-1 bg-purple-100 text-purple-900 border border-black">
                    🔥 {activeTrack.energyLevel}
                  </span>
                  {activeTrack.tags?.map((t, idx) => (
                    <span key={idx} className="text-[9px] font-mono px-1 bg-gray-100 border border-black">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* ASCII Spectrum Visualizer */}
              <div className="border-2 border-black bg-black text-lime-400 p-2 font-mono text-[10px] mb-3 shadow-[2px_2px_0px_#000]">
                <div className="flex justify-between items-center mb-1 text-[9px] text-gray-400">
                  <span>SPECTRUM PEAK</span>
                  <span>( ^..^)~ ♫</span>
                </div>
                <div className="grid grid-cols-8 gap-0.5 text-center leading-none">
                  {spectrumBands.map((band, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="h-10 flex flex-col justify-end text-[9px]">
                        {'|'.repeat(band)}
                      </div>
                      <span className="text-[8px] text-gray-500 mt-1">
                        {['60', '150', '400', '1k', '2.5k', '6k', '10k', '16k'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Track Vault Selector List */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span>VAULT TRACKS ({tracks.length})</span>
                  <List className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {tracks.map((trk, i) => (
                    <button
                      key={trk.id}
                      onClick={() => {
                        setCurrentTrackIndex(i);
                        setIsPlaying(false);
                      }}
                      className={`w-full text-left px-2 py-1 border text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        i === currentTrackIndex
                          ? 'bg-[#FFD700] border-black font-bold shadow-[1px_1px_0px_#000]'
                          : 'bg-white border-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <span>{i + 1}. {trk.title}</span>
                      </div>
                      <span className="text-[10px] opacity-75 shrink-0">
                        {formatTime(trk.durationSeconds)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidecar Download Button */}
            <div className="pt-2 border-t border-black/20 flex gap-1">
              <button
                onClick={exportSidecarMarkdown}
                className="flex-1 bg-white hover:bg-amber-100 border border-black px-2 py-1 text-[11px] font-mono font-bold flex items-center justify-center space-x-1 shadow-[1px_1px_0px_#000] cursor-pointer"
                title="Export .music.md Zettel Sidecar"
              >
                <Download className="w-3 h-3 text-black" />
                <span>Export .music.md</span>
              </button>
            </div>
          </div>

          {/* Right Column: Synchronized Teleprompter & Mondegreen Controls (8 cols) */}
          <div className="md:col-span-8 p-3 flex flex-col justify-between bg-white overflow-hidden">
            {/* Lyrics Tier Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-1 pb-2 border-b-2 border-black mb-2">
              <div className="flex items-center space-x-1">
                <span className="text-[11px] font-mono font-bold">LYRIC DIAL:</span>
                <button
                  onClick={() => setLyricTier('canonical')}
                  className={`px-2 py-0.5 border text-[10px] font-mono cursor-pointer ${
                    lyricTier === 'canonical'
                      ? 'bg-black text-white border-black font-bold shadow-[1px_1px_0px_#FFD700]'
                      : 'bg-gray-100 border-black hover:bg-gray-200'
                  }`}
                >
                  🎧 Canonical
                </button>
                <button
                  onClick={() => setLyricTier('mondegreen')}
                  className={`px-2 py-0.5 border text-[10px] font-mono cursor-pointer ${
                    lyricTier === 'mondegreen'
                      ? 'bg-[#FFD700] text-black border-black font-bold shadow-[1px_1px_0px_#000]'
                      : 'bg-gray-100 border-black hover:bg-gray-200'
                  }`}
                >
                  👂 Mondegreen
                </button>
                <button
                  onClick={() => setLyricTier('wwsgd')}
                  className={`px-2 py-0.5 border text-[10px] font-mono cursor-pointer ${
                    lyricTier === 'wwsgd'
                      ? 'bg-[#FFE4E1] text-pink-900 border-black font-bold shadow-[1px_1px_0px_#000]'
                      : 'bg-gray-100 border-black hover:bg-gray-200'
                  }`}
                >
                  🐱 WWSGD (Silly Goose)
                </button>
                <button
                  onClick={() => setLyricTier('dual')}
                  className={`px-2 py-0.5 border text-[10px] font-mono cursor-pointer ${
                    lyricTier === 'dual'
                      ? 'bg-[#B8E2F2] text-blue-900 border-black font-bold shadow-[1px_1px_0px_#000]'
                      : 'bg-gray-100 border-black hover:bg-gray-200'
                  }`}
                >
                  ⚡ Dual-Split
                </button>
              </div>

              {/* Speed Gears (AuDHD pacing) */}
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-mono font-bold">TEMPO:</span>
                {([0.75, 1.0, 1.15, 1.25] as AudioPlaybackSpeed[]).map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-1.5 py-0.5 border text-[9px] font-mono cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white border-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Synchronized Teleprompter Window */}
            <div
              ref={lyricsContainerRef}
              onScroll={handleUserScroll}
              className="flex-1 overflow-y-auto border-2 border-black bg-[#FAF9F6] p-3 space-y-2 max-h-[360px] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] select-text"
            >
              {parsedLyrics.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 font-mono text-xs">
                  (=^.^=) No timecoded .lrc lyrics mounted for this track
                </div>
              ) : (
                parsedLyrics.map((line, idx) => {
                  const isActive = idx === activeLineIndex;
                  return (
                    <div
                      key={line.index}
                      id={`lyric-line-${idx}`}
                      onClick={() => setCurrentTime(line.startTimeSec)}
                      className={`p-1.5 transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#FFF275] border-black text-black font-bold shadow-[2px_2px_0px_#000] scale-[1.01]'
                          : 'bg-white/60 border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 mb-0.5">
                        <span>[{formatTime(line.startTimeSec)}]</span>
                        {line.mondegreenText && (
                          <span className="text-amber-700 bg-amber-100 px-1 border border-amber-300">
                            👂 Misheard Annotation
                          </span>
                        )}
                      </div>

                      {/* Line content based on chosen tier */}
                      {lyricTier === 'canonical' && (
                        <p className="text-sm font-mono">{line.canonicalText}</p>
                      )}

                      {lyricTier === 'mondegreen' && (
                        <p className="text-sm font-mono text-amber-900">
                          {line.mondegreenText || line.canonicalText}
                        </p>
                      )}

                      {lyricTier === 'wwsgd' && (
                        <p className="text-sm font-mono text-pink-900">
                          {line.wwsgdText || line.canonicalText}
                        </p>
                      )}

                      {lyricTier === 'dual' && (
                        <div>
                          <p className="text-sm font-mono">{line.canonicalText}</p>
                          {line.mondegreenText && (
                            <p className="text-xs font-mono text-amber-800 bg-amber-50 px-1 mt-0.5 border-l-2 border-amber-500">
                              👉 Heard: "{line.mondegreenText}"
                            </p>
                          )}
                          {line.wwsgdText && (
                            <p className="text-[11px] font-mono text-pink-800 bg-pink-50 px-1 mt-0.5 border-l-2 border-pink-400">
                              🐱 WWSGD: "{line.wwsgdText}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Playback & Deck Controls */}
            <div className="mt-3 pt-2 border-t-2 border-black space-y-2">
              {/* Scrub Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>{formatTime(currentTime)}</span>
                  {isLoopActive && loopA !== null && loopB !== null && (
                    <span className="bg-amber-200 px-1 border border-black font-bold">
                      LOOP A [{formatTime(loopA)}] ⇄ B [{formatTime(loopB)}]
                    </span>
                  )}
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-black cursor-pointer h-2 bg-gray-200 border border-black"
                />
              </div>

              {/* Control Buttons Cluster */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Transport Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleMicroSeek(-2.0)}
                    className="p-1 border border-black bg-white hover:bg-gray-100 text-[10px] font-mono shadow-[1px_1px_0px_#000] cursor-pointer"
                    title="Micro Seek Back (-2s)"
                  >
                    -2s
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTrackIndex(prev => (prev > 0 ? prev - 1 : tracks.length - 1));
                      setIsPlaying(false);
                    }}
                    className="p-1.5 border border-black bg-white hover:bg-gray-100 shadow-[1px_1px_0px_#000] cursor-pointer"
                    title="Previous Track"
                  >
                    <SkipBack className="w-4 h-4 text-black" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="px-3 py-1.5 border-2 border-black bg-[#FFD700] hover:bg-amber-400 font-mono font-bold text-xs flex items-center space-x-1 shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 text-black fill-black" />
                        <span>PAUSE</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-black fill-black" />
                        <span>PLAY</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTrackIndex(prev => (prev < tracks.length - 1 ? prev + 1 : 0));
                      setIsPlaying(false);
                    }}
                    className="p-1.5 border border-black bg-white hover:bg-gray-100 shadow-[1px_1px_0px_#000] cursor-pointer"
                    title="Next Track"
                  >
                    <SkipForward className="w-4 h-4 text-black" />
                  </button>

                  <button
                    onClick={() => handleMicroSeek(2.0)}
                    className="p-1 border border-black bg-white hover:bg-gray-100 text-[10px] font-mono shadow-[1px_1px_0px_#000] cursor-pointer"
                    title="Micro Seek Forward (+2s)"
                  >
                    +2s
                  </button>
                </div>

                {/* A-B Loop Controls */}
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-mono font-bold">A-B LOOP:</span>
                  <button
                    onClick={handleSetLoopA}
                    className={`px-1.5 py-0.5 border text-[9px] font-mono cursor-pointer ${
                      loopA !== null
                        ? 'bg-amber-300 border-black font-bold'
                        : 'bg-white border-black hover:bg-gray-100'
                    }`}
                  >
                    Set A {loopA !== null ? `(${formatTime(loopA)})` : ''}
                  </button>
                  <button
                    onClick={handleSetLoopB}
                    className={`px-1.5 py-0.5 border text-[9px] font-mono cursor-pointer ${
                      loopB !== null
                        ? 'bg-amber-300 border-black font-bold'
                        : 'bg-white border-black hover:bg-gray-100'
                    }`}
                  >
                    Set B {loopB !== null ? `(${formatTime(loopB)})` : ''}
                  </button>
                  {(loopA !== null || loopB !== null) && (
                    <button
                      onClick={handleClearLoop}
                      className="px-1 py-0.5 border border-black bg-red-100 text-red-900 text-[9px] font-mono hover:bg-red-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Telemetry */}
        <div className="bg-[#FEFCE8] border-t-2 border-black px-3 py-1 flex items-center justify-between text-[10px] font-mono">
          <span className="text-gray-600">
            Vault: <span className="font-bold text-black">/vault/music/</span> • Shizuku Keep-Alive: <span className="text-emerald-700 font-bold">READY</span>
          </span>
          <span className="text-gray-500">
            Zero-Telemetry Audio Core (=^.^=)
          </span>
        </div>
      </div>
    </div>
  );
};
