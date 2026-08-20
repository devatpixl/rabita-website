import { Fraunces, IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from 'next/font/google';

// The three faces innocents.no uses: Fraunces to display, Inter to read, JetBrains Mono to label.

// Variable, so the whole weight range arrives in one file rather than one per weight.
export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

// Neither Latin face carries Arabic, so the Arabic locale keeps its own sans.
export const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '600'],
  variable: '--font-sans-arabic',
  display: 'swap',
});

// Editorial mono for eyebrows, datelines, phase labels and tabular figures.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
