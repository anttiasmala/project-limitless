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

/** The engine is seat-count agnostic; these are the table sizes we offer. */
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

/** Stand-in names, used for any seat the player left blank on the landing page. */
export const DEFAULT_NAMES = ['Anne', 'Bart', 'Coen', 'Dirk', 'Elsa'];

/** The roster the board falls back to when nobody has chosen one. */
export const PLAYER_NAMES = DEFAULT_NAMES.slice(0, 3);

/** How the seats are filled. Only `hotseat` is playable so far. */
export type GameMode = 'hotseat' | 'ai' | 'online';

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

export type PersonTemplate = {
  name: string;
  role: PersonRole;
  swords: number;
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
    text: 'One sword toward every ship requirement.',
  },
  Pirate: {
    role: 'fighter',
    text: "Two swords, and influence at sea's end.",
  },
  Admiral: {
    role: 'rule',
    text: 'An extra coin whenever discovery ends with five or more cards displayed.',
  },
  Trader: {
    role: 'trader',
    text: 'An extra coin whenever you bring in a ship of their trade.',
  },
  'Jack of all Trades': {
    role: 'trader',
    text: 'Supplies a house, an anchor and a cross toward expeditions.',
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
    text: 'One extra card may be flipped before a duplicate ship busts the phase.',
  },
  Governor: {
    role: 'rule',
    text: 'Draw a coin card whenever you hire or trade.',
  },
  Mademoiselle: {
    role: 'rule',
    text: 'Every card costs you one coin less.',
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

export type TaxCard = {
  id: number;
  kind: 'tax';
  name: string;
  image: string;
};

/** What the draw pile holds. `BonusCard` is awarded, never drawn. */
export type DeckCard = ShipCard | PersonCard | TaxCard;

/** What can actually be laid out in the harbour — tax resolves on the flip. */
export type HarbourCard = ShipCard | PersonCard;

export type TableauCard = PersonCard | BonusCard;

/** Anything the detail overlay can be opened on. */
export type Card = ShipCard | PersonCard | BonusCard | TaxCard;

/** Coin cards are face-down to everyone but their holder, so only the id matters. */
export type Coin = { id: number };

export type Player = {
  name: string;
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
  | 'gap' // brief settle after a bust, before the turn ends
  | 'end';

export type TaxRow = { name: string; pays: number; gains: number };

export type ToastTone = 'gain' | 'loss' | 'info';

/* Toast and Scheduled are compared by object identity: the reducer mints a new
   object every time it raises one, and leaves the existing reference alone
   otherwise, so the timer effects restart exactly when they should. */

export type Toast = { text: string; tone: ToastTone };

/** Transitions the prototype ran off `setTimeout` after a `setState`. */
export type ScheduledKind = 'TO_OTHERS' | 'NEXT_TAKER' | 'END_TURN';

export type Scheduled = { kind: ScheduledKind; delay: number };

export type GameState = {
  players: Player[];
  deck: DeckCard[];
  discard: number;
  discardPile: [];
  active: number;
  taker: number | null;
  phase: Phase;
  harbour: HarbourCard[];
  selected: number | null;
  takesLeft: number;
  bustPair: [ShipCard, ShipCard] | null;
  tax: TaxRow[] | null;
  detail: Card | null;
  toast: Toast | null;
  settings: boolean;
  winner: number | null;
  /** Spends the Jester's one-off reprieve, so it can't absorb two duplicates. */
  flipsBeyond: number;
  /** Monotonic id source, kept in state so ids survive a restart cleanly. */
  nextId: number;
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
  | { type: 'RESTART' };
