import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Editorial emphasis. Exactly ONE per headline. Never a noun for looks,
// never a number, never a brand name — the emotional pivot of the
// sentence. Serif italic (inherits font-serif from the heading), same
// size as the headline, never bold. Colour is set INLINE via `style`
// (not a Tailwind class) so it can never be silently stripped by JIT
// extraction or overridden by parent `text-*` on the heading.
//
// Rule: on cream (paper/paper-2/paper-deep) use gold-deep #9B7F4A for
// legible contrast on warm neutrals; on dusk use bright gold #C0A165.
// If the surface prop is missing, default to gold-deep — never leave
// the colour unset.
//
// `photo` is for type sitting on a PHOTOGRAPH under a scrim, which is a
// different problem from a flat surface: the ground is only ~L 0.06 rather
// than dusk's 0.007, so gold-deep falls to about 2.4:1 there, and gold-soft
// is so close to paper-white that the accent stops reading as gold at all.
// #D6BE8C sits between them — legible against the scrim and still visibly
// gold beside a paper-white headline.
//
// Usage: pass as the child of a next-intl `t.rich('...', { em: (c) =>
// <Accent surface="paper">{c}</Accent> })` interpolation, or drop
// inline inside a headline.
const ACCENT_HEX = {
  paper: '#9B7F4A',
  dusk: '#C0A165',
  photo: '#D6BE8C',
} as const;

export function Accent({
  children,
  surface = 'paper',
  className,
}: {
  children: ReactNode;
  surface?: 'paper' | 'dusk' | 'photo';
  className?: string;
}) {
  const colour = ACCENT_HEX[surface] ?? ACCENT_HEX.paper;
  return (
    <em
      className={cn('accent-em italic font-normal', className)}
      style={{ color: colour }}
    >
      {children}
    </em>
  );
}
