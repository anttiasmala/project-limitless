'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import Button from './Button';
import WinConfetti from './WinConfetti';

export type GameOverVariant = 'win' | 'loss' | 'neutral';

type Action = { label: ReactNode; onClick: () => void };

type Props = {
  open: boolean;
  variant: GameOverVariant;
  ariaLabel: string;
  trophy: string;
  confetti: readonly string[];
  title: string;
  // Body content beneath the title — typically the "you/they conquered" line
  // plus a subtitle. Passed as ReactNode so each consumer controls layout.
  body: ReactNode;
  primary: Action;
  secondary?: Action;
};

const FRAME_CLASSES: Record<GameOverVariant, string> = {
  win: 'border-amber-500 dark:border-yellow-500 shadow-[0_0_60px_#facc15]',
  loss: 'border-slate-500 dark:border-blue-900 shadow-[0_0_60px_#1e3a5f]',
  neutral: 'border-amber-400 dark:border-amber-600 shadow-[0_0_60px_#92400e]',
};

export default function GameOverModal({
  open,
  variant,
  ariaLabel,
  trophy,
  confetti,
  title,
  body,
  primary,
  secondary,
}: Props) {
  usePreventBackgroundScrolling(open);
  if (!open) return null;

  return createPortal(
    <div>
      {/* Win-only celebration burst, layered above the modal card. */}
      {variant === 'win' && <WinConfetti />}
      <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="fixed inset-0 z-101 flex items-center justify-center p-4"
      >
        <div
          className={`relative w-full max-w-sm rounded-2xl border-4 bg-white p-8 text-center dark:bg-[#1a0a00] ${FRAME_CLASSES[variant]}`}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            {confetti.map((emoji, i) => (
              <span
                key={i}
                className="absolute animate-bounce text-2xl"
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

          <p className="mb-4 text-5xl">{trophy}</p>
          <h2 className="mb-2 text-2xl font-black tracking-wide text-amber-700 dark:text-yellow-400">
            {title}
          </h2>
          {body}
          <div className="mt-2 flex flex-col gap-2">
            <Button
              variant="gold"
              onClick={primary.onClick}
              className="text-base tracking-wide focus-visible:ring-4 dark:border-yellow-400 dark:bg-yellow-600 dark:text-black dark:hover:bg-yellow-500"
            >
              {primary.label}
            </Button>
            {secondary && (
              <Button
                variant="unstyled"
                onClick={secondary.onClick}
                className="border-2 border-slate-400 bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:border-amber-600"
              >
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
