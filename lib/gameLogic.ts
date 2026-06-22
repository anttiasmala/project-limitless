export type Player = '☠️' | '⚓';
export type Board = (Player | null)[];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

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

// The fewest marks a winner can place to complete a line equals the win-length
// for that board (3-in-a-row on 3x3, 4 on 5x5, 5 on 10x10).
export function getWinLength(boardSize: 3 | 5 | 10): number {
  return boardSize === 10 ? 5 : boardSize === 5 ? 4 : 3;
}

// Time-based ("Speed bonus") scoring: how many points a win is worth based on
// how few marks the winner needed. A flawless minimum-move win is worth 3,
// one move slower is worth 2, anything else the normal 1. `winnerMarks` is the
// number of the winner's own marks on the final board.
export function computeWinPoints(
  winnerMarks: number,
  winLength: number,
): number {
  if (winnerMarks <= winLength) return 3;
  if (winnerMarks === winLength + 1) return 2;
  return 1;
}

// ─── AI LOGIC BELOW ────────────────────────────────────────────────────────────────

function minimax(
  board: Board,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player,
  depth = 0,
): number {
  const { winner } = calculateWinner(board);
  // Depth-aware scoring: prefer winning sooner and losing later. This makes the
  // engine still block an immediate threat even when the position is ultimately
  // lost (delaying the loss scores higher than allowing it next move).
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isDraw(board)) return 0;

  const scores: number[] = [];

  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    const next = [...board];
    next[i] = isMaximizing ? aiPlayer : humanPlayer;
    scores.push(minimax(next, !isMaximizing, aiPlayer, humanPlayer, depth + 1));
  }

  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

// Positional priority for breaking ties between equally-scored minimax moves.
// In 3x3 every reasonable reply against perfect play draws, so minimax scores
// them identically — without a tie-break it would pick a weak edge as often as
// the center. Lower number = higher priority: center, then corners, then edges.
// This never changes the AI's strength (it only reorders moves that are already
// game-theoretically equal); it just makes the engine — and the Hint that
// reuses it — favor the moves a strong player would actually pick.
const POSITION_PRIORITY = [1, 2, 1, 2, 0, 2, 1, 2, 1];
const CORNERS = [0, 2, 6, 8];

function getBestMove(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
): number {
  // Opening move: prefer a corner over the center. Both draw against perfect
  // play, but a corner leaves the opponent only one non-losing reply (the
  // center) versus four after a center opening — so it wins more against a
  // fallible human. Random among the four corners keeps games from all opening
  // identically.
  if (board.every((cell) => cell === null)) {
    return CORNERS[Math.floor(Math.random() * CORNERS.length)];
  }

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

  // Among the equally-best moves, keep only the highest-priority tier (center >
  // corner > edge), then pick randomly within it to preserve replay variety.
  const topPriority = Math.min(...bestMoves.map((i) => POSITION_PRIORITY[i]));
  const topMoves = bestMoves.filter((i) => POSITION_PRIORITY[i] === topPriority);
  return topMoves[Math.floor(Math.random() * topMoves.length)];
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
      // 3x3 minimax is unbeatable, so "hard" plays it 80% of the time and
      // drops to medium-quality (win/block + random) the other 20% — giving
      // a careful human a real chance.
      return Math.random() < 0.2
        ? getMediumMove(board, aiPlayer, humanPlayer)
        : getBestMove(board, aiPlayer, humanPlayer);
    case 'insane':
      return getBestMove(board, aiPlayer, humanPlayer);
  }
}

// ─── N-IN-A-ROW SHARED HELPERS ────────────────────────────────────────────────

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function makeWinnerChecker(size: number, winLen: number) {
  return function calculateWinnerN(board: Board): {
    winner: Player | null;
    line: number[] | null;
  } {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const player = board[row * size + col];
        if (!player) continue;
        for (const [dr, dc] of DIRS) {
          const pr = row - dr;
          const pc = col - dc;
          if (
            pr >= 0 &&
            pr < size &&
            pc >= 0 &&
            pc < size &&
            board[pr * size + pc] === player
          )
            continue;

          const line: number[] = [row * size + col];
          let r = row + dr;
          let c = col + dc;
          while (
            r >= 0 &&
            r < size &&
            c >= 0 &&
            c < size &&
            board[r * size + c] === player
          ) {
            line.push(r * size + c);
            r += dr;
            c += dc;
          }
          if (line.length >= winLen) {
            return { winner: player, line: line.slice(0, winLen) };
          }
        }
      }
    }
    return { winner: null, line: null };
  };
}

// Open-end aware shape score: `count` contiguous pieces with `openEnds` empty
// neighbors at the ends. Distinguishes open threats (winning shapes) from
// closed ones. Used by Insane.
function scoreShapeOpenAware(count: number, openEnds: number, winLen: number): number {
  if (count >= winLen) return 1_000_000;
  if (openEnds === 0) return 0;

  const gap = winLen - count;
  if (gap === 1) return openEnds === 2 ? 100_000 : 10_000; // open/closed (winLen-1)
  if (gap === 2) return openEnds === 2 ? 5_000 : 500; // open/closed (winLen-2)
  if (gap === 3) return openEnds === 2 ? 200 : 50;
  return openEnds === 2 ? 10 : 2;
}

// Naive length-cubed scoring: ignores whether the line is open or closed, so
// the AI extends/blocks chains by raw length and misses open-three forks.
// Used by Hard — strong enough to play solid moves, weak enough to lose to a
// human who sets up a two-move threat.
function scoreShapeNaive(count: number, openEnds: number, winLen: number): number {
  if (count >= winLen) return 1_000_000;
  if (openEnds === 0) return 0;
  return count * count * count;
}

