import Button from './utils/Button';

type Props = {
  mode: 'pvp' | 'pvc' | 'watch';
  onSwitchMode: (mode: 'pvp' | 'pvc' | 'watch') => void;
};

const MODE_LABELS: Record<Props['mode'], { label: string; aria: string }> = {
  pvp: { label: '⚔️ Two Pirates', aria: 'Two Pirates mode' },
  pvc: { label: '🤖 Vs the Kraken', aria: 'Versus the Kraken mode' },
  watch: { label: '👀 Watch', aria: 'Watch mode (computer versus computer)' },
};

export default function ModeSelector({ mode, onSwitchMode }: Props) {
  return (
    <div className="w-full flex items-center gap-3">
      {(['pvp', 'pvc', 'watch'] as const).map((_mode) => (
        <Button
          key={_mode}
          variant="unstyled"
          onClick={() => onSwitchMode(_mode)}
          aria-pressed={mode === _mode}
          aria-label={MODE_LABELS[_mode].aria}
          className={`px-4 py-2 border-2 text-sm
            ${
              mode === _mode
                ? 'bg-amber-600 border-amber-800 text-white dark:bg-amber-700 dark:border-yellow-400 dark:text-yellow-300'
                : 'bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:border-amber-800 dark:text-amber-400 dark:hover:border-amber-600'
            }`}
        >
          {MODE_LABELS[_mode].label}
        </Button>
      ))}
    </div>
  );
}
