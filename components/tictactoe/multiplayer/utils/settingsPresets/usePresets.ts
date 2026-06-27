'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { RoomSettings } from '@/utils/tictactoe/multiplayer/multiplayerTypes';
import { nanoid } from 'nanoid';
import { PresetType } from './presetTypes';

// Suggests a unique "<base>_<n>" name so new presets don't all default to the
// same "Preset". n starts at the current count + 1 and skips names already in
// use (e.g. after deleting one from the middle of the list).
export function nextPresetName(presets: PresetType[], base = 'Preset') {
  const used = new Set(presets.map((preset) => preset.name));
  let n = presets.length + 1;
  while (used.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}

// Centralizes the preset CRUD so components just call add/update/remove and the
// localStorage persistence detail stays in one place. Presets are keyed by a
// stable id rather than array position, so reordering can't break edit/delete.
export function usePresets() {
  const [presets, setPresets] = useLocalStorage<PresetType[]>('presets', []);

  function addPreset(name: string, settings: RoomSettings) {
    setPresets((prev) => [...prev, { id: nanoid(8), name, settings }]);
  }

  function updatePreset(id: string, name: string, settings: RoomSettings) {
    setPresets((prev) =>
      prev.map((preset) =>
        preset.id === id ? { ...preset, name, settings } : preset,
      ),
    );
  }

  function removePreset(id: string) {
    setPresets((prev) => prev.filter((preset) => preset.id !== id));
  }

  return { presets, addPreset, updatePreset, removePreset };
}
