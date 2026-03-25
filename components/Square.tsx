import { Player } from '../lib/gameLogic';

interface SquareProps {
  value: Player | null;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  isWinning: boolean;
  disabled: boolean;
  tabIndex: number;
  cellRef: (el: HTMLButtonElement | null) => void;
  label: string;
}

export default function Square({
  value,
  onClick,
  onKeyDown,
  isWinning,
  disabled,
  tabIndex,
  cellRef,
  label,
}: SquareProps) {
  return (
    <button
      ref={cellRef}
      role="gridcell"
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`
        w-24 h-24 text-5xl font-bold border-4 rounded-lg
        transition-all duration-300
        flex items-center justify-center
        focus:outline-none focus:ring-4 focus:ring-amber-400 dark:focus:ring-yellow-400
        ${
          isWinning
            ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900/60 shadow-[0_0_20px_#facc15] scale-105'
            : 'border-slate-300 bg-slate-100 hover:bg-slate-200 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/70 dark:hover:bg-amber-900/60 dark:hover:border-yellow-600'
        }
        ${disabled || value ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {value ?? <span className="sr-only">Empty</span>}
    </button>
  );
}
