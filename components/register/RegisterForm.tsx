// components/register/RegisterForm.tsx

'use client';

import Button from '@/components/shared/Button';
import { registerUser } from '@/lib/auth/registerUser';
import {
  collectRegisterErrors,
  REGISTER_FIELD_ORDER,
  registerSchema,
  type RegisterFieldErrors,
  type RegisterFieldName,
  type RegisterFormData,
} from '@/utils/zodSchemas';
import { useState } from 'react';
import PasswordChecklist from './PasswordChecklist';
import PasswordField from './PasswordField';
import RegisterSuccess from './RegisterSuccess';
import TextField from './TextField';

const EMPTY_FORM_DATA: RegisterFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

type Status = 'idle' | 'submitting' | 'success';

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>(EMPTY_FORM_DATA);

  // Errors from the schema and errors reported by registerUser are kept apart
  // on purpose: re-validating on every keystroke would otherwise wipe out an
  // "already taken" message the moment an unrelated field is edited.
  const [clientErrors, setClientErrors] = useState<RegisterFieldErrors>({});
  const [serverErrors, setServerErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // Validation stays silent until the first submit, then runs "live". Nobody
  // wants to be told their email is invalid while they are still typing it.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [status, setStatus] = useState<Status>('idle');
  const [registeredUsername, setRegisteredUsername] = useState('');

  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);

  const isSubmitting = status === 'submitting';

  function errorFor(field: RegisterFieldName) {
    return clientErrors[field] ?? serverErrors[field];
  }

  function updateField(field: RegisterFieldName, value: string) {
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);

    // Editing a field is an answer to whatever the server said about it.
    setServerErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(undefined);

    if (hasSubmitted) setClientErrors(collectRegisterErrors(nextFormData));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError(undefined);

    const validatedForm = registerSchema.safeParse(formData);

    if (!validatedForm.success) {
      const errors = collectRegisterErrors(formData);
      setClientErrors(errors);
      setServerErrors({});
      focusFirstInvalidField(errors);
      return;
    }

    setClientErrors({});
    setServerErrors({});
    setStatus('submitting');

    try {
      const result = await registerUser(validatedForm.data);

      if (result.ok) {
        setRegisteredUsername(validatedForm.data.username);
        setStatus('success');
        return;
      }

      const fieldErrors = result.fieldErrors ?? {};
      setServerErrors(fieldErrors);
      setFormError(result.formError);
      focusFirstInvalidField(fieldErrors);
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
    setRegisteredUsername('');
    setStatus('idle');
  }

  if (status === 'success') {
    return (
      <RegisterSuccess
        username={registeredUsername}
        onRegisterAnother={resetForm}
      />
    );
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
        id="username"
        name="username"
        label="Username"
        type="text"
        autoComplete="username"
        spellCheck="false"
        maxLength={30}
        value={formData.username}
        error={errorFor('username')}
        onChange={(e) => updateField('username', e.currentTarget.value)}
      />

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
        autoComplete="new-password"
        value={formData.password}
        error={errorFor('password')}
        isRevealed={isPasswordRevealed}
        onToggleReveal={() => setIsPasswordRevealed((previous) => !previous)}
        onChange={(value) => updateField('password', value)}
        describedBy={
          formData.password.length > 0 ? 'password-rules' : undefined
        }
      >
        {/* Hidden while the field is empty so the form doesn't greet people
            with a column of red crosses. */}
        {formData.password.length > 0 && (
          <PasswordChecklist id="password-rules" password={formData.password} />
        )}
      </PasswordField>

      <div className="mt-4 w-full">
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          error={errorFor('confirmPassword')}
          isRevealed={isPasswordRevealed}
          onToggleReveal={() => setIsPasswordRevealed((previous) => !previous)}
          onChange={(value) => updateField('confirmPassword', value)}
        />
      </div>

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
          {isSubmitting ? 'Registering…' : 'Register'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Moves focus to the first field that has a message, in rendering order, so a
 * keyboard user isn't left at the submit button hunting for what went wrong.
 */
function focusFirstInvalidField(errors: RegisterFieldErrors) {
  const firstInvalid = REGISTER_FIELD_ORDER.find(
    (field) => errors[field] !== undefined,
  );
  if (firstInvalid) document.getElementById(firstInvalid)?.focus();
}
