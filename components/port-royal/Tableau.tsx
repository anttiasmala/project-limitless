import Image from 'next/image';
import { RoleChip } from './StatChip';
import {
  BonusCard,
  CARD_ART_DIR,
  EXPEDITION_SYMBOLS,
  ExpeditionCard,
  ExpeditionSymbol,
  PersonCard,
  PersonRole,
  Player,
  TableauCard,
} from '@/utils/port-royal/types';

const GROUPS: { role: PersonRole; title: string }[] = [
  { role: 'fighter', title: 'Fighters' },
  { role: 'trader', title: 'Traders' },
  { role: 'crew', title: 'Expedition crew' },
  { role: 'rule', title: 'Rule benders' },
];

/** The symbols a crew card supplies. The Jack of all Trades supplies all three. */
function crewSymbols(card: PersonCard): ExpeditionSymbol[] {
  if (card.expeditionItem === 'jackOfAllTrades')
    return ['house', 'cross', 'anchor'];
  if (card.expeditionItem === 'none') return [];
  return [card.expeditionItem];
}

/**
 * The short name shown on a tableau chip. The full name is in the card overlay.
 * Cards are printed "Trader — Spice"; the chip is too narrow for the
 * speciality, so it keeps the base name. "Jack of all Trades" also has three
 * icons, so it is shortened to "Jack" to fit on one line.
 */
function chipName(card: PersonCard | BonusCard): string {
  if (card.kind === 'person' && card.expeditionItem === 'jackOfAllTrades')
    return 'Jack';
  return card.name.split(' — ')[0];
}

/**
 * Everyone the player has hired, grouped by what they do. Fighters show
 * their swords, the expedition crew their expedition symbols, and everyone
 * else their Victory Points
 *
 * Used for the seated player on the board, and for any player in the
 * player overlay. Hired cards are public, like in the board game.
 */
export default function Tableau({
  player,
  onInspect,
}: {
  player: Player;
  onInspect: (card: TableauCard) => void;
}) {
  const claimed = player.tableau.filter(
    (c): c is ExpeditionCard => c.kind === 'expedition',
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span className="font-archivo text-portRoyal-teal text-[11px] font-bold tracking-[0.2em] uppercase">
          {player.name} — tableau
        </span>
        <div className="bg-portRoyal-wood/50 h-px flex-1" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1">
        {GROUPS.map(({ role, title }) => {
          const items = player.tableau.filter(
            (c): c is PersonCard | BonusCard =>
              c.kind !== 'expedition' && c.role === role,
          );

          return (
            // The 150px minimum is on the title, not on the column. So the
            // column is at least 150px wide, but it can grow wider when one
            // chip needs more room (for example "Mademoiselle").
            <div key={role} className="flex flex-col gap-1.5">
              <div className="font-archivo-narrow text-portRoyal-wood min-w-37.5 text-[9px] tracking-[0.16em] uppercase">
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
                    className="bg-portRoyal-card/75 border-portRoyal-wood hover:border-portRoyal-teal flex h-11 w-max cursor-pointer items-center gap-1.75 border pr-2.5 pl-1.75"
                  >
                    <RoleChip role={card.role} />
                    <span className="font-spectral text-[13px] font-semibold">
                      {chipName(card)}
                    </span>
                    <span className="text-portRoyal-teal shrink-0 text-[12px] font-bold tabular-nums">
                      {card.role === 'fighter' ? (
                        <span className="flex gap-1">
                          {card.swords}
                          <Image
                            alt="Sword icon"
                            src={`${CARD_ART_DIR}/realSwords.png`}
                            width={16}
                            height={16}
                            className="h-4 w-4"
                          />
                        </span>
                      ) : card.kind === 'person' && card.role === 'crew' ? (
                        <span className="flex gap-1">
                          {crewSymbols(card).map((symbol) => (
                            <Image
                              key={symbol}
                              alt={`${EXPEDITION_SYMBOLS[symbol].label} icon`}
                              src={`${CARD_ART_DIR}/${EXPEDITION_SYMBOLS[symbol].icon}`}
                              width={16}
                              height={16}
                              className="h-4 w-4 object-contain"
                            />
                          ))}
                        </span>
                      ) : (
                        <span className="flex gap-1">
                          {card.vp}
                          <Image
                            alt="Victory Points icon"
                            src={`${CARD_ART_DIR}/realVictoryPoints.png`}
                            width={16}
                            height={16}
                            className="h-4 w-4"
                          />
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {claimed.length > 0 && (
          <div className="flex min-w-37.5 flex-col gap-1.5">
            <div className="font-archivo-narrow text-portRoyal-wood text-[9px] tracking-[0.16em] uppercase">
              Expeditions — claimed
            </div>
            <div className="flex flex-wrap gap-1.5">
              {claimed.map((card) => (
                <div
                  key={card.id}
                  onClick={() => onInspect(card)}
                  className="bg-portRoyal-card/75 border-portRoyal-teal hover:border-portRoyal-tealDeep flex h-11 cursor-pointer items-center gap-1.75 border pr-2.5 pl-1.75"
                >
                  <span className="font-spectral text-[13px] font-semibold">
                    {card.name}
                  </span>
                  <span className="text-portRoyal-teal text-[12px] font-bold tabular-nums">
                    {`${card.vp}◆`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
