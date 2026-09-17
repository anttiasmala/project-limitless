import type { Metadata } from 'next';
import PortRoyal from '@/components/port-royal/PortRoyal';
import { archivo, archivoNarrow, spectral } from '../port-royal-land/fonts';

export const metadata: Metadata = {
  title: 'Port Royal',
  description: 'A hotseat game of pushing your luck in the harbour.',
};

export default function Page() {
  return (
    <main
      className={`flex min-h-0 flex-1 ${spectral.variable} ${archivo.variable} ${archivoNarrow.variable}`}
    >
      <PortRoyal />
    </main>
  );
}
