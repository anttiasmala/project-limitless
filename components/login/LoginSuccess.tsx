// components/login/LoginSuccess.tsx

'use client';

import Button from '@/components/shared/Button';
import Panel from '@/components/shared/Panel';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/**
 * Shown after a successful login, and to anyone who opens /login while a
 * session is already running.
 */
export default function LoginSuccess({
  username,
  focusOnMount = true,
  onLogOut,
}: {
  username: string;
  focusOnMount?: boolean;
  onLogOut: () => void | Promise<void>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Logging out is a request now, so it can fail.
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logOutError, setLogOutError] = useState<string | undefined>(undefined);

  async function handleLogOut() {
    setIsLoggingOut(true);
    setLogOutError(undefined);

    try {
      await onLogOut();
    } catch (e) {
      console.error(e);
      // Staying on this screen is the truthful outcome: the session is still
      // alive, so showing the login form again would not make sense.
      setLogOutError('Could not log out. Please try again.');
      setIsLoggingOut(false);
    }
  }

  // The form that had focus is gone, so focus would otherwise fall back to
  // <body> and a keyboard or screen reader user would be left with no idea the
  // submit succeeded. tabIndex={-1} makes the panel a valid focus target.
  useEffect(() => {
    if (focusOnMount) panelRef.current?.focus();
  }, [focusOnMount]);

  return (
    <Panel ref={panelRef} role="status" tabIndex={-1}>
      <span className="text-4xl" aria-hidden>
        🎮
      </span>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Welcome back, {username}!
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        You are logged in.
      </p>

      <Button
        variant="neutral"
        size="md"
        onClick={handleLogOut}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out…' : 'Log out'}
      </Button>

      {logOutError !== undefined && (
        <p
          role="alert"
          className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          {logOutError}
        </p>
      )}

      <Link
        href="/"
        className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
      >
        ← Back to the arcade
      </Link>
    </Panel>
  );
}
