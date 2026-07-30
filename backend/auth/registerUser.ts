// lib/auth/registerUser.ts

import type { RegisterFieldErrors, RegisterInput } from '@/utils/zodSchemas';

/**
 * The result of attempting to create an account.
 *
 */
export type RegisterResult =
  | { ok: true }
  | { ok: false; fieldErrors?: RegisterFieldErrors; formError?: string };

/**
 * There is no user storage in this project yet, so nothing here
 * is persisted.
 *
 * `data.password` is sent as typed. The last hashing belongs on the server,
 * never frontend.
 */
export async function registerUser(
  data: RegisterInput,
): Promise<RegisterResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // "already taken" UI can be exercised by hand.
  const fieldErrors: RegisterFieldErrors = {};

  if (TAKEN_USERNAMES.includes(data.username.toLowerCase())) {
    fieldErrors.username = 'That username is already taken';
  }
  if (TAKEN_EMAILS.includes(data.email)) {
    fieldErrors.email = 'An account with that email already exists';
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  // Lets the form-level error state be triggered on demand.
  if (data.username.toLowerCase() === FAILING_USERNAME) {
    return {
      ok: false,
      formError: 'Could not reach the server. Please try again.',
    };
  }

  return { ok: true };
}

const TAKEN_USERNAMES = ['admin', 'captain', 'davyjones'];
const TAKEN_EMAILS = ['taken@example.com'];
const FAILING_USERNAME = 'kraken';
