export type Player = '☠️' | '⚓';
export type Board = (Player | null)[];
export type Difficulty = 'easy' | 'medium' | 'hard';

export const INITIAL_SCORE: Record<Player, number> = { '☠️': 0, '⚓': 0 };
export const HUMAN: Player = '☠️';
export const AI: Player = '⚓';

export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

export function calculateWinner(board: Board): {
  winner: Player | null;
  line: number[] | null;
} {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

export function isDraw(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

// ─── AI LOGIC BELOW ────────────────────────────────────────────────────────────────

function minimax(
  board: Board,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player,
): number {
  const { winner } = calculateWinner(board);
  if (winner === aiPlayer) return 10;
  if (winner === humanPlayer) return -10;
  if (isDraw(board)) return 0;

  const scores: number[] = [];

  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    const next = [...board];
    next[i] = isMaximizing ? aiPlayer : humanPlayer;
    scores.push(minimax(next, !isMaximizing, aiPlayer, humanPlayer));
  }

  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

function getBestMove(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
): number {
  let bestScore = -Infinity;
  const bestMoves: number[] = [];

  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    const next = [...board];
    next[i] = aiPlayer;
    const score = minimax(next, false, aiPlayer, humanPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMoves.length = 0;
      bestMoves.push(i);
    } else if (score === bestScore) {
      bestMoves.push(i);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function getRandomMove(board: Board): number {
  const empty = board
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
}

// Medium: win if possible, block if needed, else random
function getMediumMove(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
): number {
  // Win
  for (const [a, b, c] of WINNING_LINES) {
    const cells = [board[a], board[b], board[c]];
    const empty = [a, b, c].find((i) => board[i] === null);
    if (empty !== undefined && cells.filter((v) => v === aiPlayer).length === 2)
      return empty;
  }
  // Block
  for (const [a, b, c] of WINNING_LINES) {
    const cells = [board[a], board[b], board[c]];
    const empty = [a, b, c].find((i) => board[i] === null);
    if (
      empty !== undefined &&
      cells.filter((v) => v === humanPlayer).length === 2
    )
      return empty;
  }
  return getRandomMove(board);
}

export function getAIMove(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  difficulty: Difficulty,
): number {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(board);
    case 'medium':
      return getMediumMove(board, aiPlayer, humanPlayer);
    case 'hard':
      return getBestMove(board, aiPlayer, humanPlayer);
  }
}
