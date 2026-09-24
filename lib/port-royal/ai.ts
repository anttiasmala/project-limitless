/**
 * Basic logic of the computer player (AI).
 *
 * For every decision the bot returns one action — the same kind of action the
 * bottom bar sends when a human clicks a button. So the bot can never do
 * anything a human player could not do. It decides by giving every option a
 * value in coins:
 *
 * - **Buying**: every card in the harbour gets a value for the player who is
 *   buying. A ship is worth the coins it gives. A character is worth its
 *   points plus its ability, minus its price. The bot takes the best card as
 *   long as its value is above zero.
 * - **Discovery**: the bot compares flipping one more card against keeping
 *   what is already in the harbour — the risk of busting and losing
 *   everything, against what one more card (and maybe one more take) adds.
 * - **Expeditions** are claimed when they give more points than the characters
 *   the bot has to give away for them.
 *
 * The bot only uses information a human player at the table could also have:
 * which cards have not been seen yet. It never looks at the order of the draw
 * pile, and never at another player's hand.
 *
 * **Difficulty**: "hard" is the full strategy above. "normal" and "easy" use
 * the same calculation, but make the mistakes a human player makes: they
 * misjudge card values, care too little about abilities, flip too long or stop
 * too early, and sometimes do not notice an expedition they could claim.
 */

import {
  admiralsOf,
  affordable,
  claimCheck,
  claimingIn,
  expeditionFill,
  extraCoinsFor,
  governorsOf,
  nothingToDraw,
  priceOf,
  seatIndexOf,
  seatOf,
  swordsOf,
  takesFor,
  taxFor,
  vpOf,
} from './gameLogic';
import {
  Action,
  ADMIRAL,
  DeckCard,
  Difficulty,
  ExpeditionSymbol,
  GameState,
  GOVERNOR,
  HarbourCard,
  JESTER,
  MADEMOISELLE,
  PersonCard,
  Phase,
  Player,
  ShipCard,
  TARGET_VP,
  TAX_THRESHOLD,
} from '@/utils/port-royal/types';

/**
 * How long the bot waits before it plays its action. Long enough that a person
 * watching can follow what happened. The two confirmations (bust and tax) are
 * slower, because they show text on the screen that has to be read.
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

/* ------------------------------------------------------------------ difficulty */

/** The mistakes a difficulty level makes. "hard" makes none of them. */
type Profile = {
  /**
   * How many coins a card's value can be wrong, up or down. The bot then
   * buys the card it *thinks* is best, which is not always the best one.
   */
  misjudge: number;
  /**
   * How much of an ability's real value the bot sees (swords, extra coins,
   * special characters, expedition symbols). Points are always seen in full:
   * a new player understands points, but not what a Mademoiselle is worth.
   */
  abilitySense: number;
  /**
   * How wrong the push-your-luck guess can be, as a range for the multiplier on
   * the harbour the bot already has. Below 1 the bot is greedy and flips on,
   * above 1 it is careful and stops too early.
   */
  nerve: [low: number, high: number];
  /** The chance that the bot notices an expedition it can claim. */
  notice: number;
};

const PROFILES: Record<Difficulty, Profile> = {
  // For a first game: it buys almost at random, rarely claims an expedition,
  // and often busts or stops far too early.
  veryEasy: { misjudge: 4, abilitySense: 0.1, nerve: [0.4, 1.6], notice: 0.1 },
  easy: { misjudge: 2, abilitySense: 0.4, nerve: [0.6, 1.3], notice: 0.35 },
  normal: { misjudge: 0.7, abilitySense: 0.8, nerve: [0.85, 1.1], notice: 0.8 },
  hard: { misjudge: 0, abilitySense: 1, nerve: [1, 1], notice: 1 },
};

const profileOf = (p: Player) => PROFILES[p.difficulty];

/**
 * A number between 0 and 1 that looks random, but is always the same for the
 * same moment of the game.
 *
 * `Math.random` would not work here: the board asks the bot for its move again
 * after every change of the state, also when only a toast closes. Taking a card
 * is two steps (PICK, then TAKE), so with real random numbers the bot could
 * pick one card and then want another one, again and again. The moment is
 * described by the seat and the sizes of the piles, which do not change
 * between the two steps, but do change after every flip and every take.
 */
