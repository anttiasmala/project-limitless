'use client';
import { useCallback, useEffect, useState } from 'react';
import { AI, Difficulty, HUMAN, Player } from '@/lib/tictactoe/gameLogic';
import {
  Opponent,
  TournamentState,
  currentOpponent,
  makeTournament,
  simulateMatch,
  wasDefeatedAtFinal,
} from '@/lib/tictactoe/tournament';

export type TournamentOutcome = 'champion' | 'eliminated' | null;

// Delays let the player see the final move land before the bracket / new match
// swaps in. Tuned by feel; kept here as named constants for clarity.
const DRAW_REPLAY_DELAY_MS = 1500;
const FINAL_ADVANCE_DELAY_MS = 1800;

type Params = {
  active: boolean;
  winner: Player | null;
  draw: boolean;
  gameOver: boolean;
  // Resets board, move history, per-match scores, and timer.
  resetMatchState: () => void;
  setStarterPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player>>;
};

export type UseTournamentReturn = {
  tournament: TournamentState | null;
  tournamentOutcome: TournamentOutcome;
  opponent: Opponent | null;
  defeatedAtFinal: boolean;
  // Picks the difficulty currently in play — tournament opponent's level if
  // we're in a bracket match, otherwise the caller's fallback.
  resolveDifficulty: (fallback: Difficulty) => Difficulty;
  // Spins up a fresh bracket and returns the randomly-chosen starter so the
  // caller can wire up `isGameStarted` / etc. in the same render.
  begin: () => Player;
  // Clears all tournament state (called when leaving the mode).
  clear: () => void;
};

function randomStarter(): Player {
  return Math.random() < 0.5 ? HUMAN : AI;
}

export function useTournament({
  active,
  winner,
  draw,
  gameOver,
  resetMatchState,
  setStarterPlayer,
  setCurrentPlayer,
}: Params): UseTournamentReturn {
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [tournamentOutcome, setTournamentOutcome] =
    useState<TournamentOutcome>(null);

  const opponent = tournament ? currentOpponent(tournament) : null;
  const defeatedAtFinal = tournament ? wasDefeatedAtFinal(tournament) : false;

  const resolveDifficulty = useCallback(
    (fallback: Difficulty): Difficulty => opponent?.difficulty ?? fallback,
    [opponent],
  );

  const begin = useCallback((): Player => {
    setTournament(makeTournament());
    setTournamentOutcome(null);
    const starter = randomStarter();
    setStarterPlayer(starter);
    setCurrentPlayer(starter);
    return starter;
  }, [setStarterPlayer, setCurrentPlayer]);

  const clear = useCallback(() => {
    setTournament(null);
    setTournamentOutcome(null);
  }, []);

  // Bracket progression on match end.
  //  • Draw: replay against the same opponent with the starter flipped.
  //  • Win in semi: simulate the other semi, advance to final, pick a new starter.
  //  • Win in final: mark champion.
  //  • Loss: mark eliminated.
  useEffect(() => {
    if (!active || !tournament || !gameOver) return;
    if (tournamentOutcome) return;

    if (draw) {
      setStarterPlayer((p) => (p === HUMAN ? AI : HUMAN));
      setCurrentPlayer((p) => (p === HUMAN ? AI : HUMAN));
      const t = setTimeout(resetMatchState, DRAW_REPLAY_DELAY_MS);
      return () => clearTimeout(t);
    }

    if (winner === HUMAN) {
      if (tournament.stage === 'semi') {
        const otherWinner = simulateMatch(...tournament.otherSemiPair);
        const t = setTimeout(() => {
          setTournament({
            ...tournament,
            stage: 'final',
            otherSemiWinner: otherWinner,
          });
          resetMatchState();
          const starter = randomStarter();
          setStarterPlayer(starter);
          setCurrentPlayer(starter);
        }, FINAL_ADVANCE_DELAY_MS);
        return () => clearTimeout(t);
      }
      if (tournament.stage === 'final') {
        // Terminal stage transition — synchronous so the result modal renders
        // on the same commit as the final move.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTournament({ ...tournament, stage: 'champion' });

        setTournamentOutcome('champion');
      }
    } else if (winner === AI) {
      setTournament({ ...tournament, stage: 'eliminated' });
      setTournamentOutcome('eliminated');
    }
  }, [
    active,
    gameOver,
    winner,
    draw,
    tournament,
    tournamentOutcome,
    resetMatchState,
    setStarterPlayer,
    setCurrentPlayer,
  ]);

  return {
    tournament,
    tournamentOutcome,
    opponent,
    defeatedAtFinal,
    resolveDifficulty,
    begin,
    clear,
  };
}
