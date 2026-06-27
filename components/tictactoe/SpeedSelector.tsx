import { WatchSpeed } from '@/hooks/useWatchMode';
import Button from '@/components/shared/Button';

type Props = {
  speed: WatchSpeed;
  onSelect: (speed: WatchSpeed) => void;
};

const SPEED_LABELS: Record<WatchSpeed, string> = {
  slow: '🐢 Slow',
  normal: '⛵ Normal',
  fast: '⚡ Fast',
};

export default function SpeedSelector({ speed, onSelect }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs tracking-widest text-slate-500 uppercase dark:text-amber-500">
        Speed
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        {(['slow', 'normal', 'fast'] as WatchSpeed[]).map((_speed) => (
          <Button
            key={_speed}
            variant="unstyled"
            onClick={() => onSelect(_speed)}
            aria-pressed={speed === _speed}
            className={`border-2 px-3 py-1.5 text-xs font-semibold ${
              speed === _speed
                ? 'border-amber-800 bg-amber-600 text-white dark:border-red-500 dark:bg-red-900 dark:text-yellow-300'
                : 'border-slate-400 bg-slate-200 text-slate-700 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-500 dark:hover:border-amber-600'
            }`}
          >
            {SPEED_LABELS[_speed]}
          </Button>
        ))}
      </div>
    </div>
  );
}
