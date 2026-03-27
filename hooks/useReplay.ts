import { Board as BoardType } from '@/lib/gameLogic';
import { MoveEntry } from '@/utils/types';
import { useEffect, useState } from 'react';

const EMPTY_BOARD: BoardType = Array(9).fill(null);

function buildBoardAtStep(moves: MoveEntry[], step: number): BoardType {
  const board = [...EMPTY_BOARD] as BoardType;
  for (let i = 0; i < step; i++) {
    board[moves[i].index] = moves[i].player;
  }
  return board;
}

export default function useReplay(
  moveHistory: MoveEntry[],
  autoPlayDelay = 800,
) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const total = moveHistory.length;
  const replayBoard = buildBoardAtStep(moveHistory, stepIndex);
  const canGoBack = stepIndex > 0;
  const canGoForward = stepIndex < total;

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStepIndex((index) => {
        if (index >= total - 1) {
          setIsPlaying(false);
          return total;
        }
        return index + 1;
      });
    }, autoPlayDelay);

    return () => clearInterval(interval);
  }, [isPlaying, total, autoPlayDelay]);

  return {
    stepIndex,
    total,
    replayBoard,
    canGoBack,
    canGoForward,
    isPlaying,
    next: () => setStepIndex((i) => Math.min(i + 1, total)),
    prev: () => setStepIndex((i) => Math.max(i - 1, 0)),
    reset: () => {
      setStepIndex(0);
      setIsPlaying(false);
    },
    jumpToEnd: () => {
      setStepIndex(total);
      setIsPlaying(false);
    },
    togglePlay: () => {
      // If at the end, restart from beginning before playing
      if (stepIndex >= total) setStepIndex(0);
      setIsPlaying((p) => !p);
    },
  };
}
