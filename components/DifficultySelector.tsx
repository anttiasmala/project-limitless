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
      <span className="text-slate-500 dark:text-amber-500 text-xs uppercase tracking-widest">
        {label}
      </span>
      <div className="flex gap-2 flex-wrap justify-center">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((_difficulty) => (
          <Button
            key={_difficulty}
            variant="unstyled"
            onClick={() => {
              if (gameHasMoves && !gameOver) return;
              if (difficulty !== _difficulty) onReset();
              onSelect(_difficulty);
            }}
            className={`px-3 py-1.5 border-2 font-semibold text-xs
              ${
                difficulty === _difficulty
                  ? 'bg-amber-600 border-amber-800 text-white dark:bg-red-900 dark:border-red-500 dark:text-yellow-300'
                  : 'bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-500 dark:hover:border-amber-600'
              }
              ${
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
        ))}
      </div>
    </div>
  );
}
