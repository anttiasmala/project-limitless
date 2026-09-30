import Image from 'next/image';
import Flag from '../Flag';
import {
  CARD_ART_H,
  CARD_ART_W,
  cardArt,
  ShipCard,
  SHIPS,
} from '@/utils/port-royal/types';

/**
 * When a ship is flipped where the active player can repel the ship by having more or equal amount of swords.
 * Repelling discards the ship immediately.
 */
export default function RepelOverlay({
  ship,
  swords,
  playerName,
  clashes,
  botDeciding,
  onRepel,
  onDecline,
}: {
  ship: ShipCard;
  /** The active player's total swords, counted across their whole tableau. */
  swords: number;
  playerName: string;
  /** Whether a ship of this colour is already in the harbour. */
  clashes: boolean;
  /** The active player is a bot, so it decides and the buttons are not shown. */
  botDeciding: boolean;
  onRepel: () => void;
  onDecline: () => void;
}) {
  const colour = SHIPS[ship.colorIdx].name.toLowerCase();

  return (
    <div className="bg-portRoyal-ink/90 fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* On a phone the ship card is on top of the text, not beside it. */}
        <div className="bg-portRoyal-vellum border-portRoyal-crimson flex w-full max-w-160 flex-col gap-5 border px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] sm:flex-row sm:gap-7 sm:px-8.5 sm:py-7.5">
          <div className="bg-portRoyal-card border-portRoyal-wood/60 flex w-37.5 flex-none flex-col items-center gap-2 self-center border p-2.5 sm:self-auto">
            {ship.image ? (
              <Image
                src={cardArt(ship.image)}
                alt={ship.name}
                width={CARD_ART_W}
                height={CARD_ART_H}
                className="h-36 w-auto object-contain sm:h-42.5"
              />
            ) : (
              <Flag colorIdx={ship.colorIdx} className="h-7.5 w-11" />
            )}
            <div className="font-spectral text-[15px] font-semibold">
              {ship.name}
            </div>
            <div className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.14em] uppercase">
              just flipped
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-archivo-narrow text-portRoyal-crimson text-[10px] tracking-[0.24em] uppercase">
                Ship · repel
              </span>
              <span className="font-spectral text-[24px] leading-tight font-semibold sm:text-[30px]">
                Repel the {ship.name}?
              </span>
            </div>

            <div className="font-spectral text-portRoyal-ink text-[15px] leading-normal">
              {playerName} has {swords} {swords === 1 ? 'sword' : 'swords'}{' '}
              against the {ship.name}&apos;s {ship.swords} swords. Repelling
              discards it and the discovery phase carries on.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="border-portRoyal-teal bg-portRoyal-teal/8 text-portRoyal-teal font-archivo-narrow border px-3 py-2 text-[11px] tracking-widest uppercase">
                your swords: <span className="text-sm font-bold">{swords}</span>
              </span>
              <span className="text-portRoyal-slate text-[15px]">vs</span>
              <span className="border-portRoyal-crimson bg-portRoyal-crimson/10 text-portRoyal-crimson font-archivo-narrow border px-3 py-2 text-[11px] tracking-widest uppercase">
                ship: <span className="text-sm font-bold">{ship.swords}</span>
              </span>
              <span className="font-archivo-narrow text-portRoyal-slate text-[11px] tracking-widest uppercase sm:flex-1 sm:text-right">
                {ship.coins} {ship.coins === 1 ? 'coin' : 'coins'} aboard
              </span>
            </div>

            <div className="font-archivo-narrow text-portRoyal-crimson text-[11px] leading-relaxed tracking-[0.08em] uppercase">
              {clashes
                ? `A ${colour} ship is already in the harbour! If you decline this, the discovery busts.`
                : 'Decline to keep it and it joins the harbour as normal.'}
            </div>

            <div className="mt-auto flex justify-end gap-2.5">
              {botDeciding ? (
                <div className="font-spectral text-portRoyal-slate flex min-h-11.5 items-center text-[15px] italic">
                  {playerName} is thinking…
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onDecline}
                    className="border-portRoyal-wood text-portRoyal-ink min-h-11.5 flex-1 cursor-pointer border bg-transparent px-4 py-3.5 text-[13px] font-semibold tracking-[0.14em] uppercase hover:brightness-[1.08] sm:flex-none sm:px-6.5"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={onRepel}
                    className="bg-portRoyal-crimson text-portRoyal-ground border-portRoyal-crimsonDeep min-h-11.5 flex-1 cursor-pointer border px-4 py-3.5 text-[13px] font-semibold tracking-[0.14em] uppercase hover:brightness-[1.08] sm:flex-none sm:px-6.5"
                  >
                    Repel the ship
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
