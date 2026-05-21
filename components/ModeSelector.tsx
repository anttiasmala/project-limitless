import SvgSettings from '@/icons/settings';
import Button from './utils/Button';

type Props = {
  mode: 'pvp' | 'pvc' | 'watch';
  showSettingsModal: boolean;
  onSwitchMode: (mode: 'pvp' | 'pvc' | 'watch') => void;
  onOpenSettings: () => void;
};

const MODE_LABELS: Record<Props['mode'], { label: string; aria: string }> = {
  pvp: { label: '⚔️ Two Pirates', aria: 'Two Pirates mode' },
  pvc: { label: '🤖 Vs the Kraken', aria: 'Versus the Kraken mode' },
  watch: { label: '👀 Watch', aria: 'Watch mode (computer versus computer)' },
};

export default function ModeSelector({
  mode,
  showSettingsModal,
  onSwitchMode,
  onOpenSettings,
}: Props) {
  return (
    <div className="flex gap-3 pr-10 sm:pr-0">
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
      <div className="relative flex flex-col items-center gap-6">
        <Button
          variant="unstyled"
          aria-label="Open settings"
          aria-expanded={showSettingsModal}
          className="absolute -left-1.5 sm:left-3 top-0"
          onClick={onOpenSettings}
        >
          <SvgSettings className="w-8 h-8 fill-none dark:text-white text-amber-700" />
        </Button>
      </div>
    </div>
  );
}
