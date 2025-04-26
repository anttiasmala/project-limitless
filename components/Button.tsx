import { ComponentPropsWithoutRef, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Button({
  className,
  children,
}: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className={twMerge(
        'min-h-12 min-w-80 rounded-lg bg-green-500 font-bold wrap-anywhere text-black',
        className,
      )}
    >
      {children}
    </button>
  );
}
