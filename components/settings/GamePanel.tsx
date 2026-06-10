// components/settings/GamePanel.tsx

import { INITIAL_SCORE, Player } from '@/lib/gameLogic';
import Input from '../utils/Input';
import { useState } from 'react';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import VictoriesInfoModal from '../utils/VictoriesInfoModal';

type GamePanelProps = {
  timerEnabled?: boolean;
  setTimerEnabled?: (value: boolean) => void;
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
  usePreventBackgroundScrolling(showVictoriesInfoModal);
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
            <Input
              type="number"
              min={0}
              className="ml-1 w-12"
              value={victoriesForAction ?? 0}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (Number.isFinite(val) && val >= 0) {
                  setVictoriesForAction(val);
                }
              }}
            />
          </div>
        )}

        {setTimerEnabled && (
          <div className="flex">
            <div>
              <label className="flex cursor-pointer select-none">
                Sand timer
                <input
                  type="checkbox"
                  className="ml-2 h-5 w-5 cursor-pointer align-middle accent-amber-600"
                  checked={timerEnabled ?? false}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                />
              </label>
              {timerEnabled && setTimerDuration && (
                <div className="ml-4">
                  <label>Seconds per turn</label>
                  <Input
                    type="number"
                    min={1}
                    value={timerDuration ?? 10}
                    className="ml-1 w-12"
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (Number.isFinite(val) && val >= 1) {
                        setTimerDuration(val);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <VictoriesInfoModal
          onClose={() => {
            setShowVictoriesInfoModal(false);
            setIsAnyModalOpen(false);
          }}
          showModal={showVictoriesInfoModal}
        />
      </div>
    </div>
  );
}
