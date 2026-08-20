import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paper — three warm off-whites (light to warm tint).
        paper: '#FAF8F4',
        'paper-2': '#F2EEE7',
        'paper-deep': '#EDE6D7',
        // Ink — headings + body + secondary + muted denominator.
        ink: '#1A1A18',
        'ink-60': '#5B6157',
        'ink-40': '#A09F9C',
        // Dusk — deep Oslo-winter blue. Punctuation mark, not a theme.
        // Used only where a section earns gravity.
        dusk: '#16242E',
        'dusk-60': '#9BA5A8', // secondary text on dusk surfaces
        // Brand gold — logo colour AND the site's primary action.
        // Three tones so gold can carry surfaces, accents and gradients
        // without reading flat.
        gold: '#C0A165',
        'gold-deep': '#9B7F4A',
        'gold-soft': '#E9DBBC',
        // Hairlines, borders.
        rule: '#E4DED3',
      },
      // The innocents.no stacks, face for face. Latin comes first in each
      // stack and the Arabic face sits behind it, so Latin glyphs resolve
      // from Fraunces/Inter and Arabic glyphs fall through to Cairo/Noto
      // without needing a per-locale class swap.
      fontFamily: {
        serif: [
          'var(--font-serif)',
          'var(--font-serif-arabic)',
          'Times New Roman',
          'serif',
        ],
        sans: [
          'var(--font-sans)',
          'var(--font-sans-arabic)',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        display: ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        section: ['clamp(2rem, 4vw, 2.75rem)', { lineHeight: '1.1' }],
        card: ['1.25rem', { lineHeight: '1.35' }],
        body: ['1rem', { lineHeight: '1.6' }],
        label: ['0.8125rem', { lineHeight: '1.2', letterSpacing: '0.08em' }],
      },
      // Section rhythm. Two sections meeting stack their padding, so a 10rem opener meant 320px of empty page.
      spacing: {
        'section-sm': '3rem',
        'section-md': '3.75rem',
        'section-lg': '4.5rem',
      },
      borderRadius: {
        chip: '4px',
        btn: '4px',
      },
      maxWidth: {
        prose: '75ch',
      },
    },
  },
  plugins: [],
};

export default config;
