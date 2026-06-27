import { INITIAL_WIN_LOSS_DRAW, WinLossDrawStats } from '@/utils/tictactoe/types';
import { useLocalStorage } from './useLocalStorage';

export function useGameSettings() {
  const [isAudioMuted, setIsAudioMuted] = useLocalStorage('muted', false);
  const [volume, setVolume] = useLocalStorage('volume', 0.5);
  const [timerEnabled, setTimerEnabled] = useLocalStorage(
    'timerEnabled',
    false,
  );
  const [speedBonusEnabled, setSpeedBonusEnabled] = useLocalStorage(
    'speedBonusEnabled',
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
  const [winLossDraw, setWinLossDraw] = useLocalStorage<WinLossDrawStats>(
    'winLossDraw',
    INITIAL_WIN_LOSS_DRAW,
  );

  return {
    isAudioMuted,
    setIsAudioMuted,
    volume,
    setVolume,
    timerEnabled,
    setTimerEnabled,
    speedBonusEnabled,
    setSpeedBonusEnabled,
    isArrowKeysEnabled,
    setIsArrowKeysEnabled,
    pointSystem,
    setPointSystem,
    bestOfSeries,
    setBestOfSeries,
    victoriesForAction,
    setVictoriesForAction,
    timerDuration,
    setTimerDuration,
    winLossDraw,
    setWinLossDraw,
  };
}
