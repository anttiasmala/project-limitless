// components/share/SharedReplayLoader.tsx
//
// Reads a shared game out of the `?replay=` URL param and auto-opens the
// existing ReplayModal over the home page. Closing it strips the param, leaving
// the recipient on a fresh, playable board.

'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { decodeGame } from '@/lib/shareGame';
import ReplayModal from '../ReplayModal';

// Never resubscribes; the snapshot is constant per environment.
const externalStoreSubscribe = () => () => {};

export default function SharedReplayLoader() {
  const params = useSearchParams();
  const router = useRouter();

  // ReplayModal portals into document.body, which doesn't exist during SSR.
  // useSyncExternalStore returns the server snapshot (false) on the server and
  // during hydration, then the client snapshot (true) — no effect, no mismatch.
  const isClient = useSyncExternalStore(
    externalStoreSubscribe,
    () => true,
    () => false,
  );

  const encoded = params.get('replay');
  const game = useMemo(() => (encoded ? decodeGame(encoded) : null), [encoded]);

  if (!isClient || !game) return null;

  return (
    <ReplayModal
      onClose={() => router.replace('/')}
      moveHistory={game.moveHistory}
      boardSize={game.boardSize}
      playerIcons={game.playerIcons}
    />
  );
}
