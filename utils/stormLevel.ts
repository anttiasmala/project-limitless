import { Board as BoardType, Player, AI } from '@/lib/gameLogic';

type StormInput = {
  board: BoardType;
  winner: Player | null;
  isDraw: boolean;
  mode: 'pvp' | 'pvc';
};

// Returns 0.0 (dead calm) to 1.0 (full rage)
export function getStormLevel({
  board,
  winner,
  isDraw,
  mode,
}: StormInput): number {
  if (winner) {
    if (mode === 'pvc' && winner === AI) return 1.0; // Kraken wins — full rage
    return 0.0; // Human wins — calm
  }
  if (isDraw) return 0.75; // Draw — stormy

  const movesPlayed = board.filter(Boolean).length;
  return movesPlayed / 8; // 0 → 0.0, 8 → 1.0
}
