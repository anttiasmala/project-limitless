import Image from 'next/image';
import { useId } from 'react';
import { XP_CHECKBOX, XP_FIELD } from '../xpStyles';
import { TIME_ZONES, pad } from './constants';

type Props = {
  zone: number;
  onZoneChange: (hours: number) => void;
};

export default function TimeZoneTab({ zone, onZoneChange }: Props) {
  const daylightSavingId = useId();

  return (
    <div className="flex flex-col gap-3 text-xs">
      <select
        value={zone}
        onChange={(e) => onZoneChange(Number(e.target.value))}
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
          id={daylightSavingId}
          defaultChecked
          className={XP_CHECKBOX}
        />
        <label htmlFor={daylightSavingId} className="ml-1 text-xs select-none">
          Automatically adjust clock for daylight saving changes
        </label>
      </div>
      <p className="leading-relaxed text-[#333]">
        Current time zone:{' '}
        <span className="font-semibold">
          GMT{zone >= 0 ? '+' : '-'}
          {pad(Math.floor(Math.abs(zone)))}:{pad((Math.abs(zone) % 1) * 60)}
        </span>
      </p>
    </div>
  );
}
