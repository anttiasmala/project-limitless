/**
 * The Port Royal game engine.
 */

import allCards from '@/utils/port-royal/cards';
import {
  Action,
  Coin,
  DEFAULT_PERSON_PROFILE,
  DeckCard,
  describeRequirement,
  ExpeditionCard,
  ExpeditionItem,
  expeditionItemOf,
  ExpeditionSymbol,
  extraCoinAbility,
  fillPersonText,
  GameState,
  GOVERNOR,
  HarbourCard,
  MADEMOISELLE,
  PERSON_PROFILES,
  PersonCard,
  Player,
  SHIPS,
  ShipCard,
  SlotFill,
  TARGET_VP,
  TAX_THRESHOLD,
  TaxMode,
  TaxRow,
  Toast,
  ToastTone,
  ADMIRAL,
  JESTER,
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
 * each type), 4 tax events and 5 expeditions — 119 cards, the full deck.
 *
 * The deck is built exactly once a game.
 *
 * `shuffle` is off for the very first deck so the server and the client render
 * the same markup; the board dispatches `SHUFFLE` once it has mounted. Nothing
 * about the opening screen depends on the order, so the swap is invisible.
 */
export function buildDeck(shuffle = true): DeckCard[] {
  const d: DeckCard[] = [];
  let seq = 0;

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
      const abilities = card.abilities ?? [];

      d.push({
        id: ++seq,
        kind: 'person',
        name,
        role: profile.role,
        text: fillPersonText(profile.text, abilities),
        abilities,
        // A sword ability is printed once per sword — the Pirate carries two.
        swords: abilities.filter((a) => a === 'swords').length,
        vp: card.victoryPoints ?? 0,
        expeditionItem: expeditionItemOf(abilities),
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
        mode: card.taxMode === 'MostSwords' ? 'mostSwords' : 'lowestPoints',
        image: card.imageName ?? '',
      });
      return;
    }

    if (card.type === 'expedition') {
      d.push({
        id: ++seq,
        kind: 'expedition',
        name,
        requires: (card.expeditionMode ?? []).filter(
          (s): s is ExpeditionSymbol =>
            s === 'house' || s === 'cross' || s === 'anchor',
        ),
        coins: card.coinsAmount ?? 0,
        vp: card.victoryPoints ?? 0,
        image: card.imageName ?? '',
      });
    }
  });

  return shuffle ? shuffled(d) : d;
}

export function freshState(names: string[], shuffle = true): GameState {
  const rest = buildDeck(shuffle);
  const players: Player[] = names.map((name) => ({
    name,
    // Three cards off the top of deck pile, held face-down as coins.
    hand: rest.splice(0, 3),
    tableau: [],
    /*
    tableau: [
      {
        id: 38,
        kind: 'person',
        name: 'Sailor',
        role: 'fighter',
        text: 'One sword toward ship repel requirement.',
        swords: 10,
        vp: 1,
        expeditionItem: 'none',
        price: 3,
        image: 'sailor_1.png',
      },
    ],
    */
  }));

  return {
    players,
    deck: rest,
    discardPile: [],
    active: 0,
    taker: null,
    phase: 'handover',
    harbour: [],
    expeditions: [],
    selected: null,
    takesLeft: 1,
    repelShip: null,
    bustPair: null,
    tax: null,
    detail: null,
    toast: null,
    settings: false,
    winner: null,
    flipsBeyond: 0,
    scheduled: null,
  };
}

/* ---------------------------------------------------------------- selectors */

export const swordsOf = (p: Player) =>
  p.tableau.reduce(
    (a, c) => a + (c.kind === 'expedition' ? 0 : c.swords || 0),
    0,
  );

/**
 * Whether a player can repel a ship away. Swords are never spent, so the whole
 * tableau counts against every ship. Including the ones having 100 swords, which
 * is impossible to get in purpose
 */
export const canRepelWith = (p: Player, ship: ShipCard) =>
  swordsOf(p) >= ship.swords;

