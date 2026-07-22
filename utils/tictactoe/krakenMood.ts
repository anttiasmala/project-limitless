import {
  AI,
  Board as BoardType,
  HUMAN,
  WINNING_LINES as LINES,
  Player,
} from '@/lib/tictactoe/gameLogic';

export type KrakenMood =
  | 'idle'
  | 'thinking'
  | 'angry'
  | 'confident'
  | 'victorious'
  | 'defeated'
  | 'draw';

export function getKrakenMood({
  winner,
  isDraw,
  aiThinking,
  board,
  isGameStarted,
}: {
  winner: Player | null;
  isDraw: boolean;
  aiThinking: boolean;
  board: BoardType;
  isGameStarted: boolean;
}): KrakenMood {
  if (!isGameStarted) return 'idle';
  if (winner === AI) return 'victorious';
  if (winner === HUMAN) return 'defeated';
  if (isDraw) return 'draw';
  if (aiThinking) return 'thinking';

  // Check if human has a 2-in-a-row threat
  if (hasTwoInARow(board, HUMAN)) return 'angry';
  // Check if AI has a 2-in-a-row advantage
  if (hasTwoInARow(board, AI)) return 'confident';

  return 'idle';
}

function hasTwoInARow(board: BoardType, player: Player): boolean {
  return LINES.some(([a, b, c]) => {
    const line = [board[a], board[b], board[c]];
    return (
      line.filter((cell) => cell === player).length === 2 && line.includes(null)
    );
  });
}
