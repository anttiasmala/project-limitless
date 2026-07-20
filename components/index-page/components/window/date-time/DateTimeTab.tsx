import { XP_FIELD } from '../xpStyles';
import AnalogClock from './AnalogClock';
import { MONTHS, WEEKDAYS, pad } from './constants';

type DraftParts = {
  year?: number;
  month?: number;
  day?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

type Props = {
  draft: Date;
  onEdit: (parts: DraftParts) => void;
};

export default function DateTimeTab({ draft, onEdit }: Props) {
  const year = draft.getFullYear();
  const month = draft.getMonth();
  const day = draft.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();

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
    <div className="flex gap-4">
      {/* Date: month + year pickers above the calendar grid */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold">Date</p>
        <div className="flex gap-1">
          <select
            value={month}
            onChange={(e) => onEdit({ month: Number(e.target.value) })}
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
              if (next >= 1980 && next <= 2099) onEdit({ year: next });
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
                onClick={() => onEdit({ day: dayNumber })}
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
          {timeField(draft.getHours(), 23, (hours) => onEdit({ hours }))}:
          {timeField(draft.getMinutes(), 59, (minutes) => onEdit({ minutes }))}:
          {timeField(draft.getSeconds(), 59, (seconds) => onEdit({ seconds }))}
        </div>
      </div>
    </div>
  );
}
