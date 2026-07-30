// components/shared/TextField.tsx

import Input from './Input';
import FieldError from './FieldError';
import { InputHTMLAttributes } from 'react';

/**
 * A labelled text input with its error message wired up via aria-describedby.
 */
export default function TextField({
  id,
  label,
  error,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
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
      <Input
        id={id}
        variant="neutral"
        className="mt-1 w-full px-3 py-2 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? errorId : undefined}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
