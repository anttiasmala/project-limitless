import { useEffect, useState } from 'react';
import { DateTimeWindowModal } from '../../indexTypes';
import WindowFrame from './WindowFrame';
import { XP_BUTTON } from './xpStyles';
import DateTimeTab from './date-time/DateTimeTab';
import TimeZoneTab from './date-time/TimeZoneTab';
import InternetTimeTab from './date-time/InternetTimeTab';
import { TIME_SERVERS, TimeServer } from './date-time/constants';

type Props = {
  modal: DateTimeWindowModal;
  // Milliseconds the desktop clock currently runs ahead of (or behind) the real
  // system clock. The desktop owns it; this dialog only proposes a new value.
  offsetMs: number;
  timeZoneHours: number;
  onApply: (offsetMs: number, timeZoneHours: number) => void;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
};

const TABS = [
  ['date-time', 'Date & Time'],
  ['time-zone', 'Time Zone'],
  ['internet-time', 'Internet Time'],
] as const;

type Tab = (typeof TABS)[number][0];

export default function DateTimeWindow({
  modal,
  offsetMs,
  timeZoneHours,
  onApply,
  onClose,
  onFocus,
  onMove,
}: Props) {
  const [tab, setTab] = useState<Tab>('date-time');
  // The date/time being edited. It keeps ticking with the clock until the user
  // touches a field, at which point it freezes so their edit isn't overwritten.
  const [draft, setDraft] = useState(() => new Date(Date.now() + offsetMs));
  const [zone, setZone] = useState(timeZoneHours);
  const [isModified, setIsModified] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // Internet Time state lives here so it survives switching tabs.
  const [autoSync, setAutoSync] = useState(true);
  const [server, setServer] = useState<TimeServer>(TIME_SERVERS[0]);
  const [lastSync, setLastSync] = useState<{
    server: TimeServer;
    at: Date;
  } | null>(null);

  useEffect(() => {
    if (isModified) return;
    const tick = () => setDraft(new Date(Date.now() + offsetMs));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isModified, offsetMs]);

  // Replace part of the draft, keeping the rest. Clamps the day so switching
  // from the 31st to February lands on the 28th instead of overflowing.
  const editDraft = (parts: {
    year?: number;
    month?: number;
    day?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }) => {
    setIsModified(true);
    const nextYear = parts.year ?? draft.getFullYear();
    const nextMonth = parts.month ?? draft.getMonth();
    const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    setDraft(
      new Date(
        nextYear,
        nextMonth,
        Math.min(parts.day ?? draft.getDate(), maxDay),
        parts.hours ?? draft.getHours(),
        parts.minutes ?? draft.getMinutes(),
        parts.seconds ?? draft.getSeconds(),
      ),
    );
  };

  const applyChanges = () => {
    // Everything the user changed collapses into one number: how far the
    // desktop clock should run from the real one.
    const zoneShiftMs = (zone - timeZoneHours) * 3600000;
    onApply(draft.getTime() - Date.now() + zoneShiftMs, zone);
    setIsModified(false);
  };

  // Reset the clock to the current time
  const resetTime = () => {
    onApply(0, zone);
    setIsModified(false);
    setDraft(new Date());
  };

  // "Update Now" is a pretend network call: it just snaps the clock back to
  // real time, which is what a successful sync would do anyway.
  const syncWithServer = () => {
    resetTime();
    setLastSync({ server, at: new Date() });
  };

  return (
    <WindowFrame
      modal={modal}
      onClose={onClose}
      onFocus={onFocus}
      onMove={onMove}
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
            Sets the clock shown on the taskbar. This desktop keeps its own
            time, so your real system clock is never changed.
          </button>
        )}
        {/* Tab strip */}
        <div className="flex gap-0.5 text-xs">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`cursor-pointer rounded-t-[3px] border border-b-0 border-[#919b9c] px-3 py-1 ${
                tab === id
                  ? 'relative top-px bg-[#ece9d8] font-semibold'
                  : 'bg-[#dfdcc8]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="min-h-0 flex-1 overflow-y-auto border border-[#919b9c] bg-[#ece9d8] p-3">
          {tab === 'date-time' && (
            <DateTimeTab draft={draft} onEdit={editDraft} />
          )}
          {tab === 'time-zone' && (
            <TimeZoneTab zone={zone} onZoneChange={setZone} />
          )}
          {tab === 'internet-time' && (
            <InternetTimeTab
              autoSync={autoSync}
              onAutoSyncChange={setAutoSync}
              server={server}
              onServerChange={setServer}
              lastSync={lastSync}
              onSync={syncWithServer}
            />
          )}
        </div>

        {/* OK applies and closes, Apply applies and stays, Cancel just closes.*/}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 pt-2.5">
          <button
            type="button"
            className={`${XP_BUTTON} mr-auto`}
            disabled={offsetMs === 0 && !isModified}
            onClick={resetTime}
            title="Set the clock back to the real current time"
          >
            Reset time
          </button>
          <div className="flex gap-1.5">
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
              disabled={!isModified && zone === timeZoneHours}
              onClick={applyChanges}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
