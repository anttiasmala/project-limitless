// hooks/multiplayer/usePartyRoom.ts

import { usePartySocket } from 'partysocket/react';
import { useState, useCallback } from 'react';
import type {
  RoomState,
  ServerMessage,
  ClientMessage,
} from '@/utils/multiplayer/multiplayerTypes';

export function usePartyRoom(roomId: string) {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const socket = usePartySocket({
    host: 'localhost:1999',
    room: roomId,
    onOpen() {
      // Socket id is available on the underlying WebSocket
    },
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
          setIsError(true);
          setErrorMessage(message);
        }
      }
    },
    onClose() {
      console.log('Socket closed');
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

  const myId = roomState
    ? Object.values(roomState.players).find((p) => {
        // partysocket exposes socket.id
        return p.id === socket.id;
      })?.id ?? ''
    : '';
  // Derive my assigned player from room state
  const myPlayer = roomState?.players[myId]?.player ?? null;

  return {
    roomState,
    myPlayer,
    myId,
    opponentDisconnected,
    isError,
    errorMessage,
    sendMove,
    sendRematch,
  };
}
