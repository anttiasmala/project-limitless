import { Toast as ToastType } from '@/utils/port-royal/types';

const TONE = {
  gain: {
    kind: 'gain',
    className: 'bg-portRoyal-teal border-portRoyal-tealDeep',
  },
  loss: {
    kind: 'loss',
    className: 'bg-portRoyal-crimson border-portRoyal-crimsonDeep',
  },
  info: {
    kind: 'note',
    className: 'bg-portRoyal-ink border-portRoyal-tealDeep',
  },
} as const;

/**
 * Sits just above the action bar so it reads as a consequence of the last
 * decision rather than a system message. It is placed inside the action bar's
 * box, so `bottom-full` is the top edge of the action bar.
 */
export default function Toast({ toast }: { toast: ToastType }) {
  const tone = TONE[toast.tone];

  return (
    <div
      role="status"
      className={`text-portRoyal-ground absolute bottom-full left-1/2 mb-3 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 border px-4 py-2.5 shadow-[0_8px_20px_rgba(31,42,51,0.25)] lg:mb-9 lg:px-5 lg:py-3 ${tone.className}`}
    >
      <span className="font-archivo-narrow text-[10px] tracking-[0.2em] uppercase opacity-80">
        {tone.kind}
      </span>
      <span className="font-spectral text-[14px] lg:text-[16px]">
        {toast.text}
      </span>
    </div>
  );
}
