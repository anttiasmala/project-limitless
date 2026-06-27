// app/tictactoe/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import GameContainer from '@/components/tictactoe/GameContainer';
import SharedReplayLoader from '@/components/tictactoe/share/SharedReplayLoader';

export const metadata: Metadata = {
  title: 'Pirate Tic-Tac-Toe',
  description: 'Claim the seas — three in a row!',
};

export default function TicTacToe() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 dark:bg-[#0a0a1a]">
      {/* Opens a shared game's ReplayModal when arriving via a ?replay= link. */}
      <Suspense fallback={null}>
        <SharedReplayLoader />
      </Suspense>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#bae6fd_0%,#f1f5f9_70%)] dark:bg-[radial-gradient(ellipse_at_top,#1a3a5c_0%,#0a0a1a_70%)]" />

      {/* Back to the arcade landing page */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:text-yellow-300"
      >
        ← Home
      </Link>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 sm:max-w-lg">
        <div className="text-center">
          <h1 className="mb-1 text-3xl font-black tracking-widest text-amber-700 drop-shadow-[0_0_20px_#facc15] sm:text-5xl dark:text-yellow-400">
            ☠️ PIRATE X&apos;s &amp; O&apos;s ☠️
          </h1>
          <p className="text-sm tracking-widest text-slate-500 uppercase dark:text-amber-400">
            Claim the Seven Seas — Let&apos;s Tic-tac-toe!
          </p>
        </div>

        {/* Board reads ?replay=/search params, so it needs a Suspense boundary. */}
        <Suspense fallback={null}>
          <GameContainer />
        </Suspense>

        <div className="flex gap-6 text-sm text-slate-500 dark:text-amber-600">
          <span>☠️ = Davy Jones</span>
          <span>⚓ = Captain Hook</span>
        </div>
      </div>
    </main>
  );
}
