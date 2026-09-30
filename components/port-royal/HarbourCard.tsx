import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import Flag from './Flag';
import StatChip from './StatChip';
import { HATCH_PANEL, HATCH_SUBJECT, SUBJECT } from './shapes';
import {
  CARD_ART_DIR,
  CARD_ART_H,
  CARD_ART_W,
  cardArt,
  HarbourCard as HarbourCardType,
  ROLE_LABELS,
  SHIPS,
} from '@/utils/port-royal/types';

/**
 * The size of a card in the harbour. On the big board every card has the same
 * fixed size. Below `lg` the harbour is a grid, and a card is as wide as its
 * grid cell and keeps the shape of the printed card (178 × 286).
 */
export const CARD_SIZE =
  'aspect-[178/286] w-full lg:aspect-auto lg:h-71.5 lg:w-44.5';

type FaceProps = {
  card: HarbourCardType;
  price: number;
  buying: boolean;
  affordable: boolean;
  selected: boolean;
  /** A click picks the card. False while a bot is deciding, so the card does not look clickable. */
  pickable: boolean;
  onPick: () => void;
  onInspect: () => void;
};

/**
 * The card itself is the pick target, so inspecting must not select it.
 * The button is small, so an invisible `::before` makes the area that
 * reacts to a finger bigger than the circle.
 */
function InspectButton({
  card,
  onInspect,
  className,
}: {
  card: HarbourCardType;
  onInspect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Inspect ${card.name}`}
      onClick={(e) => {
        e.stopPropagation();
        onInspect();
      }}
      className={twMerge(
        'border-portRoyal-wood/80 bg-portRoyal-card/90 font-spectral text-portRoyal-teal hover:border-portRoyal-teal relative grid h-6.5 w-6.5 flex-none cursor-pointer place-items-center rounded-full border text-[12px] before:absolute before:-inset-2 before:content-[""] hover:border-2',
        className,
      )}
    >
      i
    </button>
  );
}

/**
 * Whole card instead of 'custom' card
 *
 * This is used when "Alternative card display" is **OFF**
 */
function PrintedFace({
  card,
  price,
  buying,
  affordable,
  selected,
  pickable,
  onPick,
  onInspect,
}: FaceProps) {
  const ship = card.kind === 'ship' ? SHIPS[card.colorIdx] : null;

  return (
    <div
      onClick={onPick}
      className={`relative ${CARD_SIZE} flex-none overflow-hidden shadow-[0_6px_14px_rgba(31,42,51,0.16)] outline-offset-[3px] transition-transform duration-120 ease-out hover:shadow-[0_12px_22px_rgba(31,42,51,0.22)] ${
        buying && pickable ? 'cursor-pointer' : 'cursor-default'
      } ${
        selected ? 'outline-portRoyal-teal -translate-y-1.5 outline-[3px]' : ''
      } ${buying && !affordable ? 'opacity-55' : 'opacity-100'}`}
    >
      <Image
        src={cardArt(card.image)}
        alt={card.name}
        width={CARD_ART_W}
        height={CARD_ART_H}
        className="h-full w-full object-contain"
      />

      {buying && (
        <span
          className={`absolute bottom-2 left-2 border px-2 py-0.75 text-[13px] font-bold tabular-nums ${
            affordable
              ? 'border-portRoyal-brass bg-portRoyal-slate text-white'
              : 'border-portRoyal-crimson bg-portRoyal-crimson text-portRoyal-ground'
          }`}
        >
          {ship ? (
            <span className="flex">
              {card.kind === 'ship' && card.coins}
              <Image
                src={`${CARD_ART_DIR}/realCoins.png`}
                alt="Coin icon"
                width={16}
                height={16}
                className="mt-0.5 ml-1 h-4 w-4"
              />
            </span>
          ) : (
            <span className="flex">
              {price}
              <Image
                src={`${CARD_ART_DIR}/realCoins.png`}
                alt="Coin icon"
                width={16}
                height={16}
                className="mt-0.5 ml-1 h-4 w-4"
              />
            </span>
          )}
        </span>
      )}

      <InspectButton
        card={card}
        onInspect={onInspect}
        className="absolute right-2 bottom-2"
      />
    </div>
  );
}

/**
 * Custom card layout instead of "whole" card
 *
 * This is used when "Alternative card display" is **ON**
 */
function ComposedFace({
  card,
  price,
  buying,
  affordable,
  selected,
  pickable,
  onPick,
  onInspect,
}: FaceProps) {
  const ship = card.kind === 'ship' ? SHIPS[card.colorIdx] : null;
  const muted = buying && !affordable;

  return (
    <div
      onClick={onPick}
      className={`relative ${CARD_SIZE} flex flex-none flex-col gap-1 overflow-hidden border p-1.5 shadow-[0_6px_14px_rgba(31,42,51,0.16)] outline-offset-[3px] transition-transform duration-120 ease-out hover:shadow-[0_12px_22px_rgba(31,42,51,0.22)] lg:gap-1.75 lg:p-2.25 ${
        buying && pickable ? 'cursor-pointer' : 'cursor-default'
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
          className={`font-spectral text-[12px] leading-[1.1] font-semibold lg:text-[15px] ${
            affordable ? 'text-portRoyal-ink' : 'text-portRoyal-slate'
          }`}
        >
          {card.name}
        </div>
        {card.kind === 'ship' && (
          <Flag
            colorIdx={card.colorIdx}
            className="h-3.5 w-5 lg:h-4.5 lg:w-6.5"
          />
        )}
      </div>

      <div
        className={`border-portRoyal-wood/70 bg-portRoyal-parchment/50 relative flex min-h-0 flex-1 items-center justify-center overflow-hidden border ${
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
        className={`text-portRoyal-ground flex min-w-0 items-center justify-between gap-1.5 px-1.5 py-0.75 ${
          selected || !ship ? 'bg-portRoyal-teal' : 'bg-portRoyal-ink'
        }`}
      >
        <span className="font-archivo-narrow truncate text-[8px] font-semibold tracking-[0.12em] uppercase lg:text-[9px] lg:tracking-[0.16em]">
          {card.kind === 'ship'
            ? `Ship · ${SHIPS[card.colorIdx].name}`
            : `Person · ${ROLE_LABELS[card.role]}`}
        </span>
        <span className="font-archivo-narrow hidden text-[9px] tracking-widest uppercase opacity-85 lg:inline">
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
        <span className="font-archivo-narrow text-portRoyal-slate hidden text-[9px] tracking-[0.14em] uppercase lg:inline">
          {ship ? 'Requirement' : 'Cost'}
        </span>
        <span
          className={`ml-auto border px-1.5 py-0.5 text-[12px] font-bold tabular-nums lg:px-2 lg:py-0.75 lg:text-[13px] ${
            affordable
              ? 'border-portRoyal-brass bg-portRoyal-brass/25 text-portRoyal-ink'
              : 'border-portRoyal-crimson bg-portRoyal-crimson/14 text-portRoyal-crimson'
          }`}
        >
          {ship ? `${card.swords}✦` : `${price}¤`}
        </span>
        <InspectButton card={card} onInspect={onInspect} />
      </div>
    </div>
  );
}

/** This determines if "Alternative" card layout should be used or not */
export default function HarbourCard({
  alternative,
  ...face
}: FaceProps & { alternative: boolean }) {
  return alternative || !face.card.image ? (
    <ComposedFace {...face} />
  ) : (
    <PrintedFace {...face} />
  );
}
