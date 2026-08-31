import Flag from './Flag';
import HarbourCard from './HarbourCard';
import { DASHED_RULE } from './shapes';
import { affordable, priceOf } from '@/lib/port-royal/gameLogic';
import {
  HarbourCard as HarbourCardType,
  Player,
  SHIPS,
} from '@/utils/port-royal/types';

/**
 * The harbour display — the cards flipped so far this turn, plus a read-out of
 * which ship colours are already exposed. During discovery every colour is
 * listed so the risk is legible; afterwards only the exposed ones remain.
 */
export default function Harbour({
  harbour,
  seat,
  buying,
  discovering,
  selected,
  onPick,
  onInspect,
}: {
  harbour: HarbourCardType[];
  seat: Player;
  buying: boolean;
  discovering: boolean;
  selected: number | null;
  onPick: (card: HarbourCardType) => void;
  onInspect: (card: HarbourCardType) => void;
}) {
  const seen = new Set(
    harbour.filter((c) => c.kind === 'ship').map((c) => c.colorIdx),
  );

  return (
    <div className="flex min-h-0 flex-col gap-2.5 px-6 pt-4 pb-3">
      <div className="flex items-center gap-3.5">
        <div className="font-archivo text-portRoyal-teal text-[11px] font-bold tracking-[0.2em] uppercase">
          Harbour display
        </div>
        <div className="h-px flex-1" style={{ background: DASHED_RULE }} />
        <div className="flex gap-2">
          {SHIPS.map((ship, i) => {
            const exposed = seen.has(i);
            if (!discovering && !exposed) return null;

            return (
              <div
                key={ship.name}
                className={`flex items-center gap-1.5 border px-2 py-1 ${
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

      <div className="border-portRoyal-wood/55 bg-portRoyal-parchment/35 min-h-79 overflow-x-auto overflow-y-hidden border p-3.5">
        {harbour.length === 0 && (
          <div className="grid h-71.5 place-items-center text-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="border-portRoyal-wood/80 h-18.5 w-18.5 rounded-full border border-dashed" />
              <div className="font-spectral text-portRoyal-slate text-[15px] italic">
                The harbour is empty. Flip a card to begin the voyage.
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          {harbour.map((card) => (
            <HarbourCard
              key={card.id}
              card={card}
              price={priceOf(card, seat)}
              buying={buying}
              affordable={buying ? affordable(card, seat) : true}
              selected={selected === card.id}
              onPick={() => onPick(card)}
              onInspect={() => onInspect(card)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
