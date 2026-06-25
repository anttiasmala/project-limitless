// components/Square.tsx

import { twMerge } from 'tailwind-merge';
import { HUMAN, Player } from '../lib/gameLogic';

interface SquareProps {
  value: Player | null;
  displayValue?: string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  isWinning: boolean;
  isHint?: boolean;
  isLatestMove?: boolean;
  // When true, an owned square is tinted by its owner (blue vs. yellow) so the two
  // sides stay distinguishable even when both players picked the same icon.
  tintByOwner?: boolean;
  disabled: boolean;
  tabIndex: number;
  cellRef: (el: HTMLButtonElement | null) => void;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Square({
  value,
  displayValue,
  onClick,
  onKeyDown,
  isWinning,
  isHint,
  isLatestMove,
  tintByOwner,
  disabled,
  tabIndex,
  cellRef,
  label,
  size,
  className,
}: SquareProps) {
  return (
    <button
      ref={cellRef}
      role="gridcell"
      aria-label={label}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={twMerge(
        ` ${
          size === 'sm'
            ? 'aspect-square w-full rounded border-2 text-[clamp(0.85rem,3.5vw,1rem)]'
            : size === 'md'
              ? 'aspect-square w-full rounded-md border-2 text-[clamp(1.6rem,7vw,2.1rem)]'
              : 'h-20 w-20 rounded-lg border-4 text-[min(8vw,2rem)] sm:h-[min(28vw,6rem)] sm:w-[min(28vw,6rem)] sm:text-5xl'
        } flex items-center justify-center font-bold transition-all duration-300 focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none dark:focus-visible:ring-yellow-400 ${
          isWinning
            ? 'scale-105 border-yellow-400 bg-yellow-100 shadow-[0_0_20px_#facc15] dark:bg-yellow-900/60'
            : isHint
              ? 'scale-105 animate-pulse border-emerald-400 bg-emerald-100 shadow-[0_0_20px_#34d399] dark:bg-emerald-900/60'
              : tintByOwner && value
                ? `${
                    value === HUMAN
                      ? 'border-sky-400 bg-sky-100 dark:border-sky-600 dark:bg-sky-900/50'
                      : 'border-yellow-400 bg-yellow-200 dark:border-yellow-500 dark:bg-yellow-700/50'
                  }${
                    isLatestMove
                      ? 'ring-2 ring-amber-400/70 ring-inset dark:ring-yellow-400/60'
                      : ''
                  }`
                : isLatestMove
                  ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-400/60 ring-inset dark:border-yellow-500 dark:bg-amber-900/50 dark:ring-yellow-400/50'
                  : 'border-slate-300 bg-slate-100 hover:border-amber-500 hover:bg-slate-200 dark:border-amber-800 dark:bg-amber-950/70 dark:hover:border-yellow-600 dark:hover:bg-amber-900/60'
        } ${disabled || value ? 'cursor-not-allowed' : 'cursor-pointer'} `,
        className,
      )}
    >
      {value ? (displayValue ?? value) : <span className="sr-only">Empty</span>}
    </button>
  );
}
