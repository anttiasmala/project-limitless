// components/SettingsModal.tsx

import { useKeyPress } from '@/hooks/useKeyPress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { Player } from '@/lib/gameLogic';
import { BaseSettingsProps, GameMode, WinLossDrawStats } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GamePanel } from './settings/GamePanel';
import { PlayersPanel } from './settings/PlayersPanel';
import { StatsPanel } from './settings/StatsPanel';
import Button from './utils/Button';

type SettingsModalProps = BaseSettingsProps & {
  // Single-player only — omit these in multiplayer
  timerEnabled?: boolean;
  setTimerEnabled?: (value: boolean) => void;
  pointSystem?: 'treasureChest' | 'number';
  setPointSystem?: (value: 'treasureChest' | 'number') => void;
  bestOfSeries?: 'off' | 'bo3' | 'bo5';
  setBestOfSeries?: (value: 'off' | 'bo3' | 'bo5') => void;
  setScores?: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  setBestOfSeriesScores?: React.Dispatch<
    React.SetStateAction<Record<Player, number>>
  >;
  resetGame?: () => void;
  victoriesForAction?: number;
  setVictoriesForAction?: (value: number) => void;
  timerDuration?: number;
  setTimerDuration?: (value: number) => void;
  showPlayerSettings?: boolean;
  mode?: GameMode;
  winLossDraw?: WinLossDrawStats;
  onResetStats?: () => void;
};

