// components/utils/Input.tsx

import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type InputVariant = 'pirate' | 'neutral';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
};

const BASE =
  'rounded-lg border-2 text-lg font-bold transition-all duration-200';

// 'pirate' is the default so every existing call site keeps the exact colors it
// had before variants existed. 'neutral' matches the slate palette of the
// arcade landing page, for screens that aren't part of the tic-tac-toe game.
//
// Each variant repeats its background and text color as --autofill-bg /
// --autofill-fg. A browser-autofilled field ignores `bg-*` and `text-*`
// entirely (see the :-webkit-autofill rule in app/globals.css). Those two
// variables are how the rule learns which colors to repaint it with
const VARIANTS: Record<InputVariant, string> = {
  pirate:
    'border-slate-300 bg-white text-slate-800 [--autofill-bg:var(--color-white)] [--autofill-fg:var(--color-slate-800)] dark:border-red-700 dark:bg-red-900 dark:text-yellow-300 dark:[--autofill-bg:var(--color-red-900)] dark:[--autofill-fg:var(--color-yellow-300)]',
  neutral:
    'border-slate-300 bg-white text-slate-800 [--autofill-bg:var(--color-white)] [--autofill-fg:var(--color-slate-800)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:[--autofill-bg:var(--color-slate-900)] dark:[--autofill-fg:var(--color-slate-100)]',
};

export default function Input({
  variant = 'pirate',
  className,
  ...rest
}: InputProps) {
  return (
    <input className={twMerge(BASE, VARIANTS[variant], className)} {...rest} />
  );
}
