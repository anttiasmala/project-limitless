// utils/multiplayer/multiplayerTypes.ts

import type { Board as BoardType, Player } from '@/lib/tictactoe/gameLogic';
import type { MoveEntry } from '../types';

// Messages carried by the `game-password` channel. Shared between the server
// (party/game.ts) and the client so the password UI can match on them without
// duplicating string literals that could drift out of sync.
export const GAME_PASSWORD_MESSAGES = {
  required: 'Password required!',
  invalid: 'Invalid password!',
} as const;

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderIcon: string;
  /** Plain text or a single emoji — emojis are sent as ordinary messages. */
  text: string;
  sentAt: number;
};

export type RoomSettings = {
  timerEnabled: boolean;
  timerDuration: number;
  bestOfSeries: 'off' | 'bo3' | 'bo5';
  boardSize: '3' | '5' | '10';
  victoriesForAction: number;
  allowSpectators: boolean;
  isPrivateGame: boolean;
  // password set to optional for now, otherwise MultiplayerPage's initialSettings require password
  password?: string;
};

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  timerEnabled: false,
  timerDuration: 10,
  bestOfSeries: 'off',
  boardSize: '3',
  victoriesForAction: 5,
  allowSpectators: true,
  isPrivateGame: false,
};

export type RoomPlayer = {
  id: string;
  player: Player;
  connected: boolean;
  wantsRematch: boolean;
  name: string;
  icon: string;
};

export type RoomState = {
  board: BoardType;
  currentPlayer: Player;
  players: Record<string, RoomPlayer>;
  status: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  winStreak: Record<Player, number>;
  winStreakPlayer: Player | null;
  isDraw: boolean;
  scores: Record<Player, number>;
  bestOfSeriesScores: Record<Player, number>;
  seriesWinner?: Player;
  moveHistory: MoveEntry[];
  settings: RoomSettings;
  timerEndsAt: number | null;
  forfeitWinner: Player | null;
  chatHistory: ChatMessage[];
};

export type ClientMessage =
  | { type: 'make-move'; index: number }
  | { type: 'request-rematch' }
  | { type: 'cancel-request-rematch' }
  | { type: 'init-settings'; settings: RoomSettings }
  | { type: 'set-profile'; name: string; icon: string }
  | { type: 'send-emoji'; emoji: string }
  | { type: 'send-chat'; text: string }
  | {
      type: 'game-password';
      password: string;
      name: string;
      icon: string;
    };

export type ServerMessage =
  | { type: 'state-update'; state: RoomState }
  | { type: 'emoji-reaction'; emoji: string; senderId: string }
  | { type: 'opponent-disconnected' }
  | { type: 'error'; message: string }
  | { type: 'info'; message: string }
  | { type: 'game-password'; message: string };

export type LobbyEntry = {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  connectedCount: number;
  allowSpectators: boolean;
  isPrivateGame: boolean;
};
