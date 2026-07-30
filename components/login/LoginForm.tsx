// components/login/LoginForm.tsx

'use client';

import Button from '@/components/shared/Button';
import PasswordField from '@/components/shared/PasswordField';
import TextField from '@/components/shared/TextField';
import { loginUser } from '@/lib/auth/loginUser';
import { focusFirstInvalidField } from '@/utils/focusFirstInvalidField';
import {
  collectLoginErrors,
  LOGIN_FIELD_ORDER,
  loginSchema,
  type LoginFieldErrors,
  type LoginFieldName,
  type LoginFormData,
} from '@/utils/zodSchemas';
import Link from 'next/link';
import { useState } from 'react';
import LoginSuccess from './LoginSuccess';

const EMPTY_FORM_DATA: LoginFormData = {
  email: '',
  password: '',
};

type Status = 'idle' | 'submitting' | 'success';

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>(EMPTY_FORM_DATA);

  // Errors from the schema and errors reported by loginUser are kept apart on
  // purpose: re-validating on every keystroke would otherwise wipe out a
  // message from the server the moment an unrelated field is edited.
  const [clientErrors, setClientErrors] = useState<LoginFieldErrors>({});
  const [serverErrors, setServerErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // Validation stays silent until the first submit, then runs "live". Nobody
  // wants to be told their email is invalid while they are still typing it.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [status, setStatus] = useState<Status>('idle');
  const [loggedInUsername, setLoggedInUsername] = useState('');

  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);

  const isSubmitting = status === 'submitting';

  function errorFor(field: LoginFieldName) {
    return clientErrors[field] ?? serverErrors[field];
  }

  function updateField(field: LoginFieldName, value: string) {
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);

    // Editing a field is an answer to whatever the server said about it.
    setServerErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(undefined);

    if (hasSubmitted) setClientErrors(collectLoginErrors(nextFormData));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError(undefined);

    const validatedForm = loginSchema.safeParse(formData);

    if (!validatedForm.success) {
      const errors = collectLoginErrors(formData);
      setClientErrors(errors);
      setServerErrors({});
      focusFirstInvalidField(LOGIN_FIELD_ORDER, errors);
      return;
    }

    setClientErrors({});
    setServerErrors({});
    setStatus('submitting');

    try {
      const result = await loginUser(validatedForm.data);

      if (result.ok) {
        setLoggedInUsername(result.username);
        setStatus('success');
        return;
      }

      const fieldErrors = result.fieldErrors ?? {};
      setServerErrors(fieldErrors);
      setFormError(result.formError);
      focusFirstInvalidField(LOGIN_FIELD_ORDER, fieldErrors);
    } catch (e) {
      console.error(e);
      setFormError('Something went wrong. Please try again.');
    }

    setStatus('idle');
  }

  function resetForm() {
    setFormData(EMPTY_FORM_DATA);
    setClientErrors({});
    setServerErrors({});
    setFormError(undefined);
    setHasSubmitted(false);
    setIsPasswordRevealed(false);
    setLoggedInUsername('');
    setStatus('idle');
  }

  if (status === 'success') {
    return <LoginSuccess username={loggedInUsername} onLogOut={resetForm} />;
  }

  return (
    <form
      // The browser's own bubbles would compete with the messages below each
      // field (and can't be styled), so validation is left entirely to zod.
      noValidate
      className="flex w-full max-w-xs flex-col items-start"
      onSubmit={(e) => handleSubmit(e)}
    >
      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        spellCheck="false"
        maxLength={128}
        value={formData.email}
        error={errorFor('email')}
        onChange={(e) => updateField('email', e.currentTarget.value)}
      />

      <PasswordField
        id="password"
        label="Password"
        // "current-password", unlike register's "new-password", is what tells a
        // password manager to offer a saved entry instead of generating one.
        autoComplete="current-password"
        value={formData.password}
        error={errorFor('password')}
        isRevealed={isPasswordRevealed}
        onToggleReveal={() => setIsPasswordRevealed((previous) => !previous)}
        onChange={(value) => updateField('password', value)}
      />

      {formError !== undefined && (
        <p
          role="alert"
          className="mt-2 w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          {formError}
        </p>
      )}

      <div className="mt-5 w-full">
        <Button
          type="submit"
          variant="neutral"
          className="w-full"
          disabled={isSubmitting}
          // Announced to screen readers while the request is in submitting
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Logging in…' : 'Login'}
        </Button>
      </div>

      {/* Inside the form rather than the page so it disappears along with the
          form once the login succeeds. */}
      <p className="mt-4 w-full text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
