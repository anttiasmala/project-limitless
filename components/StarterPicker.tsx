import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AI, HUMAN, Player } from '@/lib/gameLogic';
import Button from './utils/Button';

type PlayerDisplay = { name: string; icon: string };

type Props = {
  starterPlayer: Player;
  aiThinking: boolean;
  onSelect: (player: Player) => void;
  playerTwoOverride?: PlayerDisplay;
};

export default function StarterPicker({
  starterPlayer,
  aiThinking,
  onSelect,
  playerTwoOverride,
}: Props) {
  const [playerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwoStored] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });
  // In tournament mode the AI side shows the current bracket opponent.
  const playerTwo = playerTwoOverride ?? playerTwoStored;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs tracking-widest text-slate-500 uppercase dark:text-amber-500">
        Who sails first?
      </span>
      <div className="relative flex gap-1 rounded-full border border-slate-300 bg-white p-1 dark:border-amber-800 dark:bg-amber-950/60">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full border border-amber-800 bg-amber-600 shadow-inner transition-transform duration-300 ease-in-out dark:border-yellow-500 dark:bg-amber-700"
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
            className={`relative z-10 rounded-full px-3 py-1.5 text-sm sm:px-5 ${
              starterPlayer === player
                ? 'text-white dark:text-yellow-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-amber-500 dark:hover:text-amber-300'
            } ${aiThinking ? 'cursor-not-allowed' : ''}`}
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
