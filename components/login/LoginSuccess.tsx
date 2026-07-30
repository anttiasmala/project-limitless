// components/login/LoginSuccess.tsx

'use client';

import Button from '@/components/shared/Button';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

/**
 * Shown in place of the form after a successful login. Stands in for the
 * redirect that will happen once there are sessions to redirect into.
 */
export default function LoginSuccess({
  username,
  onLogOut,
}: {
  username: string;
  onLogOut: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // The form that had focus is gone, so focus would otherwise fall back to
  // <body> and a keyboard or screen reader user would be left with no idea the
  // submit succeeded. tabIndex={-1} makes the panel a valid focus target.
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      role="status"
      tabIndex={-1}
      className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
    >
      <span className="text-4xl" aria-hidden>
        🎮
      </span>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Welcome back, {username}!
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        You are logged in.
      </p>

      <Button variant="neutral" size="md" onClick={onLogOut}>
        Log out
      </Button>

      <Link
        href="/"
        className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
      >
        ← Back to the arcade
      </Link>
    </div>
  );
}
