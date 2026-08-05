// components/shared/SiteCredit.tsx

'use client';

import SvgGithub from '@/icons/github';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

const REPOSITORY_URL = 'https://github.com/anttiasmala/project-limitless';

// Routes that own the bottom edge of the screen themselves. The XP index page
// pins a full-width taskbar there, and the credit would land on top of it.
const HIDDEN_ON: string[] = ['/index-page'];

/**
 * The "Website by Antti Asmala" credit, rendered once in the root layout so every page
 * gets it.
 *
 * This sits in the normal flow as the last child of the body, which is a
 * `min-h-screen` flex column (see app/layout.tsx). Each page's `<main>` is
 * `flex-1` rather than `min-h-screen`, so the two together fill the viewport:
 * the footer rests on the bottom edge on short pages and is pushed below the
 * content on tall ones. Deliberately not `fixed` — that floated it over page
 * content, e.g. the tic-tac-toe board.
 */
export default function SiteCredit({ className }: { className?: string }) {
  const pathname = usePathname();

  if (HIDDEN_ON.some((route) => pathname === route)) return null;

  return (
    // `relative z-10` keeps the credit above the `fixed inset-0` background
    // gradients the pages paint, which would otherwise cover it: they are
    // positioned, so they paint above in-flow content regardless of DOM order.
    <footer
      className={twMerge(
        'relative z-10 flex w-full shrink-0 flex-wrap justify-between gap-x-4 gap-y-1 px-3 py-2 text-sm text-slate-500 dark:text-slate-400',
        className,
      )}
    >
      <div>
        <a
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:hover:text-slate-100"
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>
            Website by <span className="font-bold">Antti Asmala</span>
          </span>
          <SvgGithub className="h-4 w-4" aria-hidden />
          <span className="sr-only">
            (source on GitHub, opens in a new tab)
          </span>
        </a>
      </div>
      <div>
        <a
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:hover:text-slate-100"
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Give feedback
        </a>
      </div>
    </footer>
  );
}
