// party/lobby.ts

// @backend — PartyServer backend || This file contains the data of free lobbies

import { Server } from 'partyserver';
import type { LobbyEntry } from '@/utils/tictactoe/multiplayer/multiplayerTypes';

export default class LobbyServer extends Server<Env> {
  rooms: Record<string, LobbyEntry> = {};

  async onRequest(req: Request) {
    if (req.method === 'GET') {
      return Response.json(
        Object.values(this.rooms).filter((r) => !r.isPrivateGame),
      );
    }
    if (req.method === 'POST') {
      const entry = (await req.json()) as LobbyEntry;
      this.rooms[entry.roomId] = entry;
      for (const [roomId, room] of Object.entries(this.rooms)) {
        if (room.connectedCount === 0) {
          delete this.rooms[roomId];
        }
      }
      await this.ctx.storage.put('rooms', this.rooms);
      return Response.json({ ok: true });
    }
    return new Response('Method not allowed', { status: 405 });
  }

  async onStart() {
    this.rooms =
      (await this.ctx.storage.get<Record<string, LobbyEntry>>('rooms')) ?? {};
  }
}