export const vpOf = (p: Player) =>
  p.tableau.reduce((a, c) => a + (c.vp || 0), 0);

/**
 * Paying and being rewarded are worked out separately. The hand is halved in the
 * payer's favour - thirteen coins: pays six and keeps seven. And the reward is
 * added afterwards, on top of what was kept.
 *
 * Everyone tied on the rewarded stat is paid. E.g. "Most Swords" Tax card: a table where nobody has a
 * sword yet is a tie, so all of the players are rewarded.
 */
export function taxRows(players: Player[], mode: TaxMode): TaxRow[] {
  const values = players.map(mode === 'mostSwords' ? swordsOf : vpOf);
  const best =
    mode === 'mostSwords' ? Math.max(...values) : Math.min(...values);

  return players.map((p, i) => ({
    name: p.name,
    pays: p.hand.length >= TAX_THRESHOLD ? Math.floor(p.hand.length / 2) : 0,
    gains: values[i] === best ? 1 : 0,
  }));
}

/**
 * How many of one expedition symbol (e.g. house) the player has hired on cards.
 */
const dedicatedOf = (p: Player, symbol: ExpeditionSymbol) =>
  p.tableau.filter((c) => c.kind === 'person' && c.expeditionItem === symbol)
    .length;

export const houseOf = (p: Player) => dedicatedOf(p, 'house');
export const crossOf = (p: Player) => dedicatedOf(p, 'cross');
export const anchorOf = (p: Player) => dedicatedOf(p, 'anchor');

/** Hired Jacks of all Trades, each of which covers any one symbol. */
export const jacksOf = (p: Player) =>
  p.tableau.filter(
    (c) => c.kind === 'person' && c.expeditionItem === 'jackOfAllTrades',
  ).length;

/** One expedition symbol, and the tableau card that would be handed in for it. */
type Slot = { fill: SlotFill; card: PersonCard | null };

/**
 * Which of an expedition's symbols the player's tableau cards cover, slot by slot,
 * in the order the expedition shows them.
 *
 * Normal cards (e.g. house or cross) are used first, then the Jacks of all Trades fill what is left.
 * This order gives the right answer, because a Jack fits any slot: using one on
 * a slot a normal card could take would only cover fewer slots, never more.
 *
 * It is also the best way to pay for the expedition: every card is worth one
 * point, so giving the normal card away keeps the flexible one for later.
 */
function slotsFor(p: Player, requires: ExpeditionSymbol[]): Slot[] {
  const unused = p.tableau.filter((c): c is PersonCard => c.kind === 'person');

  const takeOne = (item: ExpeditionItem) => {
    const i = unused.findIndex((c) => c.expeditionItem === item);
    return i < 0 ? null : unused.splice(i, 1)[0];
  };

  const slots = requires.map((symbol): Slot => {
    const card = takeOne(symbol);
    return { fill: card ? 'exact' : 'missing', card };
  });

  /* A second pass, because a Jack can only be handed to a slot once every
     dedicated card has been placed. */
  return slots.map((slot): Slot => {
    if (slot.card) return slot;
    const jack = takeOne('jackOfAllTrades');

    return jack ? { fill: 'wild', card: jack } : slot;
  });
}

/** How each of an expedition's symbols is covered, for drawing the chips. */
export const expeditionFill = (
  p: Player,
  requires: ExpeditionSymbol[],
): SlotFill[] => slotsFor(p, requires).map((slot) => slot.fill);

/**
 * Whether the player can claim this expedition with their current tableau.
 *
 * Each expedition is checked on its own, so one Jack of all Trades can make two
 * expeditions look claimable. The answer is "can I claim this one now?", not
 * "can I claim both?".
 */
export const canClaim = (p: Player, requires: ExpeditionSymbol[]) =>
  expeditionFill(p, requires).every((fill) => fill !== 'missing');

