// components/Square.tsx

import { Player } from '../lib/gameLogic';

interface SquareProps {
  value: Player | null;
  displayValue?: string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  isWinning: boolean;
  disabled: boolean;
  tabIndex: number;
  cellRef: (el: HTMLButtonElement | null) => void;
  label: string;
  compact?: boolean;
}

export default function Square({
  value,
  displayValue,
  onClick,
  onKeyDown,
  isWinning,
  disabled,
  tabIndex,
  cellRef,
  label,
  compact = false,
}: SquareProps) {
  return (
    <button
      ref={cellRef}
      role="gridcell"
      aria-label={label}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`
        ${
          compact
            ? 'w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs border-2 rounded'
            : 'w-20 h-20 sm:w-[min(28vw,6rem)] sm:h-[min(28vw,6rem)] text-[min(8vw,2rem)] sm:text-5xl border-4 rounded-lg'
        }
        font-bold transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 dark:focus-visible:ring-yellow-400
        ${
          isWinning
            ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900/60 shadow-[0_0_20px_#facc15] scale-105'
            : 'border-slate-300 bg-slate-100 hover:bg-slate-200 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/70 dark:hover:bg-amber-900/60 dark:hover:border-yellow-600'
        }
        ${disabled || value ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {value ? (displayValue ?? value) : <span className="sr-only">Empty</span>}
    </button>
  );
}
