import { Board as BoardType } from '@/lib/gameLogic';
import { MoveEntry } from '@/utils/types';
import { useState } from 'react';

const EMPTY_BOARD: BoardType = Array(9).fill(null);

function buildBoardAtStep(moves: MoveEntry[], step: number): BoardType {
  const board = [...EMPTY_BOARD] as BoardType;
  for (let i = 0; i < step; i++) {
    board[moves[i].index] = moves[i].player;
  }
  return board;
}

export default function useReplay(moveHistory: MoveEntry[]) {
  const [stepIndex, setStepIndex] = useState(0);

  const total = moveHistory.length;
  const replayBoard = buildBoardAtStep(moveHistory, stepIndex);
  const canGoBack = stepIndex > 0;
  const canGoForward = stepIndex < total;

  return {
    stepIndex,
    total,
    replayBoard,
    canGoBack,
    canGoForward,
    next: () => setStepIndex((i) => Math.min(i + 1, total)),
    prev: () => setStepIndex((i) => Math.max(i - 1, 0)),
    reset: () => setStepIndex(0),
    jumpToEnd: () => setStepIndex(total),
  };
}
