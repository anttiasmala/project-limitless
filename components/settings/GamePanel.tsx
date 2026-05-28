// components/settings/GamePanel.tsx

import { INITIAL_SCORE, Player } from '@/lib/gameLogic';

type GamePanelProps = {
  timerEnabled?: boolean;
  setTimerEnabled?: (value: boolean) => void;
  bestOfSeries?: 'off' | 'bo3' | 'bo5';
  setBestOfSeries?: (value: 'off' | 'bo3' | 'bo5') => void;
  setScores?: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  setBestOfSeriesScores?: React.Dispatch<
    React.SetStateAction<Record<Player, number>>
  >;
  resetGame?: () => void;
};

export function GamePanel({
  timerEnabled,
  setTimerEnabled,
  bestOfSeries,
  setBestOfSeries,
  setScores,
  setBestOfSeriesScores,
  resetGame,
}: GamePanelProps) {
  return (
    <div className="w-72 max-w-[90vw] h-auto min-h-48 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg">
      <div className="mt-3 ml-3 flex flex-col">
        {setTimerEnabled && (
          <div className="flex">
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
      </div>
    </div>
  );
}
