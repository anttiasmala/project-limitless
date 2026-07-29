// party/game.ts

// @backend — PartyServer backend

import {
  Server,
  type Connection,
  type ConnectionContext,
  type WSMessage,
  getServerByName,
} from 'partyserver';
import {
  Board as BoardType,
  Player,
  calculateWinner,
  isDraw,
  INITIAL_SCORE,
  AI,
  HUMAN,
  calculateWinner5,
  calculateWinner10,
} from '@/lib/tictactoe/gameLogic';

import {
  type RoomState,
  type RoomSettings,
  type ClientMessage,
  type ServerMessage,
  DEFAULT_ROOM_SETTINGS,
  GAME_PASSWORD_MESSAGES,
} from '@/utils/tictactoe/multiplayer/multiplayerTypes';

const SERIES_POINT_THRESHOLDS = { bo3: 2, bo5: 3, off: Infinity } as const;
const BOARD_SIZE = { '3': 3, '5': 5, '10': 10 } as const;
const MAX_CHAT_LENGTH = 200;
const MAX_CHAT_HISTORY = 100;

type ConnState = { isSpectator?: boolean };

function createInitialBoard(boardSize: RoomSettings['boardSize']): BoardType {
  const size = BOARD_SIZE[boardSize];
  return Array(size * size).fill(null);
}

function checkWinner(board: BoardType, boardSize: RoomSettings['boardSize']) {
  if (boardSize === '3') return calculateWinner(board);
  if (boardSize === '5') return calculateWinner5(board);
  return calculateWinner10(board);
}

function makeInitialState(): RoomState {
  return {
    board: createInitialBoard(DEFAULT_ROOM_SETTINGS.boardSize),
    currentPlayer: HUMAN,
    players: {},
    status: 'waiting',
    winner: null,
    winStreak: { '☠️': 0, '⚓': 0 },
    winStreakPlayer: null,
    isDraw: false,
    scores: { ...INITIAL_SCORE },
    bestOfSeriesScores: { ...INITIAL_SCORE },
    moveHistory: [],
    settings: { ...DEFAULT_ROOM_SETTINGS },
    timerEndsAt: null,
    forfeitWinner: null,
    chatHistory: [],
  };
}

export default class GameRoom extends Server<Env> {
  // Hibernation lets the room drop out of memory while players sit idle
  // between moves, which is most of a turn-based game's lifetime. Billable
  // duration doesn't accrue while hibernating. In-memory fields don't survive
  // it, so `state` is rehydrated from storage in onStart() and the turn timer
  // uses a Durable Object alarm rather than setTimeout.
  static options = { hibernate: true };

  state: RoomState = makeInitialState();

  async startTurnTimer() {
    await this.clearTurnTimer();
    if (!this.state.settings.timerEnabled) return;
    const timerMs = this.state.settings.timerDuration * 1000;
    this.state.timerEndsAt = Date.now() + timerMs;
    await this.ctx.storage.setAlarm(this.state.timerEndsAt);
  }

  async clearTurnTimer() {
    this.state.timerEndsAt = null;
    await this.ctx.storage.deleteAlarm();
  }

  // Fires when the turn timer set in startTurnTimer() expires. Replaces the
  // old setTimeout callback — an alarm is the only timer that survives the
  // room being evicted or hibernated.
  async onAlarm() {
    if (this.state.status !== 'playing') return;
    if (this.state.timerEndsAt === null) return;

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
  }

  resetBoard() {
    this.state.board = createInitialBoard(this.state.settings.boardSize);
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
    this.ctx.storage.put('state', this.state);
  }

  // Named `broadcastMsg` rather than `broadcast` because Server already
  // defines `broadcast(string | ArrayBuffer, without?)` — this wraps it with
  // the typed ServerMessage envelope.
  broadcastMsg(msg: ServerMessage, exclude?: string[]) {
    this.broadcast(JSON.stringify(msg), exclude);
  }

