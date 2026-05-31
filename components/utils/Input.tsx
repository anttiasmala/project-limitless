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
        'bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg transition-all duration-200 text-lg',
        className,
      )}
      {...rest}
    />
  );
}