/**
 * How many extra coins the buyer's Traders pay out on a ship of this type.
 *
 * Each Trader has one ship type they pay one coin extra for it. Two Traders of
 * the same colour pay two extra coins — the abilities are counted, not the cards.
 */
export const extraCoinsFor = (p: Player, ship: ShipCard) => {
  const ability = extraCoinAbility(ship.name);

  return p.tableau.reduce(
    (a, c) =>
      a +
      (c.kind === 'person'
        ? c.abilities.filter((x) => x === ability).length
        : 0),
    0,
  );
};

/** Each Mademoiselle lowers the final price by one coin when buying a person. The price never drops below one. */
export const discountOf = (p: Player) =>
  p.tableau.filter((c) => c.name === MADEMOISELLE).length;

export const priceOf = (card: HarbourCard, p: Player) =>
  card.kind === 'person' ? Math.max(1, card.price - discountOf(p)) : 0;

/**
 * Buying on someone else's turn costs one coin more, and that coin goes to the
 * active player rather than to the discard pile.
 *
 * A hire pays it out of hand. A ship pays it off the top of the coin amount it brings
 * in, so a 0 coin player can still take a ship.
 */
export const taxFor = (phase: GameState['phase']) =>
  phase === 'others' ? 1 : 0;

/**
 * Ships cost nothing to take, not even when picking other player's active turn. The "payment coin" comes out
 * of ship's coin amount. Persons are paid in coins from hand, plus that coin when
 * buying out of own turn.
 */
export const affordable = (card: HarbourCard, p: Player, tax = 0) =>
  card.kind === 'ship' ? true : p.hand.length >= priceOf(card, p) + tax;

/** Every Governor a player has bought is one more card they may take on their pick. */
export const governorsOf = (p: Player) =>
  p.tableau.filter((c) => c.name === GOVERNOR).length;

/** Every Admiral a player has, gives +2 coins when in "Harbour Display" is 5 or more cards during their buy phase */
export const admiralsOf = (p: Player) =>
  p.tableau.filter((c) => c.name === ADMIRAL).length;

/**
 * Every Jester a player has, gives 1 coin when in their turn to pick cards the "Harbour Display" is empty.
 *
 * If the active player has busted out (2 same coloured ship cards drawn), the players who have a Jester card(s) will get their coins
 */
export const jestersOf = (p: Player) =>
  p.tableau.filter((c) => c.name === JESTER).length;

/**
 * The ACTIVE player's picks grow with the different coloured ships in the harbour:
 *
 * **0-3 different coloured ships = 1 pick**
 *
 * **4 different coloured ships = 2 picks**
 *
 * **5 different coloured ships = 3 picks**
 *
 * Everyone else gets one pick their out-of-turn buy phase. Then add one
 * pick per Governor they own.
 */
export const takesFor = (harbour: HarbourCard[], s: GameState) => {
  const buyerIdx = s.phase === 'others' ? s.taker! : s.active;

  const colours = new Set(
    harbour
      .filter((c): c is ShipCard => c.kind === 'ship')
      .map((c) => c.colorIdx),
  ).size;

  const coloursExtraCardAmount =
    s.phase === 'others' ? 1 : colours >= 5 ? 3 : colours >= 4 ? 2 : 1;

  return coloursExtraCardAmount + governorsOf(s.players[buyerIdx]);
};

/** Whoever the board is currently showing — the buyer during the others phase. */
const seatIndexOf = (s: GameState) =>
  s.phase === 'others' && s.taker !== null ? s.taker : s.active;

export const seatOf = (s: GameState) => s.players[seatIndexOf(s)];

/**
 * A player may claim expeditions any time during their turn, and as many as
 * they are able to. Buying on someone else's turn counts as their turn too.
 */
export const claimingIn = (phase: GameState['phase']) =>
  phase === 'discovery' || phase === 'trade' || phase === 'others';

export type ClaimCheck = {
  /** The cards the seated player would hand in, one per symbol. */
  handIn: PersonCard[];
  /** Why the expedition cannot be claimed right now, or null when it can. */
  blocked: string | null;
};

