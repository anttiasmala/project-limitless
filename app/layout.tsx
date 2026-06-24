// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import ThemedToastContainer from '@/components/ThemedToastContainer';

export const metadata: Metadata = {
  title: 'Pirate Tic-Tac-Toe',
  description: 'Claim the seas — three in a row!',
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
