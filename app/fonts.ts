import { Cairo, Fraunces, Inter, JetBrains_Mono, Noto_Sans_Arabic } from 'next/font/google';

// The exact five faces innocents.no ships, in the same roles:
//   --f-display     Fraunces          --f-display-ar  Cairo
//   --f-body        Inter             --f-body-ar     Noto Sans Arabic
//   --f-mono        JetBrains Mono

// Variable, so the whole weight range arrives in one file rather than one per weight.
// The three extra axes are the ones innocents.no drives: opsz 144 on display type,
// SOFT 80 + WONK 1 on the italic accent.
export const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-serif',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

// Neither Latin face carries Arabic, so the Arabic locale keeps its own pair.
export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-arabic',
  display: 'swap',
});

// Arabic display face. Fraunces has no Arabic glyphs, so headings fall through to this.
export const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['600', '700', '800'],
  variable: '--font-serif-arabic',
  display: 'swap',
});

// Editorial mono for eyebrows, datelines, phase labels and tabular figures.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