/** Whether the seated player can claim this expedition now, and what it costs them. */
export function claimCheck(s: GameState, card: ExpeditionCard): ClaimCheck {
  const slots = slotsFor(seatOf(s), card.requires);
  const handIn = slots.flatMap((slot) => (slot.card ? [slot.card] : []));
  const missing = card.requires.filter((_, i) => !slots[i].card);

  const blocked = !claimingIn(s.phase)
    ? 'Expeditions can only be claimed during your turn.'
    : missing.length
      ? `Missing ${describeRequirement(missing)}.`
      : null;

  return { handIn, blocked };
}

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
  discardPile: DeckCard[],
): {
  deck: DeckCard[];
  taken: Coin[];
  discardPile: DeckCard[];
  reshuffled: boolean;
} {
  const taken: Coin[] = [];
  let d = deck.slice();
  let pile = discardPile;
  let reshuffled = false;

  for (let i = 0; i < n; i++) {
    if (!d.length) {
      if (!pile.length) break;
      d = shuffled(pile);
      pile = [];
      reshuffled = true;
    }
    taken.push(d.shift()!);
  }

  return { deck: d, taken, discardPile: pile, reshuffled };
}

const RESHUFFLE_NOTE = 'Discard pile reshuffled into the draw pile.';

/** A harbour this size or larger pays every Admiral out. */
const ADMIRAL_THRESHOLD = 5;

/** What one Admiral is worth when it pays out. */
const ADMIRAL_COINS = 2;

/**
 * The Admiral's payout, taken the moment a player's time to take cards begins.
 * So it is taking to whoever is buying, not only to the active player.
 *
 * Every Admiral pays, so two of them are four coins and so on.
 */
function payAdmirals(s: GameState, buyerIdx: number): GameState {
  const admirals = admiralsOf(s.players[buyerIdx]);
  if (!admirals || s.harbour.length < ADMIRAL_THRESHOLD) return s;

  const r = drawInto(s.deck, admirals * ADMIRAL_COINS, s.discardPile);
  const paid: GameState = { ...s, deck: r.deck, discardPile: r.discardPile };

  // Nothing left to draw: deck and discard pile are both dry, so the ability
  // simply pays nothing rather than the turn stalling on it.
  if (!r.taken.length) return paid;

  const buyer = s.players[buyerIdx];

  return withToast(
    {
      ...paid,
      players: s.players.map((p, i) =>
        i === buyerIdx ? { ...p, hand: p.hand.concat(r.taken) } : p,
      ),
    },
    r.reshuffled
      ? RESHUFFLE_NOTE
      : `${buyer.name} takes ${r.taken.length} coins — ${
          admirals > 1 ? `${admirals} Admirals` : 'the Admiral'
        } on a harbour of ${s.harbour.length}.`,
    r.reshuffled ? 'info' : 'gain',
  );
}

/** What single Jester card is worth when it pays out. */
const JESTER_COINS = 1;

/** How long the Jester's payout toast will last before turn is handed over. */
const JESTER_BEAT = 2500;

/** How long a bust toast lasts when there are no Jesters. */
const BUST_BEAT = 400;

const coins = (n: number) => `${n} coin${n === 1 ? '' : 's'}`;

/**
 * Lists the players from `from` onwards in turn order, and stops before the
 * active player. When the harbour is empty, these are the players who never
 * get their pick.
 *
 * With 4 players and player 0 active, `from = 2` gives [2, 3]. The list wraps
 * around from the last player back to the first, and stops at player 0.
 *
 * The list is empty when `from` is the active player, because then everyone
 * has already had their pick.
 */
function seatsFrom(s: GameState, from: number): number[] {
  const seats: number[] = [];
  for (let i = from; i !== s.active; i = (i + 1) % s.players.length) {
    seats.push(i);
  }
  return seats;
}

