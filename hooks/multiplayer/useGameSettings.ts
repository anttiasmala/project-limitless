// hooks/multiplayer/useGameSettings.ts

import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useGameSettings() {
  const [isAudioMuted, setIsAudioMuted] = useLocalStorage('muted', false);
  const [volume, setVolume] = useLocalStorage('volume', 0.5);
  const [isArrowKeysEnabled, setIsArrowKeysEnabled] = useLocalStorage(
    'arrowKeysEnabled',
    false,
  );
  const [pointSystem, setPointSystem] = useLocalStorage<
    'treasureChest' | 'number'
  >('pointSystem', 'number');

  return {
    isAudioMuted,
    setIsAudioMuted,
    volume,
    setVolume,
    isArrowKeysEnabled,
    setIsArrowKeysEnabled,
    pointSystem,
    setPointSystem,
  };
}
