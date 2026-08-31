import { PersonRole } from '@/utils/port-royal/types';

export type StatKind = 'coin' | 'sword' | 'vp';

/** The three currencies, each with its own glyph, chip shape and tint. */
const STAT: Record<
  StatKind,
  { glyph: string; wrap: string; chip: string; value: string }
> = {
  coin: {
    glyph: '¤',
    wrap: 'border-portRoyal-brass bg-portRoyal-brass/12',
    chip: 'rounded-full bg-portRoyal-brass/35 text-portRoyal-brassDeep',
    value: 'text-portRoyal-ink',
  },
  sword: {
    glyph: '✦',
    wrap: 'border-portRoyal-slate bg-portRoyal-slate/8',
    chip: 'rounded-[2px] bg-portRoyal-ink/14 text-portRoyal-ink',
    value: 'text-portRoyal-ink',
  },
  vp: {
    glyph: '◆',
    wrap: 'border-portRoyal-teal bg-portRoyal-teal/8',
    chip: 'rounded-[2px] bg-portRoyal-teal/20 text-portRoyal-teal',
    value: 'text-portRoyal-teal',
  },
};

/** A glyph + number + label pill, as used on the harbour cards. */
export default function StatChip({
  kind,
  value,
  label,
}: {
  kind: StatKind;
  value: number;
  label: string;
}) {
  const s = STAT[kind];

  return (
    <div
      className={`flex items-center gap-1.25 border py-0.75 pr-1.75 pl-1 ${s.wrap}`}
    >
      <span
        aria-hidden
        className={`grid h-4 w-4 place-items-center text-[9px] font-bold ${s.chip}`}
      >
        {s.glyph}
      </span>
      <span className={`text-[13px] font-bold tabular-nums ${s.value}`}>
        {value}
      </span>
      <span className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.06em] uppercase">
        {label}
      </span>
    </div>
  );
}

/** The smaller tableau chip, keyed off the hired person's role. */
const ROLE: Record<PersonRole, { glyph: string; chip: string }> = {
  fighter: {
    glyph: '✦',
    chip: 'rounded-[2px] border-portRoyal-slate bg-portRoyal-ink/14 text-portRoyal-teal',
  },
  trader: {
    glyph: 'S',
    chip: 'rounded-full border-portRoyal-brass bg-portRoyal-brass/30 text-portRoyal-brassDeep',
  },
  rule: {
    glyph: '◆',
    chip: 'rounded-[2px] border-portRoyal-teal bg-portRoyal-teal/18 text-portRoyal-teal',
  },
};

export function RoleChip({ role }: { role: PersonRole }) {
  const r = ROLE[role];

  return (
    <span
      aria-hidden
      className={`grid h-5 w-5 place-items-center border text-[9px] font-bold ${r.chip}`}
    >
      {r.glyph}
    </span>
  );
}
