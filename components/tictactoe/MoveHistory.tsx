// components/MoveHistory.tsx
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Player } from '@/lib/gameLogic';
import { CELL_LABELS, MoveEntry } from '@/utils/tictactoe/types';

type PlayerDisplay = { name: string; icon: string };

type MoveHistoryProps = {
  moveHistory: MoveEntry[];
  winner: Player | null;
  isDraw: boolean;
  boardSize?: 3 | 5 | 10;
  mode: 'pvp' | 'pvc' | 'watch' | 'tournament';
  // Tournament passes the current bracket opponent so the log uses the right
  // pirate name (Salty Sam etc.) rather than the stored Player 2.
  playerTwoOverride?: PlayerDisplay;
};

function getCellLabel(index: number, boardSize: 3 | 5 | 10 = 3): string {
  if (boardSize === 3) return CELL_LABELS[index] ?? `Cell ${index + 1}`;
  const row = String.fromCharCode(65 + Math.floor(index / boardSize));
  const col = (index % boardSize) + 1;
  return `${row}${col}`;
}

export default function MoveHistory({
  moveHistory,
  winner,
  isDraw,
  boardSize = 3,
  playerTwoOverride,
}: MoveHistoryProps) {
  const [playerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwoStored] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });
  const playerTwo = playerTwoOverride ?? playerTwoStored;

  function getPlayerLabel(player: Player): string {
    return player === '☠️'
      ? `${playerOne.icon} ${playerOne.name}`
      : `${playerTwo.icon} ${playerTwo.name}`;
  }

  return (
    <aside className="flex max-h-48 min-h-24 w-full max-w-sm flex-col overflow-hidden rounded-xl border-2 border-slate-300 bg-white dark:border-amber-800 dark:bg-amber-950/60">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-950/80">
        <p className="text-center text-xs tracking-widest text-amber-700 uppercase dark:text-amber-400">
          ⚓ Captain&apos;s Log
        </p>
      </div>

      {/* Scroll area */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto scroll-smooth px-3 py-2">
        {moveHistory.length === 0 ? (
          <p className="mt-4 text-center text-xs text-slate-400 italic dark:text-amber-700">
            No moves yet, Captain…
          </p>
        ) : (
          moveHistory.map((move) => (
            <div
              key={move.turn}
              className="border-b border-slate-100 pb-1 text-xs text-slate-600 dark:border-amber-900/60 dark:text-amber-300"
            >
              <span className="font-bold text-amber-600 dark:text-amber-600">
                Turn {move.turn}
              </span>
              {' · '}
              <span className="text-slate-800 dark:text-yellow-300">
                {getPlayerLabel(move.player)}
              </span>
              {' seized '}
              <span className="text-slate-500 italic dark:text-amber-200">
                {getCellLabel(move.index, boardSize)}
              </span>
            </div>
          ))
        )}

        {/* Game result entry */}
        {winner && (
          <div className="mt-1 border-t border-slate-200 pt-2 text-center text-xs font-bold text-amber-700 dark:border-amber-700 dark:text-yellow-400">
            🏴‍☠️ {getPlayerLabel(winner)} claims the treasure! 🏴‍☠️
          </div>
        )}
        {isDraw && (
          <div className="mt-1 border-t border-slate-200 pt-2 text-center text-xs font-bold text-slate-600 dark:border-amber-700 dark:text-amber-300">
            ⚔️ The seas are tied!
          </div>
        )}
      </div>
    </aside>
  );
}
