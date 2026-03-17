import { Player } from '../lib/gameLogic';

interface GameStatusProps {
  winner: Player | null;
  isDraw: boolean;
  currentPlayer: Player;
  mode: 'pvp' | 'pvc';
  aiThinking: boolean;
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
}: GameStatusProps) {
  if (winner) {
    const name =
      mode === 'pvc'
        ? winner === '☠️'
          ? 'You claim'
          : 'The Kraken claims'
        : `${PVP_NAMES[winner]} claims`;
    return (
      <div className="text-center text-2xl font-bold text-yellow-400 animate-bounce">
        🏴‍☠️ {name} the treasure! 🏴‍☠️
      </div>
    );
  }
  if (isDraw) {
    return (
      <div className="text-center text-2xl font-bold text-amber-300">
        ⚔️ The seas are tied! No treasure for anyone! ⚔️
      </div>
    );
  }
  if (aiThinking) {
    return (
      <div className="text-center text-xl text-red-400 animate-pulse">
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
  return <div className="text-center text-xl text-amber-200">⚓ {label}</div>;
}
