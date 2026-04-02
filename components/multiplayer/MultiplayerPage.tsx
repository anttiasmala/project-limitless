// components/multiplayer/MultiplayerPage.tsx
'use client';

import MultiplayerBoard from './MultiplayerBoard';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function MultiplayerPage({ roomId }: { roomId: string }) {
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('isDarkTheme', true);

  return (
    <main
      className={`${
        isDarkTheme ? 'dark' : ''
      } min-h-screen flex items-center justify-center p-4`}
    >
      <div
        className="bg-white/80 border-2 border-slate-300 dark:bg-amber-950/40
        dark:border-amber-800 rounded-2xl p-4 sm:p-8 w-full max-w-lg"
      >
        <MultiplayerBoard
          roomId={roomId}
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
        />
      </div>
    </main>
  );
}
