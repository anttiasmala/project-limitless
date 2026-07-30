// app/login/page.tsx

import LoginForm from '@/components/login/LoginForm';
import Logo from '@/components/Logo';
import ThemeToggleCorner from '@/components/shared/ThemeToggleCorner';
import type { Metadata } from 'next';
import Link from 'next/link';

// Only exportable because this page is a server component — the form itself is
// the client boundary.
export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your Limitless Arcade account.',
};

export default function Login() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-16 dark:bg-[#0a0a1a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#e2e8f0_0%,#f1f5f9_70%)] dark:bg-[radial-gradient(ellipse_at_top,#15152b_0%,#0a0a1a_70%)]" />

      <ThemeToggleCorner />

      {/* Back to the arcade landing page */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-white"
      >
        ← Home
      </Link>

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-8">
        <header className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Log in
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            One account for every app in the arcade
          </p>
        </header>

        <LoginForm />
      </div>
    </main>
  );
}
