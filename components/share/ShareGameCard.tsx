// components/share/ShareGameCard.tsx
//
// The static, self-contained result card that ShareExportModal renders into a
// PNG. Intentionally NOT interactive (no Square buttons) so html-to-image gets
// a clean snapshot that reads well posted on its own.

import { AI, Board as BoardType, HUMAN, Player } from '@/lib/gameLogic';
import { BoardSize } from '@/lib/shareGame';

type PlayerInfo = { name: string; icon: string };

type Props = {
  board: BoardType;
  boardSize: BoardSize;
  winLine: number[] | null;
  winner: Player | null;
  draw: boolean;
  scores: Record<Player, number>;
  playerOne: PlayerInfo;
  playerTwo: PlayerInfo;
  playerIcons: Record<Player, string>;
};

const CELL_SIZE: Record<BoardSize, string> = {
  3: 'h-14 w-14 text-3xl',
  5: 'h-10 w-10 text-xl',
  10: 'h-6 w-6 text-sm',
};

export default function ShareGameCard({
  board,
  boardSize,
  winLine,
  winner,
  draw,
  scores,
  playerOne,
  playerTwo,
  playerIcons,
}: Props) {
  const winningCells = new Set(winLine ?? []);
  const winnerInfo = winner === HUMAN ? playerOne : winner ? playerTwo : null;

  const headline = winnerInfo
    ? `${playerIcons[winner!]} ${winnerInfo.name} wins!`
    : draw
      ? 'Draw — no plunder!'
      : 'Battle in progress';

  return (
    <div className="flex flex-col items-center gap-3 text-slate-700 dark:text-amber-100">
      <p className="text-sm font-bold tracking-wide text-amber-700 dark:text-yellow-400">
        🏴‍☠️ Pirate Tic-Tac-Toe
      </p>

      <h3 className="text-lg font-black tracking-wide text-slate-800 dark:text-yellow-300">
        {headline}
      </h3>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
      >
        {board.map((cell, i) => (
          <div
            key={i}
            className={`flex items-center justify-center rounded border-2 leading-none ${CELL_SIZE[boardSize]} ${
              winningCells.has(i)
                ? 'border-amber-500 bg-amber-200 dark:border-yellow-400 dark:bg-amber-700/60'
                : 'border-slate-300 bg-white/70 dark:border-amber-900/70 dark:bg-amber-950/40'
            }`}
          >
            {cell ? playerIcons[cell] : ''}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 text-base font-bold">
        <span className="flex items-center gap-1">
          <span>{playerOne.icon}</span>
          <span>{scores[HUMAN]}</span>
        </span>
        <span className="text-slate-400 dark:text-amber-200/50">–</span>
        <span className="flex items-center gap-1">
          <span>{scores[AI]}</span>
          <span>{playerTwo.icon}</span>
        </span>
      </div>
    </div>
  );
}
