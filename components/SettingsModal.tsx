// components/SettingsModal.tsx

import { useKeyPress } from '@/hooks/useKeyPress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { AI, HUMAN, INITIAL_SCORE, Player } from '@/lib/gameLogic';
import { BaseSettingsProps } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

        {showPlayerSettings ? (
          <div className="flex mb-2 gap-1">
            <button
              onClick={() => setSettingMenu('settings')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 border-2 cursor-pointer ${
                settingMenu === 'settings'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-red-900 border-red-700 text-yellow-300/60 hover:text-yellow-300 hover:bg-red-800'
              }`}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => setSettingMenu('players')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 border-2 cursor-pointer ${
                settingMenu === 'players'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-red-900 border-red-700 text-yellow-300/60 hover:text-yellow-300 hover:bg-red-800'
              }`}
            >
              🏴‍☠️ Players
            </button>
          </div>
        ) : null}

        {settingMenu === 'settings' ? (
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
        ) : (
          <div className="w-72 max-w-[90vw] bg-white border-2 border-slate-300 dark:bg-red-900 dark:border-red-700 rounded-lg overflow-hidden">
            <div className="bg-slate-100 dark:bg-red-800 px-4 py-2 border-b border-slate-200 dark:border-red-700">
              <h3 className="text-center font-bold text-slate-700 dark:text-yellow-300 tracking-wide">
                ⚓ Your Crew ☠️
              </h3>
            </div>
            <div className="flex gap-3 p-3">
              {/* Player 1 Card */}
              <div className="flex-1 flex flex-col items-center gap-2 bg-slate-50 dark:bg-red-800/60 rounded-lg p-3 border border-slate-200 dark:border-red-600">
                <p className="text-xs font-bold text-slate-500 dark:text-yellow-400 uppercase tracking-wider">
                  {mode === 'pvc' ? 'You' : 'Player 1'}
                </p>
                <button
                  onClick={() => setShowIconModalPlayerOne(true)}
                  title="Click to change icon"
                  className="text-4xl w-16 h-16 flex items-center justify-center rounded-full border-4 border-slate-300 dark:border-red-600 hover:border-amber-500 dark:hover:border-yellow-400 hover:scale-110 transition-all duration-200 cursor-pointer bg-white dark:bg-red-950 shadow-md"
                >
                  {playerOne.icon}
                </button>
                <p className="text-xs text-slate-400 dark:text-red-300/70 select-none">
                  tap to change
                </p>
                <input
                  value={playerOne.name}
                  onChange={(e) =>
                    setPlayerOne({ ...playerOne, name: e.currentTarget.value })
                  }
                  maxLength={16}
                  className="w-full text-center bg-white dark:bg-red-950 border-2 border-slate-300 dark:border-red-700 text-slate-800 dark:text-yellow-300 font-bold rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-all duration-200"
                />
              </div>

              {/* Player 2 Card */}
              <div className="flex-1 flex flex-col items-center gap-2 bg-slate-50 dark:bg-red-800/60 rounded-lg p-3 border border-slate-200 dark:border-red-600">
                <p className="text-xs font-bold text-slate-500 dark:text-yellow-400 uppercase tracking-wider">
                  {mode === 'pvc' ? 'AI / Kraken' : 'Player 2'}
                </p>
                <button
                  onClick={() => setShowIconModalPlayerTwo(true)}
                  title="Click to change icon"
                  className="text-4xl w-16 h-16 flex items-center justify-center rounded-full border-4 border-slate-300 dark:border-red-600 hover:border-amber-500 dark:hover:border-yellow-400 hover:scale-110 transition-all duration-200 cursor-pointer bg-white dark:bg-red-950 shadow-md"
                >
                  {playerTwo.icon}
                </button>
                <p className="text-xs text-slate-400 dark:text-red-300/70 select-none">
                  tap to change
                </p>
                <input
                  value={playerTwo.name}
                  onChange={(e) =>
                    setPlayerTwo({ ...playerTwo, name: e.currentTarget.value })
                  }
                  maxLength={16}
                  className="w-full text-center bg-white dark:bg-red-950 border-2 border-slate-300 dark:border-red-700 text-slate-800 dark:text-yellow-300 font-bold rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Icon pickers rendered as portals to avoid clipping */}
        <IconPickerModal
          showModal={showIconModalPlayerOne}
          setPlayer={setPlayerOne}
          player={playerOne}
          onClose={() => setShowIconModalPlayerOne(false)}
        />
        <IconPickerModal
          showModal={showIconModalPlayerTwo}
          setPlayer={setPlayerTwo}
          player={playerTwo}
          onClose={() => setShowIconModalPlayerTwo(false)}
        />
      </div>
    </div>,
    document.body,
  );
}

const ICON_LIST = [
  '🏴‍☠️',
  '⚓',
  '💰',
  '🦜',
  '🌊',
  '⭐️',
  '💀',
  '🦑',
  '🌑',
  '🪦',
  '☠️',
  '🗡️',
  '🪙',
  '💎',
  '🍺',
  '🔱',
];

function IconPickerModal({
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
  if (!showModal) return null;

  return createPortal(
    <div>
      <div
        className="fixed inset-0 z-100 bg-black/70"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101 bg-white dark:bg-red-950 border-2 border-slate-300 dark:border-red-700 rounded-xl p-4 shadow-2xl w-64 max-w-[90vw]">
        <h3 className="text-center font-bold text-slate-700 dark:text-yellow-300 mb-3 text-sm uppercase tracking-wider">
          Choose Your Icon
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {ICON_LIST.map((icon, index) => (
            <button
              key={`icon_${index}`}
              onClick={() => {
                setPlayer({ ...player, icon });
                onClose();
              }}
              className={`text-3xl w-full aspect-square flex items-center justify-center rounded-lg border-2 transition-all duration-150 cursor-pointer ${
                player.icon === icon
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/40 scale-110 shadow-md'
                  : 'border-slate-200 dark:border-red-700 bg-white dark:bg-red-900 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-red-800 hover:scale-105'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full py-2 bg-red-700 dark:bg-red-800 text-white dark:text-yellow-300 rounded-lg font-bold hover:bg-red-600 dark:hover:bg-red-700 border-2 border-red-900 dark:border-red-600 transition-all cursor-pointer text-sm"
        >
          ✕ Cancel
        </button>
      </div>
    </div>,
    document.body,
  );
}
