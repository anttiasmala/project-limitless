type Props = {
  timeLeft: number;
  duration: number;
};

export default function HourglassTimer({ timeLeft, duration }: Props) {
  // timeLeft may be fractional; clamp the bar and round the label up so the
  // displayed seconds count down naturally (3 → 2 → 1) without a lingering 0.
  const pct = Math.max(0, Math.min(1, timeLeft / duration));
  const secondsLeft = Math.ceil(timeLeft);
  const isUrgent = timeLeft <= 3;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`text-3xl transition-transform duration-300 ${
          isUrgent ? 'animate-bounce' : ''
        }`}
      >
        ⏳
      </div>
      {/* Progress bar */}
      <div className="h-2 w-24 overflow-hidden rounded-full border border-slate-300 bg-slate-200 dark:border-amber-800 dark:bg-amber-950">
        <div
          className={`h-full rounded-full transition-all duration-200 ease-linear ${
            isUrgent ? 'bg-red-500' : 'bg-amber-400'
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span
        className={`text-xs font-bold tabular-nums ${
          isUrgent
            ? 'animate-pulse text-red-600 dark:text-red-400'
            : 'text-slate-500 dark:text-amber-400'
        }`}
      >
        {secondsLeft}s
      </span>
    </div>
  );
}
