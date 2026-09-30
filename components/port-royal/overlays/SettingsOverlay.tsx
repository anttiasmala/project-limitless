import { ReactNode } from 'react';
import SettingSwitch from '@/components/port-royal/SettingSwitch';
import { usePortRoyalSettings } from '@/hooks/port-royal/usePortRoyalSettings';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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
  const [settings, setSettings] = usePortRoyalSettings();
  // When the device already asks for less motion, the switch is locked on.
  const deviceReducesMotion = usePrefersReducedMotion();

  return (
    <div
      onClick={onClose}
      className="bg-portRoyal-ink/60 fixed inset-0 z-50 flex justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-portRoyal-vellum border-portRoyal-wood flex h-full w-full max-w-95 flex-col gap-4.5 overflow-y-auto overscroll-contain border-l px-5 py-5 sm:px-7 sm:py-6.5"
      >
        <div className="font-spectral text-[26px] font-semibold">Settings</div>

        <SettingRow
          label="Reduce animation"
          note={
            deviceReducesMotion
              ? 'On by your device settings'
              : 'No card flip, no sliding'
          }
        >
          <SettingSwitch
            checked={deviceReducesMotion || settings.reduceAnimation}
            disabled={deviceReducesMotion}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                reduceAnimation: e.currentTarget.checked,
              }))
            }
          />
        </SettingRow>
        <SettingRow label="Fast game" note="No wait between card draws">
          <SettingSwitch
            checked={settings.fastGame}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                fastGame: e.currentTarget.checked,
              }))
            }
          />
        </SettingRow>
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
