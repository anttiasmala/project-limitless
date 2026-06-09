// utils/multiplayer/multiplayerTypes.ts

import type { Board as BoardType, Player } from '@/lib/gameLogic';
import type { MoveEntry } from '../types';

export type RoomSettings = {
  timerEnabled: boolean;
  timerDuration: number;
  bestOfSeries: 'off' | 'bo3' | 'bo5';
  boardSize: '3' | '5' | '10';
  victoriesForAction: number;
  allowSpectators: boolean;
  isPrivateGame: boolean;
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
};

export type ClientMessage =
  | { type: 'make-move'; index: number }
  | { type: 'request-rematch' }
  | { type: 'cancel-request-rematch' }
  | { type: 'init-settings'; settings: RoomSettings }
  | { type: 'set-profile'; name: string; icon: string };

export type ServerMessage =
  | { type: 'state-update'; state: RoomState }
  | { type: 'opponent-disconnected' }
  | { type: 'error'; message: string };

export type LobbyEntry = {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  connectedCount: number;
  allowSpectators: boolean;
  isPrivateGame: boolean;
};
