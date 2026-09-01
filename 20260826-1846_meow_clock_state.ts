/**
 * Zettelkasten ID: 20260826-1846
 * Project: @lorik/meow-core
 * Role: Local storage key persistence for clock presets and blinding toggles [cite: 324]
 */

import { useStickySetting } from './meowState';

export function useClockMode() {
  const [isBlinding, setIsBlinding] = useStickySetting<boolean>('meow_clock_blinding_mode', true);
  const [customChips, setCustomChips] = useStickySetting<string[]>('meow_clock_custom_chips_list', []);

  return {
    isBlinding,
    setIsBlinding,
    customChips,
    setCustomChips
  };
}
