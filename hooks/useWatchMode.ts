'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  AI,
  Board,
  Difficulty,
  HUMAN,
  INITIAL_SCORE,
  Player,
  calculateWinner,
  calculateWinner10,
  calculateWinner5,
  getAIMove,
  getAIMove10,
  getAIMove5,
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
  showReplayModal: boolean;
  showSeriesModal: boolean;
  boardSize: 3 | 5 | 10;
  bestOfSeries: 'off' | 'bo3' | 'bo5';
  victoriesForAction: number;
  scores: Record<Player, number>;
  resetGame: () => void;
  setScores: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
  setMoveHistory: React.Dispatch<React.SetStateAction<MoveEntry[]>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setAiThinking: React.Dispatch<React.SetStateAction<boolean>>;
  setWinStreaks: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  setBestOfSeriesScores: React.Dispatch<
    React.SetStateAction<Record<Player, number>>
  >;
};

export function useWatchMode({
  mode,
  isGameStarted,
  gameOver,
  board,
  currentPlayer,
  showReplayModal,
  showSeriesModal,
  boardSize,
  bestOfSeries,
  victoriesForAction,
  scores,
  resetGame,
  setScores,
  setBoard,
  setMoveHistory,
  setCurrentPlayer,
  setAiThinking,
  setWinStreaks,
  setBestOfSeriesScores,
}: Params) {
  const [watchSpeed, setWatchSpeed] = useLocalStorage<WatchSpeed>(
    'watchSpeed',
    'normal',
  );
  const [watchDifficultyOne, setWatchDifficultyOne] =
    useLocalStorage<Difficulty>('watchDifficultyOne', 'medium');
  const [watchDifficultyTwo, setWatchDifficultyTwo] =
    useLocalStorage<Difficulty>('watchDifficultyTwo', 'medium');
  const [watchPaused, setWatchPaused] = useState(false);

  const handleScores = useCallback(
    (winner: Player, currentScores: Record<Player, number>) => {
      if (
        bestOfSeries === 'off' &&
        victoriesForAction !== 0 &&
        currentScores[winner] >= victoriesForAction
      ) {
        setScores({ ...INITIAL_SCORE });
        resetGame();
      }
      if (
        bestOfSeries !== 'off' &&
        victoriesForAction !== 0 &&
        currentScores[winner] >= victoriesForAction
      ) {
        setBestOfSeriesScores((prev) => ({
          ...prev,
          [winner]: prev[winner] + 1,
        }));
        setScores({ ...INITIAL_SCORE });
      }
    },
    [
      setScores,
      resetGame,
      setBestOfSeriesScores,
      bestOfSeries,
      victoriesForAction,
    ],
  );

  useEffect(() => {
    if (
      mode !== 'watch' ||
      !isGameStarted ||
      watchPaused ||
      showReplayModal ||
      showSeriesModal
    )
      return;

    if (gameOver) {
      const restart = setTimeout(() => resetGame(), WATCH_PAUSE_MS);
      return () => clearTimeout(restart);
    }

    const movingPlayer = currentPlayer;
    const opponent = movingPlayer === '☠️' ? '⚓' : '☠️';
    const moveDifficulty =
      movingPlayer === '☠️' ? watchDifficultyOne : watchDifficultyTwo;
    const move =
      boardSize === 3
        ? getAIMove(board, movingPlayer, opponent, moveDifficulty)
        : boardSize === 5
        ? getAIMove5(board, movingPlayer, opponent, moveDifficulty)
        : getAIMove10(board, movingPlayer, opponent, moveDifficulty);
    const thinkingTimeout = setTimeout(() => setAiThinking(true), 0);
    const moveTimeout = setTimeout(() => {
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

      const { winner: _winner } =
        boardSize === 10
          ? calculateWinner10(newBoard)
          : boardSize === 5
          ? calculateWinner5(newBoard)
          : calculateWinner(newBoard);

      const _isDraw = isDraw(newBoard);
      if (_winner) {
        const newScores = { ...scores, [_winner]: scores[_winner] + 1 };
        setScores(newScores);
        handleScores(_winner, newScores);
        setWinStreaks((prev) => ({
          ...prev,
          [_winner]: prev[_winner] + 1,
          [_winner === HUMAN ? AI : HUMAN]: 0,
        }));
      } else if (_isDraw) {
        setWinStreaks({ '☠️': 0, '⚓': 0 });
      } else {
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
    boardSize,
    currentPlayer,
    showReplayModal,
    showSeriesModal,
    watchSpeed,
    watchDifficultyOne,
    watchDifficultyTwo,
    scores,
    handleScores,
    resetGame,
    setScores,
    setBoard,
    setMoveHistory,
    setCurrentPlayer,
    setAiThinking,
    setWinStreaks,
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
