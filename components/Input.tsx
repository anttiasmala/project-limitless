import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        'w-72 rounded-md bg-gray-300 p-3 text-black placeholder-gray-400',
        className,
      )}
      {...rest}
    />
  );
}
