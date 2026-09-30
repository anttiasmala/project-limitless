import { CARD_ART_DIR, PersonRole } from '@/utils/port-royal/types';
import Image from 'next/image';

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

/**
 * A glyph + number + label pill, as used on the harbour cards. The harbour
 * cards are small below `lg`, so there the label is only read by screen readers.
 */
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
      className={`flex items-center gap-1 border py-0.5 pr-1.25 pl-0.75 lg:gap-1.25 lg:py-0.75 lg:pr-1.75 lg:pl-1 ${s.wrap}`}
    >
      <span
        aria-hidden
        className={`grid h-3.5 w-3.5 place-items-center text-[8px] font-bold lg:h-4 lg:w-4 lg:text-[9px] ${s.chip}`}
      >
        {s.glyph}
      </span>
      <span
        className={`text-[12px] font-bold tabular-nums lg:text-[13px] ${s.value}`}
      >
        {value}
      </span>
      <span className="font-archivo-narrow text-portRoyal-slate text-[9px] tracking-[0.06em] uppercase max-lg:sr-only">
        {label}
      </span>
    </div>
  );
}

/** The smaller tableau chip, keyed off the hired person's role. */
const ROLE: Record<
  PersonRole,
  { glyph: string; chip: string; icon: { imageSrc: string; imageAlt: string } }
> = {
  fighter: {
    glyph: '✦',
    chip: 'rounded-[2px] border-portRoyal-slate bg-portRoyal-ink/14 text-portRoyal-teal',
    icon: {
      imageSrc: `${CARD_ART_DIR}/realSwords.png`,
      imageAlt: 'Real swords icon',
    },
  },
  trader: {
    glyph: 'S',
    chip: 'rounded-full border-portRoyal-brass bg-portRoyal-brass/30 text-portRoyal-brassDeep',
    icon: {
      imageSrc: `${CARD_ART_DIR}/realCoins.png`,
      imageAlt: 'Real coins icon',
    },
  },
  crew: {
    glyph: '⚓',
    chip: 'rounded-[2px] border-portRoyal-wood bg-portRoyal-wood/20 text-portRoyal-ink',
    icon: {
      imageSrc: `${CARD_ART_DIR}/expeditionIcon.png`,
      imageAlt: 'Expedition icon',
    },
  },
  rule: {
    glyph: '◆',
    chip: 'rounded-[2px] border-portRoyal-teal bg-portRoyal-teal/18 text-portRoyal-teal',
    icon: {
      imageSrc: `${CARD_ART_DIR}/realVictoryPoints.png`,
      imageAlt: 'Real Victory Points icon',
    },
  },
};

export function RoleChip({ role }: { role: PersonRole }) {
  const r = ROLE[role];

  return (
    <span
      aria-hidden
      className={`grid h-5 w-5 shrink-0 place-items-center border text-[9px] font-bold ${r.chip}`}
    >
      <Image
        src={r.icon.imageSrc}
        alt={r.icon.imageAlt}
        width={16}
        height={16}
        className="h-3 w-3"
      />
    </span>
  );
}
