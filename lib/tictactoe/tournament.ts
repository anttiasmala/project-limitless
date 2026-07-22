import { Difficulty } from './gameLogic';

export type Opponent = {
  id: string;
  name: string;
  icon: string;
  difficulty: Difficulty;
};

export const TOURNAMENT_OPPONENTS: Opponent[] = [
  { id: 'sam', name: 'Salty Sam', icon: '🦴', difficulty: 'easy' },
  { id: 'jack', name: 'Calico Jack', icon: '🦜', difficulty: 'medium' },
  { id: 'beard', name: 'Blackbeard', icon: '🏴‍☠️', difficulty: 'hard' },
];

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
  insane: 3,
};

// Upset chance the underdog wins. Tuned so the bracket isn't fully determined
// by seed but the favourite still wins more than half the time.
const UPSET_CHANCE_PER_RANK_GAP = 0.18;

export function simulateMatch(a: Opponent, b: Opponent): Opponent {
  const rankA = DIFFICULTY_RANK[a.difficulty];
  const rankB = DIFFICULTY_RANK[b.difficulty];
  if (rankA === rankB) return Math.random() < 0.5 ? a : b;
  const favourite = rankA > rankB ? a : b;
  const underdog = rankA > rankB ? b : a;
  const gap = Math.abs(rankA - rankB);
  const upset = Math.random() < UPSET_CHANCE_PER_RANK_GAP / gap;
  return upset ? underdog : favourite;
}

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type TournamentStage = 'semi' | 'final' | 'champion' | 'eliminated';

// `otherSemiWinner` doubles as the final opponent — it's set the moment we
// advance to the final and stays set through 'champion' / 'eliminated' so the
// bracket UI can show who the user faced.
export type TournamentState = {
  stage: TournamentStage;
  semiOpponent: Opponent;
  otherSemiPair: [Opponent, Opponent];
  otherSemiWinner: Opponent | null;
};

export function makeTournament(): TournamentState {
  const [semiOpponent, b, c] = shuffle(TOURNAMENT_OPPONENTS);
  return {
    stage: 'semi',
    semiOpponent,
    otherSemiPair: [b, c],
    otherSemiWinner: null,
  };
}

// Current AI opponent for the active match (semi or final). Null in end states.
export function currentOpponent(t: TournamentState): Opponent | null {
  if (t.stage === 'semi') return t.semiOpponent;
  if (t.stage === 'final') return t.otherSemiWinner;
  return null;
}

// True when the user reached and lost the final (as opposed to losing the semi).
export function wasDefeatedAtFinal(t: TournamentState): boolean {
  return t.stage === 'eliminated' && t.otherSemiWinner !== null;
}
