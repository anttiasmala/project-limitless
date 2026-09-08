import Image from 'next/image';
import { HATCH_PANEL_SOFT } from '../shapes';
import {
  CARD_ART_H,
  CARD_ART_W,
  Card,
  cardArt,
  describeRequirement,
  SHIPS,
  TAX_THRESHOLD,
} from '@/utils/port-royal/types';

type Stat = { value: number; label: string; className: string };

const COIN = 'border-portRoyal-brass bg-portRoyal-brass/12 text-portRoyal-ink';
const SWORD = 'border-portRoyal-slate bg-portRoyal-slate/8 text-portRoyal-ink';
const VP = 'border-portRoyal-teal bg-portRoyal-teal/8 text-portRoyal-teal';

/**
 * Zero values are filtered out. Like Swords on Admiral-card. Admiral card has 0 Swords, so filter it out
 */
function statsFor(card: Card): Stat[] {
  return printedStats(card).filter((s) => s.value > 0);
}

function printedStats(card: Card): Stat[] {
  if (card.kind === 'ship') {
    return [
      { value: card.swords, label: 'swords needed', className: SWORD },
      { value: card.coins, label: 'coins gained', className: COIN },
    ];
  }
  if (card.kind === 'person') {
    return [
      { value: card.price, label: 'cost', className: COIN },
      { value: card.swords, label: 'swords', className: SWORD },
      { value: card.vp, label: 'victory points', className: VP },
    ];
  }
  if (card.kind === 'bonus') {
    return [
      { value: card.swords, label: 'swords', className: SWORD },
      { value: card.vp, label: 'victory points', className: VP },
    ];
  }
  if (card.kind === 'expedition') {
    return [
      { value: card.coins, label: 'coins', className: COIN },
      { value: card.vp, label: 'victory points', className: VP },
    ];
  }
  return [];
}

function bandFor(card: Card): string {
  if (card.kind === 'ship') {
    const ship = SHIPS[card.colorIdx];
    return `Ship · ${ship.name} · ${ship.shape} flag`;
  }
  if (card.kind === 'tax') return 'Event · immediate';
  if (card.kind === 'expedition') return 'Expedition · posted until claimed';
  return `Person · ${card.role}`;
}

function textFor(card: Card): string {
  if (card.kind === 'ship') {
    return `Requires ${card.swords} swords to repel. Gives ${card.coins} coins, and is discarded once taken.`;
  }
  if (card.kind === 'tax') {
    return `Resolves the moment it is flipped. Every player holding ${TAX_THRESHOLD} or more coins pays half of them to the Tax, and the players with the ${
      card.mode === 'mostSwords' ? 'most swords' : 'fewest victory points'
    } each take one coin.`;
  }
  if (card.kind === 'expedition') {
    return `Stays posted above the harbour until a player hands in characters supplying ${describeRequirement(
      card.requires,
    )}.`;
  }
  return card.text;
}

/** The full card, for when the harbour's condensed face is not enough. */
export default function DetailOverlay({
  card,
  onClose,
}: {
  card: Card;
  onClose: () => void;
}) {
  const stats = statsFor(card);

  return (
    <div
      onClick={onClose}
      className="bg-portRoyal-ink/72 absolute inset-0 grid place-items-center"
    >
      {/* The panel is a reading surface, not a dismiss target. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-portRoyal-vellum border-portRoyal-wood flex w-140 flex-col gap-3.5 border px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start gap-3.5">
          <div>
            <div className="font-archivo-narrow text-portRoyal-wood text-[10px] tracking-[0.22em] uppercase">
              {bandFor(card)}
            </div>
            <div className="font-spectral text-[32px] leading-[1.1] font-semibold">
              {card.name}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="border-portRoyal-wood/70 text-portRoyal-slate ml-auto h-11 w-11 cursor-pointer border bg-transparent text-[16px]"
          >
            ×
          </button>
        </div>

        <div
          className="border-portRoyal-wood/70 bg-portRoyal-parchment/50 font-archivo-narrow text-portRoyal-wood grid place-items-center border py-4 text-[10px] tracking-[0.16em] uppercase"
          style={{ backgroundImage: HATCH_PANEL_SOFT }}
        >
          {/* The Crown favour is awarded rather than printed, so it has no art. */}
          {card.kind !== 'bonus' && card.image ? (
            <Image
              src={cardArt(card.image)}
              alt={card.name}
              width={CARD_ART_W}
              height={CARD_ART_H}
              className="h-78.75 w-auto object-contain"
            />
          ) : (
            <span className="py-14">illustration — figure study</span>
          )}
        </div>

        <div className="font-spectral text-[16px] leading-normal">
          {textFor(card)}
        </div>

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-1.5 border px-2.5 py-1.5 ${s.className}`}
              >
                <span className="text-[15px] font-bold tabular-nums">
                  {s.value}
                </span>
                <span className="font-archivo-narrow text-portRoyal-slate text-[10px] tracking-[0.12em] uppercase">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
