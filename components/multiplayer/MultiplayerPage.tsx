// components/multiplayer/MultiplayerPage.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import MultiplayerBoard from './MultiplayerBoard';
import { RoomSettings } from '@/utils/multiplayer/multiplayerTypes';

export default function MultiplayerPage({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const spectatorParam = searchParams.get('spectator');
  const isSpectator = spectatorParam === 'true';

  const timerEnabled = searchParams.get('timer') === '1';
  const pointSystem = (searchParams.get('points') ??
    'number') as RoomSettings['pointSystem'];
  const bestOfSeries = (searchParams.get('series') ??
    'off') as RoomSettings['bestOfSeries'];
  const allowSpectators = searchParams.get('allowSpectators') === '1';

  const initialSettings: RoomSettings | undefined =
    searchParams.get('timer') ||
    searchParams.get('points') ||
    searchParams.get('series') ||
    searchParams.get('allowSpectators')
      ? { timerEnabled, pointSystem, bestOfSeries, allowSpectators }
      : undefined; // joining players pass undefined — only host sends settings

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div
        className="bg-white/80 border-2 border-slate-300 dark:bg-amber-950/40
        dark:border-amber-800 rounded-2xl p-4 sm:p-8 w-full max-w-lg"
      >
        <MultiplayerBoard
          roomId={roomId}
          isSpectator={isSpectator}
          initialSettings={initialSettings}
        />
      </div>
    </main>
  );
}
