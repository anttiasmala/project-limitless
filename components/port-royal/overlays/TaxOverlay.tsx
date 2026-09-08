import Image from 'next/image';
import {
  CARD_ART_H,
  CARD_ART_W,
  TAX_THRESHOLD,
  TaxEvent,
  TaxRow,
  cardArt,
} from '@/utils/port-royal/types';

/** What the printed card rewards, in the wording the table reads. */
const REWARDED = {
  mostSwords: 'most swords',
  lowestPoints: 'fewest victory points',
} as const;

const REAL_COIN = '/images/port-royal/realCoins.png';

/** Why this player's line reads the way it does. */
function reasonFor(row: TaxRow, rewarded: string): string {
  const paid = `holds ${TAX_THRESHOLD}+ coins - pays half to the Tax`;
  const won = `${rewarded} — rewarded with one coin`;

  if (row.pays && row.gains) return `${paid}, then ${won}`;
  if (row.pays) return paid;
  if (row.gains) return won;
  return 'unaffected';
}

/**
 * The tax event resolves the moment it is flipped, for everyone at once, so it
 * shows the full table rather than only the active player's line.
 *
 * Paying and being rewarded are separate lines: the hand is halved first, and
 * the reward coin is added on top of what was kept.
 */
export default function TaxOverlay({
  event,
  onAcknowledge,
}: {
  event: TaxEvent;
  onAcknowledge: () => void;
}) {
  const { card, rows } = event;
  const rewarded = REWARDED[card.mode];

  return (
    <div className="bg-portRoyal-ink/90 absolute inset-0 grid place-items-center">
      <div className="bg-portRoyal-ground border-portRoyal-crimson flex w-180 gap-7 border px-8.5 py-7.5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="bg-portRoyal-card border-portRoyal-wood/60 flex w-37.5 flex-none flex-col items-center gap-2 border p-2.5">
          {card.image && (
            <Image
              src={cardArt(card.image)}
              alt={card.name}
              width={CARD_ART_W}
              height={CARD_ART_H}
              className="h-42.5 w-auto object-contain"
            />
          )}
          <div className="font-spectral text-[15px] font-semibold">
            {card.name}
          </div>
          <div className="font-archivo-narrow text-portRoyal-slate text-center text-[9px] tracking-[0.14em] uppercase">
            rewards the {rewarded}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-archivo-narrow text-portRoyal-crimson text-[10px] tracking-[0.24em] uppercase">
              Event · immediate
            </span>
            <span className="font-spectral text-[30px] font-semibold">
              Tax Increase
            </span>
          </div>

          <div className="font-spectral text-portRoyal-ink text-[15px] leading-normal">
            Anyone holding {TAX_THRESHOLD} or more coins pays half to the Tax,
            keeping the larger half. The players with the{' '}
            <span className="font-bold">{rewarded}</span> are then rewarded with
            one coin each.
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
                  {reasonFor(r, rewarded)}
                </span>
                {/* A payer can be rewarded too, so both sides can show at once. */}
                <span className="flex items-center gap-2 text-[15px] font-bold tabular-nums">
                  {r.pays > 0 && (
                    <span className="text-portRoyal-crimson flex items-center">
                      −{r.pays}
                      <span className="ml-1">
                        <Image
                          className="h-4 w-4"
                          alt="Coin icon"
                          src={REAL_COIN}
                          width={16}
                          height={16}
                        />
                      </span>
                    </span>
                  )}
                  {r.gains > 0 && (
                    <span className="text-portRoyal-teal flex items-center">
                      +{r.gains}
                      <span className="ml-1">
                        <Image
                          className="h-4 w-4"
                          alt="Coin icon"
                          src={REAL_COIN}
                          width={16}
                          height={16}
                        />
                      </span>
                    </span>
                  )}
                  {!r.pays && !r.gains && (
                    <span className="text-portRoyal-slate">—</span>
                  )}
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
    </div>
  );
}
