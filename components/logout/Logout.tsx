// components/logout/Logout.tsx

'use client';

import Button, { buttonClassName } from '@/components/shared/Button';
import { useSession } from '@/lib/auth/auth-client';
import { logOutUser } from '@/lib/auth/loginUser';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'loggingOut' | 'loggedOut';

/**
 * The whole of /logout. Logging out waits for a click rather than firing on
 * mount: /logout is reachable by ordinary navigation, and a page that ends the
 * session just for being visited can be triggered by a stray link. The click is
 * also what makes the outcome visible.
 */
export default function Logout() {
  const { data: session, isPending } = useSession();

  const [status, setStatus] = useState<Status>('idle');
  const [logOutError, setLogOutError] = useState<string | undefined>(undefined);

  const panelRef = useRef<HTMLDivElement>(null);

  // The button that had focus is gone once the panel swaps, so focus would fall
  // back to <body> and a keyboard or screen reader user would be left with no
  // idea it worked. tabIndex={-1} makes the panel a valid focus target.
  useEffect(() => {
    if (status === 'loggedOut') panelRef.current?.focus();
  }, [status]);

  async function handleLogOut() {
    setStatus('loggingOut');
    setLogOutError(undefined);

    try {
      await logOutUser();
      setStatus('loggedOut');
    } catch (e) {
      console.error(e);
      // Staying on the confirm screen is the truthful outcome: the session is
      // still alive, so claiming otherwise would be a lie the user acts on.
      setLogOutError('Could not log out. Please try again.');
      setStatus('idle');
    }
  }

  // The session lives in a cookie the server has to vouch for, so on first
  // paint neither "signed in" nor "signed out" is known yet.
  if (isPending) {
    return (
      <Panel>
        <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
          Checking your session…
        </p>
      </Panel>
    );
  }

  // Checked before `session`, which goes null the moment the cookie clears.
  if (status === 'loggedOut') {
    return (
      <Panel ref={panelRef} role="status" tabIndex={-1}>
        <span className="text-4xl" aria-hidden>
          👋
        </span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          You&apos;re logged out
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your session has ended on this device.
        </p>

        <LinkButton href="/login">Log in again</LinkButton>
        <HomeLink />
      </Panel>
    );
  }

  // Arriving here already signed out is not a mistake worth an error — it is
  // the state the page exists to produce.
  if (!session) {
    return (
      <Panel>
        <span className="text-4xl" aria-hidden>
          🔒
        </span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          You&apos;re not logged in
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          There is no session to end.
        </p>

        <LinkButton href="/login">Log in</LinkButton>
        <HomeLink />
      </Panel>
    );
  }

  const isLoggingOut = status === 'loggingOut';

  // `username` is nullable in Better Auth's schema, so this falls back to the
  // display name rather than rendering "signed in as null".
  const username = session.user.username ?? session.user.name;

  return (
    <Panel>
      <span className="text-4xl" aria-hidden>
        🎮
      </span>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Log out?
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        You are signed in as{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {username}
        </span>
        .
      </p>

      <Button
        variant="neutral"
        size="md"
        className="w-full"
        onClick={handleLogOut}
        disabled={isLoggingOut}
        // Announced to screen readers while the request is in progress.
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

      <HomeLink />
    </Panel>
  );
}

/**
 * The card every state of this page is drawn on, shared so the page does not
 * jump as it swaps between them.
 */
function Panel({
  children,
  ref,
  ...rest
}: React.ComponentPropsWithoutRef<'div'> & {
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm backdrop-blur focus-visible:outline-none dark:border-slate-800 dark:bg-slate-900/60"
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * A link wearing the button's styling. It stays an <a> rather than a <button>
 * with a router push, so it keeps middle-click, "open in new tab" and the
 * status bar preview that a real link gives you.
 */
function LinkButton({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className={buttonClassName({
        variant: 'neutral',
        size: 'md',
        className: 'w-full',
      })}
    >
      {children}
    </Link>
  );
}

function HomeLink() {
  return (
    <Link
      href="/"
      className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
    >
      ← Back to the arcade
    </Link>
  );
}
