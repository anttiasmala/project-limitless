// components/multiplayer/MultiplayerPage.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import MultiplayerBoard from './MultiplayerBoard';
import { RoomSettings } from '@/utils/multiplayer/multiplayerTypes';
import OceanBackground from '../OceanBackground';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEffect, useState } from 'react';

export default function MultiplayerPage({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const spectatorParam = searchParams.get('spectator');
  const isSpectator = spectatorParam === 'true';

  const timerEnabled = searchParams.get('timer') === '1';
  const timerDuration = Number(searchParams.get('timerDuration')) || 10;
  const bestOfSeries = (searchParams.get('series') ??
    'off') as RoomSettings['bestOfSeries'];
  const allowSpectators = searchParams.get('allowSpectators') === '1';
  const isPrivateGame = searchParams.get('isPrivateGame') === '1';
  const boardSize = (searchParams.get('boardSize') ??
    '3') as RoomSettings['boardSize'];
  // ?? (not ||) so an intentional 0 (unlimited) survives instead of falling back to 5
  const victoriesForAction = Number(searchParams.get('victories') ?? 5);

  // reads sessionStorage exactly once, on the first render, and keeps the value
  // before this, the password was lost during re-renders and sessionStorage was deleted -> password was undefined
  const [password] = useState(() =>
    typeof window !== 'undefined'
      ? (sessionStorage.getItem(`room-password:${roomId}`) ?? undefined)
      : undefined,
  );

  useEffect(() => {
    sessionStorage.removeItem(`room-password:${roomId}`);
  }, [roomId]);

  const initialSettings: RoomSettings | undefined =
    searchParams.get('timer') ||
    searchParams.get('timerDuration') ||
    searchParams.get('series') ||
    searchParams.get('allowSpectators') ||
    searchParams.get('isPrivateGame') ||
    searchParams.get('boardSize') ||
    searchParams.get('victories')
      ? {
          timerEnabled,
          timerDuration,
          bestOfSeries,
          allowSpectators,
          isPrivateGame,
          boardSize,
          victoriesForAction,
          password,
        }
      : undefined; // joining players pass undefined — only host sends settings

  const [isDarkTheme] = useLocalStorage('isDarkTheme', true);

  return (
    <>
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border-2 border-slate-300 bg-white/80 p-4 sm:p-8 dark:border-amber-800 dark:bg-amber-950/40">
          <MultiplayerBoard
            roomId={roomId}
            isSpectator={isSpectator}
            initialSettings={initialSettings}
          />
        </div>
      </main>
      <OceanBackground isDarkTheme={isDarkTheme} stormLevel={0} />
    </>
  );
}
