// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import ThemedToastContainer from '@/components/shared/ThemedToastContainer';
import SiteCredit from '@/components/shared/SiteCredit';

export const metadata: Metadata = {
  title: {
    default: 'Limitless Arcade',
    template: '%s · Limitless Arcade',
  },
  description: 'A growing collection of little apps & games.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint — reads localStorage and sets dark class immediately 
        https://oleksiimazurenko.dev/en/blog/nextjs-dark-mode-without-flash
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            const stored = localStorage.getItem('isDarkTheme');
            const dark = stored !== null ? JSON.parse(stored) : true;
            if (dark) document.documentElement.classList.add('dark');
          })();
        `,
          }}
        />
      </head>
      {/* The column is what puts the credit on the bottom edge: `<main>` is
          `flex-1` on every page, so it takes the height the footer doesn't. */}
      <body className="flex min-h-screen flex-col bg-slate-100 dark:bg-[#0a0a1a]">
        {children}
        <ThemedToastContainer />
        <SiteCredit />
      </body>
    </html>
  );
}
