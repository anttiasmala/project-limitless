// components/shared/AuthStatus.tsx

'use client';

import { buttonClassName } from '@/components/shared/Button';
import { useSession } from '@/lib/auth/auth-client';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

const QUIET_LINK =
  'text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300';

/**
 * Who is signed in, and the way in or out. Without this the auth pages exist
 * but nothing points at them, so /login can only be reached by typing the URL.
 *
 * Logging out is left to /logout rather than done here: that page already
 * confirms the intent and reports a sign-out that failed, and a second copy of
 * that in the corner of every page would only be a worse one.
 */
export default function AuthStatus({ className }: { className?: string }) {
  const { data: session, isPending } = useSession();

  const row = twMerge('flex min-h-9 items-center gap-3', className);

  // The session lives in a cookie the server has to vouch for, so on first
  // paint neither "signed in" nor "signed out" is known yet. Rendering the
  // empty row (rather than nothing) keeps `min-h-9` reserving the space, so
  // the header doesn't jump once the answer arrives.
  if (isPending) return <div className={row} aria-hidden />;

  if (!session) {
    return (
      <div className={row}>
        <Link
          href="/login"
          className={buttonClassName({ variant: 'neutral', size: 'sm' })}
        >
          Log in
        </Link>
        <Link href="/register" className={QUIET_LINK}>
          Register
        </Link>
      </div>
    );
  }

  // `username` is nullable in Better Auth's schema, so this falls back to the
  // display name rather than rendering "Signed in as null".
  const username = session.user.username ?? session.user.name;

  return (
    <div className={row}>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Signed in as{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {username}
        </span>
      </p>
      <Link href="/logout" className={QUIET_LINK}>
        Log out
      </Link>
    </div>
  );
}
