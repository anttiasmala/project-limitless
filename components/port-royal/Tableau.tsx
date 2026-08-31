import { RoleChip } from './StatChip';
import { PersonRole, Player, TableauCard } from '@/utils/port-royal/types';

const GROUPS: { role: PersonRole; title: string }[] = [
  { role: 'fighter', title: 'Fighters — swords' },
  { role: 'trader', title: 'Traders — goods' },
  { role: 'rule', title: 'Rule benders' },
];

/**
 * Everyone the seated player has hired, grouped by what they do. Fighters show
 * their swords, everyone else their influence, because that is the number that
 * decides whether the card was worth its price.
 */
export default function Tableau({
  seat,
  onInspect,
}: {
  seat: Player;
  onInspect: (card: TableauCard) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span className="font-archivo text-portRoyal-teal text-[11px] font-bold tracking-[0.2em] uppercase">
          {seat.name} — tableau
        </span>
        <div className="bg-portRoyal-wood/50 h-px flex-1" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1">
        {GROUPS.map(({ role, title }) => {
          const items = seat.tableau.filter((c) => c.role === role);

          return (
            <div key={role} className="flex min-w-37.5 flex-col gap-1.5">
              <div className="font-archivo-narrow text-portRoyal-wood text-[9px] tracking-[0.16em] uppercase">
                {title}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.length === 0 && (
                  <div className="border-portRoyal-wood/60 font-archivo-narrow text-portRoyal-slate flex h-11 items-center border border-dashed px-2.5 text-[10px] tracking-[0.12em] uppercase">
                    none yet
                  </div>
                )}
                {items.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => onInspect(card)}
                    className="bg-portRoyal-card/75 border-portRoyal-wood hover:border-portRoyal-teal flex h-11 cursor-pointer items-center gap-1.75 border pr-2.5 pl-1.75"
                  >
                    <RoleChip role={card.role} />
                    {/* Cards are printed "Trader — Spice"; the chip is too
                        narrow for the speciality, so it keeps the base name. */}
                    <span className="font-spectral text-[13px] font-semibold">
                      {card.name.split(' — ')[0]}
                    </span>
                    <span className="text-portRoyal-teal text-[12px] font-bold tabular-nums">
                      {card.role === 'fighter'
                        ? `${card.swords}✦`
                        : `${card.vp}◆`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
