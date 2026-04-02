// hooks/multiplayer/useGameSettings.ts

import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useGameSettings() {
  const [isAudioMuted, setIsAudioMuted] = useLocalStorage('muted', false);
  const [volume, setVolume] = useLocalStorage('volume', 0.5);
  const [isArrowKeysEnabled, setIsArrowKeysEnabled] = useLocalStorage(
    'arrowKeysEnabled',
    false,
  );

  return {
    isAudioMuted,
    setIsAudioMuted,
    volume,
    setVolume,
    isArrowKeysEnabled,
    setIsArrowKeysEnabled,
  };
}
