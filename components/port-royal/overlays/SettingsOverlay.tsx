import { ReactNode } from 'react';
import SettingSwitch from '@/components/port-royal/SettingSwitch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '@/utils/port-royal/types';

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

/** One settings line: title and small caption on the left, switch on the
 * right. The whole row is a <label>, so a click on the text also toggles. */
function SettingRow({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <label className="border-portRoyal-wood/40 flex cursor-pointer items-center justify-between gap-3 border-b py-3 select-none has-disabled:cursor-default">
      <span className="flex flex-col gap-0.5">
        <span className="font-spectral text-[16px]">{label}</span>
        <span className="font-archivo-narrow text-portRoyal-slate text-[10px] tracking-[0.12em] uppercase">
          {note}
        </span>
      </span>
      {children}
    </label>
  );
}

/** Right-hand drawer, dismissed by the backdrop or either button. */
export default function SettingsOverlay({
  onClose,
  onRestart,
}: {
  onClose: () => void;
  onRestart: () => void;
}) {
  const [settings, setSettings] = useLocalStorage(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
  );

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
          <SettingRow key={row.label} label={row.label} note={row.note}>
            {/* Disabled, so keyboard users do not land on a switch that does
                nothing. It still looks the same as a working one. */}
            <SettingSwitch checked={row.on} disabled readOnly />
          </SettingRow>
        ))}
        <SettingRow
          label="Alternative card display"
          note="Compact faces, not whole cards"
        >
          <SettingSwitch
            checked={settings.alternativeTheme}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                alternativeTheme: e.currentTarget.checked,
              }))
            }
          />
        </SettingRow>

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
          className="hover:bg-portRoyal-brass font-archivo-narrow text-portRoyal-slate border-portRoyal-wood/70 min-h-11 cursor-pointer border bg-transparent p-3 text-[11px] tracking-[0.16em] uppercase"
        >
          Close
        </button>
      </div>
    </div>
  );
}
