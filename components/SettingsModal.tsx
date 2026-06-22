// components/SettingsModal.tsx

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Player } from '@/lib/gameLogic';
import { BaseSettingsProps, GameMode, WinLossDrawStats } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { GamePanel } from './settings/GamePanel';
import { PlayersPanel } from './settings/PlayersPanel';
import { StatsPanel } from './settings/StatsPanel';
import Button from './utils/Button';
import { Modal } from './utils/Modal';

type SettingsModalProps = BaseSettingsProps & {
  // Single-player only — omit these in multiplayer
  timerEnabled?: boolean;
  setTimerEnabled?: (value: boolean) => void;
  speedBonusEnabled?: boolean;
  setSpeedBonusEnabled?: (value: boolean) => void;
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
  speedBonusEnabled,
  setSpeedBonusEnabled,
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
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
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

  const handleClose = useCallback(() => {
    if (isAnyModalOpen) return;
    setShowSettingsModal(false);
  }, [setShowSettingsModal, isAnyModalOpen]);

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

  return (
    <Modal
      open={showSettingsModal}
      onClose={handleClose}
      ariaLabel="Game settings"
      // While a nested modal (e.g. the icon picker) is open, Escape and a
      // backdrop click should fall through to it rather than closing settings.
      closeOnEscape={!isAnyModalOpen}
    >
      <div className="flex max-h-[90dvh] flex-col">
        <Button
          variant="unstyled"
          className="mb-2 w-full shrink-0 border-2 border-slate-300 bg-white py-2 tracking-wide text-slate-800 hover:border-amber-500 hover:bg-slate-100 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300 dark:hover:border-yellow-500 dark:hover:bg-red-800"
          onClick={() => setShowSettingsModal(false)}
        >
          ⚓ Close Window ☠️
        </Button>

        {showPlayerSettings ? (
          <div className="mb-2 grid shrink-0 grid-cols-2 gap-1">
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
            <div className="h-auto min-h-48 w-72 max-w-[90vw] rounded-lg border-2 border-slate-300 bg-white font-bold text-slate-800 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300">
              <div className="mt-3 ml-3 flex flex-col gap-3">
                {/* Treasure chest or number logic -- single-player only*/}
                {setPointSystem && (
                  <div className="flex">
                    <label className="cursor-pointer select-none">
                      Point system
                      <select
                        className="ml-1 rounded-md border-2 border-slate-300 bg-white text-slate-800 dark:border-red-700 dark:bg-red-950 dark:text-yellow-300"
                        name="pointSystem"
                        onChange={(e) =>
                          setPointSystem(
                            e.target.value as 'treasureChest' | 'number',
                          )
                        }
                        value={pointSystem}
                      >
                        <option
                          className="font-bold text-black dark:text-yellow-300"
                          value={'number'}
                        >
                          Number
                        </option>
                        <option
                          className="font-bold text-black dark:text-yellow-300"
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
                      className="ml-2 h-5 w-5 cursor-pointer align-middle accent-amber-600"
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
                      className="ml-2 h-5 w-5 cursor-pointer align-middle accent-amber-600"
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
                      className="ml-2 h-5 w-5 cursor-pointer align-middle accent-amber-600"
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
                    className="w-max cursor-pointer accent-yellow-400"
                    onChange={(e) => applyVolume(parseFloat(e.target.value))}
                  />
                  <input
                    className="ml-3 w-14 rounded-md border border-slate-300 px-1 text-center dark:border-yellow-500 dark:bg-red-900 dark:text-yellow-300"
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
              speedBonusEnabled={speedBonusEnabled}
              setSpeedBonusEnabled={setSpeedBonusEnabled}
              bestOfSeries={bestOfSeries}
              setBestOfSeries={setBestOfSeries}
              setScores={setScores}
              setBestOfSeriesScores={setBestOfSeriesScores}
              resetGame={resetGame}
              victoriesForAction={victoriesForAction}
              setVictoriesForAction={setVictoriesForAction}
              timerDuration={timerDuration}
              setTimerDuration={setTimerDuration}
              setIsAnyModalOpen={setIsAnyModalOpen}
            />
          ) : settingMenu === 'stats' && winLossDraw ? (
            <StatsPanel
              winLossDraw={winLossDraw}
              playerOne={playerOne}
              playerTwo={playerTwo}
              onResetStats={onResetStats}
              setIsAnyModalOpen={setIsAnyModalOpen}
            />
          ) : (
            <PlayersPanel
              playerOne={playerOne}
              setPlayerOne={setPlayerOne}
              playerTwo={playerTwo}
              setPlayerTwo={setPlayerTwo}
              mode={mode}
              setIsAnyModalOpen={setIsAnyModalOpen}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
