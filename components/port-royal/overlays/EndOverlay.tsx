import { vpOf } from '@/lib/port-royal/gameLogic';
import {
  CARD_ART_DIR,
  EndReason,
  Player,
  TARGET_VP,
} from '@/utils/port-royal/types';
import Image from 'next/image';

/** "Anne", "Anne & Bart", "Anne, Bart & Cecil" */
function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/**
 * Final standings. The breakdown lists who each player hired and what they were
 * worth, so the winning line is auditable rather than just asserted.
 *
 * @param qualified For each player, whether they met everything the rules ask
 * for to win (the points, and an expedition when that rule is on).
 * @param expeditionRule Whether the `expeditionToWin` rule was on.
 */
export default function EndOverlay({
  players,
  winners,
  endReason,
  qualified,
  expeditionRule,
  onRestart,
}: {
  players: Player[];
  winners: number[];
  endReason: EndReason;
  qualified: boolean[];
  expeditionRule: boolean;
  onRestart: () => void;
}) {
  const names = joinNames(winners.map((i) => players[i]?.name));
  const dry = endReason === 'deckDry';

  // A player who has the points but could not win because of the expedition
  // rule. Without a note it would look like the wrong player won.
  const missedExpedition = (p: Player, i: number) =>
    !dry && vpOf(p) >= TARGET_VP && !qualified[i];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[rgba(22,35,43,0.95)]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-portRoyal-ground border-portRoyal-brass flex w-full max-w-190 flex-col gap-4.5 border px-5 py-6 sm:px-10 sm:py-8.5">
          <div className="flex flex-col gap-1.5 text-center">
            <span className="font-archivo-narrow text-portRoyal-wood text-[11px] tracking-[0.3em] uppercase">
              {dry ? 'The deck ran dry' : 'Voyage complete'}
            </span>
            <span className="font-spectral text-[32px] leading-tight font-bold sm:text-[46px]">
              {winners.length > 1
                ? `${names} share Port Royal`
                : `${names} takes Port Royal`}
            </span>
            {/* Without this line an early end looks like a bug. */}
            {dry && (
              <span className="text-portRoyal-slate text-[14px]">
                Every card is in a hand or on the table, so nothing is left to
                flip. The most{' '}
                <span className="font-extrabold">Victory points</span> wins. If
                Victory points are tied, the player with the most coins wins.
              </span>
            )}
            {!dry && expeditionRule && (
              <span className="text-portRoyal-slate text-[14px]">
                Only a player with {TARGET_VP}{' '}
                <span className="font-extrabold">Victory points</span> and a
                claimed expedition could win, until every expedition was
                claimed.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {players.map((p, i) => (
              <div
                key={p.name}
                // On a phone the list of hired cards goes to its own line under the name.
                className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 border px-3.5 py-2.5 sm:flex-nowrap ${
                  winners.includes(i)
                    ? 'border-portRoyal-brass bg-portRoyal-brass/16'
                    : 'border-portRoyal-wood/50 bg-transparent'
                }`}
              >
                <span className="flex flex-1 flex-col sm:w-32.5 sm:flex-none">
                  <span className="font-spectral text-[17px] font-semibold">
                    {p.name}
                  </span>
                  {missedExpedition(p, i) && (
                    <span className="font-archivo-narrow text-portRoyal-crimson text-[10px] tracking-[0.14em] uppercase">
                      no expedition
                    </span>
                  )}
                </span>
                <span className="font-archivo-narrow text-portRoyal-slate order-last basis-full text-[11px] tracking-widest uppercase sm:order-0 sm:flex-1 sm:basis-auto">
                  {p.tableau.length
                    ? p.tableau
                        .map((c) => `${c.name.split(' — ')[0]} ${c.vp || 0}`)
                        .join(' · ')
                    : 'no persons hired'}
                </span>
                <span className="text-portRoyal-wood flex text-[16px] font-semibold tabular-nums">
                  {p.hand.length}
                  <Image
                    src={`${CARD_ART_DIR}/realCoins.png`}
                    alt="Coins icon"
                    width={16}
                    height={16}
                    className="mt-1 h-4 w-4"
                  />
                </span>
                <span className="flex text-[26px] font-bold tabular-nums">
                  {vpOf(p)}
                  <Image
                    src={`${CARD_ART_DIR}/realVictoryPoints.png`}
                    alt="Victory Points icon"
                    width={16}
                    height={16}
                    className="mt-2 ml-1 h-6 w-6"
                  />
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
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
              New game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