  sendTo(conn: Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  async saveAndBroadcast(msg: ServerMessage) {
    this.save();
    await this.updateLobby();
    this.broadcastMsg(msg);
  }

  async updateLobby() {
    try {
      const connectedCount = Object.values(this.state.players).filter(
        (p) => p.connected,
      ).length;

      const lobby = await getServerByName(this.env.Lobby, 'main');
      // Durable Object stubs require an absolute URL; the host is ignored, and
      // only the method/body reach LobbyServer.onRequest().
      await lobby.fetch('https://lobby.internal/parties/lobby/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.name,
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
    const saved = await this.ctx.storage.get<RoomState>('state');
    if (!saved) return;

    // `players` is keyed by connection id, so it's only meaningful for sockets
    // that are still attached. On a cold start there are none and this clears
    // the map (what the PartyKit version did unconditionally); on a wake from
    // hibernation the sockets are still live, so their players are kept.
    const liveIds = new Set([...this.getConnections()].map((conn) => conn.id));
    for (const id of Object.keys(saved.players)) {
      if (!liveIds.has(id)) delete saved.players[id];
    }

    this.state = saved;
  }

  async admitPlayer(
    conn: Connection<ConnState>,
    profile?: { name?: string; icon?: string },
  ) {
    const { isSpectator } = conn.state ?? {};

    if (isSpectator) {
      if (this.state.settings.allowSpectators === false) {
        this.sendTo(conn, {
          type: 'error',
          message: '👁️ Spectators are not allowed in this room.',
        });
        conn.close();
        return;
      }

      const connectedPlayers = Object.values(this.state.players).filter(
        (p) => p.connected,
      );
      if (connectedPlayers.length === 0) {
        this.sendTo(conn, {
          type: 'error',
          message: '🏴‍☠️ This room is empty — nothing to spectate.',
        });
        conn.close();
        return;
      }
    }

    if (!isSpectator) {
      const connectedPlayers = Object.values(this.state.players).filter(
        (p) => p.connected,
      );
      if (connectedPlayers.length >= 2) {
        this.sendTo(conn, { type: 'error', message: 'Room is full' });
        conn.close();
        return;
      }

      const takenSlots = Object.values(this.state.players).map((p) => p.player);
      const assignedPlayer: Player = takenSlots.includes(HUMAN) ? AI : HUMAN;

      this.state.players[conn.id] = {
        id: conn.id,
        player: assignedPlayer,
        connected: true,
        wantsRematch: false,
        name:
          profile?.name?.trim().slice(0, 20) ||
          (assignedPlayer === HUMAN ? 'Davy Jones' : 'Capt. Hook'),
        icon: profile?.icon || (assignedPlayer === HUMAN ? '☠️' : '⚓'),
      };
      if (
        Object.values(this.state.players).filter((p) => p.connected).length ===
        2
      ) {
        this.state.status = 'playing';
      }
    }

    this.sendTo(conn, { type: 'state-update', state: this.state });
    if (!isSpectator) {
      this.save();
      await this.updateLobby();
      this.broadcastMsg({ type: 'state-update', state: this.state }, [conn.id]);
    }
  }

  async onConnect(conn: Connection<ConnState>, ctx: ConnectionContext) {
    try {
      const url = new URL(ctx.request.url);
      const isSpectator = url.searchParams.get('spectator') === 'true';

      // Remember the spectator flag on the connection so we can admit later
      // (e.g. after a password challenge) without the request URL.
      conn.setState({ isSpectator });
      // Password-protected room: don't admit yet. Keep the socket open and
      // wait for a `game-password` message. The socket stays connected but the
      // player isn't in `state.players`, so onMessage's `if (!senderPlayer) return`
      // already blocks every other action until they're admitted.
      if (this.state.settings.password) {
        this.sendTo(conn, {
          type: 'game-password',
          message: GAME_PASSWORD_MESSAGES.required,
        });
        return;
      }

      await this.admitPlayer(conn);
    } catch (e) {
      console.error(e);
    }
  }

  async onClose(conn: Connection) {
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
      await this.clearTurnTimer();
      this.state = makeInitialState();
      this.save();
      await this.updateLobby();
    } else if (stillConnected.length === 1) {
      // clear the board
      this.resetBoard();

      // One player left — notify them
      this.state.status = 'waiting';
      await this.clearTurnTimer();
      this.broadcastMsg({ type: 'opponent-disconnected' });
      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }
  }

  async onMessage(sender: Connection, message: WSMessage) {
    if (typeof message !== 'string') return;

    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      return;
    }

    if (msg.type === 'game-password') {
      // Ignore if already admitted, or if the room has no password.
      if (this.state.players[sender.id]) return;
      if (!this.state.settings.password) return;
      if (msg.password === this.state.settings.password) {
        await this.admitPlayer(sender, { name: msg.name, icon: msg.icon });
      } else {
        this.sendTo(sender, {
          type: 'game-password',
          message: GAME_PASSWORD_MESSAGES.invalid,
        });
        // leave the socket open so they can try again
      }
      return;
    }

    const senderPlayer = this.state.players[sender.id];
    if (!senderPlayer) return;

    if (msg.type === 'send-emoji') {
      // A reaction is a transient event, not persistent state — broadcast it
      // once and don't store it. Storing + clearing caused two back-to-back
      // state-updates that React could coalesce, dropping the reaction.
      this.broadcastMsg({
        type: 'emoji-reaction',
        emoji: msg.emoji,
        senderId: sender.id,
      });
      return;
    }

    if (msg.type === 'send-chat') {
      const text = msg.text.trim().slice(0, MAX_CHAT_LENGTH);
      if (!text) return;
      this.state.chatHistory = [
        ...this.state.chatHistory,
        {
          id: crypto.randomUUID(),
          senderId: sender.id,
          senderName: senderPlayer.name,
          senderIcon: senderPlayer.icon,
          text,
          sentAt: Date.now(),
        },
      ].slice(-MAX_CHAT_HISTORY);
      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
      return;
    }

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

        const duration = Number(msg.settings.timerDuration);
        this.state.settings = {
          ...msg.settings,
          timerDuration: Number.isFinite(duration)
            ? Math.min(Math.max(Math.round(duration), 1), 300)
            : DEFAULT_ROOM_SETTINGS.timerDuration,
        };
        this.state.board = createInitialBoard(msg.settings.boardSize);
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

      const { winner } = checkWinner(newBoard, this.state.settings.boardSize);
      const draw = !winner && isDraw(newBoard);

      const { bestOfSeries, victoriesForAction } = this.state.settings;
      const seriesWinTarget = SERIES_POINT_THRESHOLDS[bestOfSeries];

      if (winner) {
        const loser = winner === HUMAN ? AI : HUMAN;
        this.state.scores[winner] += 1;
        // victoriesForAction === 0 means unlimited: never reset, never award series points
        if (
          victoriesForAction !== 0 &&
          this.state.scores[winner] >= victoriesForAction
        ) {
          this.state.bestOfSeriesScores[winner] += 1;
          if (
            bestOfSeries !== 'off' &&
            this.state.bestOfSeriesScores[winner] >= seriesWinTarget
          ) {
            this.state.seriesWinner = winner;
          }
        }

        this.state.winner = winner;
        this.state.status = 'finished';
        this.state.winStreak[winner] += 1;
        this.state.winStreak[loser] = 0;
        if (this.state.winStreak[winner] >= 2) {
          this.state.winStreakPlayer = winner;
        }
        await this.clearTurnTimer();
      } else if (draw) {
        this.state.isDraw = true;
        this.state.status = 'finished';
        this.state.winStreak = { ...INITIAL_SCORE };
        this.state.winStreakPlayer = null;
        await this.clearTurnTimer();
      } else {
        this.state.currentPlayer =
          this.state.currentPlayer === HUMAN ? AI : HUMAN;
        await this.startTurnTimer();
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
        if (
          _winner &&
          this.state.settings.victoriesForAction !== 0 &&
          this.state.scores[_winner] >= this.state.settings.victoriesForAction
        ) {
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
        // Reset winstreak player
        this.state.winStreakPlayer = null;
        // Reset possible forfeit winner, there is not a winner anymore
        this.state.forfeitWinner = null;
        // Reset series winner, there is not a winner anymore
        this.state.seriesWinner = undefined;
        // Reset board but keep scores and players
        this.clearBoard();

        await this.startTurnTimer();
      }

      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }
    if (msg.type === 'cancel-request-rematch') {
      this.state.players[sender.id].wantsRematch = false;
      await this.saveAndBroadcast({ type: 'state-update', state: this.state });
    }
  }
}
