/**
 * Spatial-Chained Routine Registry, "No Bad Days" Script & TTS Director Plugin
 * Dual-channel (TTS audio + visual cards) execution for spatial routines.
 */

export interface RoutineStep {
  id: string;
  title: string;
  description: string;
  spatialZone: string;
  durationSeconds: number;
  ttsCue: string;
  icon: string;
  completed: boolean;
  notes?: string;
}

export interface SpatialRoutine {
  id: string;
  name: string;
  icon: string;
  badge: string;
  targetTime: string;
  color: string;
  steps: RoutineStep[];
}

export const DEFAULT_SPATIAL_ROUTINES: SpatialRoutine[] = [
  {
    id: 'routine-leaving-house',
    name: 'Leaving the House Protocol',
    icon: '🚪',
    badge: 'Spatial Anchor: Front Doorway',
    targetTime: 'Prior to Departure',
    color: '#3b82f6',
    steps: [
      {
        id: 'lh-1',
        title: 'Tactile Pocket Tap (Keys, Wallet, Badge)',
        description: 'Physical touch check: Left pocket phone, right pocket keys & badge, back pocket wallet.',
        spatialZone: 'Entryway Console / Valet Tray',
        durationSeconds: 30,
        ttsCue: 'Commencing exit sequence. Tap your pockets for keys, wallet, and transit badge.',
        icon: '🔑',
        completed: false
      },
      {
        id: 'lh-2',
        title: 'Thermal & Appliance Sweep (Stove, Oven, Irons)',
        description: 'Visual check of kitchen burners, curling iron, and heaters.',
        spatialZone: 'Kitchen & Bathroom',
        durationSeconds: 45,
        ttsCue: 'Visual appliance check. Stoves off, irons unplugged, space heaters dark.',
        icon: '🍳',
        completed: false
      },
      {
        id: 'lh-3',
        title: 'Feline & Pet Comfort Check',
        description: 'Ensure water fountains are flowing, fresh crunchies topped off, and chin scritch given.',
        spatialZone: 'Pet Feeding Station',
        durationSeconds: 60,
        ttsCue: 'Pet welfare check. Water fountain flowing, treats safe, and farewell petting protocol fulfilled.',
        icon: '🐾',
        completed: false
      },
      {
        id: 'lh-4',
        title: 'Perimeter Windows & Sovereign Door Lock',
        description: 'Latch ground floor windows and engage sovereign deadbolt.',
        spatialZone: 'Main Threshold',
        durationSeconds: 30,
        ttsCue: 'Locking deadbolt. Perimeter secured. You are clear for takeoff.',
        icon: '🔒',
        completed: false
      }
    ]
  },
  {
    id: 'routine-morning-wake-prep',
    name: 'Morning Wake & Light Alignment',
    icon: '☀️',
    badge: 'Circadian Reset',
    targetTime: '07:30 AM',
    color: '#f59e0b',
    steps: [
      {
        id: 'mw-1',
        title: 'Photobiological Light Exposure & Curtains Open',
        description: 'Flood retina with natural daylight or 10,000 lux lamp for dopamine baseline.',
        spatialZone: 'Bedroom Window',
        durationSeconds: 120,
        ttsCue: 'Good morning. Open curtains or trigger sunrise lamp to establish circadian dopamine rhythm.',
        icon: '🌅',
        completed: false
      },
      {
        id: 'mw-2',
        title: '500ml Electrolyte & Hydration Ingestion',
        description: 'Drink a full glass of water with a pinch of mineral salt or lemon.',
        spatialZone: 'Nightstand / Kitchen',
        durationSeconds: 45,
        ttsCue: 'Drink 500 milliliters of cold water to rehydrate neural pathways.',
        icon: '💧',
        completed: false
      },
      {
        id: 'mw-3',
        title: 'Micro Stretch & Posture Unfurl',
        description: 'Gentle spinal twists, neck releases, and shoulder rolls.',
        spatialZone: 'Floor Mat',
        durationSeconds: 180,
        ttsCue: 'Three deep breaths. Unfurl your spine and roll shoulders back.',
        icon: '🧘',
        completed: false
      }
    ]
  },
  {
    id: 'routine-morning-sustenance',
    name: 'Morning Sustenance (Low-Demand Nutrition)',
    icon: '🌙🍌',
    badge: 'Metabolic Support',
    targetTime: '08:15 AM',
    color: '#10b981',
    steps: [
      {
        id: 'ms-1',
        title: 'Frictionless Banana & Rapid Fuel',
        description: 'Peel and consume a fresh banana or simple nut butter snack for rapid glucose stability.',
        spatialZone: 'Kitchen Counter',
        durationSeconds: 120,
        ttsCue: 'Zero friction nutrition: Grab a banana or rapid protein fuel to stabilize blood sugar.',
        icon: '🍌',
        completed: false
      },
      {
        id: 'ms-2',
        title: 'Warm Herbal or Matcha Infusion',
        description: 'Prepare warm tea or l-theanine brew for calm focus without jitter.',
        spatialZone: 'Tea Kettle Corner',
        durationSeconds: 240,
        ttsCue: 'Steeping tea. Savor the warm steam while focus settles.',
        icon: '🍵',
        completed: false
      }
    ]
  },
  {
    id: 'routine-bedtime-closure',
    name: 'Bedtime Closure & Reset',
    icon: '🌙🛏️',
    badge: 'Nightly Closure',
    targetTime: '10:30 PM',
    color: '#8b5cf6',
    steps: [
      {
        id: 'bc-1',
        title: 'Screen Spectrum Shift & Dim Lighting',
        description: 'Switch all monitors and bulbs to warm amber or 1800K glow.',
        spatialZone: 'Living Space',
        durationSeconds: 60,
        ttsCue: 'Commencing evening closure. Dimming lumens to amber warm spectrum.',
        icon: '🕯️',
        completed: false
      },
      {
        id: 'bc-2',
        title: 'Tomorrow Anchor Note & Clean Slate',
        description: 'Write down the single #1 priority task for tomorrow morning so the brain can let go.',
        spatialZone: 'Desk Companion Pad',
        durationSeconds: 120,
        ttsCue: 'Deposit your top tomorrow task into the ledger. Release mental loops.',
        icon: '📝',
        completed: false
      },
      {
        id: 'bc-3',
        title: 'Audio Soundscape & Pillow Unwind',
        description: 'Trigger rain sounds or white noise ambient track and settle in.',
        spatialZone: 'Bedside Sanctuary',
        durationSeconds: 300,
        ttsCue: 'Soundscape engaged. Rest well, sovereign operator. You did enough today.',
        icon: '🛏️',
        completed: false
      }
    ]
  }
];

