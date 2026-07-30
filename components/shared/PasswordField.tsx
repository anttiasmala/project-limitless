// components/shared/PasswordField.tsx

import Button from './Button';
import Input from './Input';
import SvgEyeOpen from '@/icons/eye_open';
import SvgEyeSlash from '@/icons/eye_slash';
import { ReactNode } from 'react';
import FieldError from './FieldError';

/**
 * A password input with the show/hide eye toggle, used for both "Password" and
 * "Confirm password".
 *
 * `isRevealed` is given as a parameter, so one click
 * reveals BOTH fields at once. The point of the confirmation field is to compare the
 * two password fields, which is impossible if only one of them is readable.
 */
export default function PasswordField({
  id,
  label,
  value,
  error,
  autoComplete,
  isRevealed,
  onToggleReveal,
  onChange,
  describedBy,
  children,
}: {
  id: string;
  label: string;
  value: string;
  error: string | undefined;
  autoComplete: string;
  isRevealed: boolean;
  onToggleReveal: () => void;
  onChange: (value: string) => void;
  describedBy?: string;
  children?: ReactNode;
}) {
  const errorId = `${id}-error`;
  const describedByIds =
    [error !== undefined ? errorId : undefined, describedBy]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <div className="mt-1 flex rounded-lg border-2 border-slate-300 bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-400 dark:border-slate-700 dark:bg-slate-900">
        <Input
          id={id}
          variant="neutral"
          className="w-full border-0 bg-transparent px-3 py-2 outline-0 focus:outline-0 dark:bg-transparent"
          type={isRevealed ? 'text' : 'password'}
          name={id}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          aria-invalid={error !== undefined}
          aria-describedby={describedByIds}
        />
        <Button
          className="px-2"
          aria-label={isRevealed ? 'Hide password' : 'Show password'}
          aria-pressed={isRevealed}
          title={isRevealed ? 'Hide password' : 'Show password'}
          variant="unstyled"
          onClick={onToggleReveal}
        >
          {isRevealed ? (
            <SvgEyeSlash className="h-8 w-8 text-black dark:text-white" />
          ) : (
            <SvgEyeOpen className="h-8 w-8 text-black dark:text-white" />
          )}
        </Button>
      </div>
      <FieldError id={errorId} message={error} />
      {children}
    </div>
  );
}
