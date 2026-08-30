'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

// The build roadmap, on hover. Wraps a figure in the campaign meter and, on
// hover or keyboard focus, floats a small card under it listing the three
// build steps: the current one in full ink with a gold marker, the ones to
// come faded but legible. Opens on pointer enter and focus, closes on leave,
// blur and Escape. Touch: a tap toggles it. No library, one transition.

export type PhaseStep = {
  year: string;
  name: string;
  note: string;
  state: 'done' | 'current' | 'next';
};

export function PhasePopover({
  steps,
  label,
  currentLabel,
  children,
  className,
  align = 'start',
}: {
  steps: PhaseStep[];
  /** Card heading, e.g. "Veien til 2028". */
  label: string;
  /** Small tag on the current step, e.g. "Nå". */
  currentLabel: string;
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  // Phones do not get this popover at all (client, 2026-08-31). It is a
  // hover affordance on a device with no hover, and the card opened downward
  // into the footer — which sets `relative isolate z-[1]` and so paints over
  // the card's z-30 regardless of the number. Starts true to match the
  // server render; the effect corrects it on the client.
  const [canPopover, setCanPopover] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const on = () => setCanPopover(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Never leave it stuck open if the viewport crosses the breakpoint.
  useEffect(() => {
    if (!canPopover) setOpen(false);
  }, [canPopover]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <span
      ref={rootRef}
      className={cn('relative inline-block', className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'touch') setOpen(false);
      }}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={canPopover ? open : undefined}
        onClick={() => canPopover && setOpen((v) => !v)}
        onFocus={() => canPopover && setOpen(true)}
        onBlur={() => canPopover && setOpen(false)}
        tabIndex={canPopover ? undefined : -1}
        className={cn(
          'group rounded-sm text-start outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/40',
          canPopover ? 'cursor-help' : 'cursor-default',
        )}
      >
        {children}
        {/* A dotted rule under the trigger says "there is more here" — so it
           only belongs where there IS more here. */}
        {canPopover && (
          <span
            aria-hidden
            className="mt-1 block h-px w-full border-b border-dotted border-gold-deep/50 transition-colors group-hover:border-gold-deep"
          />
        )}
      </button>

      {canPopover && (
      <div
        id={id}
        role="tooltip"
        className={cn(
          // Width is clamped to the viewport: 19rem is 304px and a phone is
          // 375, so an unclamped card plus any offset runs off the screen.
          'absolute top-full z-30 mt-3 w-[min(19rem,calc(100vw-2.5rem))] rounded-2xl border border-rule bg-paper p-4 text-start shadow-[0_2px_6px_rgba(0,0,0,0.05),0_24px_48px_-24px_rgba(0,0,0,0.35)] sm:p-5',
          'transition-[opacity,transform] duration-200 ease-out',
          // end-alignment is desktop-only. The trigger is an inline-block as
          // narrow as its text (~110px for "Foundation"), so pinning the
          // card's RIGHT edge to it pushed the other 190px off the left of
          // the screen — the clipped popover the client hit on 2026-08-30.
          // On a phone both variants hang from the start edge instead.
          align === 'end' ? 'start-0 sm:start-auto sm:end-0' : 'start-0',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0',
        )}
      >
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">{label}</p>
        <ol className="mt-3">
          {steps.map((s, i) => {
            const current = s.state === 'current';
            const faded = s.state === 'next';
            return (
              <li
                key={s.year}
                className={cn(
                  'relative flex gap-4 py-3',
                  i > 0 && 'border-t border-rule',
                  faded && 'opacity-45',
                )}
              >
                {/* Marker: filled gold for now, hollow for what is to come,
                   ink for what is done. */}
                <span
                  aria-hidden
                  className={cn(
                    'mt-[0.55rem] h-2 w-2 shrink-0 rotate-45',
                    current ? 'bg-gold-deep' : s.state === 'done' ? 'bg-ink' : 'border border-ink',
                  )}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[0.6875rem] tabular-nums tracking-[0.1em] text-ink-60">{s.year}</span>
                    <span className={cn('font-serif text-[1.05rem] leading-tight', current ? 'text-ink' : 'text-ink')}>
                      {s.name}
                    </span>
                    {current && (
                      <span className="rounded-full bg-gold-deep px-1.5 py-px font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-paper">
                        {currentLabel}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 text-[0.8rem] leading-snug text-ink-60">{s.note}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      )}
    </span>
  );
}
