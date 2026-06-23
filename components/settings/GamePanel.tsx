// components/settings/GamePanel.tsx

import { INITIAL_SCORE, Player } from '@/lib/gameLogic';
import Input from '../utils/Input';
import { useState } from 'react';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import VictoriesInfoModal from '../utils/VictoriesInfoModal';
import SpeedBonusInfoModal from '../utils/SpeedBonusInfoModal';
import ToggleSwitch from '../utils/ToggleSwitch';

type GamePanelProps = {
  timerEnabled?: boolean;
  setTimerEnabled?: (value: boolean) => void;
  speedBonusEnabled?: boolean;
  setSpeedBonusEnabled?: (value: boolean) => void;
  bestOfSeries?: 'off' | 'bo3' | 'bo5';
  setBestOfSeries?: (value: 'off' | 'bo3' | 'bo5') => void;
  setScores?: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  setBestOfSeriesScores?: React.Dispatch<
    React.SetStateAction<Record<Player, number>>
  >;
  timerDuration?: number;
  setTimerDuration?: (value: number) => void;
  resetGame?: () => void;
  victoriesForAction?: number;
  setVictoriesForAction?: (value: number) => void;
  setIsAnyModalOpen: (value: boolean) => void;
};

export function GamePanel({
  timerEnabled,
  setTimerEnabled,
  speedBonusEnabled,
  setSpeedBonusEnabled,
  bestOfSeries,
  setBestOfSeries,
  setScores,
  setBestOfSeriesScores,
  setTimerDuration,
  timerDuration,
  resetGame,
  victoriesForAction,
  setVictoriesForAction,
  setIsAnyModalOpen,
}: GamePanelProps) {
  const [showVictoriesInfoModal, setShowVictoriesInfoModal] = useState(false);
  const [showSpeedBonusInfoModal, setShowSpeedBonusInfoModal] = useState(false);
  usePreventBackgroundScrolling(
    showVictoriesInfoModal || showSpeedBonusInfoModal,
  );
  return (
    <div className="h-auto min-h-48 w-72 max-w-[90vw] rounded-lg border-2 border-slate-300 bg-white font-bold text-slate-800 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300">
      <div className="mt-3 ml-3 flex flex-col gap-3">
        {setBestOfSeries && (
          <div className="flex">
            <label className="select-none">
              Best of Series
              <select
                className="ml-1 rounded-md border-2 border-slate-300 bg-white text-slate-800 dark:border-red-700 dark:bg-red-950 dark:text-yellow-300"
                name="bestOfSeries"
                onChange={(e) => {
                  setBestOfSeries(e.target.value as 'off' | 'bo3' | 'bo5');
                  setBestOfSeriesScores?.({ ...INITIAL_SCORE });
                  setScores?.({ ...INITIAL_SCORE });
                  resetGame?.();
                }}
                value={bestOfSeries}
              >
                <option
                  className="font-bold text-black dark:text-yellow-300"
                  value={'off'}
                >
                  Off
                </option>
                <option
                  className="font-bold text-black dark:text-yellow-300"
                  value={'bo3'}
                >
                  Best of 3
                </option>
                <option
                  className="font-bold text-black dark:text-yellow-300"
                  value={'bo5'}
                >
                  Best of 5
                </option>
              </select>
            </label>
          </div>
        )}

        {setVictoriesForAction && (
          <div className="flex items-center">
            <label>Victories</label>
            <Input
              type="number"
              min={0}
              className="ml-1 w-12"
              defaultValue={victoriesForAction ?? 5}
              onBlur={(e) => {
                const val = Number(e.target.value);
                if (Number.isFinite(val) && val >= 0) {
                  setVictoriesForAction(val);
                  // Re-sync the field so e.g. an empty input shows "0" and "05" shows "5"
                  e.target.value = String(val);
                } else {
                  setVictoriesForAction(5);
                  e.target.value = String(5);
                }
              }}
            />
            <button
              type="button"
              aria-label="What does Victories mean?"
              title="What does Victories mean?"
              className="ml-1 cursor-pointer leading-none"
              onClick={() => {
                setShowVictoriesInfoModal(true);
                setIsAnyModalOpen(true);
              }}
            >
              ℹ️
            </button>
          </div>
        )}

        {setTimerEnabled && (
          <div className="flex">
            <div>
              <div className="flex">
                <label className="mr-1 flex cursor-pointer items-center">
                  Sand Timer
                  <ToggleSwitch
                    size="sm"
                    className="ml-2"
                    checked={timerEnabled ?? false}
                    onChange={(e) => setTimerEnabled(e.target.checked)}
                  />
                </label>
              </div>
              {timerEnabled && setTimerDuration && (
                <div className="ml-4">
                  <label>Seconds per turn</label>
                  <Input
                    type="number"
                    min={1}
                    defaultValue={timerDuration ?? 10}
                    className="ml-1 w-12"
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (Number.isFinite(val) && val >= 1) {
                        setTimerDuration(val);
                        // Re-sync the field so e.g. a typed "05" shows as "5"
                        e.target.value = String(val);
                      } else {
                        setTimerDuration(10);
                        e.target.value = String(10);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {setSpeedBonusEnabled && (
          <div className="flex items-center">
            <label className="flex cursor-pointer select-none">
              Speed bonus
              <ToggleSwitch
                size="sm"
                className="ml-2"
                checked={speedBonusEnabled ?? false}
                onChange={(e) => setSpeedBonusEnabled(e.target.checked)}
              />
            </label>
            <button
              type="button"
              aria-label="What does Speed bonus mean?"
              title="What does Speed bonus mean?"
              className="ml-1 cursor-pointer leading-none"
              onClick={() => {
                setShowSpeedBonusInfoModal(true);
                setIsAnyModalOpen(true);
              }}
            >
              ℹ️
            </button>
          </div>
        )}

        <VictoriesInfoModal
          onClose={() => {
            setShowVictoriesInfoModal(false);
            setIsAnyModalOpen(false);
          }}
          showModal={showVictoriesInfoModal}
        />

        <SpeedBonusInfoModal
          onClose={() => {
            setShowSpeedBonusInfoModal(false);
            setIsAnyModalOpen(false);
          }}
          showModal={showSpeedBonusInfoModal}
        />
      </div>
    </div>
  );
}
