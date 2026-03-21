import { Player } from '@/lib/gameLogic';
import { BoardPlaces, MoveEntry, PlayerNames } from '@/utils/types';
import { useEffect, useRef } from 'react';

type MoveHistoryProps = {
  moveHistory: MoveEntry[];
  mode: 'pvp' | 'pvc';
  winner: Player | null;
  isDraw: boolean;
};

function getPlayerLabel(player: Player, mode: 'pvp' | 'pvc'): string {
  if (mode === 'pvc') {
    return player === '☠️' ? 'You' : 'Kraken';
  }
  return PlayerNames[player];
}

export default function MoveHistory({
  moveHistory,
  mode,
  winner,
  isDraw,
}: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moveHistory]);
  return (
    <aside
      className="flex flex-col w-56 min-h-64 max-h-120
        bg-amber-950/60 border-2 border-amber-800 rounded-xl
        overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-amber-800 bg-amber-950/80">
        <p className="text-amber-400 text-xs uppercase tracking-widest text-center">
          {/* &apos; added instead of ' to prevent ESLint error */}⚓
          Captain&apos;s Log
        </p>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto max-h-48 px-3 py-2 flex flex-col gap-1 scroll-smooth">
        {moveHistory.length === 0 ? (
          <p className="text-amber-700 text-xs text-center mt-4 italic">
            No moves yet, Captain…
          </p>
        ) : (
          moveHistory.map((move) => (
            <div
              key={move.turn}
              className="text-xs text-amber-300 border-b border-amber-900/60 pb-1"
            >
              <span className="text-amber-600 font-bold">Turn {move.turn}</span>
              {' · '}
              <span className="text-yellow-300">
                {getPlayerLabel(move.player, mode)}
              </span>
              {' seized '}
              <span className="text-amber-200 italic">
                {BoardPlaces[move.index]}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />

        {/* Game result entry */}
        {winner && (
          <div className="mt-1 text-xs font-bold text-yellow-400 text-center border-t border-amber-700 pt-2">
            🏴‍☠️ {getPlayerLabel(winner, mode)} claims the treasure!
          </div>
        )}
        {isDraw && (
          <div className="mt-1 text-xs font-bold text-amber-300 text-center border-t border-amber-700 pt-2">
            ⚔️ The seas are tied!
          </div>
        )}
      </div>
    </aside>
  );
}
