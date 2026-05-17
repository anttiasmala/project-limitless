import SvgSettings from '@/icons/settings';

type Props = {
  mode: 'pvp' | 'pvc';
  showSettingsModal: boolean;
  onSwitchMode: (mode: 'pvp' | 'pvc') => void;
  onOpenSettings: () => void;
};

export default function ModeSelector({
  mode,
  showSettingsModal,
  onSwitchMode,
  onOpenSettings,
}: Props) {
  return (
    <div className="flex gap-3 pr-10 sm:pr-0">
      {(['pvp', 'pvc'] as const).map((_mode) => (
        <button
          key={_mode}
          onClick={() => onSwitchMode(_mode)}
          aria-pressed={mode === _mode}
          aria-label={
            _mode === 'pvp' ? 'Two Pirates mode' : 'Versus the Kraken mode'
          }
          className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all duration-200
            ${
              mode === _mode
                ? 'bg-amber-600 border-amber-800 text-white dark:bg-amber-700 dark:border-yellow-400 dark:text-yellow-300'
                : 'bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:border-amber-800 dark:text-amber-400 dark:hover:border-amber-600'
            }
            cursor-pointer`}
        >
          {_mode === 'pvp' ? '⚔️ Two Pirates' : '🤖 Vs the Kraken'}
        </button>
      ))}
      <div className="relative flex flex-col items-center gap-6">
        <button
          aria-label="Open settings"
          aria-expanded={showSettingsModal}
          className="absolute -left-1.5 sm:left-3 top-0 cursor-pointer"
          onClick={onOpenSettings}
        >
          <SvgSettings className="w-8 h-8 fill-none dark:text-white text-amber-700" />
        </button>
      </div>
    </div>
  );
}
