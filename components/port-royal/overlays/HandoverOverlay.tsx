/**
 * The pass-the-device curtain.
 *
 * Coin cards are hidden information, so the board must not be on screen while
 * the device changes hands. The whole curtain is the target — tapping anywhere
 * begins the turn.
 */
export default function HandoverOverlay({
  nextName,
  finalRound,
  onBegin,
}: {
  nextName: string;
  /** Somebody has reached the target, so this round is the last one. */
  finalRound: boolean;
  onBegin: () => void;
}) {
  return (
    <div
      onClick={onBegin}
      className="fixed inset-0 z-50 cursor-pointer overflow-y-auto overscroll-contain bg-[rgba(22,35,43,0.96)]"
    >
      <div className="flex min-h-full flex-col items-center justify-center gap-4.5 p-4 text-center">
        <div className="grid h-30 w-30 place-items-center rounded-full border border-[rgba(184,134,47,0.7)]">
          <div className="h-11.5 w-11.5 rotate-45 border border-[rgba(184,134,47,0.7)]" />
        </div>
        <div className="font-archivo-narrow text-portRoyal-wood text-[11px] tracking-[0.3em] uppercase">
          Let&apos;s Port Royal!
        </div>
        <div className="font-spectral text-portRoyal-ground text-[32px] leading-tight font-semibold sm:text-[44px]">
          Pass the device to {nextName}
        </div>
        {finalRound && (
          <div className="font-archivo-narrow text-portRoyal-brass text-[13px] tracking-[0.2em] uppercase">
            Final round, the target has been reached
          </div>
        )}
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
