/* The design specifies these three switches as a fixed display: it gives them
   labels and resting positions but no behaviour, and the systems they would
   drive (audio, reduced motion, open hands) do not exist yet. They are drawn
   exactly as designed and left inert rather than invented. */
const ROWS = [
  { label: 'Sound', note: 'coins, sails, alarms', on: true },
  { label: 'Reduce animation', note: 'no card flight, no ribbons', on: false },
  {
    label: 'Show hidden hands',
    note: 'table-talk mode, off by default',
    on: false,
  },
];

/** Right-hand drawer, dismissed by the backdrop or either button. */
export default function SettingsOverlay({
  onClose,
  onRestart,
}: {
  onClose: () => void;
  onRestart: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="bg-portRoyal-ink/60 absolute inset-0 flex justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-portRoyal-vellum border-portRoyal-wood flex h-full w-95 flex-col gap-4.5 border-l px-7 py-6.5"
      >
        <div className="font-spectral text-[26px] font-semibold">Settings</div>

        {ROWS.map((row) => (
          <div
            key={row.label}
            className="border-portRoyal-wood/40 flex items-center justify-between gap-3 border-b py-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-spectral text-[16px]">{row.label}</span>
              <span className="font-archivo-narrow text-portRoyal-slate text-[10px] tracking-[0.12em] uppercase">
                {row.note}
              </span>
            </div>
            <div
              className={`border-portRoyal-wood flex h-7 w-13 flex-none items-center border p-0.5 ${
                row.on
                  ? 'bg-portRoyal-brass/30 justify-end'
                  : 'bg-portRoyal-parchment/60 justify-start'
              }`}
            >
              <div
                className={`h-5.5 w-5.5 ${
                  row.on ? 'bg-portRoyal-brass' : 'bg-portRoyal-wood'
                }`}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onRestart}
          className="bg-portRoyal-crimson text-portRoyal-ground border-portRoyal-crimsonDeep mt-auto min-h-11.5 cursor-pointer border px-5 py-3.5 text-[13px] font-semibold tracking-[0.14em] uppercase"
        >
          Quit &amp; restart voyage
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-archivo-narrow text-portRoyal-slate border-portRoyal-wood/70 min-h-11 cursor-pointer border bg-transparent p-3 text-[11px] tracking-[0.16em] uppercase"
        >
          Close
        </button>
      </div>
    </div>
  );
}
