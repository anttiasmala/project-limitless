// components/SeriesWinnerModal.tsx
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Player } from '@/lib/gameLogic';
import { GameMode } from '@/utils/types';
import GameOverModal from './utils/GameOverModal';

interface SeriesWinnerModalProps {
  seriesWinner: Player | null;
  mode: GameMode;
  onClose: () => void;
  isWinner?: boolean;
  playerOneOverride?: { name: string; icon: string };
  playerTwoOverride?: { name: string; icon: string };
}

const WINNER_CONFETTI = ['🏴‍☠️', '⚓', '💰', '🌊', '⭐️', '💀'];
const LOSER_CONFETTI = ['💀', '🌊', '⚓', '🦑', '🌑', '🪦'];
const NEUTRAL_CONFETTI = ['🏴‍☠️', '⚓', '🌊', '⭐️', '🦑', '💀'];

export default function SeriesWinnerModal({
  seriesWinner,
  mode,
  onClose,
  isWinner,
  playerOneOverride,
  playerTwoOverride,
}: SeriesWinnerModalProps) {
  const [playerOneStored] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwoStored] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });

  if (!seriesWinner) return null;

  const playerOne = playerOneOverride ?? playerOneStored;
  const playerTwo = playerTwoOverride ?? playerTwoStored;
  const isHuman = seriesWinner === '☠️';
  const displayIcon = isHuman ? playerOne.icon : playerTwo.icon;

  const championName =
    mode === 'pvc'
      ? isHuman
        ? 'You are'
        : 'The Kraken is'
      : isHuman
      ? `${playerOne.name} is`
      : `${playerTwo.name} is`;

  // Watch mode has no winner from the player's POV — render a neutral variant.
  const variant =
    isWinner === undefined ? 'neutral' : isWinner ? 'win' : 'loss';

  const confetti =
    isWinner === undefined
      ? NEUTRAL_CONFETTI
      : isWinner
      ? WINNER_CONFETTI
      : LOSER_CONFETTI;

  const trophy = isWinner === undefined ? '⚓' : isWinner ? '🏆' : '💀';

  const title =
    isWinner === undefined
      ? 'Series Complete!'
      : isWinner
      ? 'Grand Champion!'
      : 'Defeated!';

  const championText =
    isWinner === false
      ? `${displayIcon} has conquered the seas...`
      : `${displayIcon} ${championName} the ruler of the Seven Seas!`;

  const subtitleText =
    isWinner === undefined
      ? 'The battle for the seas has ended.'
      : isWinner
      ? 'The Seven Seas bow before you!'
      : 'Your ship has sunk to the depths.';

  const buttonText =
    isWinner === undefined
      ? '👁️ Continue Watching'
      : isWinner
      ? '⚓ New Series ☠️'
      : '🌊 Try Again';

  return (
    <GameOverModal
      open
      variant={variant}
      ariaLabel="Series winner announcement"
      trophy={trophy}
      confetti={confetti}
      title={title}
      body={
        <>
          <p className="text-lg font-bold text-slate-700 dark:text-amber-200 mb-1">
            {championText}
          </p>
          <p className="text-slate-500 dark:text-amber-500 text-sm mb-6 uppercase tracking-widest">
            {subtitleText}
          </p>
        </>
      }
      primary={{ label: buttonText, onClick: onClose }}
    />
  );
}
