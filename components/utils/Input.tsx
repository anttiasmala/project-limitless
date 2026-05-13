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
        'bg-red-700 border-2 border-red-900 text-white dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg hover:bg-red-600 transition-all duration-200 text-lg',
        className,
      )}
      {...rest}
    />
  );
}
