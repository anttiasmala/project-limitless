'use client';
import GameContainer from '@/components/GameContainer';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function Home() {
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('isDarkTheme', true);

  return (
    <main
      className={`${
        isDarkTheme ? 'dark' : ''
      } min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0a0a1a] px-4`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#bae6fd_0%,#f1f5f9_70%)] dark:bg-[radial-gradient(ellipse_at_top,#1a3a5c_0%,#0a0a1a_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm sm:max-w-lg">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-amber-700 dark:text-yellow-400 drop-shadow-[0_0_20px_#facc15] tracking-widest mb-1">
            ☠️ PIRATE X&apos;s &amp; O&apos;s ☠️
          </h1>
          <p className="text-slate-500 dark:text-amber-400 text-sm tracking-widest uppercase">
            Claim the Seven Seas — Three in a Row!
          </p>
        </div>

        <GameContainer
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
        />

        <div className="text-slate-500 dark:text-amber-600 text-sm flex gap-6">
          <span>☠️ = Davy Jones</span>
          <span>⚓ = Captain Hook</span>
        </div>
      </div>
    </main>
  );
}
