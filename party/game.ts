// party/game.ts

import type * as Party from 'partykit/server';
import {
  Board as BoardType,
  Player,
  calculateWinner,
  isDraw,
  INITIAL_SCORE,
  AI,
  HUMAN,
} from '@/lib/gameLogic';

import type {
  RoomState,
  ClientMessage,
  ServerMessage,
} from '@/utils/multiplayer/multiplayerTypes';
const INITIAL_BOARD: BoardType = Array(9).fill(null);

function makeInitialState(): RoomState {
  return {
    board: [...INITIAL_BOARD],
    currentPlayer: HUMAN,
    players: {},
    status: 'waiting',
    winner: null,
    isDraw: false,
    scores: { ...INITIAL_SCORE },
    moveHistory: [],
  };
}

export default class GameRoom implements Party.Server {
  state: RoomState;

  constructor(readonly room: Party.Room) {
    this.state = makeInitialState();
  }

  clearBoard() {
    // Reset board but keep scores and players
    this.state.board = [...INITIAL_BOARD];
    this.state.currentPlayer = this.state.currentPlayer === HUMAN ? AI : HUMAN;
    this.state.winner = null;
    this.state.isDraw = false;
    this.state.status = 'playing';
    this.state.moveHistory = [];
    Object.values(this.state.players).forEach((p) => {
      p.wantsRematch = false;
    });
  }

  save() {
    this.room.storage.put('state', this.state);
  }

  broadcast(msg: ServerMessage, exclude?: string[]) {
    this.room.broadcast(JSON.stringify(msg), exclude);
  }

  sendTo(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  async saveAndBroadcast(msg: ServerMessage) {
    this.save();
    await this.updateLobby();
    this.broadcast(msg);
  }

  async updateLobby() {
    try {
      const connectedCount = Object.values(this.state.players).filter(
        (p) => p.connected,
      ).length;

      await this.room.context.parties.lobby.get('main').fetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.room.id,
          status: this.state.status,
          connectedCount,
        }),
      });
    } catch (e) {
      console.warn('Lobby update failed:', e);
    }
  }

  async onStart() {
    const saved = await this.room.storage.get<RoomState>('state');
    if (saved) {
      saved.players = {};
      this.state = saved;
    }
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    try {
      console.log(
        `Connected:
         id: ${conn.id}
         room: ${this.room.id}
         url: ${new URL(ctx.request.url).pathname}`,
      );
      const url = new URL(ctx.request.url);
      const isSpectator = url.searchParams.get('spectator') === 'true';

      if (!isSpectator) {
        const connectedPlayers = Object.values(this.state.players).filter(
          (p) => p.connected,
        );

        // Room is full
        if (connectedPlayers.length >= 2) {
          this.sendTo(conn, { type: 'error', message: 'Room is full' });
          conn.close();
          return;
        }

        // Assign player slot — first gets ☠️, second gets ⚓
        const takenSlots = Object.values(this.state.players).map(
          (p) => p.player,
        );

        const assignedPlayer: Player = takenSlots.includes(HUMAN) ? AI : HUMAN;

        this.state.players[conn.id] = {
          id: conn.id,
          player: assignedPlayer,
          connected: true,
          wantsRematch: false,
        };
        if (
          Object.values(this.state.players).filter((p) => p.connected)
            .length === 2
        ) {
          this.state.status = 'playing';
        }
      }
      this.sendTo(conn, { type: 'state-update', state: this.state });
      if (!isSpectator) {
        this.save();
        await this.updateLobby();
        this.broadcast({ type: 'state-update', state: this.state }, [conn.id]); // exclude joiner
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onClose(conn: Party.Connection) {
    if (!this.state.players[conn.id]) return;

    delete this.state.players[conn.id];

    const stillConnected = Object.values(this.state.players).filter(
      (p) => p.connected,
    );

    if (stillConnected.length === 1 && this.state.status === 'finished') {
      // Reset game, but keep players and score
      this.clearBoard();
      this.state.status = 'waiting';
      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
      return;
    }

    if (stillConnected.length === 0) {
      // Both gone — reset fully
      this.state = makeInitialState();
      this.save();
      await this.updateLobby();
    } else if (stillConnected.length === 1) {
      // One player left — notify them

      this.state.status = 'waiting';
      this.broadcast({ type: 'opponent-disconnected' });
      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      return;
    }
    const senderPlayer = this.state.players[sender.id];
    if (!senderPlayer) return;

    if (msg.type === 'make-move') {
      if (this.state.status !== 'playing') return;
      if (senderPlayer.player !== this.state.currentPlayer) return;
      if (this.state.board[msg.index] !== null) return;

      const newBoard = [...this.state.board] as BoardType;
      newBoard[msg.index] = senderPlayer.player;
      this.state.board = newBoard;
      this.state.moveHistory = [
        ...this.state.moveHistory,
        {
          turn: this.state.moveHistory.length + 1,
          player: senderPlayer.player,
          index: msg.index,
        },
      ];

      const { winner } = calculateWinner(newBoard);
      const draw = !winner && isDraw(newBoard);

      if (winner) {
        this.state.winner = winner;
        this.state.status = 'finished';
        this.state.scores[winner] += 1;
      } else if (draw) {
        this.state.isDraw = true;
        this.state.status = 'finished';
      } else {
        // Flip turn
        this.state.currentPlayer =
          this.state.currentPlayer === HUMAN ? AI : HUMAN;
      }

      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }

    if (msg.type === 'request-rematch') {
      this.state.players[sender.id].wantsRematch = true;
      const allWantRematch = Object.values(this.state.players)
        .filter((p) => p.connected)
        .every((p) => p.wantsRematch);

      if (allWantRematch) {
        // Reset board but keep scores and players
        this.clearBoard();
      }

      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }
  }
}

GameRoom satisfies Party.Worker;
