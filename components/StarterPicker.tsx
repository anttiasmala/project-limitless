import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AI, HUMAN, Player } from '@/lib/gameLogic';
import Button from './utils/Button';

type Props = {
  starterPlayer: Player;
  aiThinking: boolean;
  onSelect: (player: Player) => void;
};

export default function StarterPicker({
  starterPlayer,
  aiThinking,
  onSelect,
}: Props) {
  const [playerOne] = useLocalStorage('playerOne', { name: 'Davy Jones', icon: '☠️' });
  const [playerTwo] = useLocalStorage('playerTwo', { name: 'Capt. Hook', icon: '⚓' });

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-slate-500 dark:text-amber-500 text-xs uppercase tracking-widest">
        Who sails first?
      </span>
      <div className="relative flex bg-white border border-slate-300 dark:bg-amber-950/60 dark:border-amber-800 rounded-full p-1 gap-1">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-amber-600 border border-amber-800 dark:bg-amber-700 dark:border-yellow-500 shadow-inner transition-transform duration-300 ease-in-out"
          style={{
            transform:
              starterPlayer === AI ? 'translateX(calc(100%))' : 'translateX(0)',
          }}
        />
        {([HUMAN, AI] as Player[]).map((player) => (
          <Button
            key={player}
            variant="unstyled"
            onClick={() => onSelect(player)}
            className={`relative z-10 px-3 sm:px-5 py-1.5 rounded-full text-sm
              ${
                starterPlayer === player
                  ? 'text-white dark:text-yellow-300'
                  : 'text-slate-500 dark:text-amber-500 hover:text-slate-700 dark:hover:text-amber-300'
              }
              ${aiThinking ? 'cursor-not-allowed' : ''}`}
          >
            {player === HUMAN
              ? `${playerOne.icon} ${playerOne.name}`
              : `${playerTwo.icon} ${playerTwo.name}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
