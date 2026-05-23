'use client';

import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { createPortal } from 'react-dom';
import Button from './utils/Button';

type Outcome = 'champion' | 'eliminated';

type Props = {
  outcome: Outcome | null;
  defeatedAtFinal: boolean;
  onRestart: () => void;
  onExit: () => void;
};

const CHAMPION_CONFETTI = ['🏴‍☠️', '🏆', '💰', '🌊', '⭐️', '⚓'];
const DEFEAT_CONFETTI = ['💀', '🌊', '🪦', '🦑', '🌑', '⚓'];

export default function TournamentResultModal({
  outcome,
  defeatedAtFinal,
  onRestart,
  onExit,
}: Props) {
  usePreventBackgroundScrolling(outcome !== null);
  if (!outcome) return null;

  const isWin = outcome === 'champion';
  const confetti = isWin ? CHAMPION_CONFETTI : DEFEAT_CONFETTI;
  const trophy = isWin ? '🏆' : '💀';
  const title = isWin
    ? 'Tournament Champion!'
    : defeatedAtFinal
    ? 'Runner-Up'
    : 'Eliminated!';
  const subtitle = isWin
    ? 'You crushed the entire bracket. The seas are yours!'
    : defeatedAtFinal
    ? 'So close — you reached the final, but the seas had another captain.'
    : 'Your voyage ends in the semifinals. The kraken claims another soul.';

  return createPortal(
    <div>
      <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tournament result"
        className="fixed inset-0 z-101 flex items-center justify-center p-4"
      >
        <div
          className={`relative bg-white dark:bg-[#1a0a00] border-4 rounded-2xl p-8 max-w-sm w-full text-center ${
            isWin
              ? 'border-amber-500 dark:border-yellow-500 shadow-[0_0_60px_#facc15]'
              : 'border-slate-500 dark:border-blue-900 shadow-[0_0_60px_#1e3a5f]'
          }`}
        >
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
          <p className="text-slate-600 dark:text-amber-200 text-sm mb-6">
            {subtitle}
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="gold"
              onClick={onRestart}
              className="text-base tracking-wide dark:bg-yellow-600 dark:border-yellow-400 dark:text-black dark:hover:bg-yellow-500 focus-visible:ring-4"
            >
              🏴‍☠️ New Tournament
            </Button>
            <Button
              variant="unstyled"
              onClick={onExit}
              className="px-4 py-2 border-2 bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400 dark:hover:border-amber-600 text-sm"
            >
              Leave Tournament
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
