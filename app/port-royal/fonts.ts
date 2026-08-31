import { Archivo, Archivo_Narrow, Spectral } from 'next/font/google';

export const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

export const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-archivo-narrow',
  display: 'swap',
});
