// lib/auth/registerUser.ts

import { authClient } from '@/lib/auth/auth-client';
import type { RegisterFieldErrors, RegisterInput } from '@/utils/zodSchemas';

/**
 * The result of attempting to create an account.
 *
 */
export type RegisterResult =
  | { ok: true }
  | { ok: false; fieldErrors?: RegisterFieldErrors; formError?: string };

/**
 * Creates the account through Better Auth, which hashes the password, writes
 * the row to Postgres and - since `autoSignIn` is left on - sets the session
 * cookie, so a registration also logs the person in.
 *
 * `data.password` is sent as typed: hashing belongs on the server, never the
 * frontend.
 */
export async function registerUser(
  data: RegisterInput,
): Promise<RegisterResult> {
  const { error } = await authClient.signUp.email({
    email: data.email,
    password: data.password,
    username: data.username,
    // Better Auth requires a display name of its own. Until the form asks for
    // one, the username stands in for it.
    name: data.username,
  });

  if (!error) return { ok: true };

  const fieldError = FIELD_ERRORS_BY_CODE[error.code ?? ''];
  if (fieldError) return { ok: false, fieldErrors: { ...fieldError } };

  // Anything left is either a network failure or a rule the form does not know
  // about, and neither belongs under a single field.
  return {
    ok: false,
    formError: error.message ?? 'Could not reach the server. Please try again.',
  };
}

/**
 * The Better Auth error codes worth pinning to one field.
 *
 * The length and invalid characters should already have been caught by
 * registerSchema, so they only show up if the two ever drift apart
 */
const FIELD_ERRORS_BY_CODE: Record<string, RegisterFieldErrors | undefined> = {
  USERNAME_IS_ALREADY_TAKEN: { username: 'That username is already taken' },
  USERNAME_TOO_SHORT: {
    username: 'Username must be at least 3 characters long',
  },
  USERNAME_TOO_LONG: { username: 'Username can be at max 30 characters long' },
  INVALID_USERNAME: {
    username: 'Username can only contain letters, numbers, _ and -',
  },
  USER_ALREADY_EXISTS: {
    email: 'An account with that email already exists',
  },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    email: 'An account with that email already exists',
  },
  INVALID_EMAIL: { email: 'Email is invalid' },
  PASSWORD_TOO_SHORT: {
    password: 'Password does not meet all of the requirements below',
  },
  PASSWORD_TOO_LONG: {
    password: 'Password does not meet all of the requirements below',
  },
};
