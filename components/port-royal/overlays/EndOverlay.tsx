import { vpOf } from '@/lib/port-royal/gameLogic';
import { Player } from '@/utils/port-royal/types';

/**
 * Final standings. The breakdown lists who each player hired and what they were
 * worth, so the winning line is auditable rather than just asserted.
 */
export default function EndOverlay({
  players,
  winner,
  onRestart,
}: {
  players: Player[];
  winner: number;
  onRestart: () => void;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[rgba(22,35,43,0.95)]">
      <div className="bg-portRoyal-ground border-portRoyal-brass flex w-190 flex-col gap-4.5 border px-10 py-8.5">
        <div className="flex flex-col gap-1.5 text-center">
          <span className="font-archivo-narrow text-portRoyal-wood text-[11px] tracking-[0.3em] uppercase">
            Voyage complete
          </span>
          <span className="font-spectral text-[46px] font-bold">
            {players[winner]?.name} takes Port Royal
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {players.map((p, i) => (
            <div
              key={p.name}
              className={`flex items-center gap-3.5 border px-3.5 py-2.5 ${
                i === winner
                  ? 'border-portRoyal-brass bg-portRoyal-brass/16'
                  : 'border-portRoyal-wood/50 bg-transparent'
              }`}
            >
              <span className="font-spectral w-32.5 text-[17px] font-semibold">
                {p.name}
              </span>
              <span className="font-archivo-narrow text-portRoyal-slate flex-1 text-[11px] tracking-widest uppercase">
                {p.tableau.length
                  ? p.tableau
                      .map((c) => `${c.name.split(' — ')[0]} ${c.vp || 0}`)
                      .join(' · ')
                  : 'no persons hired'}
              </span>
              <span className="text-portRoyal-wood text-[16px] font-semibold tabular-nums">
                {p.hand.length}¤
              </span>
              <span className="text-[26px] font-bold tabular-nums">
                {vpOf(p)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="bg-portRoyal-brass text-portRoyal-ink border-portRoyal-wood min-h-12 cursor-pointer border px-7.5 py-3.75 text-[13px] font-semibold tracking-[0.14em] uppercase"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="text-portRoyal-teal border-portRoyal-teal min-h-12 cursor-pointer border bg-transparent px-7.5 py-3.75 text-[13px] font-semibold tracking-[0.14em] uppercase"
          >
            New setup
          </button>
        </div>
      </div>
    </div>
  );
}
