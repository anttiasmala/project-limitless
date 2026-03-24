'use client';

type ResetScoreProps = {
  onReset: () => void;
};

export default function ResetScore({ onReset }: ResetScoreProps) {
  return (
    <div>
      <button
        onClick={onReset}
        className="cursor-pointer bg-slate-200 border-2 border-slate-400 text-slate-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-500 rounded-2xl p-2 shadow-[0_0_40px_#94a3b820] dark:shadow-[0_0_40px_#451a0360] backdrop-blur-sm hover:border-amber-500 hover:bg-slate-300 dark:hover:border-amber-600 dark:hover:bg-amber-900/50 transition-all duration-200"
      >
        Reset Score
      </button>
    </div>
  );
}
