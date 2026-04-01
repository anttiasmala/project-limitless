import MultiplayerBoard from '@/components/multiplayer/MultiplayerBoard';

export default async function MultiplayerPage({
  params,
}: {
  params: Promise<{ roomid: string }>;
}) {
  const { roomid } = await params;
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div
        className="bg-white/80 border-2 border-slate-300 dark:bg-amber-950/40
        dark:border-amber-800 rounded-2xl p-4 sm:p-8 w-full max-w-lg"
      >
        <MultiplayerBoard roomId={roomid} />
      </div>
    </main>
  );
}
