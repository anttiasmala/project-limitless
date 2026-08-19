// components/feedback/Feedback.tsx

'use client';

import Button from '@/components/shared/Button';
import Panel from '@/components/shared/Panel';
import TextAreaField from '@/components/shared/TextAreaField';
import TextField from '@/components/shared/TextField';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import { useSession } from '@/lib/auth/auth-client';
import { focusFirstInvalidField } from '@/utils/focusFirstInvalidField';
import {
  collectFeedbackErrors,
  FEEDBACK_FIELD_ORDER,
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_TYPE_LABELS,
  feedbackFormSchema,
  feedbackTypeSchema,
  isSitePath,
  type FeedbackFieldErrors,
  type FeedbackFieldName,
  type FeedbackFormData,
  type FeedbackType,
} from '@/utils/zodSchemas';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

const EMPTY_FORM_DATA: FeedbackFormData = {
  message: '',
  type: 'OTHER',
  email: '',
};

type Status = 'idle' | 'submitting';

export default function Feedback() {
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FeedbackFormData>(EMPTY_FORM_DATA);
  const [errors, setErrors] = useState<FeedbackFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // Validation stays silent until the first submit, then runs "live". Nobody
  // wants to be told their email is invalid while they are still typing it.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [status, setStatus] = useState<Status>('idle');

  // Only offered to somebody who is logged in. For everybody else the message
  // is anonymous already, and a switch saying so would be noise.
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isSubmitting = status === 'submitting';

  // Whether the message will carry the account it was written from. When it
  // won't, the form asks for a reply address the same way it does for a
  // visitor who isn't logged in at all.
  const isIdentified = session != null && !isAnonymous;

  // The footer link carries the page it was clicked on. Opening /feedback
  // straight from the address bar leaves nothing to report, and the parameter
  // is as forgeable as the rest of the body, so anything that isn't a path on
  // this site is dropped here rather than rejected by the server.
  const from = searchParams.get('from');
  const pageUrl = from !== null && isSitePath(from) ? from : undefined;

  function updateField(field: FeedbackFieldName, value: string) {
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);
    setFormError(undefined);

    if (hasSubmitted) setErrors(collectFeedbackErrors(nextFormData));
  }

  function toggleAnonymous(nextIsAnonymous: boolean) {
    setIsAnonymous(nextIsAnonymous);
    setFormError(undefined);

    if (!nextIsAnonymous) {
      setFormData((previous) => ({ ...previous, email: '' }));
      setErrors((previous) => ({ ...previous, email: undefined }));
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError(undefined);

    const validatedForm = feedbackFormSchema.safeParse(formData);

    if (!validatedForm.success) {
      const collectedErrors = collectFeedbackErrors(formData);
      setErrors(collectedErrors);
      focusFirstInvalidField(FEEDBACK_FIELD_ORDER, collectedErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validatedForm.data, pageUrl, isAnonymous }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        // Whatever was typed stays in the form, so a failed send can be
        // retried without writing the message a second time.
        setFormError(responseText || 'Something went wrong. Please try again.');
        setStatus('idle');
        return;
      }

      toast(responseText);
      setFormData(EMPTY_FORM_DATA);
      setHasSubmitted(false);
    } catch (e) {
      console.error(e);
      setFormError('Something went wrong. Please try again.');
    }

    setStatus('idle');
  }

  // The session lives in a cookie the server has to be asked for, so on first
  // render it isn't known yet whether the email field is needed at all.
  if (isPending) {
    return (
      <Panel>
        <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
          Checking your session…
        </p>
      </Panel>
    );
  }

  return (
    <form
      // The browser's own bubbles would compete with the messages below each
      // field (and can't be styled), so validation is left entirely to zod.
      noValidate
      className="flex w-full flex-col items-start"
      onSubmit={(e) => handleSubmit(e)}
    >
      <TextAreaField
        id="message"
        name="message"
        label="Feedback"
        rows={6}
        maxLength={FEEDBACK_MAX_LENGTH}
        placeholder="What went wrong, or what would you like to see?"
        value={formData.message}
        error={errors.message}
        onChange={(e) => updateField('message', e.currentTarget.value)}
      />

      <div className="mt-2 w-full">
        <label
          htmlFor="type"
          className="text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Feedback type
        </label>
        <select
          id="type"
          name="type"
          className="mt-1 w-full cursor-pointer rounded-lg border-2 border-slate-300 bg-white px-3 py-2 font-bold text-slate-800 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={formData.type}
          onChange={(e) => updateField('type', e.currentTarget.value)}
        >
          {feedbackTypeSchema.options.map((type: FeedbackType) => (
            <option key={type} value={type}>
              {FEEDBACK_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {session != null && (
        <div className="mt-5 w-full">
          <label className="flex cursor-pointer items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
            Send anonymously
            <ToggleSwitch
              size="sm"
              className="ml-2"
              checked={isAnonymous}
              onChange={(e) => toggleAnonymous(e.currentTarget.checked)}
            />
          </label>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAnonymous ? (
              'This message will not be linked to your account.'
            ) : (
              <>
                Sending as{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {session.user.email}
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Feedback that carries the account needs no address: the server reads
          it through the relation, and asking again would only invite a second,
          unrelated one. Anonymous senders are asked, because otherwise there
          is no way to answer them at all. */}
      {!isIdentified && (
        <div className="mt-3 w-full">
          <TextField
            id="email"
            name="email"
            label="Email (optional)"
            type="email"
            autoComplete="email"
            spellCheck="false"
            maxLength={128}
            placeholder="Only if you want an answer"
            value={formData.email}
            error={errors.email}
            onChange={(e) => updateField('email', e.currentTarget.value)}
          />
        </div>
      )}

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
          // Announced to screen readers while the request is in flight
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Sending…' : 'Send feedback'}
        </Button>
      </div>
    </form>
  );
}
