import { DASHED_RULE } from './shapes';
import {
  EXPEDITION_SYMBOLS,
  ExpeditionCard,
  ExpeditionSymbol,
} from '@/utils/port-royal/types';

/** One symbol the expedition asks for, drawn as a glyph rather than as art. */
function SymbolChip({ symbol }: { symbol: ExpeditionSymbol }) {
  const s = EXPEDITION_SYMBOLS[symbol];

  return (
    <span
      title={s.label}
      className="border-portRoyal-wood/70 bg-portRoyal-parchment/60 text-portRoyal-ink grid h-6 w-6 place-items-center border text-[12px] leading-none"
    >
      <span aria-hidden>{s.glyph}</span>
      <span className="sr-only">{s.label}</span>
    </span>
  );
}

/**
 * The expeditions posted so far. Unlike the harbour this row is not cleared at
 * the end of a turn. An expedition stays in the expeditions place until it is claimed.
 *
 */
export default function Expeditions({
  expeditions,
  onInspect,
}: {
  expeditions: ExpeditionCard[];
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
        {expeditions.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onInspect(card)}
            aria-label={`Inspect ${card.name}`}
            className="border-portRoyal-wood/55 bg-portRoyal-card/85 hover:border-portRoyal-teal flex cursor-pointer items-center gap-2.5 border px-2.5 py-1.75 text-left"
          >
            <div className="flex gap-1.25">
              {card.requires.map((symbol, i) => (
                <SymbolChip key={`${symbol}-${i}`} symbol={symbol} />
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
          </button>
        ))}
      </div>
    </div>
  );
}
