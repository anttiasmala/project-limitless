/**
 * Clip-path silhouettes for the card artwork placeholders.
 *
 * The design ships stand-ins rather than illustrations, so these stay as they
 * are until real card art exists. `FIGURE` is the prototype's `SUBJ.bust` — a
 * portrait bust, nothing to do with the game's bust phase.
 */
export const SUBJECT = {
  SHIP: 'polygon(0 55%, 100% 55%, 84% 100%, 16% 100%)',
  FIGURE: 'polygon(30% 0, 70% 0, 82% 45%, 100% 100%, 0 100%, 18% 45%)',
} as const;

/** Hatching used behind the artwork placeholder and on the subject itself. */
export const HATCH_PANEL =
  'repeating-linear-gradient(45deg, rgba(31,42,51,0.15) 0 1px, transparent 1px 6px)';

export const HATCH_PANEL_SOFT =
  'repeating-linear-gradient(45deg, rgba(31,42,51,0.14) 0 1px, transparent 1px 6px)';

export const HATCH_SUBJECT =
  'repeating-linear-gradient(-45deg, rgba(31,42,51,0.45) 0 1px, transparent 1px 4px)';

/** The board's aged-paper ground: a vignette over fine monochrome noise. */
export const BOARD_VIGNETTE =
  'radial-gradient(120% 90% at 50% 35%, rgba(239,227,200,0) 42%, rgba(140,106,67,0.22) 100%)';

export const BOARD_NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.15'/></svg>\")";

/** The dashed rule that separates the harbour heading from its flag chips. */
export const DASHED_RULE =
  'repeating-linear-gradient(90deg, #8C6A43 0 5px, transparent 5px 9px)';
