// components/ReplayModal.tsx

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
import Button from './utils/Button';
import { Modal } from './utils/Modal';
import { useKeyPress } from '@/hooks/useKeyPress';

type Props = {
  onClose: () => void;
  moveHistory: MoveEntry[];
  boardSize?: 3 | 5 | 10;
  playerIcons: Record<Player, string>;
  tintByOwner?: boolean;
};

export default function ReplayModal({
  onClose,
  moveHistory,
  boardSize = 3,
  playerIcons,
  tintByOwner,
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

  const squareSize =
    boardSize === 10 ? 'sm' : boardSize === 5 ? 'md' : undefined;

  // The latest move is the one at the current step; null when at the start.
  const latestMoveIndex = moveHistory[stepIndex - 1]?.index ?? null;

  // Stepping shouldn't fight the auto-play timer, so left/right are disabled
  // while playing — matching the disabled state of the ◀ ▶ buttons.
  useKeyPress('ArrowLeft', prev, !isPlaying);
  useKeyPress('ArrowRight', next, !isPlaying);
  useKeyPress('ArrowUp', jumpToEnd);
  useKeyPress('ArrowDown', reset);

  return (
    <Modal
      open
      onClose={onClose}
      ariaLabel="Game replay"
      overlayClassName="bg-black/70 backdrop-blur-sm"
    >
      <div className="relative my-auto w-full max-w-sm rounded-2xl border-4 border-amber-500 bg-white p-2 text-center shadow-[0_0_60px_#facc15] sm:p-4 md:p-8 dark:border-yellow-500 dark:bg-[#1a0a00]">
        {/* Step counter */}
        <p className="mb-4 text-sm tracking-widest text-slate-500 uppercase dark:text-amber-500">
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
                  isWinning={showWin ? (winLine?.includes(i) ?? false) : false}
                  isLatestMove={i === latestMoveIndex}
                  tintByOwner={tintByOwner}
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
        <div className="mb-4 flex justify-center gap-2">
          {[
            {
              label: '⏮',
              action: reset,
              disabled: !canGoBack,
              aria: 'Go to start (↓)',
            },
            {
              label: '◀',
              action: prev,
              disabled: !canGoBack || isPlaying,
              aria: 'Previous move (←)',
            },
            {
              label: '▶',
              action: next,
              disabled: !canGoForward || isPlaying,
              aria: 'Next move (→)',
            },
            {
              label: '⏭',
              action: jumpToEnd,
              disabled: !canGoForward,
              aria: 'Go to end (↑)',
            },
          ].map(({ label, action, disabled, aria }) => (
            <Button
              key={aria}
              variant="gold"
              size="md"
              onClick={action}
              disabled={disabled}
              aria-label={aria}
              title={aria}
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

        {/* Keyboard hint */}
        <p className="mb-4 text-xs text-slate-400 dark:text-amber-600/80">
          Use <kbd className="font-sans">←</kbd>{' '}
          <kbd className="font-sans">→</kbd> to step,{' '}
          <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd>{' '}
          to jump to end / start
        </p>

        <Button
          variant="gold"
          onClick={onClose}
          className="text-base tracking-wide focus-visible:ring-4 dark:border-yellow-400 dark:bg-yellow-600 dark:text-black dark:hover:bg-yellow-500"
        >
          ⚓ Close Window ☠️
        </Button>
      </div>
    </Modal>
  );
}
