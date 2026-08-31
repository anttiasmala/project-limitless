import { TaxRow } from '@/utils/port-royal/types';

/**
 * The tax event resolves the moment it is flipped, for everyone at once, so it
 * shows the full table rather than only the active player's line.
 */
export default function TaxOverlay({
  rows,
  onAcknowledge,
}: {
  rows: TaxRow[];
  onAcknowledge: () => void;
}) {
  return (
    <div className="bg-portRoyal-ink/90 absolute inset-0 grid place-items-center">
      <div className="bg-portRoyal-ground border-portRoyal-crimson flex w-160 flex-col gap-4 border px-8.5 py-7.5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-baseline gap-3">
          <span className="font-archivo-narrow text-portRoyal-crimson text-[10px] tracking-[0.24em] uppercase">
            Event · immediate
          </span>
          <span className="font-spectral text-[30px] font-semibold">
            Tax Increase
          </span>
        </div>

        <div className="font-spectral text-portRoyal-ink text-[15px] leading-normal">
          Anyone holding twelve or more coins pays half to the crown. The
          players with the most swords are rewarded.
        </div>

        <div className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <div
              key={r.name}
              className={`flex items-center gap-3 border px-3 py-2 ${
                r.pays
                  ? 'border-portRoyal-crimson bg-portRoyal-crimson/10'
                  : r.gains
                    ? 'border-portRoyal-teal bg-portRoyal-teal/8'
                    : 'border-portRoyal-wood/50 bg-transparent'
              }`}
            >
              <span className="font-spectral w-30 text-[15px] font-semibold">
                {r.name}
              </span>
              <span className="font-archivo-narrow text-portRoyal-slate flex-1 text-[11px] tracking-widest uppercase">
                {r.pays
                  ? 'holds 12+ coins — pays half to the crown'
                  : r.gains
                    ? 'most swords — rewarded with one point'
                    : 'unaffected'}
              </span>
              <span
                className={`text-[15px] font-bold tabular-nums ${
                  r.pays
                    ? 'text-portRoyal-crimson'
                    : r.gains
                      ? 'text-portRoyal-teal'
                      : 'text-portRoyal-slate'
                }`}
              >
                {r.pays ? `−${r.pays}¤` : r.gains ? '+1◆' : '—'}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAcknowledge}
          className="bg-portRoyal-teal text-portRoyal-ground border-portRoyal-tealDeep min-h-11.5 cursor-pointer self-end border px-6.5 py-3.5 text-[13px] font-semibold tracking-[0.14em] uppercase"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
