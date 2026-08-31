/**
 * Shapes and static card data for the Port Royal hotseat board.
 *
 * Ported from the `Port Royal Prototype.dc.html` design hand-off. The numbers
 * here (prices, sword counts, coin yields, the deck's composition) are the
 * prototype's balance and are reproduced exactly.
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

/** A duplicate colour in the harbour ends discovery — so colour IS identity. */
export type ShipColour = {
  name: string;
  color: string;
  /** Flag silhouette, so the colours stay distinguishable without relying on hue. */
  clip: string;
  shape: string;
};

export const SHIPS: ShipColour[] = [
  {
    name: 'Green',
    color: '#3F6B4A',
    shape: 'Swallowtail',
    clip: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 26% 50%)',
  },
  {
    name: 'Blue',
    color: '#2C5A7A',
    shape: 'Pennant',
    clip: 'polygon(0 0, 100% 50%, 0 100%)',
  },
  {
    name: 'Red',
    color: '#8E3B2F',
    shape: 'Square',
    clip: 'polygon(4% 4%, 96% 4%, 96% 96%, 4% 96%)',
  },
  {
    name: 'Yellow',
    color: '#B8862F',
    shape: 'Triangle',
    clip: 'polygon(0 0, 100% 0, 50% 100%)',
  },
  {
    name: 'Black',
    color: '#1F2A33',
    shape: 'Forked',
    clip: 'polygon(0 0, 100% 0, 62% 50%, 100% 100%, 0 100%)',
  },
];

export const SHIP_NAMES = [
  'Caravel',
  'Frigate',
  'Galleon',
  'Fluyt',
  'Pinnace',
  'Sloop',
  'Brigantine',
  'Barque',
];

export type PersonRole = 'fighter' | 'trader' | 'rule';

export type PersonTemplate = {
  name: string;
  role: PersonRole;
  swords: number;
  vp: number;
  price: number;
  text: string;
};

export const PERSONS: PersonTemplate[] = [
  {
    name: 'Sailor',
    role: 'fighter',
    swords: 1,
    vp: 0,
    price: 3,
    text: 'One sword toward every ship requirement.',
  },
  {
    name: 'Pirate',
    role: 'fighter',
    swords: 2,
    vp: 1,
    price: 4,
    text: "Two swords, and one influence point at sea's end.",
  },
  {
    name: 'Marine',
    role: 'fighter',
    swords: 2,
    vp: 0,
    price: 3,
    text: 'Two swords. Cheap muscle for repelling ships.',
  },
  {
    name: 'Trader — Spice',
    role: 'trader',
    swords: 0,
    vp: 1,
    price: 6,
    text: 'Supplies one spice symbol toward expeditions.',
  },
  {
    name: 'Trader — Fabric',
    role: 'trader',
    swords: 0,
    vp: 1,
    price: 6,
    text: 'Supplies one fabric symbol toward expeditions.',
  },
  {
    name: 'Trader — Wood',
    role: 'trader',
    swords: 0,
    vp: 1,
    price: 5,
    text: 'Supplies one wood symbol toward expeditions.',
  },
  {
    name: 'Jester',
    role: 'rule',
    swords: 0,
    vp: 1,
    price: 5,
    text: 'One extra card may be flipped before a duplicate ship busts the phase.',
  },
  {
    name: 'Governor',
    role: 'rule',
    swords: 0,
    vp: 2,
    price: 8,
    text: 'Draw a coin card whenever you hire or trade.',
  },
  {
    name: 'Mademoiselle',
    role: 'rule',
    swords: 0,
    vp: 1,
    price: 7,
    text: 'Every card costs you one coin less.',
  },
  {
    name: 'Captain',
    role: 'fighter',
    swords: 3,
    vp: 1,
    price: 6,
    text: 'Three swords. The largest ships come within reach.',
  },
];

/** Named card effects are matched by name, the way the prototype does it. */
export const JESTER = 'Jester';
export const GOVERNOR = 'Governor';
export const MADEMOISELLE = 'Mademoiselle';

export type ShipCard = {
  id: number;
  kind: 'ship';
  colorIdx: number;
  name: string;
  swords: number;
  coins: number;
};

export type PersonCard = PersonTemplate & { id: number; kind: 'person' };

/** Awarded by the tax event, so it has no price and never sits in the deck. */
export type BonusCard = {
  id: number;
  kind: 'bonus';
  name: string;
  role: PersonRole;
  swords: number;
  vp: number;
  text: string;
};

export type TaxCard = { id: number; kind: 'tax'; name: string };

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
