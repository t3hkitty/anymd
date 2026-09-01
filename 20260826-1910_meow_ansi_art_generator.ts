/**
 * Zettelkasten ID: 20260826-1910
 * Project: @lorik/meow-mud
 * Role: ASCII Art Layering Engine & MIDI Synthesizer Sequence Compiler
 */

export interface AnsiLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  // A grid of characters mapping to 80x25 terminal layout
  grid: string[][];
  colorGrid: string[][]; // Holds Tailwind or ANSI color classes (e.g., 'text-rose-400')
}

export interface MidiNote {
  note: number; // MIDI Pitch (e.g., 60 for Middle C)
  duration: number; // millisecond duration
  velocity: number; // 0-127 velocity
  instrument: number; // General MIDI instrument patch (e.g., 80 for Square Wave, 81 for Sawtooth)
}

export class AnsiArtGenerator {
  private width: number = 80;
  private height: number = 25;

  constructor() {}

  /**
   * Compiles multiple visible layers into a single flattened ANSI/HTML output stream
   */
  public flattenLayers(layers: AnsiLayer[]): { characters: string[][]; colors: string[][] } {
    const finalGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(' '));
    const finalColors = Array(this.height).fill(null).map(() => Array(this.width).fill('text-slate-900'));

    // Flatten bottom-up (first layer in array is bottom background, last layer is foreground overlay)
    for (const layer of layers) {
      if (!layer.visible) continue;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const char = layer.grid[y]?.[x] || ' ';
          // Transparent blank spots do not overwrite lower layers
          if (char !== ' ' && char !== '') {
            finalGrid[y][x] = char;
            finalColors[y][x] = layer.colorGrid[y]?.[x] || 'text-slate-900';
          }
        }
      }
    }

    return { characters: finalGrid, colors: finalColors };
  }

  /**
   * Procedurally generates a 90s-style retro MIDI melody track based on active text density
   * Mapping character complexity to note values for that absolute MUD Engine chiptune vibe!
   */
  public generateProceduralMidi(layers: AnsiLayer[], bpm: number = 120): MidiNote[] {
    const melody: MidiNote[] = [];
    const ticksPerBeat = 4; // 16th notes
    const tickDuration = (60000 / bpm) / ticksPerBeat;

    // Scan the flattened canvas column-by-column (acting as musical timeline beats)
    const { characters } = this.flattenLayers(layers);

    for (let x = 0; x < this.width; x += 2) { // Step through timeline columns
      let columnAsciiSum = 0;
      let activeCharacters = 0;

      for (let y = 0; y < this.height; y++) {
        const char = characters[y][x];
        if (char !== ' ') {
          columnAsciiSum += char.charCodeAt(0);
          activeCharacters++;
        }
      }

      if (activeCharacters > 0) {
        // Procedurally derive note pitch matching 90s FM-Synth values
        const averageAscii = columnAsciiSum / activeCharacters;
        const scale = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72]; // Pentatonic/Diatonic Major scale pitches
        const pitchIndex = Math.floor(averageAscii) % scale.length;
        const pitch = scale[pitchIndex];

        // Velocity scales with column character density
        const velocity = Math.min(127, 40 + (activeCharacters * 8));

        melody.push({
          note: pitch,
          duration: tickDuration * (1 + (columnAsciiSum % 3)), // Dynamic staccato/legato notes
          velocity,
          instrument: 81 // Lead 2 (Sawtooth Wave) for chiptune feedback
        });
      } else {
        // Rest Note representation
        melody.push({
          note: 0,
          duration: tickDuration,
          velocity: 0,
          instrument: 0
        });
      }
    }

    return melody;
  }

  /**
   * Compiles MIDI pitches and timings into a base64 encoded standard MIDI File (SMF) Type 0
   */
  public exportStandardMidi(notes: MidiNote[]): string {
    // Basic MIDI Header Chunk [cite: 415]
    const header = [
      0x4d, 0x54, 0x68, 0x64, // "MThd" Magic Number
      0x00, 0x00, 0x00, 0x06, // Header length (6 bytes)
      0x00, 0x00,             // SMF Format Type 0 (Single track)
      0x00, 0x01,             // One track chunk
      0x00, 0x60              // 96 Ticks per quarter note
    ];

    const trackEvents: number[] = [];
    let cumulativeDelta = 0;

    for (const item of notes) {
      if (item.note === 0) {
        cumulativeDelta += 96; // Rest note delay increment
        continue;
      }

      // Delta Time (Variable Quantity)
      trackEvents.push(0x00); 
      // Note On event: Channel 0, Pitch, Velocity
      trackEvents.push(0x90, item.note, item.velocity);

      // Duration gap representation
      trackEvents.push(0x60); 
      // Note Off event: Channel 0, Pitch, Velocity 0
      trackEvents.push(0x80, item.note, 0x00);
    }

    // End of Track Meta event
    trackEvents.push(0x00, 0xFF, 0x2F, 0x00);

    const trackLength = trackEvents.length;
    const trackHeader = [
      0x4d, 0x54, 0x72, 0x6b, // "MTrk" track identifier
      (trackLength >> 24) & 0xFF,
      (trackLength >> 16) & 0xFF,
      (trackLength >> 8) & 0xFF,
      trackLength & 0xFF
    ];

    const completeBytes = new Uint8Array([...header, ...trackHeader, ...trackEvents]);
    
    // Polyfill binary-to-base64 compilation block for portable transfers
    let binaryString = '';
    for (let i = 0; i < completeBytes.byteLength; i++) {
      binaryString += String.fromCharCode(completeBytes[i]);
    }
    return btoa(binaryString);
  }
}
