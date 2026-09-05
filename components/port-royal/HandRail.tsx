import { swordsOf, vpOf } from '@/lib/port-royal/gameLogic';
import { Player } from '@/utils/port-royal/types';

/** Enough of a fan to read the count; beyond this the rail would overflow. */
const MAX_SHOWN = 12;

/**
 * The seated player's coin cards and running totals.
 *
 * Every coin card is worth one, so the fan is deliberately faceless — it shows
 * how much is in hand without the other players learning anything they could
 * not already count.
 */
export default function HandRail({ seat }: { seat: Player }) {
  const totals = [
    {
      label: 'Coins in hand',
      value: seat.hand.length,
      className:
        'border-portRoyal-brass bg-portRoyal-brass/12 text-portRoyal-wood',
    },
    {
      label: 'Swords',
      value: swordsOf(seat),
      className:
        'border-portRoyal-slate bg-portRoyal-slate/8 text-portRoyal-ink',
    },
    {
      label: 'Influence',
      value: vpOf(seat),
      className:
        'border-portRoyal-teal bg-portRoyal-teal/8 text-portRoyal-teal',
    },
  ];

  return (
    <div className="flex w-93 flex-none flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span className="font-archivo text-portRoyal-teal text-[11px] font-bold tracking-[0.2em] uppercase">
          {seat.name} — hand
        </span>
        <div className="bg-portRoyal-wood/50 h-px flex-1" />
        <span className="font-archivo-narrow text-portRoyal-slate text-[10px] tracking-[0.14em] uppercase">
          {seat.hand.length} coin cards, hidden
        </span>
      </div>

      <div className="flex min-h-24 items-end">
        {seat.hand.length === 0 ? (
          <div className="border-portRoyal-wood/60 font-spectral text-portRoyal-slate grid h-22 w-full place-items-center border border-dashed text-[13px] italic">
            No coins in hand - a ship is all you can take.
          </div>
        ) : (
          seat.hand.slice(0, MAX_SHOWN).map((coin, i) => (
            <div
              key={coin.id}
              className="border-portRoyal-wood bg-portRoyal-brass/14 grid h-23 w-15.5 place-items-center border shadow-[0_4px_10px_rgba(31,42,51,0.14)]"
              style={{
                marginLeft: i === 0 ? 0 : -30,
                transform: `rotate(${((i % 3) - 1) * 1.5}deg)`,
              }}
            >
              <div className="border-portRoyal-wood text-portRoyal-ink grid h-10 w-10 place-items-center rounded-full border text-[18px] font-bold">
                1
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-0.5 flex gap-2">
        {totals.map((t) => (
          <div
            key={t.label}
            className={`flex flex-1 flex-col gap-0.5 border px-2.5 py-2 ${t.className}`}
          >
            <span className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.16em] uppercase">
              {t.label}
            </span>
            <span className="text-[22px] font-bold tabular-nums">
              {t.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
