import { useEffect, useState } from 'react';
import { DateTimeWindowModal } from '../../indexTypes';
import WindowFrame from './WindowFrame';
import Image from 'next/image';

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

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// XP's calendar weeks start on Sunday.
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// A short list of the zones XP showed, enough to make the tab feel real.
// The offset is what actually moves the clock when applied.
const TIME_ZONES: { hours: number; label: string }[] = [
  { hours: -8, label: '(GMT-08:00) Pacific Time (US & Canada)' },
  { hours: -5, label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { hours: 0, label: '(GMT) Greenwich Mean Time : Dublin, London' },
  { hours: 1, label: '(GMT+01:00) Amsterdam, Berlin, Rome, Stockholm' },
  { hours: 2, label: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia' },
  { hours: 3, label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd' },
  { hours: 5.5, label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
  { hours: 9, label: '(GMT+09:00) Osaka, Sapporo, Tokyo' },
  { hours: 10, label: '(GMT+10:00) Canberra, Melbourne, Sydney' },
];

const XP_BUTTON =
  'min-w-18.75 cursor-pointer rounded-[3px] border border-[#003c74] bg-[linear-gradient(to_bottom,#fdfdfd_0%,#f0f0ea_45%,#e3e3db_50%,#eeeef2_100%)] px-4 py-0.5 text-xs shadow-[inset_0_0_0_1px_#fff] hover:border-[#0078d7] focus:outline-1 focus:outline-offset-[-3px] focus:outline-dotted active:bg-[linear-gradient(to_bottom,#e3e3db_0%,#eeeef2_100%)] disabled:cursor-default disabled:text-[#a0a0a0]';

const XP_FIELD =
  'border border-[#7f9db9] bg-white px-1 py-0.5 text-xs focus:outline-none';

const pad = (value: number) => value.toString().padStart(2, '0');

// The clock face. Hands (hand = viisari) are drawn as rotated lines from the centre, so the
// second hand lines up with the digital field beside it.
function AnalogClock({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  const hand = (angleDeg: number, length: number, width: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x2: 50 + Math.cos(rad) * length,
      y2: 50 + Math.sin(rad) * length,
      strokeWidth: width,
    };
  };

  const hourHand = hand(((hours % 12) + minutes / 60) * 30, 24, 3.5);
  const minuteHand = hand((minutes + seconds / 60) * 6, 34, 2.5);
  const secondHand = hand(seconds * 6, 36, 1);

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32" aria-hidden>
      <circle cx="50" cy="50" r="47" fill="#fff" stroke="#7f9db9" />
      {Array.from({ length: 12 }, (_, i) => {
        const rad = ((i * 30 - 90) * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={50 + Math.cos(rad) * 40}
            cy={50 + Math.sin(rad) * 40}
            r={i % 3 === 0 ? 2 : 1.2}
            fill="#333"
          />
        );
      })}
      <line x1="50" y1="50" {...hourHand} stroke="#000" strokeLinecap="round" />
      <line
        x1="50"
        y1="50"
        {...minuteHand}
        stroke="#000"
        strokeLinecap="round"
      />
      <line x1="50" y1="50" {...secondHand} stroke="#c00" />
      <circle cx="50" cy="50" r="2" fill="#000" />
    </svg>
  );
}

export default function DateTimeWindow({
  modal,
  offsetMs,
  timeZoneHours,
  onApply,
  onClose,
  onFocus,
  onMove,
}: Props) {
  const [tab, setTab] = useState<'date-time' | 'time-zone'>('date-time');
  // The date/time being edited. It keeps ticking with the clock until the user
  // touches a field, at which point it freezes so their edit isn't overwritten.
  const [draft, setDraft] = useState(() => new Date(Date.now() + offsetMs));
  const [zone, setZone] = useState(timeZoneHours);
  const [isModified, setIsModified] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isModified) return;
    const tick = () => setDraft(new Date(Date.now() + offsetMs));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isModified, offsetMs]);

  const year = draft.getFullYear();
  const month = draft.getMonth();
  const day = draft.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();

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
    const nextYear = parts.year ?? year;
    const nextMonth = parts.month ?? month;
    const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    setDraft(
      new Date(
        nextYear,
        nextMonth,
        Math.min(parts.day ?? day, maxDay),
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

  const timeField = (
    value: number,
    max: number,
    onChange: (next: number) => void,
  ) => (
    <input
      type="number"
      min={0}
      max={max}
      value={pad(value)}
      onChange={(e) => {
        const next = Number(e.target.value);
        if (Number.isNaN(next)) return;
        onChange(Math.min(Math.max(next, 0), max));
      }}
      className="w-7 [appearance:textfield] bg-white text-center text-xs focus:bg-[#316ac5] focus:text-white focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );

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
          {(
            [
              ['date-time', 'Date & Time'],
              ['time-zone', 'Time Zone'],
            ] as const
          ).map(([id, label]) => (
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
          {tab === 'date-time' ? (
            <div className="flex gap-4">
              {/* Date: month + year pickers above the calendar grid */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold">Date</p>
                <div className="flex gap-1">
                  <select
                    value={month}
                    onChange={(e) =>
                      editDraft({ month: Number(e.target.value) })
                    }
                    className={`${XP_FIELD} cursor-pointer`}
                  >
                    {MONTHS.map((name, index) => (
                      <option key={name} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (next >= 1980 && next <= 2099)
                        editDraft({ year: next });
                    }}
                    className={`${XP_FIELD} w-16`}
                  />
                </div>

                <div className="grid grid-cols-7 gap-px border border-[#7f9db9] bg-white p-1 text-center text-[11px]">
                  {WEEKDAYS.map((weekday, index) => (
                    <span key={index} className="font-semibold text-[#444]">
                      {weekday}
                    </span>
                  ))}
                  {Array.from({ length: leadingBlanks }, (_, i) => (
                    <span key={`blank-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (dayNumber) => (
                      <button
                        key={dayNumber}
                        type="button"
                        onClick={() => editDraft({ day: dayNumber })}
                        className={`cursor-pointer leading-4 ${
                          dayNumber === day
                            ? 'bg-[#316ac5] text-white'
                            : 'hover:bg-[#d3e5fa]'
                        }`}
                      >
                        {dayNumber}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Time: clock face above the editable hh:mm:ss field */}
              <div className="flex flex-col items-center gap-2">
                <p className="w-full text-xs font-semibold">Time</p>
                <AnalogClock
                  hours={draft.getHours()}
                  minutes={draft.getMinutes()}
                  seconds={draft.getSeconds()}
                />
                <div
                  className={`${XP_FIELD} flex items-center tabular-nums`}
                  // The three inputs read as one field, matching XP's spinner.
                >
                  {timeField(draft.getHours(), 23, (hours) =>
                    editDraft({ hours }),
                  )}
                  :
                  {timeField(draft.getMinutes(), 59, (minutes) =>
                    editDraft({ minutes }),
                  )}
                  :
                  {timeField(draft.getSeconds(), 59, (seconds) =>
                    editDraft({ seconds }),
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              <select
                value={zone}
                onChange={(e) => setZone(Number(e.target.value))}
                className={`${XP_FIELD} w-full cursor-pointer`}
              >
                {TIME_ZONES.map((tz) => (
                  <option key={tz.hours} value={tz.hours}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <Image
                alt="World map"
                src={'/images/index-page/clock/world.png'}
                width={710}
                height={364}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer appearance-none border border-[#7f9db9] bg-white bg-size-[11px_11px] bg-center bg-no-repeat checked:bg-[url(/images/index-page/clock/checkbox.svg)]"
                />
                <label htmlFor="checkbox" className="ml-1 text-xs select-none">
                  Automatically adjust clock for daylight saving changes
                </label>
              </div>
              <p className="leading-relaxed text-[#333]">
                Current time zone:{' '}
                <span className="font-semibold">
                  GMT{zone >= 0 ? '+' : '-'}
                  {pad(Math.floor(Math.abs(zone)))}:
                  {pad((Math.abs(zone) % 1) * 60)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* OK applies and closes, Apply applies and stays, Cancel just closes */}
        <div className="flex shrink-0 justify-end gap-1.5 pt-2.5">
          <button
            type="button"
            className={`${XP_BUTTON} mr-auto`}
            disabled={offsetMs === 0 && !isModified}
            onClick={resetTime}
            title="Set the clock back to the real current time"
          >
            Reset time
          </button>
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
    </WindowFrame>
  );
}
