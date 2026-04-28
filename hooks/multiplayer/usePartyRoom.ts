// hooks/multiplayer/usePartyRoom.ts

import { usePartySocket } from 'partysocket/react';
import { useState, useCallback } from 'react';
import type {
  RoomState,
  ServerMessage,
  ClientMessage,
} from '@/utils/multiplayer/multiplayerTypes';
import { useSearchParams } from 'next/navigation';

export function usePartyRoom(roomId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get('spectator') === 'true';

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999',
    room: roomId,
    query: { spectator: isSpectator ? 'true' : undefined },
    onMessage(e) {
      const msg = JSON.parse(e.data) as ServerMessage;
      if (msg.type === 'state-update') {
        setRoomState(msg.state);
        setOpponentDisconnected(false);
      }
      if (msg.type === 'opponent-disconnected') {
        setOpponentDisconnected(true);
      }
      if (msg.type === 'error') {
        const message = msg.message;
        console.error(message);
        if (message == 'Room is full') {
          setErrorMessage(message);
          socket.close();
        }
      }
    },
  });

  const sendMove = useCallback(
    (index: number) => {
      const msg: ClientMessage = { type: 'make-move', index };
      socket.send(JSON.stringify(msg));
    },
    [socket],
  );

  const sendRematch = useCallback(() => {
    const msg: ClientMessage = { type: 'request-rematch' };
    socket.send(JSON.stringify(msg));
  }, [socket]);

  const myId = socket.id ?? '';

  // Derive my assigned player from room state
  const myPlayer = roomState?.players[myId]?.player ?? null;

  return {
    roomState,
    myPlayer,
    myId,
    opponentDisconnected,
    errorMessage,
    sendMove,
    sendRematch,
  };
}
