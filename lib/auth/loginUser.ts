// lib/auth/loginUser.ts

import { authClient } from '@/lib/auth/auth-client';
import type { LoginFieldErrors, LoginInput } from '@/utils/zodSchemas';

/**
 * The result of attempting to log in.
 */
export type LoginResult =
  | { ok: true; username: string }
  | { ok: false; fieldErrors?: LoginFieldErrors; formError?: string };

/**
 * Signs in through Better Auth, which compares the password against the hash in
 * the `account` table and sets the session cookie.
 *
 * `data.password` is sent as typed. Hashing and comparing belongs on the
 * server, never the frontend.
 */
export async function loginUser(data: LoginInput): Promise<LoginResult> {
  const { data: session, error } = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });

  if (error) {
    if (error.code === 'INVALID_EMAIL_OR_PASSWORD') {
      return { ok: false, formError: 'Invalid email or password.' };
    }

    return {
      ok: false,
      formError:
        error.message ?? 'Could not reach the server. Please try again.',
    };
  }

  // `username` is nullable in Better Auth's schema, so the greeting falls back
  // to the display name rather than rendering "Welcome back, null!".
  return { ok: true, username: session.user.username ?? session.user.name };
}

/**
 * Ends the session and clears the cookie. Without this, "Log out" would only
 * put the form back on screen while leaving the person signed in.
 */
export async function logOutUser(): Promise<void> {
  await authClient.signOut();
}