export const ROUTINE_STORAGE_KEY = 'lc_md_spatial_routines_v1';

export function loadSpatialRoutines(): SpatialRoutine[] {
  try {
    const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load spatial routines:', err);
  }
  return DEFAULT_SPATIAL_ROUTINES;
}

export function saveSpatialRoutines(routines: SpatialRoutine[]): void {
  try {
    localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routines));
  } catch (err) {
    console.error('Failed to save spatial routines:', err);
  }
}

/**
 * "No Bad Days" Markdown Micro-Actions Generator (Goblin Tools style)
 * Deconstructs overwhelming tasks into shame-free, 2-minute actionable steps.
 */
export function generateNoBadDaysMarkdown(rawTasks: string[]): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const items = rawTasks.filter(t => t.trim().length > 0);

  let md = `# 🛡️ "No Bad Days" Clean-Slate Micro-Action Protocol\n\n`;
  md += `> [!abstract] Date: \`${dateStr}\` &bull; **Philosophy:** Zero shame, zero guilt. Every unfinished task is simply an atomic step waiting to be gently decomposed.\n\n`;
  md += `## 🌟 Goblin-Tools Style Decomposed Micro-Actions\n\n`;

  if (items.length === 0) {
    items.push('Sort mail and clear desk surface', 'Review tomorrow appointment schedule', 'Drink a glass of water and rest');
  }

  items.forEach((task, idx) => {
    md += `### ${idx + 1}. Task: **${task}**\n`;
    md += `- [ ] **Step A (15 sec):** Stand near the location where *"${task}"* lives.\n`;
    md += `- [ ] **Step B (1 min):** Touch the primary tool/item required (open the app, pick up the pen, or touch the folder).\n`;
    md += `- [ ] **Step C (2 min):** Perform the first microscopic increment (e.g. read 1 line, type 1 sentence, or file 1 piece).\n`;
    md += `- [ ] **Step D (Zero-Tax Exit):** Stop immediately if energy is depleted, or continue if momentum takes over.\n\n`;
  });

  md += `---\n*Generated by Sovereign Routine Director & Goblin Engine.*\n`;
  return md;
}

/**
 * Podcast-Style TTS Director Audio Cadence
 */
export class TtsDirectorAudio {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  public static speakCue(text: string, onEnd?: () => void, rate: number = 0.95, pitch: number = 1.0): void {
    if (!this.synth) {
      console.warn('Speech synthesis not available.');
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    // Play gentle chime tone using Web Audio API
    this.playPodcastChime();

    setTimeout(() => {
      if (!this.synth) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate; // calm broadcast cadence
      utterance.pitch = pitch;
      
      // Attempt to find pleasant calm voices
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Daniel') || v.name.includes('Samantha')) && v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    }, 400);
  }

  public static stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private static playPodcastChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // ignore audio context failures
    }
  }
}
