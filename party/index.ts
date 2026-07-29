// party/index.ts

// @backend — PartyServer worker entry point.
//
// PartyKit inferred this file from partykit.json's `main` + `parties` map.
// PartyServer needs it spelled out: the Durable Object classes have to be
// exported from the worker's entry module, and the fetch handler routes
// /parties/:namespace/:name to them.

import { routePartykitRequest } from 'partyserver';

export { default as GameRoom } from './game';
export { default as LobbyServer } from './lobby';

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ??
      new Response('Not found', { status: 404 })
    );
  },
};

export default worker;
