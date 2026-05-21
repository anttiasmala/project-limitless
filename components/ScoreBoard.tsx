// components/ScoreBoard.tsx

import { AI, HUMAN, Player } from '@/lib/gameLogic';
import TreasureChests, { BestOfTreasureChests } from './TreasureChests';
import { BestOfSeriesNames } from '@/utils/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type PlayerDisplay = { name: string; icon: string };

type Props = {
  mode: 'pvc' | 'pvp' | 'watch';
  myPlayer?: Player | null;
  scores: Record<Player, number>;
  pointSystem: 'number' | 'treasureChest';
  bestOfSeries: 'off' | 'bo3' | 'bo5';
  bestOfSeriesScores: Record<Player, number>;
  playerOneOverride?: PlayerDisplay;
  playerTwoOverride?: PlayerDisplay;
};

export default function ScoreBoard({
  mode,
  myPlayer,
  scores,
  pointSystem,
  bestOfSeries,
  bestOfSeriesScores,
  playerOneOverride,
  playerTwoOverride,
}: Props) {
  const [playerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwo] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });

  const p1 = playerOneOverride ?? playerOne;
  const p2 = playerTwoOverride ?? playerTwo;

  return (
    <div
      aria-label={`Scores: ${p1.name} ${scores[HUMAN]}, ${p2.name} ${scores[AI]}`}
      role="region"
      className="bg-white/60 border border-slate-300 text-slate-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 flex flex-col sm:flex-row gap-4 sm:gap-8 text-lg font-semibold rounded-xl sm:px-8 px-4 py-3"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-slate-500 dark:text-amber-500 uppercase tracking-widest">
          {p1.icon} {p1.name}{' '}
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
          {p2.icon} {p2.name}{' '}
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
