/**
 * This includes the hotseat gamemode
 *
 * The seats live in the query rather than in client state so the URL is the
 * whole game setup: refreshing the site restarts the game, but keeps the players data, etc
 */

import type { Metadata } from 'next';
import { archivo, archivoNarrow, spectral } from '@/app/port-royal/fonts';
import PortRoyal from '@/components/port-royal/PortRoyal';
import { rosterFromQuery } from '@/lib/port-royal/roster';

export const metadata: Metadata = {
  title: 'Port Royal · Hotseat',
  description: 'A hotseat game of pushing your luck in the harbour.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ seat?: string | string[]; bot?: string | string[] }>;
}) {
  const { seat, bot } = await searchParams;

  return (
    <main
      className={`flex min-h-0 flex-1 ${spectral.variable} ${archivo.variable} ${archivoNarrow.variable}`}
    >
      <PortRoyal seats={rosterFromQuery(seat, bot)} />
    </main>
  );
}
