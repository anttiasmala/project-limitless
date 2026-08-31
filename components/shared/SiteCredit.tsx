// components/shared/SiteCredit.tsx

'use client';

import SvgGithub from '@/icons/github';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

const REPOSITORY_URL = 'https://github.com/anttiasmala/project-limitless';

const FEEDBACK_ROUTE = '/feedback';

// Routes that own the bottom edge of the screen themselves. The XP index page
// pins a full-width taskbar there, and the credit would land on top of it.
const HIDDEN_ON: string[] = ['/index-page', '/port-royal'];

/**
 * The "Website by Antti Asmala" credit, rendered once in the root layout so every page
 * gets it.
 *
 */
export default function SiteCredit({ className }: { className?: string }) {
  const pathname = usePathname();

  if (HIDDEN_ON.some((route) => pathname === route)) return null;

  // The page the link was clicked on is what the feedback is about, and the
  // form has no other way to know it. On the feedback page itself there is
  // nothing to pass on.
  const feedbackHref =
    pathname === FEEDBACK_ROUTE
      ? FEEDBACK_ROUTE
      : `${FEEDBACK_ROUTE}?from=${encodeURIComponent(pathname)}`;

  return (
    // `relative z-10` keeps the credit above the `fixed inset-0`
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
        <Link
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:hover:text-slate-100"
          href={feedbackHref}
        >
          Give feedback
        </Link>
      </div>
    </footer>
  );
}
