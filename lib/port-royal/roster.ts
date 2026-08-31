/**
 * Turns whatever the landing page — or a hand-edited URL — supplies into a
 * roster the board can trust.
 *
 * The seat list travels as query parameters, so it is untrusted input: it can
 * be absent, too long, too short, or full of blanks. Both the landing page and
 * the board route normalise through here so they always agree on the roster a
 * given URL means.
 */

import {
  DEFAULT_NAMES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_NAMES,
} from '@/utils/port-royal/types';

/** Long enough for a name, short enough for the header's player strip. */
export const NAME_MAX = 14;

/** The seat count a bare `/local` URL opens with — the board's original table. */
export const DEFAULT_SEATS = PLAYER_NAMES.length;

/** Every table size the landing page offers, e.g. `[2, 3, 4, 5]`. */
export const SEAT_OPTIONS = Array.from(
  { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
  (_, i) => MIN_PLAYERS + i,
);

/**
 * An array names, with no blank names and no duplicates: the handover
 * curtain announces the next player by name, so two identical names would leave
 * it ambiguous who is meant to pick the device up.
 */
export function normaliseRoster(raw: readonly string[]): string[] {
  const count = raw.length
    ? Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, raw.length))
    : DEFAULT_SEATS;

  const taken = new Set<string>();

  return Array.from({ length: count }, (_, i) => {
    const base = (raw[i] ?? '').trim().slice(0, NAME_MAX) || DEFAULT_NAMES[i];

    let name = base;
    for (let n = 2; taken.has(name); n++) name = `${base} ${n}`;
    taken.add(name);

    return name;
  });
}

/** Packs a roster into the query string the board route reads back. */
export function rosterQuery(names: readonly string[]): string {
  const params = new URLSearchParams();
  names.forEach((name) => params.append('seat', name));
  return params.toString();
}

/** Unpacks the `seat` parameter, which Next hands over as a string or an array. */
export function rosterFromQuery(seat: string | string[] | undefined): string[] {
  return normaliseRoster(
    seat === undefined ? [] : Array.isArray(seat) ? seat : [seat],
  );
}
