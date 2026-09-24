/**
 * Shapes and static card data for the Port Royal hotseat board.
 *
 * Ported from the `Port Royal Prototype.dc.html` design hand-off. The board's
 * look is the prototype's; the deck itself is the printed one, held in
 * `cards.ts` and turned into `DeckCard`s by `buildDeck`. What lives here is
 * only what that raw data does not carry: how a ship type is drawn, and how a
 * character reads on the table.
 */

export const TARGET_VP = 12;

/** A hand this size or larger is halved by the tax event. */
export const TAX_THRESHOLD = 12;

/** The engine is seat-count agnostic; these are the table sizes we offer. */
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

/** Stand-in names, used for any seat the player left blank on the landing page. */
export const DEFAULT_NAMES = ['Anne', 'Bart', 'Coen', 'Dirk', 'Elsa'];

/** The roster the board falls back to when nobody has chosen one. */
export const PLAYER_NAMES = DEFAULT_NAMES.slice(0, 3);

/** Current gamemodes. Only `hotseat` is playable right now. */
export type GameMode = 'hotseat' | 'online';

/**
 * A human or computer seat. Playing against the computer is not a mode of its
 * own: it is a table where some of the chairs are `ai`, which is why any mix
 * of the two. E.g. one human against four bots, or four humans and one bot, etc
 */
export type SeatKind = 'human' | 'ai';

/** How well a computer seat plays. A human seat carries the difficulty, but ignores it. */
export type Difficulty = 'veryEasy' | 'easy' | 'normal' | 'hard';

/** Every difficulty level the landing page offers, in the order it shows them. */
export const DIFFICULTIES: Difficulty[] = ['veryEasy', 'easy', 'normal', 'hard'];

/** The level a seat starts on, and the one an unreadable URL falls back to. */
export const DEFAULT_DIFFICULTY: Difficulty = 'normal';

/** One chair at the table, as the landing page chose it. */
export type Seat = {
  name: string;
  kind: SeatKind;
  difficulty: Difficulty;
};

/** A second ship of a type in the harbour ends discovery — so type IS identity. */
export type ShipColour = {
  /** Matches the `name` of every `type: 'ship'` entry in `cards.ts`. */
  name: string;
  color: string;
  /** Flag silhouette, so the types stay distinguishable without relying on hue. */
  clip: string;
  shape: string;
};

/** The five printed ship types, in the order `colorIdx` indexes them. */
export const SHIPS: ShipColour[] = [
  {
    name: 'Skiff',
    color: '#3F6B4A',
    shape: 'Swallowtail',
    clip: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 26% 50%)',
  },
  {
    name: 'Flute',
    color: '#2C5A7A',
    shape: 'Pennant',
    clip: 'polygon(0 0, 100% 50%, 0 100%)',
  },
  {
    name: 'Frigate',
    color: '#8E3B2F',
    shape: 'Square',
    clip: 'polygon(4% 4%, 96% 4%, 96% 96%, 4% 96%)',
  },
  {
    name: 'Galleon',
    color: '#B8862F',
    shape: 'Triangle',
    clip: 'polygon(0 0, 100% 0, 50% 100%)',
  },
  {
    name: 'Pinance',
    color: '#1F2A33',
    shape: 'Forked',
    clip: 'polygon(0 0, 100% 0, 62% 50%, 100% 100%, 0 100%)',
  },
];

export type PersonRole = 'fighter' | 'trader' | 'rule';

/** The three expedition symbols an expedition card can ask for. */
export type ExpeditionSymbol = 'house' | 'cross' | 'anchor';

/**
 * The symbol a character supplies. The Jack of all Trades prints all three at
 * once, so it gets a value of its own rather than one of them.
 */
export type ExpeditionItem = ExpeditionSymbol | 'jackOfAllTrades' | 'none';

/**
 * **exact**: a card that covers the symbol (Settler, Priest, Captain).
 *
 * **wild** — Jack of all Trades is covering the symbol.
 *
 * **missing** — There are not Jack of all Trades or symbols covering it.
 */
export type SlotFill = 'exact' | 'wild' | 'missing';

/** How each expedition symbol is drawn where the art is too small to read. */
export const EXPEDITION_SYMBOLS: Record<
  ExpeditionSymbol,
  { glyph: string; label: string }
