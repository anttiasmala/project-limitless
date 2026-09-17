/**
 * Turns whatever the landing page — or a hand-edited URL — supplies into a
 * roster the board can trust.
 *
 * The table travels as query parameters, so it is untrusted input: it can be
 * absent, too long, too short, full of blanks, or claim that every chair is a
 * computer. Both the landing page and the board route normalise through here so
 * they always agree on the table a given URL means.
 */

import {
  DEFAULT_NAMES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_NAMES,
  Seat,
} from '@/utils/port-royal/types';

/** Long enough for a name, short enough for the header's player strip. */
export const NAME_MAX = 14;

/** The seat count a bare `/local` URL opens with — the board's original table. */
export const DEFAULT_SEAT_COUNT = PLAYER_NAMES.length;

/** Every table size the landing page offers, e.g. `[2, 3, 4, 5]`. */
export const SEAT_OPTIONS = Array.from(
  { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
  (_, i) => MIN_PLAYERS + i,
);

/** The table the board falls back to when nobody has chosen one. */
export const DEFAULT_ROSTER: Seat[] = PLAYER_NAMES.map((name) => ({
  name,
  kind: 'human',
}));

/**
 * A table with no blank names, no duplicates, and at least one human in it.
 *
 * Names cannot have duplicates, because the handover "curtain" announces the next player
 * by name, so two identical names would leave it unclear who is meant to pick
 * the device up.
 */
export function normaliseRoster(raw: readonly Partial<Seat>[]): Seat[] {
  const count = raw.length
    ? Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, raw.length))
    : DEFAULT_SEAT_COUNT;

  const taken = new Set<string>();

  const seats: Seat[] = Array.from({ length: count }, (_, i) => {
    const base =
      (raw[i]?.name ?? '').trim().slice(0, NAME_MAX) || DEFAULT_NAMES[i];

    let name = base;
    for (let n = 2; taken.has(name); n++) name = `${base} ${n}`;
    taken.add(name);

    return { name, kind: raw[i]?.kind === 'ai' ? 'ai' : 'human' };
  });

  // a real-player has to be playing: an all-computer table has nobody to hand the
  // device to, and no reason to be watching (at least for now). The first seat is changed to human.
  if (seats.every((s) => s.kind === 'ai'))
    seats[0] = { ...seats[0], kind: 'human' };

  return seats;
}

/**
 * Packs a table into the query string the board route reads back.
 *
 * The computer seats are marked as &bot=1 rather than as a marker inside the
 * name like (AI)Bart, because names are free text.
 */
export function rosterQuery(seats: readonly Seat[]): string {
  const params = new URLSearchParams();

  seats.forEach((s) => params.append('seat', s.name));
  seats.forEach((s, i) => {
    if (s.kind === 'ai') params.append('bot', String(i));
  });

  return params.toString();
}

/** Converts `param` into an array. */
function asArray(param: string | string[] | undefined): string[] {
  return param === undefined ? [] : Array.isArray(param) ? param : [param];
}

/** Unpacks the `seat` and `bot` parameters into the table they describe. */
export function rosterFromQuery(
  seat: string | string[] | undefined,
  bot: string | string[] | undefined,
): Seat[] {
  const bots = new Set(
    asArray(bot)
      .map(Number)
      .filter((n) => Number.isInteger(n)),
  );

  return normaliseRoster(
    asArray(seat).map((name, i) => ({
      name,
      kind: bots.has(i) ? ('ai' as const) : ('human' as const),
    })),
  );
}
