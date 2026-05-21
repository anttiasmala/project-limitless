import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FORFEIT_MESSAGE } from '@/utils/utils';
import { Player } from '../lib/gameLogic';

interface GameStatusProps {
  winner: Player | null;
  isDraw: boolean;
  currentPlayer: Player;
  mode: 'pvp' | 'pvc' | 'watch';
  aiThinking: boolean;
  showForfeitMessage: boolean;
}

export default function GameStatus({
  winner,
  isDraw,
  currentPlayer,
  mode,
  aiThinking,
  showForfeitMessage,
}: GameStatusProps) {
  const [playerOne] = useLocalStorage('playerOne', { name: 'Davy Jones', icon: '☠️' });
  const [playerTwo] = useLocalStorage('playerTwo', { name: 'Capt. Hook', icon: '⚓' });
  const playerNames: Record<Player, string> = {
    '☠️': `${playerOne.icon} ${playerOne.name}`,
    '⚓': `${playerTwo.icon} ${playerTwo.name}`,
  };
  const isGameOver = !!winner || isDraw || showForfeitMessage;

  if (showForfeitMessage) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="text-center text-4xl font-bold text-amber-700 dark:text-yellow-400 animate-pulse"
      >
        <p>{FORFEIT_MESSAGE}</p>
      </div>
    );
  }
  if (winner) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="text-center text-2xl font-bold text-amber-700 dark:text-yellow-400 animate-bounce"
      >
        🏴‍☠️ {playerNames[winner]} claims the treasure! 🏴‍☠️
      </div>
    );
  }
  if (isDraw) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="text-center text-2xl font-bold text-slate-600 dark:text-amber-300"
      >
        ⚔️ The seas are tied! No treasure for anyone! ⚔️
      </div>
    );
  }
  if (aiThinking) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={`${playerTwo.name} is thinking`}
        className="text-center text-xl text-red-600 dark:text-red-400 animate-pulse"
      >
        🐙 {playerTwo.icon} {playerTwo.name} stirs in the deep…
      </div>
    );
  }
  const label =
    mode === 'pvc'
      ? currentPlayer === '☠️'
        ? `${playerNames['☠️']}'s turn`
        : `${playerNames['⚓']} is thinking…`
      : `${playerNames[currentPlayer]}'s turn`;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isGameOver ? undefined : `Current turn ${label}`}
      className="text-center text-xl text-slate-600 dark:text-amber-200"
    >
      ⚓ {label}
    </div>
  );
}
