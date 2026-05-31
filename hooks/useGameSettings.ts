import { useLocalStorage } from './useLocalStorage';

export function useGameSettings() {
  const [isAudioMuted, setIsAudioMuted] = useLocalStorage('muted', false);
  const [volume, setVolume] = useLocalStorage('volume', 0.5);
  const [timerEnabled, setTimerEnabled] = useLocalStorage(
    'timerEnabled',
    false,
  );
  const [isArrowKeysEnabled, setIsArrowKeysEnabled] = useLocalStorage(
    'arrowKeysEnabled',
    false,
  );
  const [pointSystem, setPointSystem] = useLocalStorage<
    'treasureChest' | 'number'
  >('pointSystem', 'number');
  const [bestOfSeries, setBestOfSeries] = useLocalStorage<
    'off' | 'bo3' | 'bo5'
  >('bestOfSeries', 'off');
  const [victoriesForAction, setVictoriesForAction] = useLocalStorage(
    'victoriesForAction',
    5,
  );
  const [timerDuration, setTimerDuration] = useLocalStorage(
    'timerDuration',
    10,
  );

  return {
    isAudioMuted,
    setIsAudioMuted,
    volume,
    setVolume,
    timerEnabled,
    setTimerEnabled,
    isArrowKeysEnabled,
    setIsArrowKeysEnabled,
    pointSystem,
    setPointSystem,
    bestOfSeries,
    setBestOfSeries,
    victoriesForAction,
    setVictoriesForAction,
  };
}
