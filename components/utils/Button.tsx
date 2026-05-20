// components/utils/Button.tsx

import { ComponentPropsWithoutRef, Ref } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant =
  | 'primary'
  | 'gold'
  | 'neutral'
  | 'ghost'
  | 'unstyled';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ref?: Ref<HTMLButtonElement>;
};

const BASE =
  'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border-2 bg-red-700 border-red-900 text-white hover:bg-red-600 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 dark:hover:bg-red-800',
  gold:
    'border-2 bg-amber-600 border-amber-800 text-white hover:bg-amber-500 dark:bg-amber-700 dark:border-yellow-500 dark:text-yellow-300 dark:hover:bg-amber-600',
  neutral:
    'border-2 bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-500 dark:hover:border-amber-600 dark:hover:bg-amber-900/50',
  ghost:
    'bg-transparent border-0 text-slate-600 hover:text-red-500 dark:text-amber-700 dark:hover:text-red-400',
  unstyled: '',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'lg',
  type = 'button',
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const variantClasses = VARIANTS[variant];
  const sizeClasses = variant === 'unstyled' ? '' : SIZES[size];

  return (
    <button
      ref={ref}
      type={type}
      className={twMerge(BASE, variantClasses, sizeClasses, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
