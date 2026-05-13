// components/SeriesWinnerModal.tsx
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { Player } from '@/lib/gameLogic';
import { createPortal } from 'react-dom';

interface SeriesWinnerModalProps {
  seriesWinner: Player | null;
  mode: 'pvp' | 'pvc';
  onClose: () => void;
  isWinner?: boolean;
}

const WINNER_CONFETTI = ['🏴‍☠️', '⚓', '💰', '🌊', '⭐️', '💀'];
const LOSER_CONFETTI = ['💀', '🌊', '⚓', '🦑', '🌑', '🪦'];
const NEUTRAL_CONFETTI = ['🏴‍☠️', '⚓', '🌊', '⭐️', '🦑', '💀'];

export default function SeriesWinnerModal({
  seriesWinner,
  mode,
  onClose,
  isWinner,
}: SeriesWinnerModalProps) {
  const [playerOne] = useLocalStorage('playerOne', { name: 'Davy Jones', icon: '☠️' });
  const [playerTwo] = useLocalStorage('playerTwo', { name: 'Capt. Hook', icon: '⚓' });

  usePreventBackgroundScrolling(seriesWinner !== null);

  if (!seriesWinner) return null;
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
    isWinner === undefined
      ? `${displayIcon} ${championName} the ruler of the Seven Seas!`
      : isWinner
      ? `${displayIcon} ${championName} the ruler of the Seven Seas!`
      : `${displayIcon} has conquered the seas...`;

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

  return createPortal(
    <div>
      {/* Backdrop */}
      <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Series winner announcement"
        className="fixed inset-0 z-101 flex items-center justify-center p-4"
      >
        <div
          className={`relative bg-white dark:bg-[#1a0a00] border-4 rounded-2xl p-8 max-w-sm w-full text-center ${
            isWinner === undefined
              ? 'border-amber-400 dark:border-amber-600 shadow-[0_0_60px_#92400e]'
              : isWinner
              ? 'border-amber-500 dark:border-yellow-500 shadow-[0_0_60px_#facc15]'
              : 'border-slate-500 dark:border-blue-900 shadow-[0_0_60px_#1e3a5f]'
          }`}
        >
          {/* Floating confetti */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            {confetti.map((emoji, i) => (
              <span
                key={i}
                className="absolute text-2xl animate-bounce"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${5 + (i % 3) * 10}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.8 + i * 0.1}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <p className="text-5xl mb-4">{trophy}</p>

          <h2 className="text-2xl font-black text-amber-700 dark:text-yellow-400 tracking-wide mb-2">
            {title}
          </h2>

          <p className="text-lg font-bold text-slate-700 dark:text-amber-200 mb-1">
            {championText}
          </p>

          <p className="text-slate-500 dark:text-amber-500 text-sm mb-6 uppercase tracking-widest">
            {subtitleText}
          </p>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-amber-600 border-2 border-amber-800 text-white
              dark:bg-yellow-600 dark:border-yellow-400 dark:text-black
              font-bold rounded-lg hover:bg-amber-500 dark:hover:bg-yellow-500
              cursor-pointer transition-all duration-200 text-base tracking-wide
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
