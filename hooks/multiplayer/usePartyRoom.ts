// hooks/multiplayer/usePartyRoom.ts

import { usePartySocket } from 'partysocket/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type RoomState,
  type ServerMessage,
  type ClientMessage,
  RoomSettings,
} from '@/utils/multiplayer/multiplayerTypes';
import { useSearchParams } from 'next/navigation';

export function usePartyRoom(
  roomId: string,
  initialSettings?: RoomSettings,
  profile?: { name: string; icon: string },
  onEmojiReaction?: (data: { emoji: string; isMe: boolean }) => void,
) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [gamePasswordMessage, setGamePasswordMessage] = useState<{
    message: string;
    attempt: number;
  } | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get('spectator') === 'true';

  const settingsSentRef = useRef(false);
  const profileSentRef = useRef(false);

  // Keep the latest callback in a ref so the socket's onMessage handler always
  // calls the current one without needing to re-subscribe.
  const onEmojiReactionRef = useRef(onEmojiReaction);
  useEffect(() => {
    onEmojiReactionRef.current = onEmojiReaction;
  }, [onEmojiReaction]);

  const socket = usePartySocket({
    // Check internal IP and put it into .env.local in testing
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999',
    room: roomId,
    query: { spectator: isSpectator ? 'true' : undefined },
    onOpen() {
      // Send settings only once, only if caller provided them (= host)
      if (initialSettings && !settingsSentRef.current) {
        settingsSentRef.current = true;
        const msg: ClientMessage = {
          type: 'init-settings',
          settings: initialSettings,
        };
        socket.send(JSON.stringify(msg));
      }
      if (profile && !profileSentRef.current) {
        profileSentRef.current = true;
        const msg: ClientMessage = {
          type: 'set-profile',
          name: profile.name,
          icon: profile.icon,
        };
        socket.send(JSON.stringify(msg));
      }
    },
    onMessage(e) {
      const msg = JSON.parse(e.data) as ServerMessage;
      if (msg.type === 'state-update') {
        setRoomState(msg.state);
        setOpponentDisconnected(false);
        setGamePasswordMessage(null); // password accepted (or not needed) -> drop the password input
      }
      if (msg.type === 'emoji-reaction') {
        onEmojiReactionRef.current?.({
          emoji: msg.emoji,
          isMe: msg.senderId === socket.id,
        });
      }
      if (msg.type === 'opponent-disconnected') {
        setOpponentDisconnected(true);
      }
      if (msg.type === 'error') {
        const message = msg.message;
        console.error(message);

        setErrorMessage(message);
        socket.close();
      }
      if (msg.type === 'info') {
        setInfoMessage(msg.message);
      }
      if (msg.type === 'game-password') {
        // attempt bumps on every message so the object identity changes and the
        // gamePasswordMessage useEffect fires again — without it, submitting the
        // same wrong password twice wouldn't re-trigger the "Invalid password!" toast
        setGamePasswordMessage((prev) => ({
          message: msg.message,
          attempt: (prev?.attempt ?? 0) + 1,
        }));
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

  const sendCancelRematch = useCallback(() => {
    const msg: ClientMessage = { type: 'cancel-request-rematch' };
    socket.send(JSON.stringify(msg));
  }, [socket]);

  const sendEmoji = useCallback(
    (emoji: string) => {
      const msg: ClientMessage = { type: 'send-emoji', emoji };
      socket.send(JSON.stringify(msg));
    },
    [socket],
  );

  const sendChat = useCallback(
    (text: string) => {
      const msg: ClientMessage = { type: 'send-chat', text };
      socket.send(JSON.stringify(msg));
    },
    [socket],
  );

  const sendGamePassword = useCallback(
    (password: string) => {
      const msg: ClientMessage = {
        type: 'game-password',
        password,
        name: profile?.name ?? 'Capt. Hook',
        icon: profile?.icon ?? '⚓',
      };
      socket.send(JSON.stringify(msg));
    },
    [socket, profile],
  );

  const myId = socket.id ?? '';

  // Derive my assigned player from room state
  const myPlayer = roomState?.players[myId]?.player ?? null;

  return {
    roomState,
    myPlayer,
    myId,
    opponentDisconnected,
    errorMessage,
    infoMessage,
    gamePasswordMessage,
    sendMove,
    sendRematch,
    sendCancelRematch,
    sendEmoji,
    sendChat,
    sendGamePassword,
  };
}
