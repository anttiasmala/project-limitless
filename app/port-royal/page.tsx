import type { Metadata } from 'next';
import { archivo, archivoNarrow, spectral } from '@/app/port-royal/fonts';
import PortRoyalLand from '@/components/port-royal/PortRoyalLand';

export const metadata: Metadata = {
  title: 'Port Royal',
  description: 'Choose a table: hotseat, versus the crown, or multiplayer.',
};

export default function Page() {
  return (
    <main
      className={`flex min-h-0 flex-1 ${spectral.variable} ${archivo.variable} ${archivoNarrow.variable}`}
    >
      <PortRoyalLand />
    </main>
  );
}
