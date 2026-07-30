// lib/auth/loginUser.ts

import type { LoginFieldErrors, LoginInput } from '@/utils/zodSchemas';

/**
 * The result of attempting to log in.
 */
export type LoginResult =
  | { ok: true; username: string }
  | { ok: false; fieldErrors?: LoginFieldErrors; formError?: string };

/**
 * There is no user storage or session handling in this project yet, so nothing
 * here is real: the credentials below are hardcoded.
 *
 * `data.password` is sent as typed. Hashing and comparing belongs on the
 * server, never the frontend.
 */
export async function loginUser(data: LoginInput): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Lets the form-level error state be triggered on demand.
  if (data.email === FAILING_EMAIL) {
    return {
      ok: false,
      formError: 'Could not reach the server. Please try again.',
    };
  }

  const account = DEMO_ACCOUNTS.find(
    (candidate) => candidate.email === data.email,
  );

  // Which half was wrong is never said out loud - that would turn the login
  // form into a way of asking "does this email have an account here?".
  if (!account || account.password !== data.password) {
    return { ok: false, formError: 'Invalid email or password.' };
  }

  return { ok: true, username: account.username };
}

const DEMO_ACCOUNTS = [
  { email: 'captain@example.com', password: 'Kraken1!', username: 'captain' },
];
const FAILING_EMAIL = 'offline@example.com';
