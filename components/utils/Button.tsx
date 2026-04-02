// components/utils/Button.tsx

import { ComponentPropsWithoutRef } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => void | Promise<void>;
};

export default function Button({ onClick, className, children }: ButtonProps) {
  return (
    <button
      type="button"
      className={twMerge(
        'px-6 py-3 bg-red-700 border-2 border-red-900 text-white dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg hover:bg-red-600 cursor-pointer transition-all duration-200 text-lg',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
