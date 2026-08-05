// components/shared/Panel.tsx

import { ComponentPropsWithoutRef, Ref } from 'react';
import { twMerge } from 'tailwind-merge';

type PanelProps = ComponentPropsWithoutRef<'div'> & {
  ref?: Ref<HTMLDivElement>;
};

const BASE =
  'flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm backdrop-blur focus-visible:outline-none dark:border-slate-800 dark:bg-slate-900/60';

/**
 * The card the auth pages draw each of their states on
 *
 * `focus-visible:outline-none` belongs to the card rather than its users.
 * Several of these panels are focused programmatically to move a screen reader
 * to the outcome, and that should not paint a focus ring around the whole card.
 */
export default function Panel({
  className,
  children,
  ref,
  ...rest
}: PanelProps) {
  return (
    <div ref={ref} className={twMerge(BASE, className)} {...rest}>
      {children}
    </div>
  );
}
