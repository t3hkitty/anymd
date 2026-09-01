/**
 * Zettelkasten ID: 20260826-1846
 * Project: @lorik/meow-core
 * Version: v2.0.0
 * Role: Local storage key persistence for clock presets, blinding toggles, and temperature settings [cite: 324]
 */

import { useStickySetting } from './meowState';

export function useClockMode() {
  const [isBlinding, setIsBlinding] = useStickySetting<boolean>('meow_clock_blinding_mode', true);
  const [customChips, setCustomChips] = useStickySetting<string[]>('meow_clock_custom_chips_list', []);
  const [lastTemperature, setLastTemperature] = useStickySetting<string>('meow_clock_last_logged_temp', '40');
  const [preferredUnit, setPreferredUnit] = useStickySetting<'F' | 'C'>('meow_clock_preferred_temp_unit', 'F');

  return {
    isBlinding,
    setIsBlinding,
    customChips,
    setCustomChips,
    lastTemperature,
    setLastTemperature,
    preferredUnit,
    setPreferredUnit
  };
}
