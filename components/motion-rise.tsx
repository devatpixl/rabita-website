'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// useLayoutEffect on the client so the element is hidden before the first
// paint — with useEffect the section would flash in and then out again.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { cn } from '@/lib/cn';

// On-view fade + rise. Once, never on re-scroll (§1). The reduced-motion
// path skips the observer and shows the content immediately.
export function MotionRise({
  children,
  as: As = 'div',
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'header' | 'p' | 'span';
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Starts NOT hidden. The server therefore renders the section visible, and
  // the effect below hides it only once it has confirmed JS is running and
  // the element is still below the fold. Two bugs came out of the old
  // `useState(false)` + `opacity: 0` base rule:
  //
  //   1. the section shipped invisible in the HTML, so if the observer never
  //      fired — hydration broken, an extension in the tree, no JS — it was
  //      gone for good;
  //   2. it reset itself to hidden every time you scrolled back UP past it,
  //      so sections blanked out and re-animated mid-scroll. That was the
  //      empty band the client photographed on the homepage.
  //
  // Once shown, it now stays shown.
  const [hidden, setHidden] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already on screen: leave it alone rather than hide it and flash.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setHidden(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => setHidden(false), delay);
        io.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp: any = As;
  return (
    <Comp
      ref={ref}
      data-visible={hidden ? 'false' : 'true'}
      className={cn('motion-rise', className)}
    >
      {children}
    </Comp>
  );
}

// Staggered word-in for the hero headline. Each word is its own span with
// an incremental delay so the phrase composes itself instead of appearing
// as a block. Optionally accepts `accentWord` — that word (matched case-
// insensitively, ignoring surrounding punctuation) is set in serif italic
// in the surface-appropriate gold tone. Only one accent per headline.
export function StaggerWords({
  text,
  className,
  accentWord,
  accentSurface = 'paper',
}: {
  text: string;
  className?: string;
  accentWord?: string;
  accentSurface?: 'paper' | 'dusk';
}) {
  const words = text.split(' ');
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const norm = (s: string) => s.replace(/[.,;:!?'"«»()\[\]—–-]/g, '').toLowerCase();
  const accentIdx = accentWord ? words.findIndex((w) => norm(w) === norm(accentWord)) : -1;
  const accentColour = accentSurface === 'dusk' ? 'text-gold' : 'text-gold-deep';

  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => {
        const isAccent = i === accentIdx;
        const cls = isAccent
          ? `inline-block italic font-normal ${accentColour}`
          : 'inline-block';
        return (
          <span
            key={`${i}-${w}`}
            aria-hidden
            className={cls}
            style={{
              opacity: prefersReduced ? 1 : 0,
              transform: prefersReduced ? 'none' : 'translateY(18px)',
              animation: prefersReduced
                ? undefined
                : `rabita-word-in 700ms ${i * 90}ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards`,
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </span>
  );
}
