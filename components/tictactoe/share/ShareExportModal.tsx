'use client';

import { ReactNode, Ref, useState } from 'react';
import Button from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';

type ShareTab = 'replay' | 'image' | 'game';

type Props = {
  open: boolean;
  onClose: () => void;

  // --- Replay / Game tabs ---
  // The encoded game payload that the share URLs are built around. Empty string
  // shows a "generating…" placeholder.
  encodedGame: string;

  // --- Image tab ---
  // The card you want rendered into an image. Attach `cardRef` to its root so
  // your html2canvas / dom-to-image call can target it.
  cardRef?: Ref<HTMLDivElement>;
  cardContent: ReactNode;
  onDownloadImage: () => void;
  onCopyImage?: () => void;
  // Set true while an image is being generated to disable the buttons.
  imageBusy?: boolean;
};

const TABS: { id: ShareTab; label: string; icon: string }[] = [
  { id: 'replay', label: 'Replay', icon: '🔗' },
  { id: 'image', label: 'Image', icon: '🖼️' },
  { id: 'game', label: 'Game', icon: '🎮' },
];

export default function ShareExportModal({
  open,
  onClose,
  encodedGame,
  cardRef,
  cardContent,
  onDownloadImage,
  onCopyImage,
  imageBusy = false,
}: Props) {
  const [tab, setTab] = useState<ShareTab>('replay');
  const [copied, setCopied] = useState(false);

  const locationOrigin =
    typeof window === 'undefined' ? '' : window.location.origin;

  const handleCopyLink = (replayOrGame: 'replay' | 'game') => {
    navigator.clipboard.writeText(
      `${locationOrigin}/?${replayOrGame}=${encodedGame}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel="Share or export game"
      overlayClassName="bg-black/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl border-4 border-amber-500 bg-white p-6 text-center shadow-[0_0_60px_#92400e] dark:border-yellow-500 dark:bg-[#1a0a00]">
        {/* Close (X) */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 h-10 w-10 rounded-full text-lg leading-none text-slate-600 hover:bg-amber-200 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300 dark:hover:bg-amber-900 dark:hover:text-red-400"
        >
          ✕
        </Button>

        <p className="mb-2 text-4xl">🏴‍☠️</p>
        <h2 className="mb-1 text-2xl font-black tracking-wide text-amber-700 dark:text-yellow-400">
          Share yer Battle
        </h2>
        <p className="mb-5 text-sm text-slate-500 dark:text-amber-200/60">
          Send the link or save the game as an image.
        </p>

        {/* Segmented tab control */}
        <div className="mb-5 flex gap-1 rounded-xl border-2 border-amber-200 bg-amber-50 p-1 dark:border-amber-900/60 dark:bg-amber-950/40">
          {TABS.map(({ id, label, icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-pressed={active}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-amber-600 text-white shadow dark:bg-amber-700 dark:text-yellow-300'
                    : 'text-slate-500 hover:text-amber-700 dark:text-amber-200/60 dark:hover:text-yellow-400'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>

        {/* ---- Replay tab ---- */}
        {tab === 'replay' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-stretch gap-2">
              <input
                readOnly
                value={`${locationOrigin}/?replay=${encodedGame}`}
                placeholder="Generating link…"
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-lg border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-amber-500 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
              />
              <Button
                variant={copied ? 'gold' : 'neutral'}
                size="md"
                onClick={() => handleCopyLink('replay')}
                disabled={!encodedGame}
                className="shrink-0"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </Button>
            </div>

            <p className="text-xs text-slate-400 dark:text-amber-200/40">
              Anyone with this link can replay the game.
            </p>
          </div>
        )}

        {/* ---- Image tab ---- */}
        {tab === 'image' && (
          <div className="flex flex-col gap-4">
            {/* The export target. Attach cardRef and render the game card here. */}
            <div className="overflow-hidden rounded-xl border-2 border-amber-200 bg-amber-50 p-1 dark:border-amber-900/60 dark:bg-amber-950/40">
              <div
                ref={cardRef}
                className="rounded-lg bg-linear-to-br from-amber-50 to-orange-100 p-4 dark:from-[#241000] dark:to-[#1a0a00]"
              >
                {cardContent}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="gold"
                size="md"
                onClick={onDownloadImage}
                disabled={imageBusy}
                className="flex-1"
              >
                {imageBusy ? 'Preparing…' : '⬇ Download'}
              </Button>
              {onCopyImage && (
                <Button
                  variant="neutral"
                  size="md"
                  onClick={onCopyImage}
                  disabled={imageBusy}
                  className="flex-1"
                >
                  📋 Copy image
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ---- Game tab ---- */}
        {tab === 'game' && (
          <div className="flex flex-col gap-4">
            {/* Visual preview of the position being handed off (no cardRef —
                only the Image tab exports an image). */}
            <div className="overflow-hidden rounded-xl border-2 border-amber-200 bg-amber-50 p-1 dark:border-amber-900/60 dark:bg-amber-950/40">
              <div className="rounded-lg bg-linear-to-br from-amber-50 to-orange-100 p-4 dark:from-[#241000] dark:to-[#1a0a00]">
                {cardContent}
              </div>
            </div>

            <div className="flex items-stretch gap-2">
              <input
                readOnly
                value={`${locationOrigin}/?game=${encodedGame}`}
                placeholder="Generating link…"
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-lg border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-amber-500 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
              />
              <Button
                variant={copied ? 'gold' : 'neutral'}
                size="md"
                onClick={() => handleCopyLink('game')}
                disabled={!encodedGame}
                className="shrink-0"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </Button>
            </div>

            <p className="text-xs text-slate-400 dark:text-amber-200/40">
              Anyone with this link can pick up this position and play it out.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