/**
 * Pays the Jesters of every player in `seats`: one coin for each Jester they
 * have. These are the players who never got their pick.
 *
 * The players are paid one after another, in turn order. This matters when the
 * deck runs out in the middle of the payout: the reshuffle then happens at the
 * same moment it would have if the players had taken their picks normally, one
 * by one.
 */
function payJesters(
  s: GameState,
  seats: number[],
): { next: GameState; list: string | null; reshuffled: boolean } {
  const players = s.players.slice();
  const paid: string[] = [];
  let deck = s.deck;
  let discardPile = s.discardPile;
  let reshuffled = false;

  for (const i of seats) {
    const jesters = jestersOf(players[i]);
    if (!jesters) continue;

    const r = drawInto(deck, jesters * JESTER_COINS, discardPile);
    deck = r.deck;
    discardPile = r.discardPile;
    reshuffled = reshuffled || r.reshuffled;

    // Deck and discard pile both dry: the ability simply pays nothing.
    if (!r.taken.length) continue;

    players[i] = { ...players[i], hand: players[i].hand.concat(r.taken) };
    paid.push(`${players[i].name} ${coins(r.taken.length)}`);
  }

  if (!paid.length) return { next: s, list: null, reshuffled };

  return {
    next: { ...s, players, deck, discardPile },
    list: `the Jesters pay: ${paid.join(', ')}`,
    reshuffled,
  };
}

