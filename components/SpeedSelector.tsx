import { WatchSpeed } from '@/hooks/useGameSettings';
import Button from './utils/Button';

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
      <span className="text-slate-500 dark:text-amber-500 text-xs uppercase tracking-widest">
        Speed
      </span>
      <div className="flex gap-2 flex-wrap justify-center">
        {(['slow', 'normal', 'fast'] as WatchSpeed[]).map((_speed) => (
          <Button
            key={_speed}
            variant="unstyled"
            onClick={() => onSelect(_speed)}
            aria-pressed={speed === _speed}
            className={`px-3 py-1.5 border-2 font-semibold text-xs
              ${
                speed === _speed
                  ? 'bg-amber-600 border-amber-800 text-white dark:bg-red-900 dark:border-red-500 dark:text-yellow-300'
                  : 'bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-500 dark:hover:border-amber-600'
              }`}
          >
            {SPEED_LABELS[_speed]}
          </Button>
        ))}
      </div>
    </div>
  );
}
