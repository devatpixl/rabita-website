'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useMotionValue } from 'motion/react';
import type { AppLocale } from '@/i18n/routing';
import { formatAmount } from '@/lib/format';

// Number roll-up. Two behaviours in one component:
//   - `mode="onView"` — count up from 0 to `to` when the element enters
//     the viewport. Fires once. Used on the campaign meter.
//   - `mode="live"` — animate between successive `to` values whenever
//     the prop changes. Used on the giving-card primary button label so
//     the amount flips instead of jumping.
// Both paths respect prefers-reduced-motion (final value, no animation).

type Props = {
  to: number;
  locale: AppLocale;
  mode?: 'onView' | 'live';
  duration?: number;
  className?: string;
};

export function Counter({ to, locale, mode = 'onView', duration = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const value = useMotionValue(mode === 'onView' ? 0 : to);
  const [display, setDisplay] = useState<string>(formatAmount(locale, to));
  const inView = useInView(ref, { amount: 0.4 });

  // Sync displayed text as the motion value ticks.
  useEffect(() => {
    const unsub = value.on('change', (v) => setDisplay(formatAmount(locale, Math.round(v))));
    return () => unsub();
  }, [value, locale]);

  // onView: counts up on every entry, and resets to zero on the way out so
  // the roll-up plays again rather than sitting on its final value.
  useEffect(() => {
    if (mode !== 'onView') return;
    if (!inView) {
      value.set(0);
      return;
    }
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
    });
    return () => controls.stop();
  }, [inView, mode, to, duration, value]);

  // live: animate between successive `to` values whenever the prop changes.
  useEffect(() => {
    if (mode !== 'live') return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, {
      duration: 0.24,
      ease: [0.2, 0.7, 0.2, 1],
    });
    return () => controls.stop();
  }, [to, mode, value]);

  return (
    <span ref={ref} className={className} aria-live="polite">
      {display}
    </span>
  );
}