/** Ends the turn, or the game if anyone has reached the target. */
function endTurn(s: GameState): GameState {
  const winner = s.players.findIndex((p) => vpOf(p) >= TARGET_VP);
  // Whatever nobody bought is swept off the harbour into discardPile.
  const discardPile = s.discardPile.concat(s.harbour);

  if (winner >= 0) {
    return {
      ...s,
      phase: 'end',
      winner,
      harbour: [],
      discardPile,
      scheduled: null,
    };
  }

  return {
    ...s,
    harbour: [],
    discardPile,
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
  let discardPile = s.discardPile;
  let note: GameState['toast'] = s.toast;

  if (!deck.length) {
    // CHECK THIS
    // Every card still in play is in a hand or a tableau. So there is nothing
    // left to flip, so discovery just stalls rather than crashing on an
    // empty deck. Later probably add "draw" game or something. Right now it just stops

    // Tested this and I got stuck with one Skiff-ship left and it gave 0 coins, because draw deck and discardPile were empty
    // Probably a draw game is a good solution at this point. Or either just leave as it is currently
    if (!discardPile.length) return s;

    deck = shuffled(discardPile);
    discardPile = [];
    note = { text: RESHUFFLE_NOTE, tone: 'info' };
  }

  const card = deck.shift()!;

  if (card.kind === 'tax') {
    return {
      ...s,
      deck,
      toast: note,
      // The tax card is resolved on the flip. It never gets to "Harbour display"
      discardPile: discardPile.concat(card),
      tax: { card, rows: taxRows(s.players, card.mode) },
      phase: 'tax',
    };
  }

  /*
   * An expedition is set aside above the harbour rather than put into display row. Expeditions
   * are never bought, it survives the end of the turn, and it takes no part in
   * the duplicate-ship check. Discovery carries on as if nothing was flipped.
   */
  if (card.kind === 'expedition') {
    return withToast(
      {
        ...s,
        deck,
        discardPile,
        expeditions: s.expeditions.concat(card),
      },
      `An expedition is posted — ${card.vp} points for ${describeRequirement(
        card.requires,
      )}.`,
      'info',
    );
  }

  const drawn: GameState = { ...s, deck, discardPile, toast: note };

  /*
   * A ship the active player can repel. The
   * choice is put to the player before the ship reaches the harbour, so
   * declining leaves exactly the state an unrepellable ship would have.
   */
  if (card.kind === 'ship') {
    if (canRepelWith(s.players[s.active], card)) {
      return { ...drawn, repelShip: card, phase: 'repel' };
    }

    return settleShip(drawn, card);
  }

  return { ...drawn, harbour: s.harbour.concat(card) };
}

/**
 * Puts a ship into harbour or ends the discovery if its colour is already in the harbour.
 * Both the flip and a declined repel come through here.
 */
function settleShip(s: GameState, card: ShipCard): GameState {
  const clash = s.harbour.find(
    (c): c is ShipCard => c.kind === 'ship' && c.colorIdx === card.colorIdx,
  );

  if (clash) {
    return { ...s, bustPair: [clash, card], phase: 'bust' };
  }

  return { ...s, harbour: s.harbour.concat(card) };
}

/** A repelled ship never gets to harbour, it goes straight to the discard pile. */
function repel(s: GameState): GameState {
  const card = s.repelShip;
  if (!card) return s;

  return withToast(
    {
      ...s,
      repelShip: null,
      discardPile: s.discardPile.concat(card),
      phase: 'discovery',
    },
    `${s.players[s.active].name} repels the ${card.name}. Discovery carries on.`,
    'gain',
  );
}

/** Waved through: the ship berths as though the repel had never been offered. */
function declineRepel(s: GameState): GameState {
  const card = s.repelShip;
  if (!card) return s;

  return settleShip({ ...s, repelShip: null, phase: 'discovery' }, card);
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
  let discardPile = s.discardPile;
  let toast: Toast;
  let reshuffled = false;

  // Buying out of own turn pays the active player a coin, on
  // top of whatever the card itself costs.
  const tax = taxFor(s.phase);
  const activeName = s.players[s.active].name;

  if (card.kind === 'ship') {
    // A Trader of the ship's color pays the buyer an extra coin
    const bonus = extraCoinsFor(buyer, card);
    const r = drawInto(deck, card.coins + bonus, discardPile);
    deck = r.deck;

    // The ship brings its coins in, so it lands on the pile the
    // draw was made from. It is never in the same shuffle as the coins it paid.
    discardPile = r.discardPile.concat(card);
    reshuffled = r.reshuffled;

    // The fee is taken off the coin amount rather than the hand, so an empty-handed
    // player can still pick a ship in. A one-coin ship just gives the coin to the active player.
    const skimmed = Math.min(tax, r.taken.length);
    players[s.active].hand = players[s.active].hand.concat(
      r.taken.slice(0, skimmed),
    );
    players[buyerIdx].hand = players[buyerIdx].hand.concat(
      r.taken.slice(skimmed),
    );

    const traded = bonus
      ? ` ${bonus} of them from ${bonus > 1 ? 'Traders' : 'a Trader'}.`
      : '';

    toast = {
      text: skimmed
        ? `${buyer.name} brings in the ${card.name} — ${
            r.taken.length - skimmed
          } coins aboard, ${skimmed} to ${activeName}.${traded}`
        : `${buyer.name} brings in the ${card.name} — ${r.taken.length} coins aboard.${traded}`,
      tone: 'gain',
    };
  } else {
    // The hire itself is always paid to the discard pile, whoever is buying. Only the
    // out-of-turn coin goes to the active player, and it comes out of hand.
    if (tax) {
      players[s.active].hand = players[s.active].hand.concat(
        players[buyerIdx].hand.splice(0, tax),
      );
    }

    const cost = priceOf(card, buyer);
    // The coins paid of a card are turning to cards again the moment they leave the hand.
    discardPile = discardPile.concat(players[buyerIdx].hand.splice(0, cost));

    players[buyerIdx].tableau.push(card);
    toast = {
      text: `${buyer.name} hires ${card.name} for ${cost} coins.${
        tax ? ` One coin to ${activeName}.` : ''
      }`,
      tone: 'gain',
    };

    if (players[buyerIdx].tableau.some((c) => c.name === GOVERNOR)) {
      const r = drawInto(deck, 1, discardPile);
      deck = r.deck;
      discardPile = r.discardPile;
      reshuffled = reshuffled || r.reshuffled;
      players[buyerIdx].hand = players[buyerIdx].hand.concat(r.taken);
    }
  }

  const harbour = s.harbour.filter((c) => c.id !== card.id);
  const takesLeft = s.takesLeft - 1;
  // Picks that are left when harbour is empty are simply lost, they don't carry into next round
  const done = takesLeft <= 0 || !harbour.length;

  const next: GameState = {
    ...s,
    players,
    deck,
    discardPile,
    harbour,
    selected: null,
    takesLeft,
    toast: reshuffled ? { text: RESHUFFLE_NOTE, tone: 'info' } : toast,
    scheduled: !done
      ? null
      : isActive
        ? { kind: 'TO_OTHERS', delay: 500 }
        : { kind: 'NEXT_TAKER', delay: 500 },
  };

  return next;
}

/**
 * The current player's (not ACTIVE player) hands in the characters the expedition asks for. They go
 * to the discard pile, the expedition joins the claimer's tableau for its
 * points, and its coins are drawn off the deck like any other coins.
 *
 * The turn does not move on: a player can claim as many as they are able to.
 */
function claimExpedition(s: GameState, id: number): GameState {
  const card = s.expeditions.find((e) => e.id === id);
  if (!card) return s;

  const { handIn, blocked } = claimCheck(s, card);
  if (blocked) return withToast(s, blocked, 'loss');

  const claimerIdx = seatIndexOf(s);
  const spent = new Set(handIn.map((c) => c.id));
  const r = drawInto(s.deck, card.coins, s.discardPile);

  const players = s.players.map((p, i) =>
    i === claimerIdx
      ? {
          ...p,
          hand: p.hand.concat(r.taken),
          tableau: p.tableau.filter((c) => !spent.has(c.id)).concat(card),
        }
      : p,
  );

  return withToast(
    {
      ...s,
      players,
      deck: r.deck,
      // Handed in after the draw, so they are never in the same shuffle as
      // the coins they paid for.
      discardPile: r.discardPile.concat(handIn),
      expeditions: s.expeditions.filter((e) => e.id !== id),
      detail: null,
    },
    `${s.players[claimerIdx].name} claims the expedition — ${card.vp} points and ${coins(
      r.taken.length,
    )}.${r.reshuffled ? ` ${RESHUFFLE_NOTE}` : ''}`,
    'gain',
  );
}

/**
 * The harbour is empty, but some players have not had their pick yet. Each of
 * them would have been asked to take a card and found none, so their Jesters
 * pay out. The turn then ends without opening a single one of those seats.
 *
 * The toast is shown during a short `gap` phase before the turn ends. Without
 * it the payout would never be read: `endTurn` puts the handover curtain over
 * the board, and that hides the toast too.
 */
function skipRemaining(s: GameState, from: number): GameState {
  const { next, list, reshuffled } = payJesters(s, seatsFrom(s, from));
  if (!list) return endTurn(s);

  return withToast(
    {
      ...next,
      selected: null,
      phase: 'gap',
      scheduled: { kind: 'END_TURN', delay: JESTER_BEAT },
    },
    `No cards left in the harbour — ${list}.${
      reshuffled ? ` ${RESHUFFLE_NOTE}` : ''
    }`,
    'gain',
  );
}

/** This is run when the active player has done their trading */
function toOthers(s: GameState): GameState {
  const first = (s.active + 1) % s.players.length;
  if (!s.harbour.length) return skipRemaining(s, first);
  return openSeat(s, first);
}

function nextTaker(s: GameState): GameState {
  const next = (s.taker! + 1) % s.players.length;
  // Back round to the active player: everyone has had their pick offered.
  if (next === s.active) return endTurn(s);
  if (!s.harbour.length) return skipRemaining(s, next);
  return openSeat(s, next);
}

/** Sets the next out-of-turn buyer and sets them their picks, Governors included. */
function openSeat(s: GameState, taker: number): GameState {
  const seated: GameState = {
    ...s,
    phase: 'others',
    taker,
    selected: null,
    scheduled: null,
  };

  return payAdmirals(
    { ...seated, takesLeft: takesFor(seated.harbour, seated) },
    taker,
  );
}

export function reducer(s: GameState, action: Action): GameState {
  switch (action.type) {
    case 'FLIP':
      return flip(s);

    // More different coloured ships in the harbour earns more picks before the others get a turn.
    // 0-3 different coloured ships = 1
    // 4 different coloured ships = 2
    // 5 different coloured ships = 3
    //
    // Stopping opens the active player's buy phase, so their Admirals pay out here.
    case 'STOP':
      return payAdmirals(
        {
          ...s,
          phase: 'trade',
          takesLeft: takesFor(s.harbour, s),
          selected: null,
        },
        s.active,
      );

    case 'ACK_BUST': {
      const swept: GameState = {
        ...s,
        harbour: [],
        bustPair: null,
        // All the drawn cards (harbour display), plus the duplicate ship that ended the drawing phase. The ship it
        // clashed with is already in the harbour, so sweeping the harbour carries it along.
        discardPile: s.discardPile.concat(
          s.harbour,
          s.bustPair ? [s.bustPair[1]] : [],
        ),
      };

      // Trade & hire phase is skipped altogether, so every other player's Jester pays
      // out just as it would have when their empty-handed seat came round. The
      // sweep happens first: the lost cards are on the pile a dry deck draws from.
      const { next, list, reshuffled } = payJesters(
        swept,
        seatsFrom(s, (s.active + 1) % s.players.length),
      );

      return withToast(
        {
          ...next,
          phase: 'gap',
          scheduled: {
            kind: 'END_TURN',
            delay: list ? JESTER_BEAT : BUST_BEAT,
          },
        },
        list
          ? `The haul is lost. No trade this turn — ${list}.${
              reshuffled ? ` ${RESHUFFLE_NOTE}` : ''
            }`
          : 'The haul is lost. No trade this turn.',
        'loss',
      );
    }

    case 'ACK_TAX': {
      const { rows } = s.tax!;
      let deck = s.deck.slice();
      let reshuffled = false;

      // Everyone's payment hits the discardPile before any reward is given, so a
      // payer who is also rewarded can be handed back a coin they just paid.
      // And the rotation of discardPile / deck stays in motion
      let discardPile = s.discardPile.concat(
        ...s.players.map((p, i) => p.hand.slice(0, rows[i].pays)),
      );

      const players = s.players.map((p, i) => {
        const row = rows[i];
        const hand = p.hand.slice(row.pays);

        if (row.gains) {
          const r = drawInto(deck, row.gains, discardPile);
          deck = r.deck;
          discardPile = r.discardPile;
          reshuffled = reshuffled || r.reshuffled;
          hand.push(...r.taken);
        }

        return { ...p, hand };
      });

      return {
        ...s,
        players,
        deck,
        discardPile,
        tax: null,
        phase: 'discovery',
        toast: reshuffled ? { text: RESHUFFLE_NOTE, tone: 'info' } : s.toast,
      };
    }

    case 'PICK': {
      if (s.phase !== 'trade' && s.phase !== 'others') return s;
      const buyer =
        s.phase === 'trade' ? s.players[s.active] : s.players[s.taker!];

      const tax = taxFor(s.phase);

      if (!affordable(action.card, buyer, tax)) {
        return withToast(
          s,
          tax
            ? `Not enough coins — ${s.players[s.active].name} takes one on top of the price.`
            : 'Not enough coins in hand.',
          'loss',
        );
      }

      return {
        ...s,
        selected: s.selected === action.card.id ? null : action.card.id,
      };
    }

    case 'REPEL':
      return repel(s);

    case 'DECLINE_REPEL':
      return declineRepel(s);

    case 'CLAIM_EXPEDITION':
      return claimExpedition(s, action.id);

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