type ShapeScorer = (count: number, openEnds: number, winLen: number) => number;

// Evaluate the value of placing `player` at `index` by summing the shape score
// across all 4 directions.
function evaluatePlacement(
  board: Board,
  index: number,
  player: Player,
  size: number,
  winLen: number,
  scoreFn: ShapeScorer,
): number {
  const row = Math.floor(index / size);
  const col = index % size;
  let total = 0;

  for (const [dr, dc] of DIRS) {
    let count = 1;
    let openEnds = 0;

    let r = row + dr;
    let c = col + dc;
    while (
      r >= 0 && r < size && c >= 0 && c < size &&
      board[r * size + c] === player
    ) {
      count++;
      r += dr;
      c += dc;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === null) openEnds++;

    r = row - dr;
    c = col - dc;
    while (
      r >= 0 && r < size && c >= 0 && c < size &&
      board[r * size + c] === player
    ) {
      count++;
      r -= dr;
      c -= dc;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === null) openEnds++;

    total += scoreFn(count, openEnds, winLen);
  }
  return total;
}

function hasNeighbor(board: Board, index: number, size: number, range: number): boolean {
  const row = Math.floor(index / size);
  const col = index % size;
  for (let dr = -range; dr <= range; dr++) {
    for (let dc = -range; dc <= range; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] !== null) return true;
    }
  }
  return false;
}

function getScoredMoveN(
  board: Board,
  ai: Player,
  human: Player,
  size: number,
  winLen: number,
  checkWinner: (b: Board) => { winner: Player | null; line: number[] | null },
  scoreFn: ShapeScorer,
  defenseWeight: number,
): number {
  const CELLS = size * size;

  // Empty board: open in the center — corners are the worst opening.
  if (board.every((c) => c === null)) {
    const mid = Math.floor(size / 2);
    return mid * size + mid;
  }

  // Immediate win
  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = ai;
    if (checkWinner(test).winner) return i;
  }

  // Immediate block
  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = human;
    if (checkWinner(test).winner) return i;
  }

  // Score every empty cell that's within 2 squares of an existing stone.
  // Distant cells are dead weight in n-in-a-row openings.
  let bestScore = -Infinity;
  let bestMoves: number[] = [];

  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    if (!hasNeighbor(board, i, size, 2)) continue;

    const offense = evaluatePlacement(board, i, ai, size, winLen, scoreFn);
    const defense = evaluatePlacement(board, i, human, size, winLen, scoreFn);
    const score = offense + defense * defenseWeight;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [i];
    } else if (score === bestScore) {
      bestMoves.push(i);
    }
  }

  if (bestMoves.length > 0) {
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }
  return getRandomMove(board);
}

// Hard: naive length-cubed scoring, equal offense/defense weight.
function getHardMoveN(
  board: Board,
  ai: Player,
  human: Player,
  size: number,
  winLen: number,
  checkWinner: (b: Board) => { winner: Player | null; line: number[] | null },
): number {
  return getScoredMoveN(board, ai, human, size, winLen, checkWinner, scoreShapeNaive, 1.0);
}

// Insane: open-end aware scoring, defense weighted slightly higher than
// offense so the AI prefers blocking an equal-length threat to extending it.
function getInsaneMoveN(
  board: Board,
  ai: Player,
  human: Player,
  size: number,
  winLen: number,
  checkWinner: (b: Board) => { winner: Player | null; line: number[] | null },
): number {
  return getScoredMoveN(board, ai, human, size, winLen, checkWinner, scoreShapeOpenAware, 1.1);
}

function getMediumMoveN(
  board: Board,
  ai: Player,
  human: Player,
  size: number,
  checkWinner: (b: Board) => { winner: Player | null; line: number[] | null },
): number {
  const CELLS = size * size;

  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = ai;
    if (checkWinner(test).winner) return i;
  }
  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = human;
    if (checkWinner(test).winner) return i;
  }
  return getRandomMove(board);
}

// ─── 5x5 GAME LOGIC (4-in-a-row) ──────────────────────────────────────────────

const SIZE_5 = 5;
const WIN_5 = 4;

export const calculateWinner5 = makeWinnerChecker(SIZE_5, WIN_5);

export function getAIMove5(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  difficulty: Difficulty,
): number {
  if (difficulty === 'easy') return getRandomMove(board);
  if (difficulty === 'medium')
    return getMediumMoveN(board, aiPlayer, humanPlayer, SIZE_5, calculateWinner5);
  if (difficulty === 'hard')
    return getHardMoveN(board, aiPlayer, humanPlayer, SIZE_5, WIN_5, calculateWinner5);
  return getInsaneMoveN(board, aiPlayer, humanPlayer, SIZE_5, WIN_5, calculateWinner5);
}

// ─── 10x10 GAME LOGIC (5-in-a-row) ────────────────────────────────────────────

const SIZE_10 = 10;
const WIN_10 = 5;

export const calculateWinner10 = makeWinnerChecker(SIZE_10, WIN_10);

export function getAIMove10(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  difficulty: Difficulty,
): number {
  if (difficulty === 'easy') return getRandomMove(board);
  if (difficulty === 'medium')
    return getMediumMoveN(board, aiPlayer, humanPlayer, SIZE_10, calculateWinner10);
  if (difficulty === 'hard')
    return getHardMoveN(board, aiPlayer, humanPlayer, SIZE_10, WIN_10, calculateWinner10);
  return getInsaneMoveN(board, aiPlayer, humanPlayer, SIZE_10, WIN_10, calculateWinner10);
}
