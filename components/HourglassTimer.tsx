type Props = {
  timeLeft: number;
  duration: number;
};

export default function HourglassTimer({ timeLeft, duration }: Props) {
  const pct = timeLeft / duration;
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
      <div className="w-24 h-2 bg-slate-200 border border-slate-300 dark:bg-amber-950 dark:border-amber-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isUrgent ? 'bg-red-500' : 'bg-amber-400'
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span
        className={`text-xs font-bold tabular-nums ${
          isUrgent
            ? 'text-red-600 dark:text-red-400 animate-pulse'
            : 'text-slate-500 dark:text-amber-400'
        }`}
      >
        {timeLeft}s
      </span>
    </div>
  );
}
