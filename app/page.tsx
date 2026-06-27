// app/page.tsx — Limitless Arcade landing page

import Link from 'next/link';

// Registry of apps available in the arcade. Add a new entry here (and a matching
// route under app/<href>) to surface a new app on the landing page.
const apps: {
  href: string;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    href: '/tictactoe',
    title: 'Tic-Tac-Toe',
    description: 'Pirate-themed three-in-a-row, vs. AI or online multiplayer.',
    icon: '☠️',
  },
  {
    href: '/calculator',
    title: 'Calculator',
    description: 'A simple calculator — work in progress.',
    icon: '🧮',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-16 dark:bg-[#0a0a1a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#e2e8f0_0%,#f1f5f9_70%)] dark:bg-[radial-gradient(ellipse_at_top,#15152b_0%,#0a0a1a_70%)]" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-10">
        <header className="text-center">
          <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-800 sm:text-6xl dark:text-slate-100">
            Limitless Arcade
          </h1>
          <p className="text-sm tracking-wide text-slate-500 sm:text-base dark:text-slate-400">
            A growing collection of little apps &amp; games.
          </p>
        </header>

        <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {apps.map((app) => (
            <li key={app.href}>
              <Link
                href={app.href}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-600"
              >
                <span className="text-4xl" aria-hidden>
                  {app.icon}
                </span>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
                  {app.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {app.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
