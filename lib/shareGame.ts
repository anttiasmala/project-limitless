// lib/shareGame.ts
//
// Serializes a finished game into a compact, URL-safe string and back, so a
// game can be shared as a link with NO backend — the whole replay travels in
// the URL. The recipient's home page decodes it and opens the ReplayModal.

import { AI, HUMAN, Player } from '@/lib/gameLogic';
import { GameMode, MoveEntry } from '@/utils/types';

export type BoardSize = 3 | 5 | 10;

export type SharedGame = {
  moveHistory: MoveEntry[];
  boardSize: BoardSize;
  playerIcons: Record<Player, string>;
  whoseTurn?: Player;
  mode: GameMode;
};

// Wire payload — kept terse since it lives in a URL. `m` is a list of
// [playerBit, cellIndex] where the bit is 0 for ☠️ (HUMAN) and 1 for ⚓ (AI).
type Payload = {
  _boardSize: BoardSize;
  icons: [string, string]; // [☠️ icon, ⚓ icon]
  _moveHistory: [0 | 1, number][];
  whoseTurn?: Player;
  mode: 'pvp' | 'pvc';
};

// btoa/atob only handle Latin-1, but the icons are multi-byte emoji, so we go
// through TextEncoder and emit base64url (URL-safe, no padding).
function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeGame({
  moveHistory,
  boardSize,
  playerIcons,
  whoseTurn,
  mode,
}: SharedGame): string {
  const payload: Payload = {
    _boardSize: boardSize,
    icons: [playerIcons[HUMAN], playerIcons[AI]],
    _moveHistory: moveHistory.map((move) => [
      move.player === AI ? 1 : 0,
      move.index,
    ]),
    whoseTurn,
    // Only PvP/PvC positions are playable; collapse the spectator-style modes
    // (watch/tournament) to 'pvc' so their replay links still decode.
    mode: mode === 'pvp' ? 'pvp' : 'pvc',
  };
  return toBase64Url(JSON.stringify(payload));
}

// Returns null for anything malformed so callers can simply ignore bad links
// instead of crashing the page.
export function decodeGame(encoded: string): SharedGame | null {
  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as Payload;

    if (
      payload._boardSize !== 3 &&
      payload._boardSize !== 5 &&
      payload._boardSize !== 10
    )
      return null;
    if (!Array.isArray(payload.icons) || payload.icons.length !== 2)
      return null;
    if (!Array.isArray(payload._moveHistory)) return null;

    const cells = payload._boardSize * payload._boardSize;
    const moveHistory: MoveEntry[] = [];
    for (let turn = 0; turn < payload._moveHistory.length; turn++) {
      // entry contains 2 values, the first is player and the second is cell seized
      // e.g. [0, 0], HUMAN seized left upper Square
      const entry = payload._moveHistory[turn];
      // entry has to be an array and has to contain exactly 2 values
      if (!Array.isArray(entry) || entry.length !== 2) return null;
      // icon = player (☠️ (HUMAN) or ⚓ (AI)), index = Square seized
      const [icon, index] = entry;
      if (icon !== 0 && icon !== 1) return null;
      // if index is not a number, it is less than 0, it is equal or more than there are cells, return null
      if (!Number.isInteger(index) || index < 0 || index >= cells) return null;
      // turn's count starts from 0, add + 1 to it to start from turn 1, not turn 0
      moveHistory.push({
        turn: turn + 1,
        player: icon === 1 ? AI : HUMAN,
        index,
      });
    }

    return {
      moveHistory,
      boardSize: payload._boardSize,
      playerIcons: {
        [HUMAN]: payload.icons[0],
        [AI]: payload.icons[1],
      } as Record<Player, string>,
      whoseTurn: payload.whoseTurn,
      mode: payload.mode,
    };
  } catch {
    return null;
  }
}
