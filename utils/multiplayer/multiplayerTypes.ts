// utils/multiplayer/multiplayerTypes.ts

import type { Board as BoardType, Player } from '@/lib/gameLogic';
import type { MoveEntry } from '../types';

export type RoomSettings = {
  timerEnabled: boolean;
  pointSystem: 'number' | 'treasureChest';
  bestOfSeries: 'off' | 'bo3' | 'bo5';
  allowSpectators: boolean;
};

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  timerEnabled: false,
  pointSystem: 'number',
  bestOfSeries: 'off',
  allowSpectators: true,
};

export type RoomPlayer = {
  id: string;
  player: Player;
  connected: boolean;
  wantsRematch: boolean;
};

export type RoomState = {
  board: BoardType;
  currentPlayer: Player;
  players: Record<string, RoomPlayer>;
  status: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  isDraw: boolean;
  scores: Record<Player, number>;
  bestOfSeriesScores: Record<Player, number>;
  seriesWinner?: Player;
  moveHistory: MoveEntry[];
  settings: RoomSettings;
  timerEndsAt: number | null;
  forfeitWinner: Player | null;
};

export type ClientMessage =
  | { type: 'make-move'; index: number }
  | { type: 'request-rematch' }
  | { type: 'init-settings'; settings: RoomSettings };

export type ServerMessage =
  | { type: 'state-update'; state: RoomState }
  | { type: 'opponent-disconnected' }
  | { type: 'error'; message: string };

export type LobbyEntry = {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  connectedCount: number;
  allowSpectators: boolean;
};
