// app/multiplayer/[roomid]/page.tsx

import MultiplayerPage from '@/components/multiplayer/MultiplayerPage';

export default async function MultiplayerRoom({
  params,
}: {
  params: Promise<{ roomid: string }>;
}) {
  const { roomid } = await params;
  return <MultiplayerPage roomId={roomid} />;
}