export function SettingsModal({
  showSettingsModal,
  setShowSettingsModal,
  isAudioMuted,
  setIsAudioMuted,
  volume,
  setVolume,
  AudioArray,
  isArrowKeysEnabled,
  setIsArrowKeysEnabled,
  timerEnabled,
  setTimerEnabled,
  pointSystem,
  setPointSystem,
  bestOfSeries,
  setBestOfSeries,
  setScores,
  setBestOfSeriesScores,
  resetGame,
  victoriesForAction,
  setVictoriesForAction,
  timerDuration,
  setTimerDuration,
  showPlayerSettings,
  mode,
  winLossDraw,
  onResetStats,
}: SettingsModalProps) {
  const handleClose = useCallback(
    () => setShowSettingsModal(false),
    [setShowSettingsModal],
  );
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('isDarkTheme', true);
  const [playerOne, setPlayerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwo, setPlayerTwo] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });
  const [settingMenu, setSettingMenu] = useState<
    'settings' | 'game' | 'players' | 'stats'
  >('settings');

  const showGameSettings = Boolean(setTimerEnabled || setBestOfSeries);

  const tabClass = (isActive: boolean) =>
    `py-2 px-3 text-sm border-2 ${
      isActive
        ? 'bg-amber-600 border-amber-500 text-white'
        : 'bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300 hover:border-amber-500 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300/60 dark:hover:text-yellow-300 dark:hover:bg-red-800'
    }`;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  useKeyPress('Escape', handleClose, showSettingsModal);
  usePreventBackgroundScrolling(showSettingsModal);

  const applyVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    const muted = clamped <= 0;
    setIsAudioMuted(muted);
    AudioArray.forEach((ref) => {
      if (ref.current) {
        ref.current.volume = clamped;
        ref.current.muted = muted;
      }
    });
  };

  if (!showSettingsModal) return null;

  return createPortal(
    <div>
      <div
        className="fixed top-0 left-0 z-98 h-full w-full bg-black opacity-80"
        onClick={() => setShowSettingsModal(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game settings"
        className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2 flex flex-col max-h-[90dvh]"
      >
        <Button
          variant="unstyled"
          className="py-2 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 hover:bg-slate-100 hover:border-amber-500 dark:hover:bg-red-800 dark:hover:border-yellow-500 tracking-wide w-full mb-2 shrink-0"
          onClick={() => setShowSettingsModal(false)}
        >
          ⚓ Close Window ☠️
        </Button>

        {showPlayerSettings ? (
          <div className="grid grid-cols-2 mb-2 gap-1 shrink-0">
            <Button
              variant="unstyled"
              onClick={() => setSettingMenu('settings')}
              className={tabClass(settingMenu === 'settings')}
            >
              ⚙️ Settings
            </Button>
            {showGameSettings && (
              <Button
                variant="unstyled"
                onClick={() => setSettingMenu('game')}
                className={tabClass(settingMenu === 'game')}
              >
                🎮 Game
              </Button>
            )}
            <Button
              variant="unstyled"
              onClick={() => setSettingMenu('players')}
              className={tabClass(settingMenu === 'players')}
            >
              🏴‍☠️ Players
            </Button>
            {winLossDraw && (
              <Button
                variant="unstyled"
                onClick={() => setSettingMenu('stats')}
                className={tabClass(settingMenu === 'stats')}
              >
                📊 Stats
              </Button>
            )}
          </div>
        ) : null}

        <div className="overflow-y-auto">
          {settingMenu === 'settings' ? (
            <div className="w-72 max-w-[90vw] h-auto min-h-48 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg">
              <div className="mt-3 ml-3 flex flex-col gap-3">
                {/* Treasure chest or number logic -- single-player only*/}
                {setPointSystem && (
                  <div className="flex">
                    <label className="cursor-pointer select-none">
                      Point system
                      <select
                        className="ml-1 border-2 border-slate-300 rounded-md text-slate-800 bg-white dark:border-red-700 dark:text-yellow-300 dark:bg-red-950"
                        name="pointSystem"
                        onChange={(e) =>
                          setPointSystem(
                            e.target.value as 'treasureChest' | 'number',
                          )
                        }
                        value={pointSystem}
                      >
                        <option
                          className="text-black dark:text-yellow-300 font-bold"
                          value={'number'}
                        >
                          Number
                        </option>
                        <option
                          className="text-black dark:text-yellow-300 font-bold"
                          value={'treasureChest'}
                        >
                          Treasure Chest
                        </option>
                      </select>
                    </label>
                  </div>
                )}

                {/* Dark theme logic */}
                <div className="flex">
                  <label className="cursor-pointer select-none">
                    Dark Theme
                    <input
                      type="checkbox"
                      className="ml-2 w-5 h-5 cursor-pointer align-middle"
                      checked={isDarkTheme}
                      onChange={(e) => setIsDarkTheme(e.target.checked)}
                    />
                  </label>
                </div>

                {/* Arrowkeys Enabling logic */}
                <div className="flex">
                  <label className="cursor-pointer select-none">
                    Arrow keys
                    <input
                      type="checkbox"
                      className="ml-2 w-5 h-5 cursor-pointer align-middle"
                      checked={isArrowKeysEnabled}
                      onChange={(e) => setIsArrowKeysEnabled(e.target.checked)}
                    />
                  </label>
                </div>

                {/* Mute sounds logic */}
                <div className="flex">
                  <label className="cursor-pointer select-none">
                    Mute sounds
                    <input
                      type="checkbox"
                      className="ml-2 w-5 h-5 cursor-pointer align-middle"
                      checked={isAudioMuted}
                      onChange={(e) => {
                        const muted = e.target.checked;
                        setIsAudioMuted(muted);
                        if (!muted && volume === 0) {
                          setVolume(0.5);
                          AudioArray.forEach((ref) => {
                            if (ref.current) ref.current.volume = 0.5;
                          });
                        }
                        AudioArray.forEach((ref) => {
                          if (ref.current) ref.current.muted = muted;
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Volume slider logic */}
                <div className="flex">
                  <label className="pr-3">Volume</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    className="cursor-pointer w-max accent-yellow-400"
                    onChange={(e) => applyVolume(parseFloat(e.target.value))}
                  />
                  <input
                    className="ml-3 w-14 border border-slate-300 dark:border-yellow-500 dark:bg-red-900 dark:text-yellow-300 rounded-md px-1 text-center"
                    min={0}
                    max={100}
                    type="number"
                    aria-label="Set volume"
                    value={Math.floor(volume * 100)}
                    onChange={(e) => applyVolume(Number(e.target.value) / 100)}
                  />
                </div>
              </div>
            </div>
          ) : settingMenu === 'game' ? (
            <GamePanel
              timerEnabled={timerEnabled}
              setTimerEnabled={setTimerEnabled}
              bestOfSeries={bestOfSeries}
              setBestOfSeries={setBestOfSeries}
              setScores={setScores}
              setBestOfSeriesScores={setBestOfSeriesScores}
              resetGame={resetGame}
              victoriesForAction={victoriesForAction}
              setVictoriesForAction={setVictoriesForAction}
              timerDuration={timerDuration}
              setTimerDuration={setTimerDuration}
            />
          ) : settingMenu === 'stats' && winLossDraw ? (
            <StatsPanel
              winLossDraw={winLossDraw}
              playerOne={playerOne}
              playerTwo={playerTwo}
              onResetStats={onResetStats}
            />
          ) : (
            <PlayersPanel
              playerOne={playerOne}
              setPlayerOne={setPlayerOne}
              playerTwo={playerTwo}
              setPlayerTwo={setPlayerTwo}
              mode={mode}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
