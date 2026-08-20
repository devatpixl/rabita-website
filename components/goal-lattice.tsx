'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

// The goal as 100 marks, one per million kroner, in the diamond lattice of the facade.
// Paid marks are solid; the rest are drawn as outlines, so the field reads as a
// ledger you can count rather than a block of grey texture.

const TOTAL = 100;
const COLS = 20;

export function GoalLattice({
  percent,
  caption,
  countLabel,
  className,
}: {
  percent: number;
  caption: string;
  countLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);
  const [still, setStill] = useState(false);
  const lit = Math.min(TOTAL, Math.max(0, Math.round(percent)));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStill(true);
      setPlay(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setPlay(e.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('', className)}>
      <div
        className="grid gap-[9px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        role="img"
        aria-label={caption}
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const on = i < lit;
          return (
            <span
              key={i}
              aria-hidden
              className={cn(
                'block aspect-square rotate-45',
                on ? 'bg-gold-deep' : 'border border-gold-deep/25 bg-transparent',
              )}
              style={{
                // Paid marks arrive in order, so the field fills rather than appearing.
                opacity: play ? 1 : 0,
                transform: `rotate(45deg) scale(${play || still ? 0.7 : 0.3})`,
                transition: still
                  ? 'none'
                  : `opacity 320ms ease-out ${on ? i * 22 : 400 + i * 4}ms,` +
                    ` transform 420ms cubic-bezier(0.22,1,0.36,1) ${on ? i * 22 : 400 + i * 4}ms`,
              }}
            />
          );
        })}
      </div>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[0.75rem] uppercase tracking-[0.14em]">
        {countLabel && (
          <>
            <span className="text-gold-deep tabular-nums">{countLabel}</span>
            <span aria-hidden className="text-ink-40">
              &middot;
            </span>
          </>
        )}
        <span className="text-ink-60">{caption}</span>
      </p>
    </div>
  );
}