function roll(s: GameState, ...keys: number[]): number {
  const moment = [
    seatIndexOf(s),
    s.active,
    s.deck.length,
    s.discardPile.length,
    s.harbour.length,
    ...s.players.map((p) => p.tableau.length),
    ...keys,
  ];

  // A small integer hash (like MurmurHash3's final mixing steps).
  let h = 0x9e3779b9;
  for (const k of moment) {
    h = Math.imul(h ^ k, 0x85ebca6b);
    h ^= h >>> 13;
  }
  h = Math.imul(h ^ (h >>> 16), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 2 ** 32;
}

/** Different decisions use different keys, so their rolls do not repeat each other. */
const MISJUDGE_KEY = 1;
const NERVE_KEY = 2;
const NOTICE_KEY = 3;

export type BotTurn = { action: Action; delay: number };

/**
 * The move a computer player makes now, and how long to wait before making it.
 * Returns null when the game is not waiting for a bot at all.
 */
export function botTurn(s: GameState): BotTurn | null {
  // If someone opened an overlay, the overlay owns the board: looking at a
  // card during a bot's turn should not let the game keep running behind it.
  if (s.detail || s.settings) return null;

  // The engine has already planned this step by itself.
  if (s.scheduled) return null;

  // `seatOf` gives the player whose decision we are waiting for: the buyer
  // during the others phase, the active player in every other phase.
  if (seatOf(s).kind !== 'ai') return null;

  const action = decide(s);
  if (!action) return null;

  return { action, delay: BEAT[s.phase] ?? DEFAULT_BEAT };
}

export function decide(s: GameState): Action | null {
  switch (s.phase) {
    // A computer player has nothing to hand over, so it starts its turn at once.
    case 'handover':
      return { type: 'BEGIN_TURN' };

    case 'discovery':
      return claim(s) ?? discover(s);

    // Repelling is only useful when the ship would bust the harbour. A ship
    // with a new colour is better kept: it gives coins, and maybe one more take.
    case 'repel':
      return clashes(s, s.repelShip!)
        ? { type: 'REPEL' }
        : { type: 'DECLINE_REPEL' };

    case 'trade':
    case 'others':
      return claim(s) ?? buy(s);

    case 'bust':
      return { type: 'ACK_BUST' };

    case 'tax':
      return { type: 'ACK_TAX' };

    // `gap` and `end` belong to the engine; it decides what happens next.
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ valuation */

/** How far the game has gone: 0 at the start, 1 when somebody reaches the target. */
const progress = (s: GameState) =>
  Math.min(1, Math.max(...s.players.map(vpOf)) / TARGET_VP);

/**
 * What one victory point is worth in coins. Early in the game coins matter
 * more. When somebody gets close to the target, points matter more.
 */
const vpWorth = (s: GameState) => 2.5 + 2 * progress(s);

/**
 * What index the coin is placed in hand.
 *
 * e.g. coinWorth(0) is the first coin in the hand, coinWorth(8) the ninth.
 *
 * The first coins can buy anything in the harbour. After that a coin only
 * waits for a price it may never reach. The most expensive card costs nine,
 * and at the tax threshold half of the hand is lost to the next Tax card.
 * Giving later coins a smaller value also keeps the bot spending: every coin
 * in a hand is one card out of the draw pile, so if everybody saves coins the
 * deck runs out of cards.
 */
function coinWorth(indexInHand: number): number {
  if (indexInHand < 8) return 1;
  if (indexInHand < TAX_THRESHOLD) return 0.7;
  // This is already enough for any two cards in the harbour. More coins than
  // this are only saved, not used.
  if (indexInHand < 16) return 0.35;
  return 0.05;
}

/** What it is worth to gain `n` coins when the hand already holds `hand` coins. */
function coinsGained(hand: number, n: number): number {
  let worth = 0;
  for (let i = 0; i < n; i++) worth += coinWorth(hand + i);
  return worth;
}

/** What it costs to pay `n` coins out of a hand of `hand` coins. */
function coinsSpent(hand: number, n: number): number {
  let worth = 0;
  for (let i = 1; i <= n; i++) worth += coinWorth(hand - i);
  return worth;
}

/** One more sword is worth a lot while the common ships can still attack. */
function swordWorth(held: number): number {
  if (held < 2) return 1;
  if (held < 4) return 0.8;
  if (held < 6) return 0.5;
  return 0.15;
}

/** Paying the out-of-turn coin helps another player, so it is a small minus. */
const FEE_PENALTY = 0.3;

/**
 * Value of a symbol when no expedition on the table needs it. It can still be
 * useful for expeditions that come later.
 */
const SPECULATIVE_SYMBOL = 0.4;

const missingFor = (p: Player, requires: ExpeditionSymbol[]) =>
  expeditionFill(p, requires).filter((f) => f === 'missing').length;

/**
 * What an expedition symbol is worth: the part of an expedition on the table
 * that it completes, or a small guess value. A card can be handed in only
 * once, so it counts only for the expedition where it helps the most.
 */
function symbolWorth(s: GameState, p: Player, card: PersonCard): number {
  if (card.expeditionItem === 'none') return 0;

  const jack = card.expeditionItem === 'jackOfAllTrades';
  const withCard: Player = { ...p, tableau: p.tableau.concat(card) };
  let best = SPECULATIVE_SYMBOL * (jack ? 2 : 1);

  for (const e of s.expeditions) {
    const before = missingFor(p, e.requires);
    const closed = before - missingFor(withCard, e.requires);
    if (closed <= 0) continue;

    // The characters that are handed in take their own points away with them.
    const payoff = (e.vp - e.requires.length) * vpWorth(s) + e.coins;
    best = Math.max(best, (payoff * closed) / e.requires.length);
  }

  return best;
}

/** What this character is worth to the buyer, before its price is counted. */
function personWorth(s: GameState, p: Player, card: PersonCard): number {
  // Abilities pay off during the turns that are still left, so they lose
  // value near the end of the game. Points do not.
  const early = 1 - progress(s);

  let points = card.vp * vpWorth(s);

  if (vpOf(p) + card.vp >= TARGET_VP) points += 100;

  let ability = 0;

  for (let i = 0; i < card.swords; i++) {
    ability += swordWorth(swordsOf(p) + i) * (0.4 + 0.6 * early);
  }

  const traded = card.abilities.filter((a) =>
    a.startsWith('extraCoin_'),
  ).length;
  ability += traded * 2.2 * early;

  if (card.name === GOVERNOR) ability += 9 * early;
  if (card.name === MADEMOISELLE) ability += 3.5 * early;
  if (card.name === ADMIRAL) ability += 2.5 * early;
  if (card.name === JESTER) ability += 1.2 * early;

  // A Governor on the table gives a coin for every hire, also for this card.
  if (card.name === GOVERNOR || governorsOf(p)) ability += 1;

  ability += symbolWorth(s, p, card);

  return points + ability * profileOf(p).abilitySense;
}

/**
 * The total value of taking this card now, or null when the buyer cannot
 * afford it. A ship taken during someone else's turn gives its first coin to
 * the active player.
 */
function takeWorth(s: GameState, p: Player, card: HarbourCard): number | null {
  const fee = taxFor(s.phase);
  if (!affordable(card, p, fee)) return null;

  const hand = p.hand.length;

  if (card.kind === 'ship') {
    return coinsGained(
      hand,
      Math.max(0, card.coins + extraCoinsFor(p, card) - fee),
    );
  }

  const cost = priceOf(card, p) + fee;
  return personWorth(s, p, card) - coinsSpent(hand, cost) - fee * FEE_PENALTY;
}

/**
 * The value the buyer *thinks* the card has: the real value, plus or minus a
 * mistake of up to `misjudge` coins. A "hard" bot sees the real value.
 */
function judgedWorth(
  s: GameState,
  p: Player,
  card: HarbourCard,
): number | null {
  const worth = takeWorth(s, p, card);
  const { misjudge } = profileOf(p);
  if (worth === null || !misjudge) return worth;

  return worth + (roll(s, MISJUDGE_KEY, card.id) * 2 - 1) * misjudge;
}

/** The harbour cards, best first, with the value this buyer gives them. */
function ranked(s: GameState, p: Player) {
  return s.harbour
    .map((card) => ({ card, worth: judgedWorth(s, p, card) }))
    .filter((o): o is { card: HarbourCard; worth: number } => o.worth !== null)
    .sort((a, b) => b.worth - a.worth);
}

/* ------------------------------------------------------------------- decisions */

/** Claims the best expedition the player can claim, if it gives more than it costs. */
function claim(s: GameState): Action | null {
  if (!claimingIn(s.phase)) return null;

  const p = seatOf(s);

  // A weaker bot sometimes does not see the claim. The roll changes after
  // every flip and take, so it gets a new chance to see it later.
  if (roll(s, NOTICE_KEY) >= profileOf(p).notice) return null;

  let best: { id: number; gain: number } | null = null;

  for (const e of s.expeditions) {
    const { handIn, blocked } = claimCheck(s, e);
    if (blocked) continue;

    const lost = handIn.reduce((a, c) => a + c.vp, 0);
    const wins = vpOf(p) - lost + e.vp >= TARGET_VP;
    const gain = e.vp - lost + (wins ? 100 : 0);

    if (gain > 0 && (!best || gain > best.gain)) best = { id: e.id, gain };
  }

  return best && { type: 'CLAIM_EXPEDITION', id: best.id };
}

/**
 * Takes the best card that is worth taking, or stops buying. Taking a card is
 * two actions — first select, then take. This keeps the bot's moves the same
 * as a human's, and lets the person watching see which card it chose.
 */
function buy(s: GameState): Action {
  const p = seatOf(s);
  const done: Action =
    s.phase === 'trade' ? { type: 'TO_OTHERS' } : { type: 'PASS_TAKE' };

  // During its own turn the bot can use its takes freely. Out of turn, a card
  // must be clearly worth the coin that has to be paid to the active player.
  const threshold = s.phase === 'trade' ? 0.01 : 0.5;

  const [best] = ranked(s, p);
  if (!best || best.worth < threshold) return done;

  return s.selected === best.card.id
    ? { type: 'TAKE' }
    : { type: 'PICK', card: best.card };
}

const isShip = (c: HarbourCard): c is ShipCard => c.kind === 'ship';

const clashes = (s: GameState, ship: ShipCard) =>
  s.harbour.some((c) => isShip(c) && c.colorIdx === ship.colorIdx);

/** A harbour this big is always kept, whatever the calculation says. */
const MAX_HARBOUR = 10;

/** Harbour size where Admirals pay, and how many coins each one pays. */
const ADMIRAL_HARBOUR = 5;
const ADMIRAL_COINS = 2;

/** The sum of the `k` biggest values — what `k` takes out of them would give. */
function topSum(worths: number[], k: number): number {
  return worths
    .slice()
    .sort((a, b) => b - a)
    .slice(0, k)
    .reduce((a, w) => a + w, 0);
}

/**
 * Flip one more card, or stop and trade what is already in the harbour.
 *
 * Stopping is worth the current haul, meaning the value of the best cards the
 * player is allowed to take. Flipping is worth the average haul over every
 * card that could come up: the same haul, a better one, or nothing at all when
 * a ship of a colour that is already in the harbour cannot be repelled and
 * busts everything. The bot keeps flipping while that average is bigger.
 *
 * The cards that could come up are all the cards nobody has seen yet: the draw
 * pile, the discard pile and every hand, counted together. A human player
 * could keep the same count by watching which cards have been hired and
 * posted. It says nothing about the order of the draw pile, or about who holds
 * which card.
 */
function discover(s: GameState): Action {
  const FLIP: Action = { type: 'FLIP' };
  const STOP: Action = { type: 'STOP' };

  if (!s.harbour.length) return FLIP;

  // There is nothing left to draw, so flipping would end the game. Trade the
  // harbour first; the next player's flip ends the game.
  if (nothingToDraw(s)) return STOP;
  if (s.harbour.length >= MAX_HARBOUR) return STOP;

  const p = s.players[s.active];
  const swords = swordsOf(p);
  const admiralPay = coinsGained(p.hand.length, admiralsOf(p) * ADMIRAL_COINS);

  const worthOf = (c: HarbourCard) => Math.max(0, takeWorth(s, p, c) ?? 0);
  const berthed = s.harbour.map(worthOf);

  const haul = (harbour: HarbourCard[], worths: number[]) =>
    topSum(worths, takesFor(harbour, s)) +
    (harbour.length >= ADMIRAL_HARBOUR ? admiralPay : 0);

  const kept = haul(s.harbour, berthed);

  // A Tax card takes away half of a hand that is at or above the threshold.
  const taxed =
    kept -
    (p.hand.length >= TAX_THRESHOLD
      ? coinsSpent(p.hand.length, Math.floor(p.hand.length / 2))
      : 0);

  // When the draw pile is empty, the next card comes from the discard pile
  // after it is shuffled, so only those cards can come up. Everybody can see
  // that the draw pile is empty.
  const unseen = s.deck.length
    ? [...s.deck, ...s.discardPile, ...s.players.flatMap((x) => x.hand)]
    : s.discardPile;

  const outcome = (card: DeckCard): number => {
    switch (card.kind) {
      case 'ship':
        return !clashes(s, card)
          ? haul([...s.harbour, card], [...berthed, worthOf(card)])
          : swords >= card.swords
            ? kept // repelled: the flip is used up, but the haul stays the same
            : 0; // bust
      case 'person':
        return haul([...s.harbour, card], [...berthed, worthOf(card)]);
      case 'tax':
        return taxed;
      default:
        return kept; // an expedition is put on the table, the haul stays the same
    }
  };

  const outcomes = unseen.map(outcome);

  // No card can make the harbour better, so there is nothing to win. Without
  // this a greedy bot could repel the same ship forever: when the discard pile
  // is only that ship, it is shuffled back and flipped again.
  if (!outcomes.some((o) => o > kept)) return STOP;

  const pushed = outcomes.reduce((a, o) => a + o, 0);

  // A weaker bot guesses the risk wrong: its nerve moves the line where it
  // stops. For a "hard" bot the nerve is always exactly 1.
  const [low, high] = profileOf(p).nerve;
  const nerve = low + roll(s, NERVE_KEY) * (high - low);

  return pushed / unseen.length > kept * nerve ? FLIP : STOP;
}
