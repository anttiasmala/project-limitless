import { GameMode } from '@/utils/types';
import Button from './utils/Button';

type Props = {
  mode: GameMode;
  onSwitchMode: (mode: GameMode) => void;
};

const MODE_LABELS: Record<GameMode, { label: string; aria: string }> = {
  pvp: { label: '⚔️ Two Pirates', aria: 'Two Pirates mode' },
  pvc: { label: '🤖 Vs Kraken', aria: 'Versus the Kraken mode' },
  watch: { label: '👀 Watch', aria: 'Watch mode (computer versus computer)' },
  tournament: { label: '🏆 Tournament', aria: 'Tournament mode' },
};

export default function ModeSelector({ mode, onSwitchMode }: Props) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {(['pvp', 'pvc', 'watch', 'tournament'] as const).map((_mode) => (
        <Button
          key={_mode}
          variant="unstyled"
          onClick={() => onSwitchMode(_mode)}
          aria-pressed={mode === _mode}
          aria-label={MODE_LABELS[_mode].aria}
          className={`border-2 px-2 py-2 text-sm ${
            mode === _mode
              ? 'border-amber-800 bg-amber-600 text-white dark:border-yellow-400 dark:bg-amber-700 dark:text-yellow-300'
              : 'border-slate-400 bg-slate-200 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:border-amber-600 dark:hover:bg-amber-900/50'
          }`}
        >
          {MODE_LABELS[_mode].label}
        </Button>
      ))}
    </div>
  );
}
