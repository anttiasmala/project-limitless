import { Difficulty } from '@/lib/gameLogic';
import Button from './utils/Button';

type Props = {
  difficulty: Difficulty;
  gameHasMoves: boolean;
  gameOver: boolean;
  onSelect: (difficulty: Difficulty) => void;
  onReset: () => void;
  label?: string;
};

const DIFFICULTY_LABELS: Record<Difficulty, { short: string; long: string }> = {
  easy: { short: '🌊 Easy', long: '🌊 Calm Seas (Easy)' },
  medium: { short: '⛈️ Medium', long: '⛈️ Stormy Waters (Medium)' },
  hard: { short: '💀 Hard', long: "💀 Davy Jones' Wrath (Hard)" },
  insane: { short: '🌀 Insane', long: '🌀 Maelstrom (Insane)' },
};

export default function DifficultySelector({
  difficulty,
  gameHasMoves,
  gameOver,
  onSelect,
  onReset,
  label = 'Kraken Strength',
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs tracking-widest text-slate-500 uppercase dark:text-amber-500">
        {label}
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(
          (_difficulty) => (
            <Button
              key={_difficulty}
              variant="unstyled"
              onClick={() => {
                if (gameHasMoves && !gameOver) return;
                if (difficulty !== _difficulty) onReset();
                onSelect(_difficulty);
              }}
              className={`border-2 px-3 py-1.5 text-xs font-semibold ${
                difficulty === _difficulty
                  ? 'border-amber-800 bg-amber-600 text-white dark:border-red-500 dark:bg-red-900 dark:text-yellow-300'
                  : 'border-slate-400 bg-slate-200 text-slate-700 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-500 dark:hover:border-amber-600'
              } ${
                gameHasMoves && difficulty !== _difficulty && !gameOver
                  ? 'cursor-not-allowed'
                  : ''
              }`}
            >
              <span className="sm:hidden">
                {DIFFICULTY_LABELS[_difficulty].short}
              </span>
              <span className="hidden sm:inline">
                {DIFFICULTY_LABELS[_difficulty].long}
              </span>
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
