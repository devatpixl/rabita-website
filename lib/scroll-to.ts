// Native smooth scroll, with a guarantee: if the page has not arrived
// within 700ms (smooth scrolling is throttled in background tabs and off
// in some settings) it jumps instantly. Reduced-motion jumps straight
// away. Either way the reader always ends up where they asked to go.
//
// Lifted out of building-rises.tsx when floor-by-floor needed its skip
// control back, rather than copied — the 700ms fallback is the part worth
// having and the part most likely to be forgotten in a second copy.
export function scrollTo(target: number) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = Math.max(0, Math.round(target));
  if (reduced) {
    window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
    return;
  }
  window.scrollTo({ top, behavior: 'smooth' });
  window.setTimeout(() => {
    if (Math.abs(window.scrollY - top) > 40) {
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
    }
  }, 700);
}
