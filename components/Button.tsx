import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Button({
  className,
  children,
}: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={twMerge(
        'h-12 w-80 rounded-lg bg-green-500 font-bold text-black',
        className,
      )}
    >
      {children}
    </button>
  );
}
