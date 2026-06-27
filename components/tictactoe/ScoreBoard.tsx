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
  victoriesForAction: number;
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
  victoriesForAction,
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

  // Treasure chests double as a progress bar toward the victory target, so the
  // number of slots mirrors `victoriesForAction` and is shared by both players.
  // Two cases have no fillable track and fall back to a compact "💰 count
  // [/ target]" readout: endless mode (0), which has no target, and targets
  // beyond CHEST_LIMIT, where a row of chests would become a wall.
  const CHEST_LIMIT = 10;
  const useCompactChests =
    victoriesForAction === 0 || victoriesForAction > CHEST_LIMIT;
  const chestMax = Math.min(victoriesForAction, CHEST_LIMIT);

  // Both point systems frame the score as progress toward the target
  // ("count / target"), with the target omitted in endless mode (0).
  const progressSuffix =
    victoriesForAction > 0 ? ` / ${victoriesForAction}` : '';

  // Spoken form for the aria-label — "of" reads more naturally than "/".
  const ariaScore = (count: number) =>
    victoriesForAction > 0 ? `${count} of ${victoriesForAction}` : `${count}`;

  const renderScore = (count: number) => {
    if (pointSystem === 'number') {
      return (
        <p>
          {count}
          {progressSuffix}
        </p>
      );
    }

    return useCompactChests ? (
      <p>
        💰 {count}
        {progressSuffix}
      </p>
    ) : (
      <TreasureChests count={count} max={chestMax} />
    );
  };

  return (
    <div
      aria-label={`Scores: ${p1.name} ${ariaScore(scores[HUMAN])}, ${p2.name} ${ariaScore(scores[AI])}`}
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
        {renderScore(scores[HUMAN])}
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
        {renderScore(scores[AI])}
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
