// components/utils/Input.tsx

import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        'rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-800 transition-all duration-200 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300',
        className,
      )}
      {...rest}
    />
  );
}
