import { FORFEIT_MESSAGE } from '@/utils/utils';
import { Player } from '../lib/gameLogic';

interface GameStatusProps {
  winner: Player | null;
  isDraw: boolean;
  currentPlayer: Player;
  mode: 'pvp' | 'pvc';
  aiThinking: boolean;
  showForfeitMessage: boolean;
}

const PVP_NAMES: Record<Player, string> = {
  '☠️': 'Davy Jones (☠️)',
  '⚓': 'Captain Hook (⚓)',
};

export default function GameStatus({
  winner,
  isDraw,
  currentPlayer,
  mode,
  aiThinking,
  showForfeitMessage,
}: GameStatusProps) {
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
    const name =
      mode === 'pvc'
        ? winner === '☠️'
          ? 'You claim'
          : 'The Kraken claims'
        : `${PVP_NAMES[winner]} claims`;
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="text-center text-2xl font-bold text-amber-700 dark:text-yellow-400 animate-bounce"
      >
        🏴‍☠️ {name} the treasure! 🏴‍☠️
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
        aria-label="Kraken is thinking"
        className="text-center text-xl text-red-600 dark:text-red-400 animate-pulse"
      >
        🐙 The Kraken stirs in the deep…
      </div>
    );
  }
  const label =
    mode === 'pvc'
      ? currentPlayer === '☠️'
        ? 'Your turn, Pirate! (☠️)'
        : 'Kraken is thinking… (⚓)'
      : `${PVP_NAMES[currentPlayer]}'s turn`;
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
