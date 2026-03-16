import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
