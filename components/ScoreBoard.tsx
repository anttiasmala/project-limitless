// components/ScoreBoard.tsx

import { AI, HUMAN, Player } from '@/lib/gameLogic';
import TreasureChests, { BestOfTreasureChests } from './TreasureChests';
import { BestOfSeriesNames, GameMode } from '@/utils/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type PlayerDisplay = { name: string; icon: string };

type Props = {
  mode: GameMode;
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
      className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-white/60 px-4 py-3 text-lg font-semibold text-slate-800 sm:flex-row sm:gap-8 sm:px-8 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs tracking-widest text-slate-500 uppercase dark:text-amber-500">
          {p1.icon} {p1.name}{' '}
          {myPlayer === HUMAN
            ? '(You)'
            : mode === 'pvc' || mode === 'tournament'
              ? '(AI)'
              : ''}
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
      <span className="self-center text-slate-400 sm:hidden dark:text-amber-600">
        —————————
      </span>
      <span className="hidden self-center text-slate-400 sm:block dark:text-amber-600">
        |
      </span>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs tracking-widest text-amber-700 uppercase dark:text-amber-500">
          {p2.icon} {p2.name}{' '}
          {myPlayer === AI
            ? '(You)'
            : mode === 'pvc' || mode === 'tournament'
              ? '(AI)'
              : ''}
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
