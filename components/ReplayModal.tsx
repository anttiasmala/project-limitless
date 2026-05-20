// components/ReplayModal.tsx

import { createPortal } from 'react-dom';
import Square from './Square';
import { calculateWinner } from '@/lib/gameLogic';
import WinningLine from './WinningLine';
import { MoveEntry } from '@/utils/types';
import useReplay from '@/hooks/useReplay';
import { useGridMeasure } from '@/hooks/useGridMeasure';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import Button from './utils/Button';

type Props = {
  onClose: () => void;
  moveHistory: MoveEntry[];
};

export default function ReplayModal({ onClose, moveHistory }: Props) {
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
  } = useReplay(moveHistory);

  const { gridRef, measurement } = useGridMeasure(3);
  const { winner, line: winLine } = calculateWinner(replayBoard);
  // Only show winning line on the final step
  const showWin = stepIndex === total && !!winner;

  usePreventBackgroundScrolling(true);

  return createPortal(
    <div>
      <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game replay"
        className="fixed inset-0 z-101 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="relative bg-white dark:bg-[#1a0a00] border-4 border-amber-500 dark:border-yellow-500 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_60px_#facc15] my-auto">
          {/* Step counter */}
          <p className="text-sm text-slate-500 dark:text-amber-500 uppercase tracking-widest mb-4">
            Move {stepIndex} / {total}
          </p>

          {/* Board */}
          <div className="relative mb-6" ref={gridRef}>
            <div className="grid grid-cols-3 gap-3">
              {replayBoard.map((cell, i) => (
                <Square
                  key={i}
                  value={cell}
                  isWinning={showWin ? winLine?.includes(i) ?? false : false}
                  disabled={true}
                  onClick={() => null}
                  onKeyDown={() => null}
                  tabIndex={-1}
                  cellRef={() => null}
                  label={`Square ${i}`}
                />
              ))}
            </div>
            {showWin && winLine && (
              <WinningLine
                winLine={winLine}
                cellSize={measurement.cellSize}
                gap={measurement.gap}
              />
            )}
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
