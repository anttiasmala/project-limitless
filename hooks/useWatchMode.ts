'use client';
import { useEffect, useState } from 'react';
import {
  Board,
  Difficulty,
  Player,
  calculateWinner,
  getAIMove,
  isDraw,
} from '@/lib/gameLogic';
import { GameMode, MoveEntry } from '@/utils/types';
import { useLocalStorage } from './useLocalStorage';

export type WatchSpeed = 'slow' | 'normal' | 'fast';

const WATCH_SPEED_MS: Record<WatchSpeed, number> = {
  slow: 1500,
  normal: 800,
  fast: 350,
};
const WATCH_PAUSE_MS = 2000;

type Params = {
  mode: GameMode;
  isGameStarted: boolean;
  gameOver: boolean;
  board: Board;
  currentPlayer: Player;
  resetGame: () => void;
  setScores: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
  setMoveHistory: React.Dispatch<React.SetStateAction<MoveEntry[]>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setAiThinking: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useWatchMode({
  mode,
  isGameStarted,
  gameOver,
  board,
  currentPlayer,
  resetGame,
  setScores,
  setBoard,
  setMoveHistory,
  setCurrentPlayer,
  setAiThinking,
}: Params) {
  const [watchSpeed, setWatchSpeed] = useLocalStorage<WatchSpeed>('watchSpeed', 'normal');
  const [watchDifficultyOne, setWatchDifficultyOne] = useLocalStorage<Difficulty>(
    'watchDifficultyOne',
    'medium',
  );
  const [watchDifficultyTwo, setWatchDifficultyTwo] = useLocalStorage<Difficulty>(
    'watchDifficultyTwo',
    'medium',
  );
  const [watchPaused, setWatchPaused] = useState(false);

  useEffect(() => {
    if (mode !== 'watch' || !isGameStarted || watchPaused) return;

    if (gameOver) {
      const restart = setTimeout(() => resetGame(), WATCH_PAUSE_MS);
      return () => clearTimeout(restart);
    }

    const movingPlayer = currentPlayer;
    const opponent = movingPlayer === '☠️' ? '⚓' : '☠️';
    const moveDifficulty =
      movingPlayer === '☠️' ? watchDifficultyOne : watchDifficultyTwo;

    const thinkingTimeout = setTimeout(() => setAiThinking(true), 0);
    const moveTimeout = setTimeout(() => {
      const move = getAIMove(board, movingPlayer, opponent, moveDifficulty);
      if (move === -1) {
        setAiThinking(false);
        return;
      }
      const newBoard = [...board] as Board;
      newBoard[move] = movingPlayer;
      setBoard(newBoard);
      setMoveHistory((prev) => [
        ...prev,
        { turn: prev.length + 1, player: movingPlayer, index: move },
      ]);

      const { winner: _winner } = calculateWinner(newBoard);
      const _isDraw = isDraw(newBoard);
      if (_winner) {
        setScores((prev) => ({ ...prev, [_winner]: prev[_winner] + 1 }));
      } else if (!_isDraw) {
        setCurrentPlayer(opponent);
      }
      setAiThinking(false);
    }, WATCH_SPEED_MS[watchSpeed]);

    return () => {
      clearTimeout(thinkingTimeout);
      clearTimeout(moveTimeout);
    };
  }, [
    mode,
    isGameStarted,
    watchPaused,
    gameOver,
    board,
    currentPlayer,
    watchSpeed,
    watchDifficultyOne,
    watchDifficultyTwo,
    resetGame,
    setScores,
    setBoard,
    setMoveHistory,
    setCurrentPlayer,
    setAiThinking,
  ]);

  return {
    watchSpeed,
    setWatchSpeed,
    watchPaused,
    setWatchPaused,
    watchDifficultyOne,
    setWatchDifficultyOne,
    watchDifficultyTwo,
    setWatchDifficultyTwo,
  };
}
