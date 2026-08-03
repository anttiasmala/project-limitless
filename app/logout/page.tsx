// app/logout/page.tsx

import Logo from '@/components/Logo';
import Logout from '@/components/logout/Logout';
import ThemeToggleCorner from '@/components/shared/ThemeToggleCorner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log out',
  description: 'Log out of your Limitless Arcade account.',
};

export default function LogoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-16 dark:bg-[#0a0a1a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#e2e8f0_0%,#f1f5f9_70%)] dark:bg-[radial-gradient(ellipse_at_top,#15152b_0%,#0a0a1a_70%)]" />

      <ThemeToggleCorner />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-8">
        <header className="flex flex-col items-center text-center">
          <Logo />
        </header>

        <Logout />
      </div>
    </main>
  );
}
