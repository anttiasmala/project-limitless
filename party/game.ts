// party/game.ts

// @backend — PartyKit backend

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

import {
  type RoomState,
  type ClientMessage,
  type ServerMessage,
  DEFAULT_ROOM_SETTINGS,
} from '@/utils/multiplayer/multiplayerTypes';

const SERIES_POINT_THRESHOLDS = { bo3: 2, bo5: 3, off: Infinity } as const;

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
    bestOfSeriesScores: { ...INITIAL_SCORE },
    moveHistory: [],
    settings: { ...DEFAULT_ROOM_SETTINGS },
    timerEndsAt: null,
    forfeitWinner: null,
  };
}

export default class GameRoom implements Party.Server {
  state: RoomState;

  constructor(readonly room: Party.Room) {
    this.state = makeInitialState();
  }

  private timerHandle: ReturnType<typeof setTimeout> | null = null;

  startTurnTimer() {
    this.clearTurnTimer();
    if (!this.state.settings.timerEnabled) return;

    this.state.timerEndsAt = Date.now() + 10000;

    this.timerHandle = setTimeout(async () => {
      if (this.state.status !== 'playing') return;

      const loser = this.state.currentPlayer;
      const opponent = loser === HUMAN ? AI : HUMAN;

      if (this.state.scores[opponent] >= 4) {
        const { bestOfSeries } = this.state.settings;
        this.state.bestOfSeriesScores[opponent] += 1;
        if (
          bestOfSeries !== 'off' &&
          this.state.bestOfSeriesScores[opponent] >=
            SERIES_POINT_THRESHOLDS[bestOfSeries]
        ) {
          this.state.seriesWinner = opponent;
        }
      }

      this.state.scores[opponent] += 1;
      this.state.winner = null;
      this.state.isDraw = false;
      this.state.timerEndsAt = null;
      this.state.status = 'finished';
      this.state.forfeitWinner = opponent;

      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }, 10000);
  }

  clearTurnTimer() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
    this.state.timerEndsAt = null;
  }

  resetBoard() {
    this.state.board = [...INITIAL_BOARD];
    this.state.winner = null;
    this.state.isDraw = false;
    this.state.moveHistory = [];
    Object.values(this.state.players).forEach((p) => {
      p.wantsRematch = false;
    });
  }

  clearBoard() {
    // Reset board but keep scores and players
    this.resetBoard();
    this.state.currentPlayer = this.state.currentPlayer === HUMAN ? AI : HUMAN;
    this.state.status = 'playing';
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
          allowSpectators: this.state.settings.allowSpectators,
          isPrivateGame: this.state.settings.isPrivateGame,
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

      if (isSpectator && this.state.settings.allowSpectators === false) {
        this.sendTo(conn, {
          type: 'error',
          message: '👁️ Spectators are not allowed in this room.',
        });
        conn.close();
        return;
      }

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
          name: assignedPlayer === HUMAN ? 'Davy Jones' : 'Capt. Hook',
          icon: assignedPlayer === HUMAN ? '☠️' : '⚓',
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
      this.resetBoard();
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
      // clear the board
      this.resetBoard();

      // One player left — notify them
      this.state.status = 'waiting';
      this.clearTurnTimer();
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

    if (msg.type === 'set-profile') {
      const trimmed = msg.name.trim().slice(0, 20);
      if (trimmed) this.state.players[sender.id].name = trimmed;
      if (msg.icon) this.state.players[sender.id].icon = msg.icon;
      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
      return;
    }

    if (msg.type === 'init-settings') {
      // Only the host (first connected player) can set settings,
      // and only before the game starts
      const connectedPlayers = Object.values(this.state.players).filter(
        (p) => p.connected,
      );
      const isHost = connectedPlayers[0]?.id === sender.id;
      const isBeforeGame = this.state.status === 'waiting';

      if (isHost && isBeforeGame) {
        // These comments below are used in development, will be deleted when not needed anymore
        //this.state.scores = { '☠️': 4, '⚓': 0 };
        //this.state.bestOfSeriesScores = { '☠️': 1, '⚓': 0 };

        this.state.settings = msg.settings;
        await this.saveAndBroadcast({
          type: 'state-update',
          state: this.state,
        });
      }
      return;
    }

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

      const { bestOfSeries } = this.state.settings;
      const seriesWinTarget = SERIES_POINT_THRESHOLDS[bestOfSeries];

      if (winner) {
        // >= 4 is correct, because increment happens after the check
        if (this.state.scores[winner] >= 4) {
          this.state.bestOfSeriesScores[winner] += 1;
          if (
            bestOfSeries !== 'off' &&
            this.state.bestOfSeriesScores[winner] >= seriesWinTarget
          ) {
            this.state.seriesWinner = winner;
          }

          this.state.scores[winner] += 1;
          this.state.winner = winner;
          this.state.status = 'finished';

          this.clearTurnTimer();
          await this.saveAndBroadcast({
            type: 'state-update',
            state: this.state,
          });

          return;
        }

        this.state.winner = winner;
        this.state.status = 'finished';
        this.state.scores[winner] += 1;
        this.clearTurnTimer();
      } else if (draw) {
        this.state.isDraw = true;
        this.state.status = 'finished';
        this.clearTurnTimer();
      } else {
        // Flip turn
        this.state.currentPlayer =
          this.state.currentPlayer === HUMAN ? AI : HUMAN;
        this.startTurnTimer();
      }

      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }

    if (msg.type === 'request-rematch') {
      this.state.players[sender.id].wantsRematch = true;
      const allWantRematch = Object.values(this.state.players)
        .filter((p) => p.connected)
        .every((p) => p.wantsRematch);

      if (allWantRematch) {
        const _winner = this.state.winner ?? this.state.forfeitWinner;
        // Reset round scores after a series point was earned
        if (_winner && this.state.scores[_winner] >= 5) {
          this.state.scores = { ...INITIAL_SCORE };
        }

        // Reset series scores if series is complete
        if (
          _winner &&
          this.state.bestOfSeriesScores[_winner] >=
            SERIES_POINT_THRESHOLDS[this.state.settings.bestOfSeries]
        ) {
          this.state.bestOfSeriesScores = { ...INITIAL_SCORE };
        }
        // Reset possible forfeit winner, there is not a winner anymore
        this.state.forfeitWinner = null;
        // Reset series winner, there is not a winner anymore
        this.state.seriesWinner = undefined;
        // Reset board but keep scores and players
        this.clearBoard();
        this.startTurnTimer();
      }

      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }
  }
}

GameRoom satisfies Party.Worker;
