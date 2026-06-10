import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FORFEIT_MESSAGE } from '@/utils/utils';
import { GameMode } from '@/utils/types';
import { Player } from '../lib/gameLogic';

type PlayerDisplay = { name: string; icon: string };

interface GameStatusProps {
  winner: Player | null;
  isDraw: boolean;
  currentPlayer: Player;
  mode: GameMode;
  aiThinking: boolean;
  showForfeitMessage: boolean;
  // Tournament passes the current bracket opponent so the AI side renders with
  // the right pirate's name and icon instead of the stored Player 2.
  playerTwoOverride?: PlayerDisplay;
}

export default function GameStatus({
  winner,
  isDraw,
  currentPlayer,
  mode,
  aiThinking,
  showForfeitMessage,
  playerTwoOverride,
}: GameStatusProps) {
  const [playerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwoStored] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });
  const playerTwo = playerTwoOverride ?? playerTwoStored;
  const playerNames: Record<Player, string> = {
    '☠️': `${playerOne.icon} ${playerOne.name}`,
    '⚓': `${playerTwo.icon} ${playerTwo.name}`,
  };
  const isGameOver = !!winner || isDraw || showForfeitMessage;

  // In watch mode, aria-live/role is suppressed to avoid flooding screen readers
  // with an infinite stream of turn announcements.
  const liveProps =
    mode === 'watch'
      ? {}
      : { role: 'status' as const, 'aria-live': 'polite' as const };
  const alertProps =
    mode === 'watch'
      ? {}
      : { role: 'alert' as const, 'aria-live': 'assertive' as const };

  if (showForfeitMessage) {
    return (
      <div
        {...alertProps}
        className="animate-pulse text-center text-4xl font-bold text-amber-700 dark:text-yellow-400"
      >
        <p>{FORFEIT_MESSAGE}</p>
      </div>
    );
  }
  if (winner) {
    return (
      <div
        {...alertProps}
        className="animate-bounce text-center text-2xl font-bold text-amber-700 dark:text-yellow-400"
      >
        🏴‍☠️ {playerNames[winner]} claims the treasure! 🏴‍☠️
      </div>
    );
  }
  if (isDraw) {
    return (
      <div
        {...alertProps}
        className="text-center text-2xl font-bold text-slate-600 dark:text-amber-300"
      >
        ⚔️ The seas are tied! No treasure for anyone! ⚔️
      </div>
    );
  }
  if (aiThinking) {
    // Side-specific flavor: ⚓ "stirs in the deep", ☠️ gets pirate-flavored text
    const thinkingText =
      currentPlayer === '⚓'
        ? `🐙 ${playerTwo.icon} ${playerTwo.name} stirs in the deep…`
        : `🗺️ ${playerOne.icon} ${playerOne.name} plots a course…`;
    return (
      <div
        {...liveProps}
        aria-label={`${currentPlayer === '⚓' ? playerTwo.name : playerOne.name} is thinking`}
        className="animate-pulse text-center text-xl text-red-600 dark:text-red-400"
      >
        {thinkingText}
      </div>
    );
  }
  const label =
    (mode === 'pvc' || mode === 'tournament') && currentPlayer === '⚓'
      ? `${playerNames['⚓']} is thinking…`
      : `${playerNames[currentPlayer]}'s turn`;
  return (
    <div
      {...liveProps}
      aria-label={isGameOver ? undefined : `Current turn ${label}`}
      className="text-center text-xl text-slate-600 dark:text-amber-200"
    >
      ⚓ {label}
    </div>
  );
}
