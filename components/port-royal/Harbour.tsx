import Image from 'next/image';
import { useEffect, useRef } from 'react';
import CardFlip from './CardFlip';
import Flag from './Flag';
import HarbourCard, { CARD_SIZE } from './HarbourCard';
import { DASHED_RULE } from './shapes';
import { affordable, priceOf } from '@/lib/port-royal/gameLogic';
import {
  CARD_ART_H,
  CARD_ART_W,
  cardArt,
  DeckCard,
  HarbourCard as HarbourCardType,
  Player,
  ShipCard,
  SHIPS,
} from '@/utils/port-royal/types';

/**
 * The harbour display — the cards flipped so far this turn, plus a read-out of
 * which ship colours are already exposed. During discovery every colour is
 * listed so the risk is legible; afterwards only the exposed ones remain.
 *
 * On the big board (`lg`) the cards are one row that scrolls sideways. Below
 * `lg` they are a grid of smaller cards, so every card can be seen at once.
 */
export default function Harbour({
  harbour,
  seat,
  buying,
  tax,
  discovering,
  selected,
  alternative,
  smoothScroll,
  revealing,
  flipMs,
  pickable,
  onPick,
  onInspect,
}: {
  harbour: HarbourCardType[];
  seat: Player;
  buying: boolean;
  /** The coin payed to the active player when the seat is buying out of their turn. */
  tax: number;
  discovering: boolean;
  selected: number | null;
  /** Draw the alternative face rather than the "whole" card. */
  alternative: boolean;
  /** Slide to a new card. Off when animations are reduced, then the row jumps. */
  smoothScroll: boolean;
  /** The card that is turning over right now or nothing turning over */
  revealing: DeckCard | null;
  /** How long the revealed card turns over. 0 = it is shown instantly */
  flipMs: number;
  /** A real player may pick a card. False while a bot is deciding. */
  pickable: boolean;
  onPick: (card: HarbourCardType) => void;
  onInspect: (card: HarbourCardType) => void;
}) {
  // A card that turns over but does not stay in the harbour (tax, expedition,
  // a ship that can be repelled or that busts). It is shown at the end of the
  // row only while it turns over.
  const visitor =
    revealing && !harbour.some((c) => c.id === revealing.id) ? revealing : null;

  // The colour of a ship still turning over is not shown yet, so the flags do not give it away.
  const seen = new Set(
    harbour
      .filter((c): c is ShipCard => c.kind === 'ship' && c.id !== revealing?.id)
      .map((c) => c.colorIdx),
  );

  // Scroll to the end when a card is flipped. Buying a card does not break the scroll to the end "flow"
  const scroller = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const shownCount = harbour.length + (visitor ? 1 : 0);
  const prevCount = useRef(shownCount);
  useEffect(() => {
    const el = scroller.current;
    if (el && shownCount > prevCount.current) {
      const behavior = smoothScroll ? 'smooth' : 'auto';
      if (row.current && getComputedStyle(row.current).display === 'grid') {
        // The grid does not scroll sideways, but a new row of cards can be
        // under the action bar or below the screen. Then the page scrolls so
        // the new card can be seen. "nearest" does nothing when it already is.
        row.current.lastElementChild?.scrollIntoView({
          block: 'nearest',
          behavior,
        });
      } else {
        el.scrollTo({ left: el.scrollWidth, behavior });
      }
    }
    prevCount.current = shownCount;
  }, [shownCount, smoothScroll]);

  return (
    <div className="flex min-h-0 flex-col gap-2.5 px-4 pt-3 pb-3 lg:px-6 lg:pt-4">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
        <div className="font-archivo text-portRoyal-teal text-[11px] font-bold tracking-[0.2em] uppercase">
          Harbour display
        </div>
        <div
          className="hidden h-px flex-1 sm:block"
          style={{ background: DASHED_RULE }}
        />
        <div className="flex flex-wrap gap-1.5 lg:gap-2">
          {SHIPS.map((ship, i) => {
            const exposed = seen.has(i);
            if (!discovering && !exposed) return null;

            return (
              <div
                key={ship.name}
                className={`flex items-center gap-1.5 border px-1.5 py-1 lg:px-2 ${
                  exposed
                    ? 'border-portRoyal-crimson bg-portRoyal-crimson/16'
                    : 'border-portRoyal-wood/50 bg-transparent'
                }`}
              >
                <Flag colorIdx={i} className="h-3 w-4.5" />
                <span className="font-archivo-narrow text-portRoyal-ink text-[9px] tracking-[0.14em] uppercase">
                  {exposed ? 'exposed' : 'clear'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        ref={scroller}
        className="border-portRoyal-wood/55 bg-portRoyal-parchment/35 border p-2 lg:min-h-79 lg:overflow-x-auto lg:overflow-y-hidden lg:p-3.5"
      >
        {shownCount === 0 && (
          <div className="grid h-40 place-items-center px-2 text-center lg:h-71.5">
            <div className="flex flex-col items-center gap-1.5">
              <div className="border-portRoyal-wood/80 h-18.5 w-18.5 rounded-full border border-dashed" />
              <div className="font-spectral text-portRoyal-slate text-[15px] italic">
                The harbour is empty. Flip a card to begin the voyage.
              </div>
            </div>
          </div>
        )}

        {/* `scroll-mb` keeps a card that is scrolled to above the action bar,
            which is pinned to the bottom of the screen below `lg`. */}
        <div
          ref={row}
          className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 *:scroll-mt-4 *:scroll-mb-40 md:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] lg:flex lg:items-start lg:gap-3"
        >
          {harbour.map((card) => (
            <CardFlip
              key={card.id}
              flipMs={card.id === revealing?.id ? flipMs : 0}
            >
              <HarbourCard
                card={card}
                price={priceOf(card, seat)}
                buying={buying}
                affordable={buying ? affordable(card, seat, tax) : true}
                selected={selected === card.id}
                alternative={alternative}
                pickable={pickable}
                onPick={() => onPick(card)}
                onInspect={() => onInspect(card)}
              />
            </CardFlip>
          ))}

          {visitor && (
            <CardFlip key={`visitor-${visitor.id}`} flipMs={flipMs}>
              {visitor.kind === 'ship' || visitor.kind === 'person' ? (
                <HarbourCard
                  card={visitor}
                  price={priceOf(visitor, seat)}
                  buying={false}
                  affordable
                  selected={false}
                  alternative={alternative}
                  pickable={false}
                  onPick={() => {}}
                  onInspect={() => onInspect(visitor)}
                />
              ) : (
                // Tax and expedition cards have no harbour face, so the printed card is shown.
                <Image
                  src={cardArt(visitor.image)}
                  alt={visitor.name}
                  width={CARD_ART_W}
                  height={CARD_ART_H}
                  className={`${CARD_SIZE} object-contain shadow-[0_6px_14px_rgba(31,42,51,0.16)]`}
                />
              )}
            </CardFlip>
          )}
        </div>
      </div>
    </div>
  );
}
