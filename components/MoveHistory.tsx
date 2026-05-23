// components/MoveHistory.tsx
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Player } from '@/lib/gameLogic';
import { CELL_LABELS, MoveEntry } from '@/utils/types';

type MoveHistoryProps = {
  moveHistory: MoveEntry[];
  winner: Player | null;
  isDraw: boolean;
  boardSize?: 3 | 5 | 10;
  mode: 'pvp' | 'pvc' | 'watch';
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
}: MoveHistoryProps) {
  const [playerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwo] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });

  function getPlayerLabel(player: Player): string {
    return player === '☠️'
      ? `${playerOne.icon} ${playerOne.name}`
      : `${playerTwo.icon} ${playerTwo.name}`;
  }

  return (
    <aside
      className="flex flex-col w-full max-w-sm min-h-24 max-h-48
  bg-white border-2 border-slate-300 dark:bg-amber-950/60 dark:border-amber-800 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 dark:border-amber-800 dark:bg-amber-950/80">
        <p className="text-amber-700 dark:text-amber-400 text-xs uppercase tracking-widest text-center">
          ⚓ Captain&apos;s Log
        </p>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1 scroll-smooth">
        {moveHistory.length === 0 ? (
          <p className="text-slate-400 dark:text-amber-700 text-xs text-center mt-4 italic">
            No moves yet, Captain…
          </p>
        ) : (
          moveHistory.map((move) => (
            <div
              key={move.turn}
              className="text-xs text-slate-600 dark:text-amber-300 border-b border-slate-100 dark:border-amber-900/60 pb-1"
            >
              <span className="text-amber-600 dark:text-amber-600 font-bold">
                Turn {move.turn}
              </span>
              {' · '}
              <span className="text-slate-800 dark:text-yellow-300">
                {getPlayerLabel(move.player)}
              </span>
              {' seized '}
              <span className="text-slate-500 dark:text-amber-200 italic">
                {getCellLabel(move.index, boardSize)}
              </span>
            </div>
          ))
        )}

        {/* Game result entry */}
        {winner && (
          <div className="mt-1 text-xs font-bold text-amber-700 dark:text-yellow-400 text-center border-t border-slate-200 dark:border-amber-700 pt-2">
            🏴‍☠️ {getPlayerLabel(winner)} claims the treasure! 🏴‍☠️
          </div>
        )}
        {isDraw && (
          <div className="mt-1 text-xs font-bold text-slate-600 dark:text-amber-300 text-center border-t border-slate-200 dark:border-amber-700 pt-2">
            ⚔️ The seas are tied!
          </div>
        )}
      </div>
    </aside>
  );
}
