import Lobby from '@/components/multiplayer/Lobby';

export default async function MultiplayerPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div
        className="bg-white/80 border-2 border-slate-300 dark:bg-amber-950/40
        dark:border-amber-800 rounded-2xl p-4 sm:p-8 w-full max-w-lg"
      >
        <Lobby />
      </div>
    </main>
  );
}
