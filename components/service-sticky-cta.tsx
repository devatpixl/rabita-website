'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The phone's standing "Send henvendelse" (pilot, 2026-09-28).
 *
 * On a phone the form is four or five screens down, and the opener's own
 * button scrolls away with the opener. This is that button again, pinned
 * bottom-start, shown once the reader has scrolled past the opener and
 * hidden again while the form itself is on screen — it never covers the
 * thing it points at.
 *
 * bottom-5 start-4 mirrors the contact FAB at bottom-5 end-4 (z-40, same
 * layer), so the two sit either side of the screen and neither overlaps
 * the other. The consent banner on a phone stops at 3.5rem from the
 * bottom, above both. md:hidden — on a laptop the opener's button and the
 * form are a scroll apart, and a pinned button there is furniture.
 */
export function ServiceStickyCta({ label, target = 'enquiry' }: { label: string; target?: string }) {
  const [pastOpener, setPastOpener] = useState(false);
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastOpener(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFormInView(e?.isIntersecting ?? false), {
      rootMargin: '0px 0px -30% 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const shown = pastOpener && !formInView;

  return (
    <a
      href={`#${target}`}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={cn(
        // Capped at the viewport minus the FAB's own footprint (≈145px pill +
        // its 1rem inset + a 0.75rem gap), so the two can never touch; on a
        // 360px screen the label truncates rather than overlapping.
        'fixed bottom-5 start-4 z-40 inline-flex min-h-11 max-w-[calc(100vw-11.25rem)] items-center rounded-full bg-gold-deep px-4 text-[14px] font-semibold text-paper shadow-[0_12px_32px_-12px_rgba(26,26,24,0.45)] transition-all duration-300 ease-out md:hidden print:hidden',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      {/* No arrow: on a 360px screen the arrow was the 22px that pushed
         the label into an ellipsis, and a pinned button does not need one. */}
      <span className="truncate">{label}</span>
    </a>
  );
}
