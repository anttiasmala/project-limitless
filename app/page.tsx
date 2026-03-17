import GameContainer from '@/components/GameContainer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a1a] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1a3a5c_0%,#0a0a1a_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_#facc15] tracking-widest mb-1">
            ☠️ PIRATE X&apos;s &amp; O&apos;s ☠️
          </h1>
          <p className="text-amber-400 text-sm tracking-widest uppercase">
            Claim the Seven Seas — Three in a Row!
          </p>
        </div>

        <GameContainer />

        <div className="text-amber-600 text-sm flex gap-6">
          <span>☠️ = Davy Jones</span>
          <span>⚓ = Captain Hook</span>
        </div>
      </div>
    </main>
  );
}
