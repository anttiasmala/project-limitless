// components/shared/TextAreaField.tsx

import { TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import FieldError from './FieldError';

// The colors are the ones Input paints its 'neutral' variant with, so a
// textarea sits in a form next to a TextField without looking like a stranger.
// The text itself is a size down from Input's: a paragraph in the same bold
// 18px an email field uses
const BASE =
  'mt-1 w-full resize-y rounded-lg border-2 px-3 py-2 font-medium transition-all duration-200 border-slate-300 bg-white text-slate-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

/**
 * The multi-line counterpart of TextField: same label, and the same error
 * message wired up through aria-describedby.
 */
export default function TextAreaField({
  id,
  label,
  error,
  className,
  ...rest
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  id: string;
  label: string;
  error: string | undefined;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <textarea
        id={id}
        className={twMerge(BASE, className)}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? errorId : undefined}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
