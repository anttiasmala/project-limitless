import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'index-page',
  description: 'Index page',
};

export default function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 dark:bg-[#0a0a1a]">
      {/* Back to the arcade landing page */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:text-white"
      >
        ← Home
      </Link>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl dark:text-slate-100"></h1>
      </div>
    </main>
  );
}
