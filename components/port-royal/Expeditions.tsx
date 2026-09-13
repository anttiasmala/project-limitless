import { canClaim, expeditionFill } from '@/lib/port-royal/gameLogic';
import { DASHED_RULE } from './shapes';
import {
  EXPEDITION_SYMBOLS,
  ExpeditionCard,
  ExpeditionSymbol,
  Player,
  SlotFill,
} from '@/utils/port-royal/types';

/**
 * This has styling for 3 types, exact-card (e.g. house),
 * wild = Jack of all Trades and then not hired
 */
const CHIP_FILLS: Record<SlotFill, { className: string; note: string }> = {
  exact: {
    className:
      'border-portRoyal-teal bg-portRoyal-teal text-portRoyal-card font-bold',
    note: 'hired',
  },
  wild: {
    className:
      'border-portRoyal-teal border-dashed bg-portRoyal-teal/22 text-portRoyal-tealDeep font-bold',
    note: 'covered by a Jack of all Trades',
  },
  missing: {
    className:
      'border-portRoyal-wood/70 bg-portRoyal-parchment/60 text-portRoyal-ink',
    note: 'not hired',
  },
};

/** One symbol the expedition asks for, drawn as a glyph rather than as art. */
function SymbolChip({
  symbol,
  fill,
}: {
  symbol: ExpeditionSymbol;
  fill: SlotFill;
}) {
  const s = EXPEDITION_SYMBOLS[symbol];
  const { className, note } = CHIP_FILLS[fill];

  return (
    <span
      title={`${s.label} — ${note}`}
      className={`grid h-6 w-6 place-items-center border text-[12px] leading-none ${className}`}
    >
      <span aria-hidden>{s.glyph}</span>
      <span className="sr-only">{`${s.label}, ${note}`}</span>
    </span>
  );
}

/**
 * The expeditions posted so far. Unlike the harbour this row is not cleared at
 * the end of a turn. An expedition stays in the expeditions place until it is claimed.
 */
export default function Expeditions({
  expeditions,
  seat,
  claiming,
  onInspect,
}: {
  expeditions: ExpeditionCard[];
  /** The player the symbols are matched against: whoever is taking cards. */
  seat: Player;
  /** Whether the phase lets the player to claim Expedition */
  claiming: boolean;
  onInspect: (card: ExpeditionCard) => void;
}) {
  if (!expeditions.length) return null;

  return (
    <div className="flex flex-none flex-col gap-2 px-6 pt-4">
      <div className="flex items-center gap-3.5">
        <div className="font-archivo text-portRoyal-teal text-[11px] font-bold tracking-[0.2em] uppercase">
          Expeditions
        </div>
        <div className="h-px flex-1" style={{ background: DASHED_RULE }} />
        <div className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.14em] uppercase">
          posted until claimed
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-2.5">
        {expeditions.map((card) => {
          const fills = expeditionFill(seat, card.requires);
          const claimable = canClaim(seat, card.requires);
          const ready = claimable && claiming;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onInspect(card)}
              aria-label={`Inspect ${card.name}${ready ? ', claimable now' : ''}`}
              className={`bg-portRoyal-card/85 hover:border-portRoyal-teal flex cursor-pointer items-center gap-2.5 border px-2.5 py-1.75 text-left ${
                claimable
                  ? 'border-portRoyal-teal shadow-[2px_2px_0_rgba(27,75,79,0.28)]'
                  : 'border-portRoyal-wood/55'
              }`}
            >
              <div className="flex gap-1.25">
                {card.requires.map((symbol, i) => (
                  <SymbolChip
                    key={`${symbol}-${i}`}
                    symbol={symbol}
                    fill={fills[i]}
                  />
                ))}
              </div>

              <div className="bg-portRoyal-wood/35 h-6 w-px" />

              <div className="flex items-center gap-1.75">
                <span className="text-portRoyal-teal text-[13px] font-bold tabular-nums">
                  {card.vp}
                </span>
                <span className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.12em] uppercase">
                  pts
                </span>
                <span className="text-portRoyal-ink text-[13px] font-bold tabular-nums">
                  {card.coins}
                </span>
                <span className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.12em] uppercase">
                  coins
                </span>
              </div>

              {ready && (
                <span className="bg-portRoyal-teal text-portRoyal-card font-archivo-narrow px-1.5 py-0.75 text-[9px] font-bold tracking-[0.14em] uppercase">
                  claim ready
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
