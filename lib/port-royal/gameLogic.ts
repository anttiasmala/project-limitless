/**
 * The Port Royal game engine.
 */

import allCards from '@/utils/port-royal/cards';
import {
  Action,
  DEFAULT_PERSON_PROFILE,
  DeckCard,
  ExpeditionSymbol,
  GameState,
  GOVERNOR,
  HarbourCard,
  JESTER,
  MADEMOISELLE,
  PERSON_PROFILES,
  Player,
  SHIPS,
  ShipCard,
  TARGET_VP,
  TaxRow,
  Toast,
  ToastTone,
} from '@/utils/port-royal/types';

/** Ship type name -> the `SHIPS` slot that draws its flag. */
const SHIP_INDEX = new Map(SHIPS.map((s, i) => [s.name, i]));

function shuffled<T>(cards: T[]): T[] {
  const d = cards.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

/**
 * The printed deck, straight out of `cards.ts`: 60 characters, 50 ships (ten of
 * each type) and 4 tax events — 114 cards.
 *
 * The five research cards are left out. They score expedition symbols, and the
 * engine has no expedition phase yet, so a flipped one would be a card the
 * harbour could neither price nor take.
 *
 * Ids are minted here rather than taken from the card data: `drawInto` rebuilds
 * the deck when it runs dry, and a hand of coins is nothing but ids, so they
 * have to stay unique across rebuilds.
 *
 * `shuffle` is off for the very first deck so the server and the client render
 * the same markup; the board dispatches `SHUFFLE` once it has mounted. Nothing
 * about the opening screen depends on the order, so the swap is invisible.
 */
export function buildDeck(
  startId: number,
  shuffle = true,
): { deck: DeckCard[]; nextId: number } {
  const d: DeckCard[] = [];
  let seq = startId;

  allCards.forEach((card) => {
    const name = card.name ?? '';

    if (card.type === 'ship') {
      const colorIdx = SHIP_INDEX.get(name);
      if (colorIdx === undefined) return;

      d.push({
        id: ++seq,
        kind: 'ship',
        colorIdx,
        name,
        swords: card.shipWeapons ?? 0,
        coins: card.shipCoins ?? 0,
        image: card.imageName ?? '',
      });
      return;
    }

    if (card.type === 'character') {
      const profile = PERSON_PROFILES[name] ?? DEFAULT_PERSON_PROFILE;

      d.push({
        id: ++seq,
        kind: 'person',
        name,
        role: profile.role,
        text: profile.text,
        // A sword ability is printed once per sword — the Pirate carries two.
        swords: (card.abilities ?? []).filter((a) => a === 'swords').length,
        vp: card.victoryPoints ?? 0,
        expeditionItem: (card.abilities ?? []).map((a) => {
          if (card.name?.toLowerCase() === 'jack of all trades') {
            return 'jackOfAllTrades';
          }
          if (a === 'house' || a === 'cross' || a === 'anchor') {
            return a;
          }
          return 'none';
        })[0],
        price: card.characterCost ?? 0,
        image: card.imageName ?? '',
      });
      return;
    }

    if (card.type === 'tax') {
      d.push({
        id: ++seq,
        kind: 'tax',
        name: 'Tax Increase',
        image: card.imageName ?? '',
      });
    }
  });

  return { deck: shuffle ? shuffled(d) : d, nextId: seq };
}

export function freshState(names: string[], shuffle = true): GameState {
  const { deck, nextId } = buildDeck(0, shuffle);
  const rest = deck.slice();
  const players: Player[] = names.map((name) => ({
    name,
    hand: rest.splice(0, 3).map((c) => ({ id: c.id })),
    tableau: [],
  }));

  return {
    players,
    deck: rest,
    discard: 0,
    discardPile: [],
    active: 0,
    taker: null,
    phase: 'handover',
    harbour: [],
    selected: null,
    takesLeft: 1,
    bustPair: null,
    tax: null,
    detail: null,
    toast: null,
    settings: false,
    winner: null,
    flipsBeyond: 0,
    nextId,
    scheduled: null,
  };
}

/* ---------------------------------------------------------------- selectors */

export const swordsOf = (p: Player) =>
  p.tableau.reduce((a, c) => a + (c.swords || 0), 0);

export const vpOf = (p: Player) =>
  p.tableau.reduce((a, c) => a + (c.vp || 0), 0);

/**
 * How many of one expedition symbol (e.g. house) the player has hired.
 *
 * A character prints at most one of each, so this counts cards: the Jack of all
 * Trades will add to every symbol,
 */
const symbolsOf = (p: Player, symbol: ExpeditionSymbol) =>
  p.tableau.filter(
    (c) =>
      c.kind === 'person' &&
      (c.expeditionItem === symbol || c.expeditionItem === 'jackOfAllTrades'),
  ).length;

export const houseOf = (p: Player) => symbolsOf(p, 'house');
export const crossOf = (p: Player) => symbolsOf(p, 'cross');
export const anchorOf = (p: Player) => symbolsOf(p, 'anchor');

/** The Mademoiselle knocks a coin off everything, but never below one. */
export const discountOf = (p: Player) =>
  p.tableau.some((c) => c.name === MADEMOISELLE) ? 1 : 0;

export const priceOf = (card: HarbourCard, p: Player) =>
  card.kind === 'person' ? Math.max(1, card.price - discountOf(p)) : 0;

/**
 * Ships cost nothing to take. Persons are paid in coins from hand.
 */
export const affordable = (card: HarbourCard, p: Player) =>
  card.kind === 'ship' ? true : p.hand.length >= priceOf(card, p);

/**
 * Pick amount (takesLeft) the ACTIVE player has earned
 * Pick amount can be increased by having multiple different coloured ships in the harbour
 *
 * **0-3 different coloured ships = 1 pick**
 *
 * **4 different coloured ships = 2 picks**
 *
 * **5 different coloured ships = 3 picks**
 */
export const takesFor = (harbour: HarbourCard[]) => {
  const colours = new Set(
    harbour
      .filter((c): c is ShipCard => c.kind === 'ship')
      .map((c) => c.colorIdx),
  ).size;

  return colours >= 5 ? 3 : colours >= 4 ? 2 : 1;
};

/** Whoever the board is currently showing — the buyer during the others phase. */
export const seatOf = (s: GameState) =>
  s.phase === 'others' && s.taker !== null
    ? s.players[s.taker]
    : s.players[s.active];

/* ------------------------------------------------------------------ reducer */

const withToast = (
  next: GameState,
  text: string,
  tone: ToastTone,
): GameState => ({ ...next, toast: { text, tone } satisfies Toast });

/**
 * Draw `n` coin cards, reshuffling the discard pile back in if the deck runs
 * dry mid-draw.
 */
function drawInto(
  deck: DeckCard[],
  n: number,
  discard: number,
  nextId: number,
): {
  deck: DeckCard[];
  taken: { id: number }[];
  discard: number;
  nextId: number;
  reshuffled: boolean;
} {
  const taken: { id: number }[] = [];
  let d = deck.slice();
  let dis = discard;
  let id = nextId;
  let reshuffled = false;

  for (let i = 0; i < n; i++) {
    if (!d.length) {
      const rebuilt = buildDeck(id);
      d = rebuilt.deck;
      id = rebuilt.nextId;
      dis = 0;
      reshuffled = true;
    }
    taken.push({ id: d.shift()!.id });
  }

  return { deck: d, taken, discard: dis, nextId: id, reshuffled };
}

const RESHUFFLE_NOTE = 'Discard pile reshuffled into the draw pile.';

/** Ends the turn, or the game if anyone has reached the target. */
function endTurn(s: GameState): GameState {
  const winner = s.players.findIndex((p) => vpOf(p) >= TARGET_VP);
  const discard = s.discard + s.harbour.length;

  if (winner >= 0) {
    return {
      ...s,
      phase: 'end',
      winner,
      harbour: [],
      discard,
      scheduled: null,
    };
  }

  return {
    ...s,
    harbour: [],
    discard,
    active: (s.active + 1) % s.players.length,
    taker: null,
    selected: null,
    flipsBeyond: 0,
    phase: 'handover',
    scheduled: null,
  };
}

function flip(s: GameState): GameState {
  let deck = s.deck.slice();
  let discard = s.discard;
  let nextId = s.nextId;
  let note: GameState['toast'] = s.toast;

  if (!deck.length) {
    const rebuilt = buildDeck(nextId);
    deck = rebuilt.deck;
    nextId = rebuilt.nextId;
    discard = 0;
    note = { text: RESHUFFLE_NOTE, tone: 'info' };
  }

  const card = deck.shift()!;

  if (card.kind === 'tax') {
    const rows: TaxRow[] = s.players.map((p) => ({
      name: p.name,
      pays: p.hand.length >= 12 ? Math.floor(p.hand.length / 2) : 0,
      gains: swordsOf(p) >= 3 ? 1 : 0,
    }));
    return {
      ...s,
      deck,
      nextId,
      toast: note,
      discard: discard + 1,
      tax: rows,
      phase: 'tax',
    };
  }

  // A second ship of a colour already in the harbour ends the phase.
  if (card.kind === 'ship') {
    const clash = s.harbour.find(
      (c): c is ShipCard => c.kind === 'ship' && c.colorIdx === card.colorIdx,
    );

    if (clash) {
      const grace =
        s.players[s.active].tableau.some((c) => c.name === JESTER) &&
        s.flipsBeyond === 0;

      if (grace) {
        return withToast(
          {
            ...s,
            deck,
            nextId,
            discard,
            harbour: s.harbour.concat(card),
            flipsBeyond: 1,
          },
          'Jester absorbs the duplicate — one more flip is safe.',
          'info',
        );
      }

      return {
        ...s,
        deck,
        nextId,
        discard,
        toast: note,
        bustPair: [clash, card],
        phase: 'bust',
      };
    }
  }

  return {
    ...s,
    deck,
    nextId,
    discard,
    toast: note,
    harbour: s.harbour.concat(card),
  };
}

function take(s: GameState): GameState {
  const card = s.harbour.find((c) => c.id === s.selected);
  if (!card) return s;

  const isActive = s.phase === 'trade';
  const buyerIdx = isActive ? s.active : s.taker!;
  const buyer = s.players[buyerIdx];
  const players = s.players.map((p) => ({
    ...p,
    hand: p.hand.slice(),
    tableau: p.tableau.slice(),
  }));

  let deck = s.deck.slice();
  let discard = s.discard;
  let nextId = s.nextId;
  let toast: Toast;
  let reshuffled = false;

  if (card.kind === 'ship') {
    const r = drawInto(deck, card.coins, discard, nextId);
    deck = r.deck;
    discard = r.discard + 1; // the taken ship goes to the discard pile
    nextId = r.nextId;
    reshuffled = r.reshuffled;
    players[buyerIdx].hand = players[buyerIdx].hand.concat(r.taken);
    toast = {
      text: `${buyer.name} brings in the ${card.name} — ${card.coins} coins aboard.`,
      tone: 'gain',
    };
  } else {
    const cost = priceOf(card, buyer);
    const paid = players[buyerIdx].hand.splice(0, cost);

    // Buying out of turn pays the active player rather than the crown.
    if (!isActive) {
      players[s.active].hand = players[s.active].hand.concat(paid);
    } else {
      discard += cost;
    }

    players[buyerIdx].tableau.push(card);
    toast = {
      text: `${buyer.name} hires ${card.name} for ${cost}${
        isActive ? ' coins.' : ` coins, paid to ${s.players[s.active].name}.`
      }`,
      tone: 'gain',
    };

    if (players[buyerIdx].tableau.some((c) => c.name === GOVERNOR)) {
      const r = drawInto(deck, 1, discard, nextId);
      deck = r.deck;
      discard = r.discard;
      nextId = r.nextId;
      reshuffled = reshuffled || r.reshuffled;
      players[buyerIdx].hand = players[buyerIdx].hand.concat(r.taken);
    }
  }

  const harbour = s.harbour.filter((c) => c.id !== card.id);
  const takesLeft = isActive ? s.takesLeft - 1 : 0;

  const next: GameState = {
    ...s,
    players,
    deck,
    discard,
    nextId,
    harbour,
    selected: null,
    takesLeft,
    toast: reshuffled ? { text: RESHUFFLE_NOTE, tone: 'info' } : toast,
    scheduled:
      isActive && takesLeft <= 0
        ? { kind: 'TO_OTHERS', delay: 500 }
        : !isActive
          ? { kind: 'NEXT_TAKER', delay: 500 }
          : null,
  };

  return next;
}

function toOthers(s: GameState): GameState {
  if (!s.harbour.length) return endTurn(s);
  return {
    ...s,
    phase: 'others',
    taker: (s.active + 1) % s.players.length,
    selected: null,
    scheduled: null,
  };
}

function nextTaker(s: GameState): GameState {
  const next = (s.taker! + 1) % s.players.length;
  if (next === s.active || !s.harbour.length) return endTurn(s);
  return { ...s, taker: next, selected: null, scheduled: null };
}

export function reducer(s: GameState, action: Action): GameState {
  switch (action.type) {
    case 'FLIP':
      return flip(s);

    case 'STOP':
      // More different coloured ships in the harbour earns more picks before the others get a turn.
      // 0-3 different coloured ships = 1
      // 4 different coloured ships = 2
      // 5 different coloured ships = 3
      return {
        ...s,
        phase: 'trade',
        takesLeft: takesFor(s.harbour),
        selected: null,
      };

    case 'ACK_BUST':
      return withToast(
        {
          ...s,
          harbour: [],
          bustPair: null,
          // The haul plus both clashing ships.
          discard: s.discard + s.harbour.length + 2,
          phase: 'gap',
          scheduled: { kind: 'END_TURN', delay: 400 },
        },
        'The haul is lost. No trade this turn.',
        'loss',
      );

    case 'ACK_TAX': {
      let nextId = s.nextId;
      const players = s.players.map((p, i) => {
        const row = s.tax![i];
        return {
          ...p,
          hand: row.pays ? p.hand.slice(row.pays) : p.hand,
          tableau: row.gains
            ? p.tableau.concat({
                id: ++nextId,
                kind: 'bonus',
                name: 'Crown favour',
                vp: 1,
                swords: 0,
                role: 'rule',
                text: 'Awarded for holding the most swords when taxes rose.',
              })
            : p.tableau,
        };
      });
      return { ...s, players, nextId, tax: null, phase: 'discovery' };
    }

    case 'PICK': {
      if (s.phase !== 'trade' && s.phase !== 'others') return s;
      const buyer =
        s.phase === 'trade' ? s.players[s.active] : s.players[s.taker!];

      if (!affordable(action.card, buyer)) {
        return withToast(
          s,
          action.card.kind === 'ship'
            ? 'Not enough swords to bring her in.'
            : 'Not enough coins in hand.',
          'loss',
        );
      }

      return {
        ...s,
        selected: s.selected === action.card.id ? null : action.card.id,
      };
    }

    case 'TAKE':
      return take(s);

    case 'TO_OTHERS':
      return toOthers(s);

    case 'PASS_TAKE':
    case 'NEXT_TAKER':
      return nextTaker(s);

    case 'END_TURN':
      return endTurn(s);

    case 'BEGIN_TURN':
      return { ...s, phase: 'discovery' };

    case 'INSPECT':
      return { ...s, detail: action.card };

    case 'CLOSE_DETAIL':
      return { ...s, detail: null };

    case 'TOGGLE_SETTINGS':
      return { ...s, settings: !s.settings };

    case 'CLEAR_TOAST':
      return { ...s, toast: null };

    // Swaps the deterministic opening deck for a shuffled one once the board is
    // on the client. The handover curtain is up, so nothing visible changes.
    case 'SHUFFLE':
      return freshState(s.players.map((p) => p.name));

    // Keeps the table that was chosen on the landing page — a restart re-deals,
    // it does not send everyone back to the default roster.
    case 'RESTART':
      return freshState(s.players.map((p) => p.name));

    default:
      return s;
  }
}
