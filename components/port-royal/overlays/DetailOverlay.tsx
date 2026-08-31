import { HATCH_PANEL_SOFT } from '../shapes';
import { Card, SHIPS } from '@/utils/port-royal/types';

type Stat = { value: number; label: string; className: string };

const COIN = 'border-portRoyal-brass bg-portRoyal-brass/12 text-portRoyal-ink';
const SWORD = 'border-portRoyal-slate bg-portRoyal-slate/8 text-portRoyal-ink';
const VP = 'border-portRoyal-teal bg-portRoyal-teal/8 text-portRoyal-teal';

function statsFor(card: Card): Stat[] {
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
      { value: card.vp, label: 'influence', className: VP },
    ];
  }
  if (card.kind === 'bonus') {
    return [
      { value: card.swords, label: 'swords', className: SWORD },
      { value: card.vp, label: 'influence', className: VP },
    ];
  }
  return [];
}

function bandFor(card: Card): string {
  if (card.kind === 'ship') {
    const ship = SHIPS[card.colorIdx];
    return `Ship · ${ship.name} · ${ship.shape} flag`;
  }
  return card.kind === 'tax' ? 'Event · immediate' : `Person · ${card.role}`;
}

function textFor(card: Card): string {
  if (card.kind === 'ship') {
    return `Requires ${card.swords} swords to bring in. Yields ${card.coins} coin cards, and is discarded once plundered.`;
  }
  return card.kind === 'tax' ? '' : card.text;
}

/** The full card, for when the harbour's condensed face is not enough. */
export default function DetailOverlay({
  card,
  onClose,
}: {
  card: Card;
  onClose: () => void;
}) {
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
          className="border-portRoyal-wood/70 bg-portRoyal-parchment/50 font-archivo-narrow text-portRoyal-wood grid h-37.5 place-items-center border text-[10px] tracking-[0.16em] uppercase"
          style={{ backgroundImage: HATCH_PANEL_SOFT }}
        >
          {card.kind === 'ship'
            ? 'illustration — ship under sail'
            : 'illustration — figure study'}
        </div>

        <div className="font-spectral text-[16px] leading-normal">
          {textFor(card)}
        </div>

        <div className="flex flex-wrap gap-2">
          {statsFor(card).map((s) => (
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
      </div>
    </div>
  );
}
