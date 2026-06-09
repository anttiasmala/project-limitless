// components/ReplayModal.tsx

import { createPortal } from 'react-dom';
import Square from './Square';
import {
  calculateWinner,
  calculateWinner5,
  calculateWinner10,
  Player,
} from '@/lib/gameLogic';
import WinningLine from './WinningLine';
import { MoveEntry } from '@/utils/types';
import useReplay from '@/hooks/useReplay';
import { useGridMeasure } from '@/hooks/useGridMeasure';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import Button from './utils/Button';

type Props = {
  onClose: () => void;
  moveHistory: MoveEntry[];
  boardSize?: 3 | 5 | 10;
  playerIcons: Record<Player, string>;
};

export default function ReplayModal({
  onClose,
  moveHistory,
  boardSize = 3,
  playerIcons,
}: Props) {
  const {
    stepIndex,
    total,
    replayBoard,
    canGoBack,
    canGoForward,
    isPlaying,
    next,
    prev,
    reset,
    jumpToEnd,
    togglePlay,
  } = useReplay(moveHistory, 800, boardSize);

  const { gridRef, measurement } = useGridMeasure(boardSize);
  const calcWinner =
    boardSize === 10
      ? calculateWinner10
      : boardSize === 5
      ? calculateWinner5
      : calculateWinner;
  const { winner, line: winLine } = calcWinner(replayBoard);
  const showWin = stepIndex === total && !!winner;

  usePreventBackgroundScrolling(true);

  const squareSize =
    boardSize === 10 ? 'sm' : boardSize === 5 ? 'md' : undefined;

  // The latest move is the one at the current step; null when at the start.
  const latestMoveIndex = moveHistory[stepIndex - 1]?.index ?? null;

  return createPortal(
    <div>
      <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game replay"
        className="fixed inset-0 z-101 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="relative bg-white dark:bg-[#1a0a00] border-4 border-amber-500 dark:border-yellow-500 rounded-2xl p-2 sm:p-4 md:p-8 max-w-sm w-full text-center shadow-[0_0_60px_#facc15] my-auto">
          {/* Step counter */}
          <p className="text-sm text-slate-500 dark:text-amber-500 uppercase tracking-widest mb-4">
            Move {stepIndex} / {total}
          </p>

          {/* Board */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div
                ref={gridRef}
                className={`grid ${
                  boardSize === 10
                    ? 'grid-cols-10 gap-1'
                    : boardSize === 5
                    ? 'grid-cols-5 gap-2'
                    : 'grid-cols-3 gap-3'
                }`}
              >
                {replayBoard.map((cell, i) => (
                  <Square
                    key={i}
                    value={cell}
                    displayValue={cell ? playerIcons[cell] : undefined}
                    isWinning={showWin ? winLine?.includes(i) ?? false : false}
                    isLatestMove={i === latestMoveIndex}
                    disabled={true}
                    onClick={() => null}
                    onKeyDown={() => null}
                    tabIndex={-1}
                    cellRef={() => null}
                    label={`Square ${i}`}
                    size={squareSize}
                  />
                ))}
              </div>
              {showWin && winLine && (
                <WinningLine
                  winLine={winLine}
                  cellSize={measurement.cellSize}
                  gap={measurement.gap}
                  cols={boardSize}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2 mb-4">
            {[
              {
                label: '⏮',
                action: reset,
                disabled: !canGoBack,
                aria: 'Go to start',
              },
              {
                label: '◀',
                action: prev,
                disabled: !canGoBack || isPlaying,
                aria: 'Previous move',
              },
              {
                label: '▶',
                action: next,
                disabled: !canGoForward || isPlaying,
                aria: 'Next move',
              },
              {
                label: '⏭',
                action: jumpToEnd,
                disabled: !canGoForward,
                aria: 'Go to end',
              },
            ].map(({ label, action, disabled, aria }) => (
              <Button
                key={aria}
                variant="gold"
                size="md"
                onClick={action}
                disabled={disabled}
                aria-label={aria}
                className="text-lg disabled:opacity-30"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Auto-play toggle */}
          <div className="mb-6">
            <Button
              variant="gold"
              size="md"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
              className="px-5"
            >
              {isPlaying ? '⏸ Pause' : '▶ Auto-play'}
            </Button>
          </div>

          <Button
            variant="gold"
            onClick={onClose}
            className="text-base tracking-wide dark:bg-yellow-600 dark:border-yellow-400 dark:text-black dark:hover:bg-yellow-500 focus-visible:ring-4"
          >
            ⚓ Close Window ☠️
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
