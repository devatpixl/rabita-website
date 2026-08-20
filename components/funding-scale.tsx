'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

// The campaign as a surveyor's scale: the goal is the rule, the phases are stations on it.

type Station = { at: number; year: string; label: string; current: boolean };

export function FundingScale({
  percent,
  stations,
  pctLabel,
  className,
}: {
  percent: number;
  stations: Station[];
  pctLabel: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(0);
  const target = Math.min(100, Math.max(0, percent));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRun(target);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(target);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  // The run draws, then the marker catches up a beat later, which reads as the marker being carried by the line rather than racing it.
  const draw = 'cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Percentage rides above the marker */}
      <div
        className="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.14em] text-gold-deep"
        style={{
          insetInlineStart: `${run}%`,
          transform: 'translateX(-50%)',
          opacity: run > 0 ? 1 : 0,
          transition: `inset-inline-start 1100ms ${draw}, opacity 600ms ease-out 500ms`,
        }}
      >
        {pctLabel}
      </div>

      {/* The rule, its gold run, and the station ticks */}
      <div
        className="relative h-px w-full bg-rule"
        role="progressbar"
        aria-valuenow={Math.round(target)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="absolute start-0 top-1/2 h-[2px] -translate-y-1/2 bg-gold-deep"
          style={{ width: `${run}%`, transition: `width 1100ms ${draw}` }}
        />

        {stations.map((s) => (
          <span
            key={s.year}
            aria-hidden
            className={cn(
              'absolute top-0 block h-2 w-px',
              s.current ? 'bg-gold-deep' : 'bg-rule',
            )}
            style={{ insetInlineStart: `${s.at}%` }}
          />
        ))}

        {/* The goal, so the run is measured against a stated end */}
        <span aria-hidden className="absolute -top-1 end-0 block h-3 w-px bg-ink-40" />

        {/* Marker — the site's diamond, sitting on the line */}
        <span
          aria-hidden
          className="absolute top-1/2 block h-[9px] w-[9px] rotate-45 bg-gold-deep"
          style={{
            insetInlineStart: `${run}%`,
            transform: 'translate(-50%, -50%) rotate(45deg)',
            transition: `inset-inline-start 1100ms ${draw}`,
          }}
        />
      </div>

      {/* Stations as bands, not points. Each year owns an equal share of the
         rule, so the last label sits inside its own band instead of hanging
         two thirds along an otherwise empty line. */}
      <ol
        className="mt-4 grid"
        style={{ gridTemplateColumns: `repeat(${stations.length}, minmax(0, 1fr))` }}
      >
        {stations.map((s) => (
          <li key={s.year} className="border-s border-rule ps-3 first:border-s-0 first:ps-0">
            <div
              className={cn(
                'text-[15px] tabular-nums',
                s.current ? 'font-semibold text-ink' : 'text-ink-60',
              )}
            >
              {s.year}
            </div>
            <div className={cn('mt-1 text-[15px]', s.current ? 'text-ink' : 'text-ink-60')}>
              {s.label}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
