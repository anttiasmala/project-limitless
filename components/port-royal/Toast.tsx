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
 * decision rather than a system message.
 */
export default function Toast({ toast }: { toast: ToastType }) {
  const tone = TONE[toast.tone];

  return (
    <div
      role="status"
      className={`text-portRoyal-ground absolute bottom-26.5 left-1/2 flex -translate-x-1/2 items-center gap-3 border px-5 py-3 shadow-[0_8px_20px_rgba(31,42,51,0.25)] ${tone.className}`}
    >
      <span className="font-archivo-narrow text-[10px] tracking-[0.2em] uppercase opacity-80">
        {tone.kind}
      </span>
      <span className="font-spectral text-[16px]">{toast.text}</span>
    </div>
  );
}
