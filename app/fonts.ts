import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Serif, JetBrains_Mono } from 'next/font/google';

// One superfamily so Arabic pages keep the same rhythm as Latin ones.
// Weights kept minimal so the font payload stays small on 4G — §8.

export const plexSerif = IBM_Plex_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: ['600'],
  variable: '--font-serif',
  display: 'swap',
});

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '600'],
  variable: '--font-sans-arabic',
  display: 'swap',
});

// Third face — editorial mono for eyebrows, datelines, phase labels and
// tabular figures on the campaign meter. The single biggest lever for
// "newsroom" register (§2A of the redesign plan).
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
