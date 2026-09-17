/**
 * Contains basic logic of computer player (AI)
 */

import { seatOf } from './gameLogic';
import { Action, GameState, Phase } from '@/utils/port-royal/types';

/**
 * How long the Bot waits to do a decision and commiting to it. It is long
 * enough that whoever is watching can follow what happened. The two
 * acknowledgements (bust & Tax) are slower because they put something on screen to read.
 */
const BEAT: Partial<Record<Phase, number>> = {
  handover: 450,
  discovery: 900,
  repel: 1000,
  trade: 750,
  others: 650,
  bust: 2200,
  tax: 2600,
};

const DEFAULT_BEAT = 800;

export type BotTurn = { action: Action; delay: number };

/**
 * The move a computer seat makes now, and how long to wait before making it —
 * or null when the board is not waiting on a bot at all.
 */
export function botTurn(s: GameState): BotTurn | null {
  // An overlay somebody opened owns the board: inspecting a card during a
  // bot's turn should not leave the game running on underneath it.
  if (s.detail || s.settings) return null;

  // The engine has already queued this transition itself.
  if (s.scheduled) return null;

  // `seatOf` is the seat whose decision is pending — the buyer during the
  // others phase, the active player otherwise.
  if (seatOf(s).kind !== 'ai') return null;

  const action = decide(s);
  if (!action) return null;

  return { action, delay: BEAT[s.phase] ?? DEFAULT_BEAT };
}

function decide(s: GameState): Action | null {
  switch (s.phase) {
    // Nothing to hand over to a computer — take the turn straight away.
    case 'handover':
      return { type: 'BEGIN_TURN' };

    // Stopping is not offered on an empty harbour, so take exactly one card
    // and bank it.
    case 'discovery':
      return s.harbour.length ? { type: 'STOP' } : { type: 'FLIP' };

    case 'repel':
      return { type: 'DECLINE_REPEL' };

    case 'trade':
      return { type: 'TO_OTHERS' };

    case 'others':
      return { type: 'PASS_TAKE' };

    case 'bust':
      return { type: 'ACK_BUST' };

    case 'tax':
      return { type: 'ACK_TAX' };

    // `gap` and `end` belong to the engine; it schedules whatever follows.
    default:
      return null;
  }
}
