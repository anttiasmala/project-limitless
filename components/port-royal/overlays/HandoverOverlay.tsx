/**
 * The pass-the-device curtain.
 *
 * Coin cards are hidden information, so the board must not be on screen while
 * the device changes hands. The whole curtain is the target — tapping anywhere
 * begins the turn.
 */
export default function HandoverOverlay({
  nextName,
  onBegin,
}: {
  nextName: string;
  onBegin: () => void;
}) {
  return (
    <div
      onClick={onBegin}
      className="absolute inset-0 grid cursor-pointer place-items-center bg-[rgba(22,35,43,0.96)]"
    >
      <div className="flex flex-col items-center gap-4.5 text-center">
        <div className="grid h-30 w-30 place-items-center rounded-full border border-[rgba(184,134,47,0.7)]">
          <div className="h-11.5 w-11.5 rotate-45 border border-[rgba(184,134,47,0.7)]" />
        </div>
        <div className="font-archivo-narrow text-portRoyal-wood text-[11px] tracking-[0.3em] uppercase">
          Coin cards are hidden information
        </div>
        <div className="font-spectral text-portRoyal-ground text-[44px] font-semibold">
          Pass the device to {nextName}
        </div>
        <div className="font-spectral text-portRoyal-sand text-[17px] italic">
          Everyone else, look away. {nextName}&apos;s coins become visible on
          tap.
        </div>
        <button
          type="button"
          className="bg-portRoyal-brass text-portRoyal-ink border-portRoyal-wood mt-2 min-h-13 cursor-pointer border px-8.5 py-4 text-[13px] font-semibold tracking-[0.14em] uppercase"
        >
          Tap when ready
        </button>
      </div>
    </div>
  );
}
