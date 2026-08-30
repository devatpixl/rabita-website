'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

// The four commitments. Rows arrive on scroll, staggered; a thin gold rule
// grows down the start edge on hover or focus and the row lifts a shade.
// Reduced motion: no transforms, no transitions, everything just there.

export type AssuranceItem = { title: string; body: string; href?: string; linkLabel?: string };

export function AssuranceList({ items }: { items: AssuranceItem[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ul ref={ref}>
      {items.map((it, i) => (
        <li
          key={it.title}
          className={cn(
            'group relative border-t border-paper/15 transition-colors duration-300 ease-out hover:bg-paper/[0.04] focus-within:bg-paper/[0.04]',
            !reduced && 'transition-[opacity,transform,background-color]',
          )}
          style={
            reduced
              ? undefined
              : {
                  opacity: shown ? 1 : 0,
                  transform: shown ? 'translateY(0)' : 'translateY(12px)',
                  transitionDelay: shown ? `${i * 80}ms` : '0ms',
                  transitionDuration: '500ms',
                }
          }
        >
          {/* The gold rule: zero height at rest, full height on hover/focus. */}
          <span
            aria-hidden
            className={cn(
              'absolute inset-y-0 start-0 w-px origin-top bg-gold',
              reduced ? 'scale-y-0 group-hover:scale-y-100 group-focus-within:scale-y-100' : 'scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100 group-focus-within:scale-y-100',
            )}
          />
          <div className="grid gap-x-8 gap-y-1.5 px-4 py-5 md:min-h-[6.5rem] md:grid-cols-12 md:px-5 md:py-6">
            <h3 className="font-serif text-[1.15rem] leading-snug text-paper md:col-span-5">{it.title}</h3>
            <div className="md:col-span-7">
              <p className="max-w-[48ch] text-[14px] leading-relaxed text-paper/80">{it.body}</p>
              {it.href && it.linkLabel && (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-gold transition-colors hover:text-paper"
                >
                  {it.linkLabel}
                  <span aria-hidden className="text-[11px]">↗</span>
                </a>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
