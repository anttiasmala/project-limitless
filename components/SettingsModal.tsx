// components/SettingsModal.tsx

import { useKeyPress } from '@/hooks/useKeyPress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { AI, HUMAN, INITIAL_SCORE, Player } from '@/lib/gameLogic';
import { BaseSettingsProps } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './utils/Button';
import Input from './utils/Input';

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
}: SettingsModalProps) {
  const handleClose = useCallback(
    () => setShowSettingsModal(false),
    [setShowSettingsModal],
  );
  const [showIconModalPlayerOne, setShowIconModalPlayerOne] = useState(false);
  const [showIconModalPlayerTwo, setShowIconModalPlayerTwo] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('isDarkTheme', true);
  const [playerOne, setPlayerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwo, setPlayerTwo] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });
  const [settingMenu, setSettingMenu] = useState<'settings' | 'players'>(
    'settings',
  );

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
        className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2"
      >
        <button
          className="py-2 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg hover:bg-slate-100 hover:border-amber-500 dark:hover:bg-red-800 dark:hover:border-yellow-500 cursor-pointer transition-all duration-200 tracking-wide w-full mb-2"
          onClick={() => setShowSettingsModal(false)}
        >
          ⚓ Close Window ☠️
        </button>
        <div className="flex mb-1">
          <Button
            onClick={() => setSettingMenu('settings')}
            className={`px-3 ${
              settingMenu === 'settings'
                ? 'dark:bg-red-700 bg-red-700 '
                : 'bg-red-700'
            }`}
          >
            Settings
          </Button>
          <Button
            onClick={() => setSettingMenu('players')}
            className={`px-3 ml-1 ${
              settingMenu === 'players'
                ? 'dark:bg-red-700 bg-red-700 '
                : 'bg-red-700'
            }`}
          >
            Players
          </Button>
        </div>
        {settingMenu === 'settings' ? (
          <div>
            <div className="w-48 max-w-[90vw] h-auto min-h-48 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg">
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
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <label className="select-none text-black dark:text-yellow-300">
                Player 1:
              </label>
              <div className="flex">
                <Input
                  value={playerOne.name}
                  onChange={(e) => {
                    setPlayerOne({ ...playerOne, name: e.currentTarget.value });
                  }}
                  className="sm:w-48"
                />
                <div className="border-4 border-red-500 dark:border-red-900 rounded-md w-max">
                  <button
                    onClick={() =>
                      setShowIconModalPlayerOne((prevValue) => !prevValue)
                    }
                    className="text-4xl cursor-pointer"
                  >
                    {playerOne.icon}
                  </button>
                </div>
              </div>
              <IconModal
                showModal={showIconModalPlayerOne}
                setPlayer={setPlayerOne}
                player={{ ...playerOne }}
                onClose={() => setShowIconModalPlayerOne(false)}
              />
            </div>
            <div className="flex flex-col mt-4">
              <label className="select-none text-black dark:text-yellow-300">
                Player 2:
              </label>
              <div className="flex">
                <Input
                  value={playerTwo.name}
                  onChange={(e) => {
                    setPlayerTwo({ ...playerTwo, name: e.currentTarget.value });
                  }}
                  className="sm:w-48"
                />
                <div className="border-4 border-red-500 dark:border-red-900 rounded-md w-max">
                  <button
                    onClick={() =>
                      setShowIconModalPlayerTwo((prevValue) => !prevValue)
                    }
                    className="text-4xl cursor-pointer"
                  >
                    {playerTwo.icon}
                  </button>
                </div>
              </div>
              <IconModal
                showModal={showIconModalPlayerTwo}
                setPlayer={setPlayerTwo}
                player={{ ...playerTwo }}
                onClose={() => setShowIconModalPlayerTwo(false)}
              />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

function IconModal({
  showModal,
  setPlayer,
  player,
  onClose,
}: {
  showModal: boolean;
  setPlayer: ({ icon, name }: { icon: string; name: string }) => void;
  player: { icon: string; name: string };
  onClose: () => void;
}) {
  if (!showModal) return;
  const ICON_LIST = [
    '🏴‍☠️',
    '⚓',
    '💰',
    '🌊',
    '⭐️',
    '💀',
    '🦑',
    '🌑',
    '🪦',
    '☠️',
  ];

  return (
    <div>
      <div className="absolute mt-1 w-full dark:bg-red-950 grid grid-cols-4 gap-4 text-3xl rounded-md">
        {ICON_LIST.map((icon, index) => (
          <div key={`icon_${index}`}>
            <button
              onClick={() => {
                setPlayer({ ...player, icon });
                onClose();
              }}
              className="border-2 border-slate-300 rounded-md text-slate-800 bg:white dark:border-red-700 dark:text-yellow-300 dark:bg-red-950 dark:hover:bg-red-800 cursor-pointer"
            >
              {icon}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
