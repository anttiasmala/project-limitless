// components/register/RegisterSuccess.tsx

'use client';

import Button from '@/components/shared/Button';
import Panel from '@/components/shared/Panel';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

/**
 * Shown in place of the form after a successful registration.
 */
export default function RegisterSuccess({
  username,
  onRegisterAnother,
}: {
  username: string;
  onRegisterAnother: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // The form that had focus is gone, so focus would otherwise fall back to
  // <body> and a keyboard or screen reader user would be left with no idea the
  // submit succeeded. tabIndex={-1} makes the panel a valid focus target.
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <Panel ref={panelRef} role="status" tabIndex={-1}>
      <span className="text-4xl" aria-hidden>
        🎉
      </span>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Welcome aboard, {username}!
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Your account has been created.
      </p>

      <Button variant="neutral" size="md" onClick={onRegisterAnother}>
        Register another account
      </Button>

      <Link
        href="/"
        className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
      >
        ← Back to the arcade
      </Link>
    </Panel>
  );
}
