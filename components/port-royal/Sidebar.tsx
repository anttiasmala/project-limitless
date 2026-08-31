/**
 * The left rail: how much is left to draw, how much has been spent, and the
 * one line of rules text that matters in the current phase.
 */
export default function Sidebar({
  deckCount,
  discard,
  hint,
}: {
  deckCount: number;
  discard: number;
  hint: string;
}) {
  return (
    <div className="border-portRoyal-wood/50 flex w-44 flex-none flex-col gap-4.5 border-r px-4 py-4.5">
      <div className="flex flex-col gap-2">
        <div className="font-archivo text-portRoyal-teal text-[10px] font-bold tracking-[0.2em] uppercase">
          Draw pile
        </div>
        {/* Stacked offsets stand in for the physical depth of the pile. */}
        <div className="border-portRoyal-wood bg-portRoyal-brass/12 relative grid h-38 w-27 place-items-center border shadow-[3px_3px_0_rgba(140,106,67,0.35),6px_6px_0_rgba(140,106,67,0.2)]">
          <div className="border-portRoyal-wood grid h-16.5 w-16.5 place-items-center rounded-full border-2 text-[22px] font-bold tabular-nums">
            {deckCount}
          </div>
          <div className="font-archivo-narrow text-portRoyal-wood absolute bottom-1.5 text-[9px] tracking-[0.18em] uppercase">
            left
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-archivo text-portRoyal-teal text-[10px] font-bold tracking-[0.2em] uppercase">
          Discard
        </div>
        <div className="border-portRoyal-wood/70 bg-portRoyal-parchment/40 font-archivo-narrow text-portRoyal-slate grid h-38 w-27 place-items-center border border-dashed text-center text-[10px] tracking-[0.16em] uppercase">
          {discard ? `${discard} cards` : 'empty'}
        </div>
      </div>

      <div className="font-spectral text-portRoyal-slate mt-auto text-[12px] leading-[1.4] italic">
        {hint}
      </div>
    </div>
  );
}
