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
};

// Higher difficulty tends to win; equal difficulty falls back to a coin flip.
export function simulateMatch(a: Opponent, b: Opponent): Opponent {
  const rankA = DIFFICULTY_RANK[a.difficulty];
  const rankB = DIFFICULTY_RANK[b.difficulty];
  if (rankA > rankB) return a;
  if (rankB > rankA) return b;
  return Math.random() < 0.5 ? a : b;
}

export type TournamentStage = 'semi' | 'final' | 'champion' | 'eliminated';

export type TournamentState = {
  stage: TournamentStage;
  semiOpponent: Opponent;
  otherSemiPair: [Opponent, Opponent];
  otherSemiWinner: Opponent | null;
  finalOpponent: Opponent | null;
};

export function makeTournament(): TournamentState {
  const shuffled = [...TOURNAMENT_OPPONENTS].sort(() => Math.random() - 0.5);
  const [semiOpponent, b, c] = shuffled;
  return {
    stage: 'semi',
    semiOpponent,
    otherSemiPair: [b, c],
    otherSemiWinner: null,
    finalOpponent: null,
  };
}

// Current AI opponent for the active match (semi or final). Null in end states.
export function currentOpponent(t: TournamentState): Opponent | null {
  if (t.stage === 'semi') return t.semiOpponent;
  if (t.stage === 'final') return t.finalOpponent;
  return null;
}
