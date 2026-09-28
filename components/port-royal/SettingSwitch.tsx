import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type SettingSwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'role'
> & {
  /** Extra classes for the outer wrapper (e.g. spacing). */
  className?: string;
};

/**
 * Square on/off switch in the Port Royal parchment style.
 *
 * It is a real checkbox (hidden, but still focusable) with role="switch", so
 * screen readers say "on" / "off". Put it inside a <label> together with the
 * text, then clicking the text also toggles it.
 */
export default function SettingSwitch({
  className,
  ...rest
}: SettingSwitchProps) {
  return (
    <span className={twMerge('relative inline-flex flex-none', className)}>
      <input type="checkbox" role="switch" className="peer sr-only" {...rest} />
      {/* Track. When ON, the whole track fills with brass, so the state is
          clear at a glance, not only from the knob position. */}
      <span
        aria-hidden
        className="border-portRoyal-wood bg-portRoyal-parchment/60 peer-checked:border-portRoyal-brassDeep peer-checked:bg-portRoyal-brass peer-focus-visible:outline-portRoyal-ink h-7 w-13 border transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 motion-reduce:transition-none"
      />
      {/* Knob. It sits 3px from the edge (1px border + 2px gap). When ON it
          moves 24px, which is track width 52 - 22 knob - 2 * 3 gap. */}
      <span
        aria-hidden
        className="bg-portRoyal-wood peer-checked:bg-portRoyal-card absolute top-0.75 left-0.75 h-5.5 w-5.5 transition-[translate,background-color] duration-200 peer-checked:translate-x-6 motion-reduce:transition-none"
      />
    </span>
  );
}
