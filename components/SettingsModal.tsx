// components/SettingsModal.tsx

import { useKeyPress } from '@/hooks/useKeyPress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { INITIAL_SCORE, Player } from '@/lib/gameLogic';
import { BaseSettingsProps, WinLossDrawStats } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  showPlayerSettings?: boolean;
  mode?: 'pvp' | 'pvc';
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
    'settings' | 'players' | 'stats'
  >('settings');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  useKeyPress('Escape', handleClose, showSettingsModal);
  usePreventBackgroundScrolling(showSettingsModal);

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
          <div className="flex mb-2 gap-1 shrink-0">
            <Button
              variant="unstyled"
              onClick={() => setSettingMenu('settings')}
              className={`flex-1 py-2 px-3 text-sm border-2 ${
                settingMenu === 'settings'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-red-900 border-red-700 text-yellow-300/60 hover:text-yellow-300 hover:bg-red-800'
              }`}
            >
              ⚙️ Settings
            </Button>
            <Button
              variant="unstyled"
              onClick={() => setSettingMenu('players')}
              className={`flex-1 py-2 px-3 text-sm border-2 ${
                settingMenu === 'players'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-red-900 border-red-700 text-yellow-300/60 hover:text-yellow-300 hover:bg-red-800'
              }`}
            >
              🏴‍☠️ Players
            </Button>
            {winLossDraw && (
              <Button
                variant="unstyled"
                onClick={() => setSettingMenu('stats')}
                className={`flex-1 py-2 px-3 text-sm border-2 ${
                  settingMenu === 'stats'
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-red-900 border-red-700 text-yellow-300/60 hover:text-yellow-300 hover:bg-red-800'
                }`}
              >
                📊 Stats
              </Button>
            )}
          </div>
        ) : null}

        <div className="overflow-y-auto">
          {settingMenu === 'settings' ? (
            <div className="w-auto max-w-[90vw] h-auto min-h-48 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg">
              <div className="mt-3 ml-3 flex flex-col">
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
                {/* TIMER LOGIC -- single-player only*/}
                {setTimerEnabled && (
                  <div className="mt-3 flex">
                    <label className="cursor-pointer select-none">
                      Sand timer (10s)
                      <input
                        type="checkbox"
                        className="ml-2 w-5 h-5 cursor-pointer align-middle"
                        checked={timerEnabled ?? false}
                        onChange={(e) => setTimerEnabled(e.target.checked)}
                      />
                    </label>
                  </div>
                )}

                {/* Treasure chest or number logic -- single-player only*/}
                {setPointSystem && (
                  <div className="mt-3 flex">
                    <label className="cursor-pointer select-none">
                      Point system:
                      <select
                        className="border-2 border-slate-300 rounded-md text-slate-800 bg-white dark:border-red-700 dark:text-yellow-300 dark:bg-red-950"
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
                <div className="mt-3 flex">
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
                <div className="mt-3 flex">
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

                {/* Best of Series logic -- single-player only */}
                {setBestOfSeries && (
                  <div className="mt-3 flex">
                    <label className="select-none">
                      Best of Series:
                      <select
                        className="border-2 border-slate-300 rounded-md text-slate-800 bg-white dark:border-red-700 dark:text-yellow-300 dark:bg-red-950"
                        name="bestOfSeries"
                        onChange={(e) => {
                          setBestOfSeries(
                            e.target.value as 'off' | 'bo3' | 'bo5',
                          );
                          setBestOfSeriesScores?.({ ...INITIAL_SCORE });
                          setScores?.({ ...INITIAL_SCORE });
                          resetGame?.();
                        }}
                        value={bestOfSeries}
                      >
                        <option
                          className="text-black dark:text-yellow-300 font-bold"
                          value={'off'}
                        >
                          Off
                        </option>
                        <option
                          className="text-black dark:text-yellow-300 font-bold"
                          value={'bo3'}
                        >
                          Best of 3
                        </option>
                        <option
                          className="text-black dark:text-yellow-300 font-bold"
                          value={'bo5'}
                        >
                          Best of 5
                        </option>
                      </select>
                    </label>
                  </div>
                )}

                {/* Volume slider logic */}
                <p>Volume</p>
                <div className="flex">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    className="cursor-pointer w-max accent-yellow-400"
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      setVolume(vol);
                      const muted = vol === 0;
                      setIsAudioMuted(muted);
                      AudioArray.forEach((ref) => {
                        if (ref.current) {
                          ref.current.volume = vol;
                          ref.current.muted = muted;
                        }
                      });
                    }}
                  />
                  <p className="ml-3">{Math.floor(volume * 100)}</p>
                </div>
              </div>
            </div>
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
