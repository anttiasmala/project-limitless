// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import ThemedToastContainer from '@/components/shared/ThemedToastContainer';

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
      <body>
        {children}
        <ThemedToastContainer />
      </body>
    </html>
  );
}
