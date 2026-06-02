// components/settings/GamePanel.tsx

import { INITIAL_SCORE, Player } from '@/lib/gameLogic';
import Input from '../utils/Input';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '../utils/Button';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';

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
}: GamePanelProps) {
  const [showVictoriesInfoModal, setShowVictoriesInfoModal] = useState(false);
  usePreventBackgroundScrolling(showVictoriesInfoModal);
  return (
    <div className="w-72 max-w-[90vw] h-auto min-h-48 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg">
      <div className="mt-3 ml-3 flex flex-col">
        {setTimerEnabled && (
          <div className="flex">
            <div>
              <label className="cursor-pointer select-none flex">
                Sand timer
                <input
                  type="checkbox"
                  className="ml-2 w-5 h-5 cursor-pointer align-middle"
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
                    className="w-12 ml-1"
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

        {setBestOfSeries && (
          <div className="mt-3 flex">
            <label className="select-none">
              Best of Series:
              <select
                className="border-2 border-slate-300 rounded-md text-slate-800 bg-white dark:border-red-700 dark:text-yellow-300 dark:bg-red-950"
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

        {setVictoriesForAction && (
          <div className="mt-3 flex items-center">
            <label>Victories</label>
            <button
              type="button"
              aria-label="What does Victories mean?"
              title="What does Victories mean?"
              className="ml-1 cursor-pointer leading-none"
              onClick={() => setShowVictoriesInfoModal(true)}
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
                setVictoriesForAction(val);
              }}
            />
          </div>
        )}

        {showVictoriesInfoModal &&
          createPortal(
            <div>
              <div
                className="fixed top-0 left-0 z-100 h-full w-full bg-black opacity-80"
                onClick={() => setShowVictoriesInfoModal(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Victories setting information"
                className="fixed top-1/2 left-1/2 z-101 -translate-x-1/2 -translate-y-1/2 flex w-72 max-w-[90vw] max-h-[90dvh] flex-col overflow-y-auto rounded-lg border-2 border-slate-300 bg-white p-4 text-slate-800 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300"
              >
                <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-wider">
                  Victories
                </h3>
                <p className="font-normal">
                  How many wins a player needs before one of the following
                  happens:
                </p>
                <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 font-normal">
                  <li>
                    When <b>Best of Series</b> is on, the winner earns one
                    series point.
                  </li>
                  <li>
                    When <b>Best of Series</b> is off, all scores reset.
                  </li>
                  <li>
                    Setting it to <b>0</b> means{' '}
                    <span className="font-bold text-amber-600 dark:text-yellow-300">
                      unlimited
                    </span>{' '}
                    — scores never reset and no series points are awarded.
                  </li>
                </ul>
                <Button
                  variant="primary"
                  className="mt-4 w-full shrink-0 py-2 text-sm tracking-wide"
                  onClick={() => setShowVictoriesInfoModal(false)}
                >
                  ⚓ Close Window ☠️
                </Button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
