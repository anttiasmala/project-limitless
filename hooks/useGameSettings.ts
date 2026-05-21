import { Difficulty } from '@/lib/gameLogic';
import { useLocalStorage } from './useLocalStorage';

export type WatchSpeed = 'slow' | 'normal' | 'fast';

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

  // Watch mode (computer vs computer) settings — persisted, reused fresh each move
  const [watchSpeed, setWatchSpeed] = useLocalStorage<WatchSpeed>(
    'watchSpeed',
    'normal',
  );
  const [watchDifficultyOne, setWatchDifficultyOne] = useLocalStorage<Difficulty>(
    'watchDifficultyOne',
    'medium',
  );
  const [watchDifficultyTwo, setWatchDifficultyTwo] = useLocalStorage<Difficulty>(
    'watchDifficultyTwo',
    'medium',
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
    watchSpeed,
    setWatchSpeed,
    watchDifficultyOne,
    setWatchDifficultyOne,
    watchDifficultyTwo,
    setWatchDifficultyTwo,
  };
}