> = {
  house: { glyph: '⌂', label: 'house' },
  cross: { glyph: '✚', label: 'cross' },
  anchor: { glyph: '⚓', label: 'anchor' },
};

const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];

/**
 * What symbols an expedition asks for. This describes it as a text. Like: Two anchors and one house
 * This text will be used in a toast
 */
export function describeRequirement(requires: ExpeditionSymbol[]): string {
  const parts = (['house', 'cross', 'anchor'] as ExpeditionSymbol[])
    .map((symbol) => {
      const number = requires.filter((r) => r === symbol).length;
      if (!number) return null;
      const { label } = EXPEDITION_SYMBOLS[symbol];
      return `${COUNT_WORDS[number] ?? number} ${number === 1 ? label : label === 'cross' ? `${label}es` : `${label}s`}`;
    })
    .filter((part): part is string => part !== null);

  if (!parts.length) return 'nothing';

  return parts.length > 1
    ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
    : parts[0];
}

/**
 * What a character card actually does, named the way `cards.ts` names it.
 *
 * An ability is printed once per instance, so the list carries duplicates: the
 * Pirate is `['swords', 'swords']`, and the Jack of all Trades prints all three
 * expedition symbols at once.
 */
export type Ability =
  | 'swords'
  | 'fiveCards'
  | 'oneCheaper'
  | 'boardEmpty'
  | 'extraCard'
  | 'extraCoin_skiff'
  | 'extraCoin_flute'
  | 'extraCoin_frigate'
  | 'extraCoin_galleon'
  | 'extraCoin_pinance'
  | 'house'
  | 'anchor'
  | 'cross';

/**
 * The ability a Trader of a given ship type pays out an extra coin on.
 */
export const extraCoinAbility = (shipName: string) =>
  `extraCoin_${shipName.toLowerCase()}` as Ability;

const EXTRA_COIN_SHIPS = new Map(
  SHIPS.map((s) => [extraCoinAbility(s.name), s.name]),
);

/** The ship type an `extraCoin_*` ability names, or `undefined` for any other. */
export const shipForAbility = (ability: Ability) =>
  EXTRA_COIN_SHIPS.get(ability);

/**
 * Replaces the `{ship}` text with a correct ship text. Every Trader shares one profile, but each names its own ship.
 */
export function fillPersonText(text: string, abilities: Ability[]): string {
  if (!text.includes('{ship}')) return text;

  const ship = abilities.map(shipForAbility).find(Boolean);

  return text.replace('{ship}', ship ?? 'ship of their colour');
}

const isExpeditionSymbol = (a: Ability): a is ExpeditionSymbol =>
  a in EXPEDITION_SYMBOLS;

/**
 * The expedition symbol a character supplies. Carrying more than one means
 * carrying all three, which is the Jack of all Trades.
 */
export function expeditionItemOf(abilities: Ability[]): ExpeditionItem {
  const symbols = abilities.filter(isExpeditionSymbol);

  return symbols.length > 1 ? 'jackOfAllTrades' : (symbols[0] ?? 'none');
}

export type PersonTemplate = {
  name: string;
  role: PersonRole;
  swords: number;
  /** Straight from `cards.ts`. */
  abilities: Ability[];
  /** vp = Victory points */
  vp: number;
  expeditionItem: ExpeditionItem;
  price: number;
  text: string;
};

/** How a hired character reads on the table, once the deck data is in hand. */
export type PersonProfile = { role: PersonRole; text: string };

/**
 * Keyed by the character `name` in `cards.ts`. Points, price and swords come
 * from the card data itself; the tableau column a character sorts into and the
 * line the detail overlay prints do not, so they live here.
 *
 * Only the Jester, the Governor and the Mademoiselle are wired into the
 * engine — the rest are points, swords and expedition symbols for now, and
 * their text describes the printed card rather than an implemented effect.
 */
