import Flag from '../Flag';
import { ShipCard, SHIPS } from '@/utils/port-royal/types';

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
    <div className="absolute inset-0 grid place-items-center bg-[rgba(87,29,22,0.93)]">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="font-spectral text-portRoyal-ground text-[56px] font-bold tracking-[0.02em]">
          Bust
        </div>
        <div className="font-spectral text-portRoyal-blush max-w-155 text-[19px]">
          A second {colour} ship sailed in. Discovery ends, and every card in
          the harbour is discarded.
        </div>

        <div className="flex items-center gap-4.5">
          {pair.map((ship, i) => (
            <div
              key={ship.id}
              className="bg-portRoyal-ground/95 border-portRoyal-crimson flex w-37.5 flex-col items-center gap-2 border p-2.5"
            >
              <Flag colorIdx={ship.colorIdx} className="h-7.5 w-11" />
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
