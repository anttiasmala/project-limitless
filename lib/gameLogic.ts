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

// ─── 5x5 GAME LOGIC (4-in-a-row) ──────────────────────────────────────────────

const SIZE_5 = 5;

export function calculateWinner5(board: Board): {
  winner: Player | null;
  line: number[] | null;
} {
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let row = 0; row < SIZE_5; row++) {
    for (let col = 0; col < SIZE_5; col++) {
      const player = board[row * SIZE_5 + col];
      if (!player) continue;
      for (const [dr, dc] of dirs) {
        const pr = row - dr;
        const pc = col - dc;
        if (
          pr >= 0 && pr < SIZE_5 && pc >= 0 && pc < SIZE_5 &&
          board[pr * SIZE_5 + pc] === player
        ) continue;

        const line: number[] = [row * SIZE_5 + col];
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < SIZE_5 && c >= 0 && c < SIZE_5 && board[r * SIZE_5 + c] === player) {
          line.push(r * SIZE_5 + c);
          r += dr;
          c += dc;
        }
        if (line.length >= 4) {
          return { winner: player, line: line.slice(0, 4) };
        }
      }
    }
  }
  return { winner: null, line: null };
}

function countDir5(board: Board, row: number, col: number, dr: number, dc: number, player: Player): number {
  let count = 0;
  let r = row + dr;
  let c = col + dc;
  while (r >= 0 && r < SIZE_5 && c >= 0 && c < SIZE_5 && board[r * SIZE_5 + c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function maxLine5(board: Board, index: number, player: Player): number {
  const row = Math.floor(index / SIZE_5);
  const col = index % SIZE_5;
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let max = 0;
  for (const [dr, dc] of dirs) {
    const len = countDir5(board, row, col, dr, dc, player) + countDir5(board, row, col, -dr, -dc, player) + 1;
    if (len > max) max = len;
  }
  return max;
}

export function getAIMove5(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  difficulty: Difficulty,
): number {
  const CELLS = SIZE_5 * SIZE_5;

  if (difficulty === 'easy') return getRandomMove(board);

  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = aiPlayer;
    if (calculateWinner5(test).winner) return i;
  }

  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = humanPlayer;
    if (calculateWinner5(test).winner) return i;
  }

  if (difficulty === 'medium') return getRandomMove(board);

  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const aiLine = maxLine5(board, i, aiPlayer);
    const humanLine = maxLine5(board, i, humanPlayer);
    const score = Math.pow(aiLine, 3) + Math.pow(humanLine, 3) * 0.9;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove !== -1 ? bestMove : getRandomMove(board);
}

// ─── 10x10 GAME LOGIC (5-in-a-row) ────────────────────────────────────────────

const SIZE_10 = 10;

export function calculateWinner10(board: Board): {
  winner: Player | null;
  line: number[] | null;
} {
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let row = 0; row < SIZE_10; row++) {
    for (let col = 0; col < SIZE_10; col++) {
      const player = board[row * SIZE_10 + col];
      if (!player) continue;
      for (const [dr, dc] of dirs) {
        // Only start from the beginning of a run to avoid duplicates
        const pr = row - dr;
        const pc = col - dc;
        if (
          pr >= 0 &&
          pr < SIZE_10 &&
          pc >= 0 &&
          pc < SIZE_10 &&
          board[pr * SIZE_10 + pc] === player
        )
          continue;

        const line: number[] = [row * SIZE_10 + col];
        let r = row + dr;
        let c = col + dc;
        while (
          r >= 0 &&
          r < SIZE_10 &&
          c >= 0 &&
          c < SIZE_10 &&
          board[r * SIZE_10 + c] === player
        ) {
          line.push(r * SIZE_10 + c);
          r += dr;
          c += dc;
        }
        if (line.length >= 5) {
          return { winner: player, line: line.slice(0, 5) };
        }
      }
    }
  }
  return { winner: null, line: null };
}

function countDir10(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: Player,
): number {
  let count = 0;
  let r = row + dr;
  let c = col + dc;
  while (
    r >= 0 &&
    r < SIZE_10 &&
    c >= 0 &&
    c < SIZE_10 &&
    board[r * SIZE_10 + c] === player
  ) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function maxLine10(board: Board, index: number, player: Player): number {
  const row = Math.floor(index / SIZE_10);
  const col = index % SIZE_10;
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let max = 0;
  for (const [dr, dc] of dirs) {
    const len =
      countDir10(board, row, col, dr, dc, player) +
      countDir10(board, row, col, -dr, -dc, player) +
      1;
    if (len > max) max = len;
  }
  return max;
}

export function getAIMove10(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  difficulty: Difficulty,
): number {
  const CELLS = SIZE_10 * SIZE_10;

  if (difficulty === 'easy') return getRandomMove(board);

  // Immediate win
  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = aiPlayer;
    if (calculateWinner10(test).winner) return i;
  }

  // Immediate block
  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const test = [...board];
    test[i] = humanPlayer;
    if (calculateWinner10(test).winner) return i;
  }

  if (difficulty === 'medium') return getRandomMove(board);

  // Hard: heuristic scoring based on max consecutive pieces through each cell
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < CELLS; i++) {
    if (board[i] !== null) continue;
    const aiLine = maxLine10(board, i, aiPlayer);
    const humanLine = maxLine10(board, i, humanPlayer);
    const score = Math.pow(aiLine, 3) + Math.pow(humanLine, 3) * 0.9;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove !== -1 ? bestMove : getRandomMove(board);
}