export const PERSON_PROFILES: Record<string, PersonProfile> = {
  Sailor: {
    role: 'fighter',
    text: 'One sword toward ship repel requirement.',
  },
  Pirate: {
    role: 'fighter',
    text: 'Two swords toward ship repel requirement.',
  },
  Admiral: {
    role: 'rule',
    text: 'Whenever it is your time to take cards, get two coins if there are five or more cards in the display.',
  },
  Trader: {
    role: 'trader',
    /* `{ship}` is filled in per card by `fillPersonText` — each Trader names its own (e.g. Skiff). */
    text: 'Get an extra coin whenever you take a {ship}.',
  },
  'Jack of all Trades': {
    role: 'trader',
    text: 'Supplies one of expedition symbol (a house, an anchor or a cross) toward expeditions.',
  },
  Captain: {
    role: 'trader',
    text: 'Supplies one anchor toward expeditions.',
  },
  Priest: {
    role: 'trader',
    text: 'Supplies one cross toward expeditions.',
  },
  Settler: {
    role: 'trader',
    text: 'Supplies one house toward expeditions.',
  },
  Jester: {
    role: 'rule',
    text: 'If you are currently not the active player and it is your turn to take cards. Get one coin if there are 0 cards in the display',
  },
  Governor: {
    role: 'rule',
    text: 'Whenever it is your time to take cards, you can take 1 more card from the display. If you are not the active player, you have to pay the active player 1 coin for each card taken.',
  },
  Mademoiselle: {
    role: 'rule',
    text: 'Every card costs you one coin less. The cost cannot be discounted to less than 0.',
  },
};

/** For a character `cards.ts` gains before this table catches up. */
export const DEFAULT_PERSON_PROFILE: PersonProfile = {
  role: 'rule',
  text: 'No effect beyond the points printed on the card.',
};

/** Named card effects are matched by name, the way the prototype does it. */
export const JESTER = 'Jester';
export const GOVERNOR = 'Governor';
export const MADEMOISELLE = 'Mademoiselle';
export const ADMIRAL = 'Admiral';

/** Where the `imageName` of a card in `cards.ts` resolves to under `public/`. */
export const CARD_ART_DIR = '/images/port-royal';

/** Player preferences, kept in `localStorage` rather than in game state. */
export const SETTINGS_KEY = 'portRoyalSettings';

export type Settings = {
  /**
   * **Off** — the default, draws a drawn card as the printed (whole card) card.
   *
   * **On** — swaps in the composed face: the art inset in a panel, with the name,
   * flag, stat chips and price set around it.
   */
  alternativeTheme: boolean;
};

export const DEFAULT_SETTINGS: Settings = { alternativeTheme: false };

/** The printed card art is 204×315, so every face draws at the same ratio. */
export const CARD_ART_W = 204;
export const CARD_ART_H = 315;

export const cardArt = (image: string) => `${CARD_ART_DIR}/${image}`;

export type ShipCard = {
  id: number;
  kind: 'ship';
  colorIdx: number;
  name: string;
  swords: number;
  coins: number;
  /** File name of the printed card, straight from `cards.ts`. */
  image: string;
};

export type PersonCard = PersonTemplate & {
  id: number;
  kind: 'person';
  image: string;
};

/**
 * Awarded by the tax event, so it has no price, never sits in the deck, and —
 * being unprinted — has no card art either.
 */
export type BonusCard = {
  id: number;
  kind: 'bonus';
  name: string;
  role: PersonRole;
  swords: number;
  vp: number;
  text: string;
};

/**
 * Which the Tax card pays the coin to. Two of the four Tax cards pay the
 * most swords, the other two pay whoever is furthest behind on points.
 */
export type TaxMode = 'mostSwords' | 'lowestPoints';

export type TaxCard = {
  id: number;
  kind: 'tax';
  name: string;
  mode: TaxMode;
  image: string;
};

/**
 * Set aside above the harbour when flipped rather than joining the display, and
 * left there across turns. An expedition is not bought, it is claimed later by
 * discarding characters that carry the symbols it asks for.
 *
 */
export type ExpeditionCard = {
  id: number;
  kind: 'expedition';
  name: string;
  /** The symbols that have to be handed in to claim it. */
  requires: ExpeditionSymbol[];
  /** Coins paid out on claiming, on top of the influence. */
  coins: number;
  vp: number;
  image: string;
};

/** What the draw pile holds. `BonusCard` is awarded, never drawn. */
export type DeckCard = ShipCard | PersonCard | TaxCard | ExpeditionCard;

/**
 * What can actually be set to display row out in the harbour. Tax resolves on the flip, and
 * an expedition is set aside in its own row.
 */
