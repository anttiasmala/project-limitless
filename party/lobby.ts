// party/lobby.ts

// This file contains the data of free lobbies

import type * as Party from 'partykit/server';

type LobbyEntry = {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  connectedCount: number;
};

export default class LobbyServer implements Party.Server {
  rooms: Record<string, LobbyEntry> = {};

  constructor(readonly room: Party.Room) {}

  async onRequest(req: Party.Request) {
    if (req.method === 'GET') {
      console.log('GET-request party/lobby.ts');
      const rooms =
        (await this.room.storage.get<Record<string, LobbyEntry>>('rooms')) ??
        {};

      // Only return rooms with at least 1 player
      const available = Object.values(rooms).filter(
        (r) => r.connectedCount === 1,
      );
      return Response.json(available);
    }
    if (req.method === 'POST') {
      const entry = (await req.json()) as LobbyEntry;
      this.rooms[entry.roomId] = entry;
      for (const [roomId, room] of Object.entries(this.rooms)) {
        if (room.connectedCount === 0) {
          delete this.rooms[roomId];
        }
      }
      await this.room.storage.put('rooms', this.rooms);
      return Response.json({ ok: true });
    }
    return new Response('Method not allowed', { status: 405 });
  }

  async onStart() {
    this.rooms =
      (await this.room.storage.get<Record<string, LobbyEntry>>('rooms')) ?? {};
  }
}

LobbyServer satisfies Party.Worker;
