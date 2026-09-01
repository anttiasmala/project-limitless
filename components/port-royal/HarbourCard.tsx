import Image from 'next/image';
import Flag from './Flag';
import StatChip from './StatChip';
import { HATCH_PANEL, HATCH_SUBJECT, SUBJECT } from './shapes';
import {
  CARD_ART_H,
  CARD_ART_W,
  cardArt,
  HarbourCard as HarbourCardType,
  SHIPS,
} from '@/utils/port-royal/types';

/**
 * One card face in the harbour display.
 *
 * Three states drive nearly every colour on it: whether the seat is currently
 * buying, whether they can afford this card, and whether it is selected. When
 * buying is off (during discovery) nothing is dimmed — the cards are just
 * evidence of how far the luck has been pushed.
 */
export default function HarbourCard({
  card,
  price,
  buying,
  affordable,
  selected,
  onPick,
  onInspect,
}: {
  card: HarbourCardType;
  price: number;
  buying: boolean;
  affordable: boolean;
  selected: boolean;
  onPick: () => void;
  onInspect: () => void;
}) {
  const ship = card.kind === 'ship' ? SHIPS[card.colorIdx] : null;
  const muted = buying && !affordable;

  return (
    <div
      onClick={onPick}
      className={`relative flex h-71.5 w-44.5 flex-none flex-col gap-1.75 border p-2.25 shadow-[0_6px_14px_rgba(31,42,51,0.16)] outline-offset-[3px] transition-transform duration-120 ease-out hover:shadow-[0_12px_22px_rgba(31,42,51,0.22)] ${
        buying ? 'cursor-pointer' : 'cursor-default'
      } ${
        selected
          ? 'border-portRoyal-teal outline-portRoyal-teal -translate-y-1.5 bg-[#FFFDF7]/98 outline-[3px]'
          : muted
            ? 'border-portRoyal-wood bg-portRoyal-parchment/62'
            : buying
              ? 'border-portRoyal-brass bg-portRoyal-card/85'
              : 'border-portRoyal-wood bg-portRoyal-card/85'
      }`}
    >
      {/* Inner keyline — the printed border inside the card's cut edge. */}
      <div className="border-portRoyal-wood/40 pointer-events-none absolute inset-1 border" />

      <div className="flex items-start justify-between gap-1.5">
        <div
          className={`font-spectral text-[15px] leading-[1.1] font-semibold ${
            affordable ? 'text-portRoyal-ink' : 'text-portRoyal-slate'
          }`}
        >
          {card.name}
        </div>
        {card.kind === 'ship' && (
          <Flag colorIdx={card.colorIdx} className="h-4.5 w-6.5" />
        )}
      </div>

      <div
        className={`border-portRoyal-wood/70 bg-portRoyal-parchment/50 relative flex min-h-26 flex-1 items-center justify-center overflow-hidden border ${
          muted ? 'opacity-45' : 'opacity-100'
        }`}
        style={{ backgroundImage: HATCH_PANEL }}
      >
        {card.image ? (
          <Image
            src={cardArt(card.image)}
            alt={card.name}
            width={CARD_ART_W}
            height={CARD_ART_H}
            className="h-full w-auto object-contain"
          />
        ) : (
          <>
            <div
              className="h-[56%] w-[54%] border border-[rgba(31,42,51,0.4)]"
              style={{
                backgroundImage: HATCH_SUBJECT,
                clipPath: ship ? SUBJECT.SHIP : SUBJECT.FIGURE,
              }}
            />
            <div className="font-archivo-narrow text-portRoyal-wood absolute right-1 bottom-0.75 left-1 text-center text-[9px] tracking-[0.12em] uppercase">
              {ship ? 'ship silhouette' : 'figure study'}
            </div>
          </>
        )}
      </div>

      <div
        className={`text-portRoyal-ground flex items-center justify-between gap-1.5 px-1.5 py-0.75 ${
          selected || !ship ? 'bg-portRoyal-teal' : 'bg-portRoyal-ink'
        }`}
      >
        <span className="font-archivo-narrow text-[9px] font-semibold tracking-[0.16em] uppercase">
          {card.kind === 'ship'
            ? `Ship · ${SHIPS[card.colorIdx].name}`
            : `Person · ${card.role}`}
        </span>
        <span className="font-archivo-narrow text-[9px] tracking-widest uppercase opacity-85">
          {ship ? ship.shape : 'hire'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.25">
        {card.kind === 'ship' ? (
          <>
            <StatChip kind="sword" value={card.swords} label="needed" />
            <StatChip kind="coin" value={card.coins} label="gained" />
          </>
        ) : (
          <>
            <StatChip kind="sword" value={card.swords} label="sw" />
            <StatChip kind="vp" value={card.vp} label="pts" />
          </>
        )}
      </div>

      <div className="mt-auto flex items-center gap-1.75">
        <span className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.14em] uppercase">
          {ship ? 'Requirement' : 'Cost'}
        </span>
        <span
          className={`ml-auto border px-2 py-0.75 text-[13px] font-bold tabular-nums ${
            affordable
              ? 'border-portRoyal-brass bg-portRoyal-brass/25 text-portRoyal-ink'
              : 'border-portRoyal-crimson bg-portRoyal-crimson/14 text-portRoyal-crimson'
          }`}
        >
          {ship ? `${card.swords}✦` : `${price}¤`}
        </span>
        <button
          type="button"
          aria-label={`Inspect ${card.name}`}
          onClick={(e) => {
            // The card itself is the pick target; inspecting must not select it.
            e.stopPropagation();
            onInspect();
          }}
          className="border-portRoyal-wood/80 bg-portRoyal-card/90 font-spectral text-portRoyal-teal hover:border-portRoyal-teal grid h-6.5 w-6.5 flex-none place-items-center rounded-full border text-[12px]"
        >
          i
        </button>
      </div>
    </div>
  );
}