export type HarbourCard = ShipCard | PersonCard;

/** A claimed expedition sits in the claimer's tableau, so its points count. */
export type TableauCard = PersonCard | BonusCard | ExpeditionCard;

/** Anything the detail overlay can be opened on. */
export type Card = ShipCard | PersonCard | BonusCard | TaxCard | ExpeditionCard;

/**
 * A coin is a deck card turned face-down
 */
export type Coin = DeckCard;

export type Player = {
  name: string;
  /** Whether the board waits for a real-player here, or the bot plays its turn. */
  kind: SeatKind;
  /** How sharply the bot plays this seat */
  difficulty: Difficulty;
  hand: Coin[];
  tableau: TableauCard[];
};

export type Phase =
  | 'handover' // pass-the-device curtain
  | 'discovery' // flipping cards, pushing luck
  | 'trade' // active player buys
  | 'others' // the other players buy, paying the active one
  | 'bust' // duplicate ship colour
  | 'tax' // tax event resolution
  | 'repel' // repel the ship drawn
  | 'gap' // brief settle after a bust, before the turn ends
  | 'end';

export type TaxRow = { name: string; pays: number; gains: number };

/** The flipped Tax card together with pays / gains numbers */
export type TaxEvent = { card: TaxCard; rows: TaxRow[] };

export type ToastTone = 'gain' | 'loss' | 'info';

/* Toast and Scheduled are compared by object identity: the reducer mints a new
   object every time it raises one, and leaves the existing reference alone
   otherwise, so the timer effects restart exactly when they should. */

export type Toast = { text: string; tone: ToastTone };

/** Transitions the prototype ran off `setTimeout` after a `setState`. */
export type ScheduledKind = 'TO_OTHERS' | 'NEXT_TAKER' | 'END_TURN';

export type Scheduled = { kind: ScheduledKind; delay: number };

/**
 * - `target`: a player reached TARGET_VP at the end of a turn.
 * - `deckDry`: a flip found no cards in the draw pile or the discard pile.
 *   Every card is in a hand or a tableau, so the game cannot go on.
 */
export type EndReason = 'target' | 'deckDry';

export type GameState = {
  players: Player[];
  deck: DeckCard[];
  /**
   * Every card that has left the play: coins spent, ships taken or repelled, the
   * cards lost to a bust, resolved tax cards. The deck is rebuilt from here when it runs dry
   */
  discardPile: DeckCard[];
  active: number;
  taker: number | null;
  phase: Phase;
  harbour: HarbourCard[];
  /** Flipped expeditions, waiting to be claimed. Outlives the turn. */
  expeditions: ExpeditionCard[];
  selected: number | null;
  takesLeft: number;
  /**
   * The freshly flipped ship the active player is being offered a repel on (if enough swords).
   * It is held aside rather than put in the harbour, so declining puts it
   * exactly as an unrepellable ship would - bust check included.
   */
  repelShip: ShipCard | null;
  bustPair: [ShipCard, ShipCard] | null;
  tax: TaxEvent | null;
  detail: Card | null;
  toast: Toast | null;
  settings: boolean;
  /**
   * The seats that won, filled in when the game ends. More than one seat means
   * a shared victory: the same points and the same number of coins.
   */
  winners: number[];
  /** Why the game ended. Null while the game is still being played. */
  endReason: EndReason | null;
  /** Spends the Jester's one-off reprieve, so it can't absorb two duplicates. */
  flipsBeyond: number;
  scheduled: Scheduled | null;
};

export type Action =
  | { type: 'FLIP' }
  | { type: 'STOP' }
  | { type: 'ACK_BUST' }
  | { type: 'ACK_TAX' }
  | { type: 'PICK'; card: HarbourCard }
  | { type: 'TAKE' }
  | { type: 'TO_OTHERS' }
  | { type: 'PASS_TAKE' }
  | { type: 'NEXT_TAKER' }
  | { type: 'END_TURN' }
  | { type: 'BEGIN_TURN' }
  | { type: 'INSPECT'; card: Card }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'SHUFFLE' }
  | { type: 'RESTART' }
  | { type: 'REPEL' }
  | { type: 'DECLINE_REPEL' }
  | { type: 'CLAIM_EXPEDITION'; id: number };
