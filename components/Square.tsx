import React from 'react';
import { Player } from '../lib/gameLogic';

interface SquareProps {
  value: Player | null;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}

export default function Square({
  value,
  onClick,
  isWinning,
  disabled,
}: SquareProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !!value}
      className={`
        w-24 h-24 text-5xl font-bold border-4 rounded-lg
        transition-all duration-300 cursor-pointer
        flex items-center justify-center
        ${
          isWinning
            ? 'border-yellow-400 bg-yellow-900/60 shadow-[0_0_20px_#facc15] scale-105'
            : 'border-amber-800 bg-amber-950/70 hover:bg-amber-900/60 hover:border-yellow-600'
        }
        ${disabled || value ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {value}
    </button>
  );
}
