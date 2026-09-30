/**
 * The left rail: how much is left to draw, how much has been spent, and the
 * one line of rules text that matters in the current phase.
 *
 * Below `lg` there is no room for a rail, so it is a short strip at the bottom
 * of the board: the two counts as text, and the hint under them.
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
  const discardText =
    discard === 0
      ? 'empty'
      : discard === 1
        ? `${discard} card`
        : `${discard} cards`;

  return (
    <div className="border-portRoyal-wood/50 flex flex-none flex-col gap-2 border-t px-4 py-3 lg:w-44 lg:gap-4.5 lg:border-t-0 lg:border-r lg:py-4.5">
      {/* The small version, for phones and tablets. */}
      <div className="flex gap-5 lg:hidden">
        <div className="flex items-baseline gap-2">
          <span className="font-archivo text-portRoyal-teal text-[10px] font-bold tracking-[0.2em] uppercase">
            Draw pile
          </span>
          <span className="text-[15px] font-bold tabular-nums">
            {deckCount}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-archivo text-portRoyal-teal text-[10px] font-bold tracking-[0.2em] uppercase">
            Discard
          </span>
          <span className="font-archivo-narrow text-portRoyal-slate text-[11px] tracking-[0.16em] uppercase">
            {discardText}
          </span>
        </div>
      </div>

      <div className="hidden flex-col gap-2 lg:flex">
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

      <div className="hidden flex-col gap-2 lg:flex">
        <div className="font-archivo text-portRoyal-teal text-[10px] font-bold tracking-[0.2em] uppercase">
          Discard
        </div>
        <div className="border-portRoyal-wood/70 bg-portRoyal-parchment/40 font-archivo-narrow text-portRoyal-slate grid h-38 w-27 place-items-center border border-dashed text-center text-[10px] tracking-[0.16em] uppercase">
          {discardText}
        </div>
      </div>

      <div className="font-spectral text-portRoyal-slate text-[12px] leading-[1.4] italic lg:mt-auto">
        {hint}
      </div>
    </div>
  );
}
