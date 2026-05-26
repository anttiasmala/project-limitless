'use client';

import GameOverModal from './utils/GameOverModal';

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
  if (!outcome) return null;

  const isWin = outcome === 'champion';
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

  return (
    <GameOverModal
      open
      variant={isWin ? 'win' : 'loss'}
      ariaLabel="Tournament result"
      trophy={isWin ? '🏆' : '💀'}
      confetti={isWin ? CHAMPION_CONFETTI : DEFEAT_CONFETTI}
      title={title}
      body={
        <p className="text-slate-600 dark:text-amber-200 text-sm mb-6">
          {subtitle}
        </p>
      }
      primary={{ label: '🏴‍☠️ New Tournament', onClick: onRestart }}
      secondary={{ label: 'Leave Tournament', onClick: onExit }}
    />
  );
}
