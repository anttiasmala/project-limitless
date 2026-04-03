import type { Board as BoardType, Player } from '@/lib/gameLogic';
import type { MoveEntry } from '../types';

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
  moveHistory: MoveEntry[];
};

export type ClientMessage =
  | { type: 'make-move'; index: number }
  | { type: 'request-rematch' };

export type ServerMessage =
  | { type: 'state-update'; state: RoomState }
  | { type: 'opponent-disconnected' }
  | { type: 'error'; message: string };

export type LobbyEntry = {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  connectedCount: number;
};
