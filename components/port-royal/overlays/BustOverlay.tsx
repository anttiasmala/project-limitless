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
 * Shown when a second ship of a colour already in the harbour is flipped: the
 * discovery ends and the whole haul is discarded. The two clashing ships are
 * put side by side so the loss is obviously earned rather than arbitrary.
 */
export default function BustOverlay({
  pair,
  onAcknowledge,
}: {
  pair: [ShipCard, ShipCard];
  onAcknowledge: () => void;
}) {
  const colour = SHIPS[pair[0].colorIdx].name.toLowerCase();

  return (
    // Covers the screen, not only the board. When the content is taller than
    // the screen (a phone on its side), the overlay scrolls.
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[rgba(87,29,22,0.93)]">
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-4 text-center sm:gap-5 [@media(max-height:480px)]:gap-3">
        <div className="font-spectral text-portRoyal-ground text-[40px] leading-none font-bold tracking-[0.02em] sm:text-[56px] [@media(max-height:480px)]:text-[40px]">
          Bust
        </div>
        <div className="font-spectral text-portRoyal-blush max-w-155 text-[16px] sm:text-[19px]">
          A second {colour} ship sailed in. Discovery ends, and every card in
          the harbour is discarded.
        </div>

        <div className="flex items-center gap-3 sm:gap-4.5">
          {pair.map((ship, i) => (
            <div
              key={ship.id}
              className="bg-portRoyal-ground/95 border-portRoyal-crimson flex w-34 flex-col items-center gap-2 border p-2.5 sm:w-37.5"
            >
              {ship.image ? (
                <Image
                  src={cardArt(ship.image)}
                  alt={ship.name}
                  width={CARD_ART_W}
                  height={CARD_ART_H}
                  // Smaller on a short screen (a phone on its side), so the button still fits.
                  className="h-36 w-auto object-contain sm:h-42.5 [@media(max-height:480px)]:h-24"
                />
              ) : (
                <Flag colorIdx={ship.colorIdx} className="h-7.5 w-11" />
              )}
              <div className="font-spectral text-[15px] font-semibold">
                {ship.name}
              </div>
              <div className="font-archivo-narrow text-portRoyal-crimson text-[9px] tracking-[0.14em] uppercase">
                {i === 0 ? 'already in harbour' : 'just flipped'}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAcknowledge}
          className="bg-portRoyal-ground text-portRoyal-crimson border-portRoyal-ground mt-1.5 min-h-12 cursor-pointer border px-7.5 py-3.75 text-[13px] font-semibold tracking-[0.14em] uppercase"
        >
          Discard the haul
        </button>
      </div>
    </div>
  );
}
