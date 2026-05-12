// components/ScoreBoard.tsx

import { AI, HUMAN, Player } from '@/lib/gameLogic';
import TreasureChests, { BestOfTreasureChests } from './TreasureChests';
import { BestOfSeriesNames } from '@/utils/types';

type Props = {
  mode: 'pvc' | 'pvp';
  myPlayer?: Player | null;
  scores: Record<Player, number>;
  pointSystem: 'number' | 'treasureChest';
  bestOfSeries: 'off' | 'bo3' | 'bo5';
  bestOfSeriesScores: Record<Player, number>;
};

export default function ScoreBoard({
  mode,
  myPlayer,
  scores,
  pointSystem,
  bestOfSeries,
  bestOfSeriesScores,
}: Props) {
  return (
    <div
      aria-label={`Scores: Davy Jones ${scores[HUMAN]}, Captain Hook ${scores[AI]}`}
      role="region"
      className="bg-white/60 border border-slate-300 text-slate-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 flex flex-col sm:flex-row gap-4 sm:gap-8 text-lg font-semibold rounded-xl sm:px-8 px-4 py-3"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-slate-500 dark:text-amber-500 uppercase tracking-widest">
          ☠️ Davy Jones{' '}
          {myPlayer === HUMAN ? '(You)' : mode === 'pvc' ? '(AI)' : ''}
        </span>
        {pointSystem === 'number' ? (
          <p>{scores[HUMAN]}</p>
        ) : (
          <TreasureChests count={scores[HUMAN]} />
        )}
        {bestOfSeries !== 'off' && (
          <BestOfTreasureChests
            count={bestOfSeriesScores[HUMAN]}
            max={BestOfSeriesNames[bestOfSeries]}
          />
        )}
      </div>
      <span className="self-center text-slate-400 dark:text-amber-600 sm:hidden">
        —————————
      </span>
      <span className="hidden sm:block text-slate-400 dark:text-amber-600 self-center">
        |
      </span>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs dark:text-amber-500 text-amber-700 uppercase tracking-widest">
          ⚓ Capt. Hook{' '}
          {myPlayer === AI ? '(You)' : mode === 'pvc' ? '(AI)' : ''}
        </span>
        {pointSystem === 'number' ? (
          <p>{scores[AI]}</p>
        ) : (
          <TreasureChests count={scores[AI]} />
        )}
        {bestOfSeries !== 'off' && (
          <BestOfTreasureChests
            count={bestOfSeriesScores[AI]}
            max={BestOfSeriesNames[bestOfSeries]}
          />
        )}
      </div>
    </div>
  );
}
