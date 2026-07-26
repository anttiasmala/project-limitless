import { useId, useState } from 'react';
import { useWindowsXPSettings } from '@/hooks/index-page/useWindowsXPSettings';
import { WindowsXPSettings } from '@/utils/index-page/settings';
import { SettingsWindowModal } from '../../indexTypes';
import WindowFrame from '../window/WindowFrame';
import { XP_BUTTON, XP_CHECKBOX } from '../window/xpStyles';

type Props = {
  modal: SettingsWindowModal;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
  onMinimize: (uuid: string) => void;
};

// The checkboxes on offer, grouped the way XP's Control Panel groups related
// options. A new setting is one entry here plus its key in WindowsXPSettings.
const GROUPS: {
  title: string;
  options: { key: keyof WindowsXPSettings; label: string; help: string }[];
}[] = [
  {
    title: 'Desktop',
    options: [
      {
        key: 'enableCustomContextMenu',
        label: 'Use the Windows XP right-click menu',
        help: "Turn this off to get your browser's own menu, which makes saving or copying the icons and wallpaper easier.",
      },
    ],
  },
];

export default function Settings({
  modal,
  onClose,
  onFocus,
  onMinimize,
  onMove,
}: Props) {
  const [settings, setSettings] = useWindowsXPSettings();
  // The edits in progress, or null while nothing has been changed. Keeping it
  // null (instead of a copy made on mount) means the dialog still shows the
  // saved values once localStorage has been read, which happens after mount.
  const [draft, setDraft] = useState<WindowsXPSettings | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fieldId = useId();

  const values = draft ?? settings;
  const isModified =
    draft !== null &&
    (Object.keys(draft) as (keyof WindowsXPSettings)[]).some(
      (key) => draft[key] !== settings[key],
    );

  const applyChanges = () => {
    setSettings(values);
    // Fall back to the saved values again, which the write above just updated.
    setDraft(null);
  };

  return (
    <WindowFrame
      modal={modal}
      onClose={onClose}
      onFocus={onFocus}
      onMove={onMove}
      onMinimize={onMinimize}
      onHelp={() => setShowHelp((prev) => !prev)}
    >
      <div className="relative flex min-h-0 flex-1 flex-col bg-[#ece9d8] p-2.5 text-black">
        {/* XP's "What's This?" balloon, toggled by the title bar's ? button */}
        {showHelp && (
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="absolute top-1 right-2 z-1 max-w-56 cursor-default border border-[#8b8878] bg-[#ffffe1] px-2 py-1 text-left text-[11px] leading-relaxed shadow-md"
          >
            These settings only change how this desktop behaves. They are kept
            in this browser, so they follow you back on your next visit.
          </button>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {GROUPS.map((group) => (
            <fieldset
              key={group.title}
              className="border border-[#aca899] px-3 pt-1 pb-3"
            >
              <legend className="px-1 text-xs font-semibold">
                {group.title}
              </legend>
              {group.options.map((option) => (
                <div key={option.key} className="mt-1">
                  <div className="flex">
                    <input
                      type="checkbox"
                      id={`${fieldId}-${option.key}`}
                      checked={values[option.key]}
                      onChange={(e) =>
                        setDraft({ ...values, [option.key]: e.target.checked })
                      }
                      className={`${XP_CHECKBOX} mt-0.5`}
                    />
                    <label
                      htmlFor={`${fieldId}-${option.key}`}
                      className="ml-1.5 cursor-pointer text-xs select-none"
                    >
                      {option.label}
                    </label>
                  </div>
                  {/* Indented under the box, like XP's explanatory sub-text */}
                  <p className="mt-1 ml-5 text-[11px] leading-relaxed text-[#4d4d47]">
                    {option.help}
                  </p>
                </div>
              ))}
            </fieldset>
          ))}
        </div>

        {/* OK applies and closes, Apply applies and stays, Cancel just closes */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 pt-2.5">
          <button
            type="button"
            className={XP_BUTTON}
            onClick={() => {
              applyChanges();
              onClose(modal.uuid);
            }}
          >
            OK
          </button>
          <button
            type="button"
            className={XP_BUTTON}
            onClick={() => onClose(modal.uuid)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={XP_BUTTON}
            disabled={!isModified}
            onClick={applyChanges}
          >
            Apply
          </button>
        </div>
      </div>
    </WindowFrame>
  );
}
