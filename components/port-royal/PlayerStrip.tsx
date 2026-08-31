import { swordsOf, vpOf } from '@/lib/port-royal/gameLogic';
import { Phase, Player } from '@/utils/port-royal/types';

/**
 * The scoreboard along the top bar: one card per player, showing influence,
 * coins in hand and swords. Coin counts are public — only the coin cards
 * themselves are hidden — so this stays visible through every phase.
 */
export default function PlayerStrip({
  players,
  active,
  taker,
  phase,
}: {
  players: Player[];
  active: number;
  taker: number | null;
  phase: Phase;
}) {
  return (
    <div className="gap-2.5overflow-x-auto flex min-w-0 flex-1">
      {players.map((p, i) => {
        const isActive = i === active;
        const isTaking = phase === 'others' && i === taker;

        return (
          // Cards sit at their natural width and shrink from it, so a
          // three-player table looks as it always did and a five-player one
          // still fits the bar instead of sliding off the end.
          <div
            key={p.name}
            className={`flex w-44 min-w-0 shrink flex-col gap-1.25 border px-3 py-2 ${
              isActive
                ? 'border-portRoyal-brass bg-portRoyal-brass/16'
                : isTaking
                  ? 'border-portRoyal-steel bg-portRoyal-teal/30'
                  : 'border-portRoyal-steel bg-transparent'
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className={`h-2 w-2 flex-none rounded-full ${
                  isActive
                    ? 'bg-portRoyal-brass'
                    : isTaking
                      ? 'bg-portRoyal-teal'
                      : 'bg-portRoyal-slate'
                }`}
              />
              <span className="font-spectral text-portRoyal-ground truncate text-[15px] font-semibold">
                {p.name}
              </span>
              <span
                className={`font-archivo-narrow ml-auto flex-none text-[9px] tracking-[0.16em] uppercase ${
                  isActive
                    ? 'text-portRoyal-brassLight'
                    : 'text-portRoyal-slate'
                }`}
              >
                {isActive ? 'active' : isTaking ? 'taking' : 'waiting'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 tabular-nums">
              <span className="text-portRoyal-ground text-[20px] font-bold">
                {vpOf(p)}
                <span className="font-archivo-narrow text-portRoyal-wood ml-1 text-[9px] tracking-[0.14em] uppercase">
                  pts
                </span>
              </span>
              <span className="text-portRoyal-brassLight text-[14px] font-semibold">
                {p.hand.length}
                <span className="font-archivo-narrow ml-0.75 text-[9px] tracking-[0.14em] uppercase">
                  coins
                </span>
              </span>
              <span className="text-portRoyal-ground text-[14px] font-semibold">
                {swordsOf(p)}
                <span className="font-archivo-narrow ml-0.75 text-[9px] tracking-[0.14em] uppercase">
                  sw
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
