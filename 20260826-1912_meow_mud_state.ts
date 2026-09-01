/**
 * Zettelkasten ID: 20260826-1912
 * Project: @lorik/meow-mud
 * Role: Local Storage persistence and state sync for canvas layers and MIDI tempos [cite: 324]
 */

import { useStickySetting } from '../state/meowState';
import { AnsiLayer } from '../components/AnsiArtGenerator';

export function useMeowMudState() {
  const [layers, setLayers] = useStickySetting<AnsiLayer[]>('meow_mud_canvas_layers', []);
  const [activeLayerId, setActiveLayerId] = useStickySetting<string>('meow_mud_active_layer_id', '');
  const [bpm, setBpm] = useStickySetting<number>('meow_mud_midi_bpm', 125);
  const [synthVolume, setSynthVolume] = useStickySetting<number>('meow_mud_synth_volume', 50);

  return {
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    bpm,
    setBpm,
    synthVolume,
    setSynthVolume
  };
}
